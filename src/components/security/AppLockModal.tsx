'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Fingerprint,
  Lock,
  Unlock,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  isBiometricsSupported,
  getSecurityConfig,
  saveSecurityConfig,
  registerBiometrics,
  verifyBiometrics,
  setAppPin,
  verifyAppPin,
  isAppSessionLocked,
  lockAppSession,
  unlockAppSession,
} from '@/lib/security/biometrics';

interface AppLockModalProps {
  userEmail?: string;
  isOpen?: boolean;
  onClose?: () => void;
  mode?: 'unlock' | 'settings';
}

export function AppLockModal({
  userEmail = 'student@studysync.lk',
  isOpen = false,
  onClose,
  mode = 'unlock',
}: AppLockModalProps) {
  const [activeTab, setActiveTab] = useState<'unlock' | 'settings'>(mode);
  const [pinInput, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [securityConfig, setSecurityConfig] = useState(getSecurityConfig());
  const [verifyingBio, setVerifyingBio] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    isBiometricsSupported().then(setBiometricsAvailable);
    setSecurityConfig(getSecurityConfig());
    setIsLocked(isAppSessionLocked());
  }, [isOpen]);

  // Attempt biometric unlock automatically if enabled
  const handleBiometricUnlock = async () => {
    try {
      setVerifyingBio(true);
      const res = await verifyBiometrics();
      if (res.success) {
        toast.success('Identity verified with Windows Hello / Biometrics!');
        setIsLocked(false);
        onClose?.();
      } else {
        toast.error(res.error || 'Biometric verification cancelled.');
      }
    } catch (e: any) {
      toast.error('Biometric error: ' + e.message);
    } finally {
      setVerifyingBio(false);
    }
  };

  const handlePinUnlock = async () => {
    if (pinInput.length < 4) {
      toast.error('Enter at least 4 digits');
      return;
    }
    const isValid = await verifyAppPin(pinInput);
    if (isValid) {
      toast.success('App unlocked successfully');
      setPinInput('');
      setIsLocked(false);
      onClose?.();
    } else {
      toast.error('Incorrect PIN. Please try again.');
      setPinInput('');
    }
  };

  const handleNumpadPress = (digit: string) => {
    if (pinInput.length < 6) {
      const next = pinInput + digit;
      setPinInput(next);
      if (next.length >= 4 && securityConfig.pinEnabled) {
        verifyAppPin(next).then((valid) => {
          if (valid) {
            toast.success('App unlocked!');
            setPinInput('');
            setIsLocked(false);
            onClose?.();
          }
        });
      }
    }
  };

  const handleEnableBiometrics = async () => {
    if (!userEmail) {
      toast.error('Please sign in first');
      return;
    }
    setVerifyingBio(true);
    const res = await registerBiometrics(userEmail);
    setVerifyingBio(false);
    if (res.success) {
      toast.success('Windows Hello / Biometric lock enabled!');
      setSecurityConfig(getSecurityConfig());
    } else {
      toast.error(res.error || 'Enrollment failed.');
    }
  };

  const handleSaveNewPin = async () => {
    if (newPin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    await setAppPin(newPin);
    toast.success('Security PIN saved successfully!');
    setNewPin('');
    setConfirmPin('');
    setSecurityConfig(getSecurityConfig());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="bg-[#FBF9F5] dark:bg-[#111614] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] max-w-sm rounded-2xl p-6 shadow-xl">
        <DialogHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-[#EFE9DF] dark:bg-white/[0.05] border border-[#E5DDD0] dark:border-white/[0.08] flex items-center justify-center text-[#132219] dark:text-[#F2EFE9]">
            {securityConfig.biometricsEnabled ? (
              <Fingerprint className="h-6 w-6 text-[#2D5A43] animate-pulse" strokeWidth={1.5} />
            ) : (
              <Lock className="h-6 w-6 text-[#C85A32]" strokeWidth={1.5} />
            )}
          </div>
          <DialogTitle className="text-xl font-serif font-medium tracking-tight text-[#132219] dark:text-[#F2EFE9]">
            {activeTab === 'unlock' ? 'Registry Vault & App Lock' : 'Biometric & Passcode Settings'}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#697D72] dark:text-[#8E9A90]">
            {activeTab === 'unlock'
              ? 'Windows Hello, Fingerprint, Touch ID, or security PIN'
              : 'Configure hardware authenticators and local passcodes'}
          </DialogDescription>
        </DialogHeader>

        {activeTab === 'unlock' ? (
          <div className="space-y-5 pt-2">
            {/* Biometric 1-Tap Trigger */}
            {securityConfig.biometricsEnabled && (
              <Button
                onClick={handleBiometricUnlock}
                disabled={verifyingBio}
                className="w-full h-12 bg-[#2D5A43] hover:bg-[#234735] text-white rounded-xl font-medium flex items-center justify-center gap-2.5 cursor-pointer shadow-sm transition-all"
              >
                <Fingerprint className="h-5 w-5 animate-pulse" strokeWidth={1.5} />
                <span>{verifyingBio ? 'Scanning...' : 'Verify Windows Hello / Touch ID'}</span>
              </Button>
            )}

            {/* PIN Dots Indicator */}
            {securityConfig.pinEnabled && (
              <div className="space-y-4">
                <div className="flex justify-center gap-3 py-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`h-3.5 w-3.5 rounded-full border transition-all ${
                        pinInput.length > idx
                          ? 'bg-[#C85A32] border-[#C85A32] scale-110 shadow-sm'
                          : 'bg-[#EFE9DF] dark:bg-white/[0.05] border-[#E5DDD0] dark:border-white/[0.08]'
                      }`}
                    />
                  ))}
                </div>

                {/* Tactile Numpad */}
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <Button
                      key={num}
                      variant="outline"
                      onClick={() => handleNumpadPress(num)}
                      className="h-11 rounded-xl text-sm font-mono font-medium bg-[#F5F1E9] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] hover:bg-[#EFE9DF] dark:hover:bg-white/[0.05] active:scale-95 transition-all cursor-pointer"
                    >
                      {num}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    onClick={() => setPinInput('')}
                    className="h-11 rounded-xl text-xs text-[#697D72] dark:text-[#8E9A90] hover:text-[#132219] cursor-pointer"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleNumpadPress('0')}
                    className="h-11 rounded-xl text-sm font-mono font-medium bg-[#F5F1E9] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] hover:bg-[#EFE9DF] dark:hover:bg-white/[0.05] active:scale-95 transition-all cursor-pointer"
                  >
                    0
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setPinInput((p) => p.slice(0, -1))}
                    className="h-11 rounded-xl text-xs text-[#697D72] dark:text-[#8E9A90] hover:text-[#132219] cursor-pointer"
                  >
                    Del
                  </Button>
                </div>
              </div>
            )}

            {!securityConfig.biometricsEnabled && !securityConfig.pinEnabled && (
              <div className="p-4 rounded-xl bg-[#F5F1E9] dark:bg-[#17201D] border border-[#E5DDD0] dark:border-white/[0.08] text-center space-y-3">
                <ShieldCheck className="h-7 w-7 text-[#C85A32] mx-auto" strokeWidth={1.5} />
                <p className="text-xs text-[#697D72] dark:text-[#8E9A90]">
                  App lock is not set up yet. Enable Windows Hello or a security PIN to protect your academic records.
                </p>
                <Button
                  onClick={() => setActiveTab('settings')}
                  className="w-full bg-[#132219] dark:bg-[#F2EFE9] hover:bg-[#203628] dark:hover:bg-white text-[#FBF9F5] dark:text-[#132219] rounded-xl h-10 text-xs font-medium cursor-pointer"
                >
                  Configure Protection Now
                </Button>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 text-xs text-[#697D72] dark:text-[#8E9A90]">
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="hover:text-[#132219] dark:hover:text-white cursor-pointer underline"
              >
                Security Settings
              </button>
              <button
                type="button"
                onClick={() => onClose?.()}
                className="hover:text-[#132219] dark:hover:text-white cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : (
          /* Settings Tab */
          <div className="space-y-4 pt-2">
            {/* Windows Hello / Biometric Enroller */}
            <div className="p-3.5 rounded-xl bg-[#F5F1E9] dark:bg-[#17201D] border border-[#E5DDD0] dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-medium text-[#132219] dark:text-[#F2EFE9] flex items-center gap-1.5">
                  <Fingerprint className="h-4 w-4 text-[#2D5A43]" strokeWidth={1.5} />
                  Windows Hello / Biometrics
                </span>
                {securityConfig.biometricsEnabled && (
                  <span className="text-[10px] text-[#2D5A43] font-mono font-medium px-2 py-0.5 rounded-md bg-[#2D5A43]/10 border border-[#2D5A43]/20">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#697D72] dark:text-[#8E9A90]">
                {biometricsAvailable
                  ? 'Use device fingerprint sensor, Windows Hello, or Face ID to unlock StudySync.'
                  : 'Device biometric hardware is being verified.'}
              </p>
              <Button
                size="sm"
                onClick={handleEnableBiometrics}
                disabled={verifyingBio}
                className="w-full h-9 bg-[#2D5A43] hover:bg-[#234735] text-white rounded-xl text-xs font-medium cursor-pointer"
              >
                {securityConfig.biometricsEnabled ? 'Re-enroll Biometrics' : 'Enable Windows Hello / Touch ID'}
              </Button>
            </div>

            {/* PIN Code Enroller */}
            <div className="p-3.5 rounded-xl bg-[#F5F1E9] dark:bg-[#17201D] border border-[#E5DDD0] dark:border-white/[0.08] space-y-2.5">
              <span className="text-xs font-serif font-medium text-[#132219] dark:text-[#F2EFE9] flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-[#C85A32]" strokeWidth={1.5} />
                4-Digit Security PIN
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-[#697D72] dark:text-[#8E9A90]">New PIN</Label>
                  <Input
                    type="password"
                    maxLength={6}
                    placeholder="â€¢â€¢â€¢â€¢"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="h-9 bg-[#FBF9F5] dark:bg-[#111614] border-[#E5DDD0] dark:border-white/[0.08] text-center text-sm rounded-lg text-[#132219] dark:text-[#F2EFE9]"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-[#697D72] dark:text-[#8E9A90]">Confirm PIN</Label>
                  <Input
                    type="password"
                    maxLength={6}
                    placeholder="â€¢â€¢â€¢â€¢"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="h-9 bg-[#FBF9F5] dark:bg-[#111614] border-[#E5DDD0] dark:border-white/[0.08] text-center text-sm rounded-lg text-[#132219] dark:text-[#F2EFE9]"
                  />
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleSaveNewPin}
                disabled={newPin.length < 4}
                className="w-full h-9 bg-[#132219] dark:bg-[#F2EFE9] hover:bg-[#203628] dark:hover:bg-white text-[#FBF9F5] dark:text-[#132219] rounded-xl text-xs font-medium cursor-pointer"
              >
                Save Security PIN
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setActiveTab('unlock')}
              className="w-full h-10 border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] hover:bg-[#EFE9DF] rounded-xl text-xs cursor-pointer"
            >
              Back to Lock Screen
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
