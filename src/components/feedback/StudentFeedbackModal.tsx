'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { localDb } from '@/lib/storage/localDb';
import { FeedbackCategory, FeedbackSentiment } from '@/types/feedback';
import {
  MessageSquarePlus,
  X,
  Send,
  Star,
  BookOpen,
  Bug,
  Lightbulb,
  FileCheck,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface StudentFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentFeedbackModal: React.FC<StudentFeedbackModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, member } = useAuth();

  const [category, setCategory] = useState<FeedbackCategory>('feature_request');
  const [sentiment, setSentiment] = useState<FeedbackSentiment>('positive');
  const [rating, setRating] = useState<number>(5);
  const [subject, setSubject] = useState<string>('Combined Mathematics');
  const [message, setMessage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const categories: { id: FeedbackCategory; label: string; icon: React.ElementType }[] = [
    { id: 'feature_request', label: 'Feature Suggestion', icon: Lightbulb },
    { id: 'curriculum', label: 'Curriculum & Theory', icon: BookOpen },
    { id: 'bug_report', label: 'Bug Report', icon: Bug },
    { id: 'paper_correction', label: 'Past Paper Marking', icon: FileCheck },
    { id: 'general_appreciation', label: 'Mentor Message', icon: Heart },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter your feedback message.');
      return;
    }

    try {
      setSubmitting(true);
      localDb.saveFeedback({
        studyId: isAnonymous ? undefined : member?.studyId || undefined,
        studentName: isAnonymous ? 'Anonymous Scholar' : member?.fullName || user?.displayName || 'Scholar',
        studentEmail: isAnonymous ? undefined : user?.email || undefined,
        category,
        sentiment,
        rating,
        subject,
        stream: member?.stream || 'Physical Science',
        district: member?.school ? member.school : 'Colombo',
        message: message.trim(),
      });

      toast.success('Feedback submitted successfully to StudySync administrators.');
      setMessage('');
      onClose();
    } catch (err: any) {
      toast.error('Failed to submit feedback: ' + (err?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1d1b19]/60 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#fef8f4] border-2 border-[#1d1b19] rounded-3xl shadow-[6px_6px_0px_#1d1b19] p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#dec0b7]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c85a32] flex items-center justify-center text-white shadow-xs">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-[#c85a32] tracking-wider">
                Student &amp; Mentor Voice
              </span>
              <h3 className="font-serif text-xl font-bold text-[#1d1b19]">
                StudySync Feedback
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#dec0b7] hover:bg-[#ede7e3] flex items-center justify-center text-[#1d1b19] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
          {/* Category Chips */}
          <div className="space-y-2">
            <label className="font-mono text-[11px] uppercase font-semibold text-[#57423b] tracking-wider block">
              Feedback Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const active = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-[#c85a32] text-white border-[#c85a32] font-semibold shadow-xs'
                        : 'bg-white text-[#1d1b19] border-[#dec0b7]/60 hover:bg-[#f3ede9]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate text-[11px]">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject & Experience Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[11px] uppercase font-semibold text-[#57423b] tracking-wider block">
                Related Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-[#dec0b7] rounded-xl px-3 py-2 text-xs text-[#1d1b19] focus:outline-none focus:border-[#c85a32]"
              >
                <option value="Combined Mathematics">Combined Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="General Platform Experience">General Platform Experience</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[11px] uppercase font-semibold text-[#57423b] tracking-wider block">
                Overall Satisfaction
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 rounded hover:bg-[#f3ede9] transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating
                          ? 'text-[#fcd34d] fill-[#fcd34d]'
                          : 'text-[#dec0b7]'
                      }`}
                    />
                  </button>
                ))}
                <span className="font-mono text-[11px] text-[#57423b] ml-1">
                  {rating}/5
                </span>
              </div>
            </div>
          </div>

          {/* Message Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[11px] uppercase font-semibold text-[#57423b] tracking-wider">
                Your Feedback or Report
              </label>
              <span className="font-mono text-[10px] text-[#6b5952]">
                {message.length}/500
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              placeholder="Describe your suggestion, syllabus doubt, or experience in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white border border-[#dec0b7] rounded-2xl p-3 text-xs text-[#1d1b19] placeholder:text-[#8a726a] focus:outline-none focus:border-[#c85a32] resize-none"
            />
          </div>

          {/* Identity & Anonymous Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#dec0b7]/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#456644]" />
              <div>
                <span className="font-semibold text-[#1d1b19] block text-[11px]">
                  {isAnonymous ? 'Anonymous Submission' : (member?.fullName || user?.displayName || 'Registered Scholar')}
                </span>
                <span className="font-mono text-[10px] text-[#6b5952] block">
                  {isAnonymous ? 'Your identity is strictly withheld from mentors' : (member?.studyId || 'Authenticated')}
                </span>
              </div>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-3.5 h-3.5 text-[#c85a32] rounded focus:ring-0"
              />
              <span className="text-[11px] text-[#57423b]">Anonymous</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-[#dec0b7] text-[#57423b] hover:bg-[#ede7e3] font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-full bg-[#c85a32] hover:bg-[#b04b25] text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Send Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
