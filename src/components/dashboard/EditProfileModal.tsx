'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  School,
  Send,
  Sparkles,
  ShieldCheck,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  GraduationCap,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { SRI_LANKAN_SCHOOLS, DISTRICTS } from '@/lib/schools';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const {
    user,
    member,
    updateProfile,
    sendEmailVerificationLink,
    checkEmailVerificationStatus,
  } = useAuth();

  const [fullName, setFullName] = useState(member?.fullName || '');
  const [gender, setGender] = useState(member?.gender || 'Other');
  const [telegram, setTelegram] = useState(member?.telegram || '');
  const [school, setSchool] = useState(member?.school || '');
  const [district, setDistrict] = useState(member?.district || 'Colombo');
  const [stream, setStream] = useState<'Biological Science' | 'Physical Science'>(
    (member?.stream as any) || 'Physical Science'
  );
  const [optionalSubject, setOptionalSubject] = useState(
    member?.optionalSubject || (member?.stream === 'Biological Science' ? 'Physics' : 'Chemistry')
  );
  const [examYear, setExamYear] = useState(member?.examYear || '2026');
  const [targetWeeklyHours, setTargetWeeklyHours] = useState<number>(member?.targetWeeklyHours || 25);

  const [saving, setSaving] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  // Sync state when modal opens
  React.useEffect(() => {
    if (member) {
      setFullName(member.fullName || '');
      setGender(member.gender || 'Other');
      setTelegram(member.telegram || '');
      setSchool(member.school || '');
      setDistrict(member.district || 'Colombo');
      setStream((member.stream as any) || 'Physical Science');
      setOptionalSubject(
        member.optionalSubject || (member.stream === 'Biological Science' ? 'Physics' : 'Chemistry')
      );
      setExamYear(member.examYear || '2026');
      setTargetWeeklyHours(member.targetWeeklyHours || 25);
    }
  }, [member, open]);

  const handleStreamChange = (newStream: 'Biological Science' | 'Physical Science') => {
    setStream(newStream);
    if (newStream === 'Biological Science') {
      setOptionalSubject('Physics');
    } else {
      setOptionalSubject('Chemistry');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full Name cannot be empty.');
      return;
    }
    if (!school.trim()) {
      toast.error('School name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const cleanTelegram = telegram.trim()
        ? telegram.trim().startsWith('@')
          ? telegram.trim()
          : '@' + telegram.trim()
        : '';

      const ok = await updateProfile({
        fullName: fullName.trim(),
        gender,
        telegram: cleanTelegram,
        school: school.trim(),
        district,
        stream,
        optionalSubject,
        examYear,
        targetWeeklyHours,
      });

      if (ok) {
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSendVerification = async () => {
    setSendingVerification(true);
    try {
      const res = await sendEmailVerificationLink();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } finally {
      setSendingVerification(false);
    }
  };

  const handleRefreshVerification = async () => {
    setCheckingVerification(true);
    try {
      const isVerified = await checkEmailVerificationStatus();
      if (isVerified) {
        toast.success('Your email is verified with Google!');
      } else {
        toast.info('Email is still pending verification. Please click the link in your email.');
      }
    } finally {
      setCheckingVerification(false);
    }
  };

  const isEmailVerified = user?.emailVerified;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-[#fef8f4] border border-[#dec0b7]/80 text-[#1d1b19] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 border-b border-[#dec0b7]/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-[#c85a32]/10 border border-[#c85a32]/20 flex items-center justify-center text-[#c85a32]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[#1d1b19] font-serif">
                Scholar Profile &amp; Customization
              </DialogTitle>
              <DialogDescription className="text-xs text-[#2d2420]">
                Configure your candidate profile, district quota weighting, and weekly goals.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 1. Account & Email Verification Status Box */}
        <div className="p-4 rounded-2xl bg-white border border-[#dec0b7]/60 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#c85a32]" />
              <span className="text-xs font-semibold text-[#1d1b19]">Authenticated Email:</span>
            </div>
            {isEmailVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#c6edc1] text-[#022106] border border-[#456644]/20">
                <CheckCircle2 className="h-3 w-3 text-[#456644]" /> Verified Account
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdcbc] text-[#854f00] border border-[#854f00]/20">
                <AlertCircle className="h-3 w-3" /> Verification Pending
              </span>
            )}
          </div>

          <div className="text-xs font-mono text-[#1d1b19] bg-[#f8f2ef] p-2.5 rounded-xl border border-[#dec0b7]/40 truncate">
            {user?.email || member?.email || 'scholar@studysync.lk'}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendVerification}
              disabled={sendingVerification || isEmailVerified}
              className="text-xs border-[#dec0b7] bg-white hover:bg-[#f8f2ef] text-[#1d1b19] rounded-xl h-8 px-3 cursor-pointer"
            >
              {sendingVerification ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Send className="h-3.5 w-3.5 mr-1.5 text-[#c85a32]" />
              )}
              <span>{isEmailVerified ? 'Email Already Verified' : 'Send Verification Email Link'}</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRefreshVerification}
              disabled={checkingVerification}
              className="text-xs text-[#2d2420] hover:text-[#1d1b19] hover:bg-[#f8f2ef] rounded-xl h-8 px-2.5 cursor-pointer"
            >
              <RefreshCw
                className={'h-3.5 w-3.5 mr-1 ' + (checkingVerification ? 'animate-spin' : '')}
              />
              <span>Refresh Status</span>
            </Button>
          </div>
        </div>

        {/* 2. Profile Editing Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-xs text-[#1d1b19] font-medium">Candidate Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Kasun Fernando"
              className="bg-white border-[#dec0b7] text-[#1d1b19] rounded-xl h-10 text-sm focus:border-[#c85a32]"
              required
            />
          </div>

          {/* District & Target Exam Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#1d1b19] font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#c85a32]" />
                <span>Home District</span>
              </Label>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger className="bg-white border-[#dec0b7] text-[#1d1b19] rounded-xl h-10 text-sm">
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#dec0b7] text-[#1d1b19] max-h-60">
                  {DISTRICTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#1d1b19] font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#c85a32]" />
                <span>Target Exam Year</span>
              </Label>
              <Select value={examYear} onValueChange={setExamYear}>
                <SelectTrigger className="bg-white border-[#dec0b7] text-[#1d1b19] rounded-xl h-10 text-sm">
                  <SelectValue placeholder="Select Exam Year" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#dec0b7] text-[#1d1b19]">
                  <SelectItem value="2026">2026 A/L (August)</SelectItem>
                  <SelectItem value="2027">2027 A/L (August)</SelectItem>
                  <SelectItem value="2028">2028 A/L</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* School Name */}
          <div className="space-y-1.5">
            <Label className="text-xs text-[#1d1b19] font-medium">School</Label>
            <Input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              list="sri-lankan-schools-list"
              placeholder="e.g. Royal College Colombo / Ananda College"
              className="bg-white border-[#dec0b7] text-[#1d1b19] rounded-xl h-10 text-sm focus:border-[#c85a32]"
              required
            />
            <datalist id="sri-lankan-schools-list">
              {SRI_LANKAN_SCHOOLS.map((s) => (
                <option key={s.name} value={s.name} />
              ))}
            </datalist>
          </div>

          {/* Gender & Weekly Study Quota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#1d1b19] font-medium">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-white border-[#dec0b7] text-[#1d1b19] rounded-xl h-10 text-sm">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#dec0b7] text-[#1d1b19]">
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#1d1b19] font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#c85a32]" />
                <span>Weekly Study Goal</span>
              </Label>
              <Select
                value={String(targetWeeklyHours)}
                onValueChange={(val) => setTargetWeeklyHours(Number(val))}
              >
                <SelectTrigger className="bg-white border-[#dec0b7] text-[#1d1b19] rounded-xl h-10 text-sm">
                  <SelectValue placeholder="Target Hours" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#dec0b7] text-[#1d1b19]">
                  <SelectItem value="15">15 Hours / Week (2.1h/day)</SelectItem>
                  <SelectItem value="20">20 Hours / Week (2.8h/day)</SelectItem>
                  <SelectItem value="25">25 Hours / Week (3.5h/day)</SelectItem>
                  <SelectItem value="30">30 Hours / Week (4.3h/day)</SelectItem>
                  <SelectItem value="35">35 Hours / Week (5.0h/day)</SelectItem>
                  <SelectItem value="40">40 Hours / Week (5.7h/day - Intensive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Telegram Handle */}
          <div className="space-y-1.5">
            <Label className="text-xs text-[#1d1b19] font-medium">Telegram Username (for Study Bot Sync)</Label>
            <Input
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@your_username"
              className="bg-white border-[#dec0b7] text-[#1d1b19] rounded-xl h-10 text-sm focus:border-[#c85a32] font-mono"
            />
          </div>

          {/* Stream & Optional Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#1d1b19] font-medium">A/L Examination Stream</Label>
              <Select
                value={stream}
                onValueChange={(val: any) => handleStreamChange(val)}
              >
                <SelectTrigger className="bg-white border-[#dec0b7] text-[#1d1b19] rounded-xl h-10 text-sm">
                  <SelectValue placeholder="Select Stream" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#dec0b7] text-[#1d1b19]">
                  <SelectItem value="Physical Science">Physical Science (Combined Maths)</SelectItem>
                  <SelectItem value="Biological Science">Biological Science (Biology)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#1d1b19] font-medium">3rd Subject Choice</Label>
              <Select value={optionalSubject} onValueChange={setOptionalSubject}>
                <SelectTrigger className="bg-white border-[#dec0b7] text-[#1d1b19] rounded-xl h-10 text-sm">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#dec0b7] text-[#1d1b19]">
                  {stream === 'Physical Science' ? (
                    <>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="ICT">Information &amp; Communication Tech (ICT)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Agriculture">Agricultural Science</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#dec0b7]/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#dec0b7] bg-white hover:bg-[#f8f2ef] text-[#2d2420] rounded-xl h-10 px-4 text-xs cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="bg-[#c85a32] hover:bg-[#b04b25] text-white font-semibold rounded-xl h-10 px-5 text-xs shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Save Account Customizations</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
