'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { AuthUser, MemberData } from '@/types/member';
import {
  isAdminUser,
  loadAuthSession,
  saveAuthSession,
  signInWithGooglePopup,
  signInWithDirectEmail,
  signInWithPassword,
  signOutAuth,
  waitForFirebaseAuth,
  sendAccountVerificationEmail,
  reloadCurrentUserAuth,
} from '@/lib/auth';
import { ApiClient } from '@/lib/api';
import { localDb } from '@/lib/storage/localDb';
import { safeStorage } from '@/lib/storage/safeStorage';

export interface AuthContextType {
  user: AuthUser | null;
  member: MemberData | null;
  loading: boolean;
  isRegistered: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<AuthUser | null>;
  signInWithEmail: (email: string, fullName?: string) => Promise<AuthUser | null>;
  signInWithPassword: (identifier: string, password: string) => Promise<AuthUser | null>;
  signInWithCandidateId: (studyId: string, pin?: string) => Promise<boolean>;
  createCustomProfile: (data: {
    fullName: string;
    studyId?: string;
    email?: string;
    school: string;
    district?: string;
    stream: string;
    optionalSubject?: string;
    pin?: string;
  }) => Promise<MemberData | null>;
  signOut: () => Promise<void>;
  refreshMember: () => Promise<MemberData | null>;
  updateProfile: (data: Partial<MemberData>) => Promise<boolean>;
  sendEmailVerificationLink: () => Promise<{ success: boolean; message: string }>;
  checkEmailVerificationStatus: () => Promise<boolean>;
  isEmailModalOpen: boolean;
  openEmailModal: () => void;
  closeEmailModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  const isRegistered = Boolean(member && member.studyId);
  const isAdmin = isAdminUser(user?.email, member?.role);

  /**
   * Synchronizes member profile from backend Google Apps Script
   */
  const syncMemberProfile = useCallback(async (authUser: AuthUser): Promise<MemberData | null> => {
    try {
      const res = await ApiClient.checkUser(authUser.email);
      if (res.success && res.data) {
        if (res.data.registered && res.data.member) {
          const profile: MemberData = res.data.member;
          setMember(profile);
          return profile;
        } else {
          setMember(null);
          return null;
        }
      } else {
        setMember(null);
        return null;
      }
    } catch (err) {
      console.error('[AuthContext] Error syncing member profile:', err);
      setMember(null);
      return null;
    }
  }, []);

  /**
   * Initial Session Restore & Firebase onAuthStateChanged Listener
   */
  useEffect(() => {
    let isMounted = true;
    let unsubscribeAuth: (() => void) | null = null;

    async function initAuth() {
      // 1. Instant local session restore
      const cached = loadAuthSession();
      if (cached && isMounted) {
        setUser(cached);
        syncMemberProfile(cached).catch(console.warn);
      }

      // 2. Attach live Firebase Auth listener
      try {
        const auth = await waitForFirebaseAuth(3000);
        if (auth && isMounted) {
          unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser: any) => {
            if (!isMounted) return;

            if (firebaseUser) {
              const liveUser: AuthUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email.toLowerCase(),
                displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                photoURL: firebaseUser.photoURL || '',
                emailVerified: firebaseUser.emailVerified,
              };

              setUser(liveUser);
              saveAuthSession(liveUser);

              await syncMemberProfile(liveUser);
            } else {
              if (!loadAuthSession()) {
                setUser(null);
                setMember(null);
              }
            }
            setLoading(false);
          });
        } else {
          if (isMounted) setLoading(false);
        }
      } catch (err) {
        console.warn('[AuthContext] Firebase listener setup failed:', err);
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    };
  }, [syncMemberProfile]);

  /**
   * Google Sign-In Flow
   */
  const handleGoogleSignIn = async (): Promise<AuthUser | null> => {
    setLoading(true);
    try {
      const authUser = await signInWithGooglePopup();
      setUser(authUser);
      const profile = await syncMemberProfile(authUser);

      if (profile && profile.studyId) {
        toast.success('Welcome back, ' + profile.fullName + '!');
        router.push('/dashboard');
      } else {
        toast.info('Please complete your 1-time StudySync registration.');
        router.push('/register');
      }
      return authUser;
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        toast.info('Google sign-in popup was cancelled.');
      } else if (err.code === 'auth/popup-blocked') {
        toast.warning('Popup was blocked by browser. Please allow popups or use email sign-in.');
        setIsEmailModalOpen(true);
      } else {
        toast.error(err.message || 'Google authentication failed.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Direct Email Sign-In Flow
   */
  const handleEmailSignIn = async (email: string, fullName?: string): Promise<AuthUser | null> => {
    setLoading(true);
    try {
      const authUser = await signInWithDirectEmail(email, fullName);
      setUser(authUser);
      const profile = await syncMemberProfile(authUser);

      if (profile && profile.studyId) {
        toast.success('Welcome back, ' + profile.fullName + '!');
        router.push('/dashboard');
      } else {
        toast.info('Please complete your 1-time registration form.');
        router.push('/register');
      }
      setIsEmailModalOpen(false);
      return authUser;
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in with email.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Candidate Study ID & Passkey Sign-In Flow
   */
  const handleCandidateSignIn = async (studyId: string, pin?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const cleanId = (studyId || '').trim().toUpperCase();
      if (!cleanId) {
        toast.error('Please enter your Candidate Index / ID');
        return false;
      }

      // 1. Check local DB first
      let profile: MemberData | null = localDb.getMemberByStudyId(cleanId);
      if (!profile) {
        const res = await ApiClient.verifyMember(cleanId);
        if (res.success && res.data?.member) {
          profile = res.data.member as MemberData;
          localDb.saveMember(profile);
        }
      }

      if (!profile) {
        toast.error('Candidate ID not found. Please verify with your mentor.');
        return false;
      }

      const authUser: AuthUser = {
        uid: profile.studyId,
        email: profile.email ? profile.email.toLowerCase() : `${profile.studyId.toLowerCase()}@studysync.lk`,
        displayName: profile.fullName || profile.studyId,
        photoURL: '',
        emailVerified: true,
      };

      setUser(authUser);
      setMember(profile);
      saveAuthSession(authUser);
      safeStorage.setJson('studysync_member', profile);

      toast.success(`Welcome back, ${profile.fullName}!`);
      return true;
    } catch (err: any) {
      toast.error('Authentication error: ' + (err?.message || 'Server offline'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Direct Custom Profile Creation Flow (No Google account required)
   */
  const handleCreateCustomProfile = async (data: {
    fullName: string;
    studyId?: string;
    email?: string;
    school: string;
    district?: string;
    stream: string;
    optionalSubject?: string;
    pin?: string;
  }): Promise<MemberData | null> => {
    setLoading(true);
    try {
      const generatedId = (data.studyId?.trim() || `SG-${data.stream.includes('Bio') ? 'BIO' : 'MATH'}-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase();
      const memberEmail = data.email?.trim() || `${generatedId.toLowerCase()}@studysync.lk`;

      const newMember: MemberData = {
        studyId: generatedId,
        fullName: data.fullName.trim(),
        name: data.fullName.trim(),
        email: memberEmail.toLowerCase(),
        school: data.school.trim() || 'Central College',
        district: data.district || 'Colombo',
        stream: data.stream,
        optionalSubject: data.optionalSubject || (data.stream.includes('Bio') ? 'Agricultural Science' : 'Chemistry'),
        examYear: '2026',
        status: 'Active',
        role: 'student',
        registrationDate: new Date().toISOString().split('T')[0],
        streakCount: 1,
        totalHours: 0,
      };

      // 1. Save to local database immediately
      localDb.saveMember(newMember);

      // 2. Establish active session
      const authUser: AuthUser = {
        uid: generatedId,
        email: memberEmail.toLowerCase(),
        displayName: data.fullName.trim(),
        photoURL: '',
        emailVerified: true,
      };

      setUser(authUser);
      setMember(newMember);
      saveAuthSession(authUser);
      safeStorage.setJson('studysync_member', newMember);

      // 3. Asynchronously register with backend
      ApiClient.registerUser({
        action: 'registerUser',
        fullName: data.fullName.trim(),
        email: memberEmail.toLowerCase(),
        school: data.school.trim() || 'Central College',
        stream: data.stream,
        optionalSubject: newMember.optionalSubject,
        examYear: '2026',
        telegramUsername: '',
      }).catch(console.warn);

      toast.success(`Scholar profile created! Study ID: ${generatedId}`);
      return newMember;
    } catch (err: any) {
      toast.error('Failed to create custom profile: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Profile Updating Flow (Saves to Google Sheets Members tab)
   */
  const handleUpdateProfile = async (data: Partial<MemberData>): Promise<boolean> => {
    if (!user || !member) {
      toast.error('You must be signed in to edit profile details.');
      return false;
    }

    try {
      const payload = {
        email: user.email,
        studyId: member.studyId,
        fullName: data.fullName || member.fullName,
        gender: data.gender || member.gender,
        telegram: data.telegram || member.telegram,
        school: data.school || member.school,
        stream: data.stream || member.stream,
        optionalSubject: data.optionalSubject || member.optionalSubject,
        examYear: data.examYear || member.examYear,
      };

      const res = await ApiClient.updateProfile(payload);
      if (res.success) {
        // Update local member object immediately
        const updated: MemberData = {
          ...member,
          fullName: payload.fullName,
          gender: payload.gender,
          telegram: payload.telegram,
          school: payload.school,
          stream: payload.stream,
          optionalSubject: payload.optionalSubject,
          examYear: payload.examYear,
        };
        setMember(updated);
        toast.success('Account profile details updated successfully in Google Sheets!');
        return true;
      } else {
        toast.error(res.error || 'Failed to update profile.');
        return false;
      }
    } catch (err: any) {
      console.error('[AuthContext] Update profile error:', err);
      toast.error(err.message || 'Error communicating with database.');
      return false;
    }
  };

  /**
   * Send Email Verification Link via Firebase Auth
   */
  const handleSendVerificationEmail = async (): Promise<{ success: boolean; message: string }> => {
    return sendAccountVerificationEmail();
  };

  /**
   * Check / Reload Email Verification Status
   */
  const handleCheckEmailVerificationStatus = async (): Promise<boolean> => {
    const res = await reloadCurrentUserAuth();
    if (user) {
      const updatedUser = { ...user, emailVerified: res.emailVerified };
      setUser(updatedUser);
      saveAuthSession(updatedUser);
    }
    return res.emailVerified;
  };

  /**
   * Sign-Out Flow
   */
  const handleSignOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOutAuth();
      setUser(null);
      setMember(null);
      toast.info('You have been signed out safely.');
      router.push('/');
    } catch (err) {
      console.warn('[AuthContext] Sign-out error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manual Member Refresh
   */
  const handleRefreshMember = async (): Promise<MemberData | null> => {
    if (!user) return null;
    return syncMemberProfile(user);
  };

  /**
   * Secure Password Sign-In Flow
   */
  const handlePasswordSignIn = async (identifier: string, password: string): Promise<AuthUser | null> => {
    setLoading(true);
    try {
      const { user: authUser, member: profile } = await signInWithPassword(identifier, password);
      setUser(authUser);
      setMember(profile);

      if (profile && profile.studyId) {
        toast.success(`Welcome back, ${profile.fullName}!`);
        if (profile.role === 'admin' || isAdminUser(authUser.email, profile.role)) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/register');
      }
      setIsEmailModalOpen(false);
      return authUser;
    } catch (err: any) {
      toast.error(err.message || 'Failed to authenticate.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        member,
        loading,
        isRegistered,
        isAdmin,
        signInWithGoogle: handleGoogleSignIn,
        signInWithEmail: handleEmailSignIn,
        signInWithPassword: handlePasswordSignIn,
        signInWithCandidateId: handleCandidateSignIn,
        createCustomProfile: handleCreateCustomProfile,
        signOut: handleSignOut,
        refreshMember: handleRefreshMember,
        updateProfile: handleUpdateProfile,
        sendEmailVerificationLink: handleSendVerificationEmail,
        checkEmailVerificationStatus: handleCheckEmailVerificationStatus,
        isEmailModalOpen,
        openEmailModal: () => setIsEmailModalOpen(true),
        closeEmailModal: () => setIsEmailModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom Hook: useAuth
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
