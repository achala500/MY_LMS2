'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  Flame,
  LogOut,
  LogIn,
  Menu,
  X,
  Calendar,
  Inbox,
  Search,
  Settings,
  Users,
  Sparkles,
  ShieldCheck,
  Shield,
  KeyRound,
  GraduationCap,
  MessageSquarePlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { localDb } from '@/lib/storage/localDb';
import { AppLockModal } from '@/components/security/AppLockModal';
import { UserInboxModal } from '@/components/dashboard/UserInboxModal';
import { ScholarLoginModal } from '@/components/auth/ScholarLoginModal';
import { EditProfileModal } from '@/components/dashboard/EditProfileModal';
import { ScholarAvatarStudioModal } from '@/components/character/ScholarAvatarStudioModal';
import { StudentFeedbackModal } from '@/components/feedback/StudentFeedbackModal';

export interface HeaderUserProps {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}

export interface HeaderMemberProps {
  studyId?: string;
  fullName?: string;
  streakCount?: number;
  role?: string;
  stream?: string;
}

export interface HeaderProps {
  user?: HeaderUserProps | null;
  member?: HeaderMemberProps | null;
  streak?: number;
  isAdmin?: boolean;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

const ADMIN_EMAIL = 'alwisachalaanurada@gmail.com';

export function Header({
  user,
  member,
  streak = 0,
  isAdmin: propIsAdmin = false,
  onSignIn,
  onSignOut,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appLockModalOpen, setAppLockModalOpen] = useState(false);
  const [inboxModalOpen, setInboxModalOpen] = useState(false);
  const [scholarLoginOpen, setScholarLoginOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [avatarStudioOpen, setAvatarStudioOpen] = useState(false);
  const [unreadInboxCount, setUnreadInboxCount] = useState(0);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('pointerdown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [userDropdownOpen]);

  // Close mobile drawer automatically on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      if (member?.studyId) {
        const inbox = localDb.getStudentInbox(member.studyId);
        const unread = inbox.filter((m) => !m.read).length;
        setUnreadInboxCount(unread);
      }
    } catch (e) {}
  }, [member?.studyId, inboxModalOpen]);

  const effectiveStreak = member?.streakCount ?? streak ?? 0;
  const isWhitelistedAdmin = propIsAdmin || user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const initials = member?.fullName
    ? member.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SC';

  const navLinks = [
    { href: '/', label: 'Home', icon: LayoutDashboard },
    { href: '/rooms', label: 'Focus', icon: Users },
    { href: '/daily', label: 'Log', icon: Flame },
    { href: '/tests', label: 'Marks', icon: Sparkles },
    { href: '/id-card', label: 'Pass', icon: CreditCard },
    { href: '/calendar', label: 'Plan', icon: Calendar },
    ...(isWhitelistedAdmin ? [{ href: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  const handleSignInClick = () => {
    setScholarLoginOpen(true);
  };

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    router.push(href);
  };

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#fef8f4] border-b border-[#e7e1de] transition-colors">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4 relative">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <Link href="/" className="flex items-center gap-2 group shrink-0 active:scale-95 transition-transform duration-100">
              <div className="w-8 h-8 rounded-xl bg-[#c85a32] flex items-center justify-center text-white shadow-xs group-hover:bg-[#b04b25] transition-colors shrink-0">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                </svg>
              </div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1d1b19] truncate">
                Study<span className="text-[#c85a32]">Sync</span>
              </span>
            </Link>
            <span className="hidden 2xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3ede9] text-[#2d2420] text-xs font-mono uppercase tracking-wider shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c85a32] animate-pulse" />
              A/L 2026 â€¢ Colombo &amp; Districts
            </span>
          </div>

          {/* Desktop Navigation Pill - hidden on mobile, flex on md */}
          <nav className="hidden md:flex items-center p-1 bg-[#f8f2ef] border border-[#e7e1de] rounded-full text-xs font-medium shrink-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full transition-all duration-150 active:scale-95',
                    isActive
                      ? 'bg-[#c85a32] text-white shadow-xs font-semibold'
                      : 'text-[#2d2420] hover:text-[#1d1b19] hover:bg-[#ede7e3]'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons, Streak, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Search Pill (wide desktop only) */}
            <div className="relative hidden 2xl:block">
              <div className="flex items-center bg-[#f8f2ef] border border-[#e7e1de] rounded-full px-3 py-1.5 text-xs text-[#1d1b19] focus-within:border-[#c85a32] focus-within:ring-1 focus-within:ring-[#c85a32]/20 transition-all">
                <Search className="w-3.5 h-3.5 text-[#4a3b35] mr-2" />
                <input
                  type="text"
                  placeholder="Search notes, IDs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      router.push(`/verify?id=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  className="bg-transparent border-none outline-none text-xs text-[#1d1b19] placeholder:text-[#4a3b35] w-28 lg:w-36 focus:w-44 transition-all"
                />
                <kbd className="hidden lg:inline-flex items-center justify-center text-[10px] font-mono bg-[#ede7e3] px-1.5 py-0.5 rounded text-[#2d2420] ml-1.5">
                  âŒ˜K
                </kbd>
              </div>
            </div>

            {/* Streak Counter - Pure Monoline Vector */}
            <div className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#ffdcbc] text-[#854f00] text-xs font-semibold font-mono shadow-xs shrink-0">
              <Flame className="w-3.5 h-3.5 text-[#854f00]" />
              <span className="hidden sm:inline">{effectiveStreak} days</span>
              <span className="inline sm:hidden">{effectiveStreak}d</span>
            </div>

            {/* Student Feedback Button */}
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="w-8 h-8 rounded-full bg-[#f8f2ef] border border-[#e7e1de] text-[#2d2420] hover:text-[#1d1b19] hover:bg-[#ede7e3] hidden sm:inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Share Feedback or Suggestions"
            >
              <MessageSquarePlus className="w-4 h-4 text-[#c85a32]" />
            </button>

            {/* Mentor Inbox / Announcements */}
            <button
              onClick={() => setInboxModalOpen(true)}
              className="w-8 h-8 rounded-full bg-[#f8f2ef] border border-[#e7e1de] text-[#2d2420] hover:text-[#1d1b19] hover:bg-[#ede7e3] hidden sm:inline-flex items-center justify-center transition-colors cursor-pointer shrink-0 relative"
              title="Mentor Messages & Announcements"
            >
              <Inbox className="w-4 h-4" />
              {unreadInboxCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c85a32] text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-xs">
                  {unreadInboxCount}
                </span>
              )}
            </button>

            {/* User Profile or Sign In Button */}
            {user ? (
              <div className="relative shrink-0 z-30" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-[#bf542c] text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                  title={member?.fullName || user.displayName || 'Scholar'}
                >
                  {initials}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border-2 border-[#19202e] shadow-[4px_4px_0px_#19202e] py-2 z-50 text-xs font-sans animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-[#e7e1de]">
                      <p className="font-semibold text-[#1d1b19] truncate">{member?.fullName || user.displayName || 'Scholar'}</p>
                      <p className="text-[11px] font-mono text-[#4a3b35] truncate">{member?.studyId || user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        router.push('/dashboard');
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-[#2d2420] hover:bg-[#f8f2ef] hover:text-[#1d1b19] cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#c85a32]" />
                      <span>Overview Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setAvatarStudioOpen(true);
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-[#2d2420] hover:bg-[#f8f2ef] hover:text-[#1d1b19] font-medium cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#c85a32]" />
                      <span>Scholar Avatar Studio</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setEditProfileModalOpen(true);
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-[#2d2420] hover:bg-[#f8f2ef] hover:text-[#1d1b19] font-medium cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#c85a32]" />
                      <span>Account &amp; Customization</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        router.push('/id-card');
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-[#2d2420] hover:bg-[#f8f2ef] hover:text-[#1d1b19] cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Digital Student Pass</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        router.push('/rooms');
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-[#2d2420] hover:bg-[#f8f2ef] hover:text-[#1d1b19] cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-[#c85a32]" />
                      <span>Focus Town Co-Study</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        router.push('/calendar');
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-[#2d2420] hover:bg-[#f8f2ef] hover:text-[#1d1b19] cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Planner &amp; Rhythm</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setInboxModalOpen(true);
                      }}
                      className="w-full text-left flex items-center justify-between px-4 py-2 text-[#2d2420] hover:bg-[#f8f2ef] hover:text-[#1d1b19] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Inbox className="w-3.5 h-3.5 text-[#c85a32]" />
                        <span>Mentor Messages</span>
                      </div>
                      {unreadInboxCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#c85a32] text-white text-[10px] font-mono font-bold">
                          {unreadInboxCount}
                        </span>
                      )}
                    </button>
                    <div className="border-t border-[#e7e1de] my-1" />
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (onSignOut) onSignOut();
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-[#ba1a1a] hover:bg-[#ffdad6]/40 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignInClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#c85a32] hover:bg-[#b04b25] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0 z-20 min-h-[36px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile / Tablet Menu Hamburger (visible below md breakpoint) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border-2 border-[#19202e] bg-white text-[#19202e] hover:bg-[#f8f2ef] active:translate-y-0.5 transition-all shrink-0 cursor-pointer shadow-xs min-h-[40px] min-w-[40px] flex items-center justify-center z-30"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Global Responsive Mobile / Tablet Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[100] md:hidden bg-[#19202e]/60 flex justify-end animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full max-w-xs bg-[#fef8f4] h-full shadow-[0_0_50px_rgba(0,0,0,0.3)] p-5 sm:p-6 overflow-y-auto border-l-2 border-[#19202e] flex flex-col justify-between animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#19202e] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#c85a32] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    SS
                  </div>
                  <div>
                    <span className="font-serif text-lg font-bold text-[#19202e] block leading-tight">StudySync</span>
                    <span className="font-mono text-[10px] text-[#4a3b35] block">A/L 2026 Companion</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-xl border-2 border-[#19202e] bg-white hover:bg-[#f8f2ef] flex items-center justify-center text-[#19202e] cursor-pointer shadow-xs active:translate-y-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scholar Account Card: Logged In vs Guest */}
              {user ? (
                <div className="mb-4 p-3.5 rounded-2xl bg-white border-2 border-[#19202e] shadow-[3px_3px_0px_#19202e] space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#bf542c] text-white flex items-center justify-center text-sm font-bold font-mono shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-[#19202e] truncate">{member?.fullName || user.displayName || 'Scholar'}</p>
                      <p className="text-[11px] font-mono text-[#4a3b35] truncate">{member?.studyId || user.email}</p>
                      {member?.stream && (
                        <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full bg-[#f3ede9] text-[#2d2420] text-[10px] font-mono">
                          {member.stream}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#e7e1de]">
                    <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#854f00]">
                      <Flame className="w-3.5 h-3.5 text-[#854f00]" />
                      {effectiveStreak} days streak
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onSignOut) onSignOut();
                      }}
                      className="text-[11px] text-[#ba1a1a] hover:underline font-semibold cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3.5 rounded-2xl bg-white border-2 border-[#19202e] shadow-[3px_3px_0px_#19202e] space-y-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#c85a32]" />
                    <span className="font-serif font-bold text-xs text-[#19202e]">Welcome, Scholar</span>
                  </div>
                  <p className="text-[11px] text-[#4a3b35] leading-relaxed">
                    Track daily revision, claim Focus Town study desks, and check cutoff forecasts.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setScholarLoginOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#c85a32] hover:bg-[#b04b25] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In / Create Pass</span>
                  </button>
                </div>
              )}

              {/* Navigation Links with Icons */}
              <div className="space-y-1.5">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.href}
                      type="button"
                      onClick={() => handleNavClick(link.href)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all cursor-pointer text-left',
                        isActive
                          ? 'bg-[#19202e] text-white border-[#19202e] shadow-xs'
                          : 'bg-white text-[#19202e] border-transparent hover:border-[#19202e]'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-[#c85a32]')} />
                      <span>{link.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Bottom Quick Utilities */}
            <div className="pt-4 border-t-2 border-[#19202e] space-y-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setInboxModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#19202e] text-[#19202e] font-bold text-xs shadow-[2px_2px_0px_#19202e] hover:bg-[#f8f2ef] transition-colors cursor-pointer active:translate-y-0.5"
              >
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-[#c85a32]" />
                  <span>Mentor Messages</span>
                </div>
                {unreadInboxCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#c85a32] text-white text-[10px] font-mono font-bold">
                    {unreadInboxCount} new
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAvatarStudioOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#19202e] text-[#19202e] font-bold text-xs shadow-[2px_2px_0px_#19202e] hover:bg-[#f8f2ef] transition-colors cursor-pointer active:translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-[#c85a32]" />
                <span>Scholar Avatar Studio</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setEditProfileModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#19202e] text-[#19202e] font-bold text-xs shadow-[2px_2px_0px_#19202e] hover:bg-[#f8f2ef] transition-colors cursor-pointer active:translate-y-0.5"
              >
                <Settings className="w-4 h-4 text-[#c85a32]" />
                <span>Account &amp; Study Settings</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('/verify')}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#19202e] text-[#19202e] font-bold text-xs shadow-[2px_2px_0px_#19202e] hover:bg-[#f8f2ef] transition-colors cursor-pointer active:translate-y-0.5"
              >
                <ShieldCheck className="w-4 h-4 text-[#456644]" />
                <span>Verify Student Pass</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setFeedbackModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#19202e] text-[#19202e] font-bold text-xs shadow-[2px_2px_0px_#19202e] hover:bg-[#f8f2ef] transition-colors cursor-pointer active:translate-y-0.5"
              >
                <MessageSquarePlus className="w-4 h-4 text-[#c85a32]" />
                <span>Send Feedback &amp; Suggestions</span>
              </button>

              <div className="flex items-center justify-between text-xs font-mono text-[#854f00] pt-1 px-1">
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  <span>{effectiveStreak}d active streak</span>
                </span>
                <span className="text-[10px] text-[#4a3b35]">A/L 2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AppLockModal isOpen={appLockModalOpen} onClose={() => setAppLockModalOpen(false)} userEmail={user?.email || 'student@studysync.lk'} />
      <UserInboxModal isOpen={inboxModalOpen} onClose={() => setInboxModalOpen(false)} studyId={member?.studyId || 'AL-2026'} studentName={member?.fullName || user?.displayName || 'Scholar'} studentEmail={user?.email || 'student@studysync.lk'} />
      <ScholarLoginModal isOpen={scholarLoginOpen} onClose={() => setScholarLoginOpen(false)} />
      <EditProfileModal open={editProfileModalOpen} onOpenChange={setEditProfileModalOpen} />
      <ScholarAvatarStudioModal open={avatarStudioOpen} onOpenChange={setAvatarStudioOpen} />
      <StudentFeedbackModal isOpen={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />
    </>
  );
}

export default Header;
