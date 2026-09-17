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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Inbox,
  FileQuestion,
  CheckCircle2,
  Send,
  MessageSquare,
  Sparkles,
  Clock,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { InboxMessage, AdminForm } from '@/types/forms';
import { localDb } from '@/lib/storage/localDb';
import { api } from '@/lib/api';

interface UserInboxModalProps {
  studyId: string;
  studentName: string;
  studentEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function UserInboxModal({
  studyId,
  studentName,
  studentEmail,
  isOpen,
  onClose,
  onUnreadCountChange,
}: UserInboxModalProps) {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [activeFormMessage, setActiveFormMessage] = useState<InboxMessage | null>(null);
  const [formAnswers, setFormAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const loadInbox = () => {
    if (!studyId) return;
    const inbox = localDb.getStudentInbox(studyId);
    setMessages(inbox);
    const unread = inbox.filter((m) => !m.read).length;
    onUnreadCountChange?.(unread);
  };

  useEffect(() => {
    if (isOpen) {
      loadInbox();
      setActiveFormMessage(null);
      setFormAnswers({});
    }
  }, [isOpen, studyId]);

  const handleOpenMessage = (msg: InboxMessage) => {
    localDb.markInboxMessageRead(studyId, msg.id);
    loadInbox();

    if (msg.type === 'form' && msg.form) {
      setActiveFormMessage(msg);
      setFormAnswers({});
    }
  };

  const handleAnswerChange = (fieldId: string, value: any) => {
    setFormAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmitForm = () => {
    if (!activeFormMessage || !activeFormMessage.form) return;
    const form = activeFormMessage.form;

    // Validate required fields
    for (const f of form.fields) {
      if (f.required && (formAnswers[f.id] === undefined || formAnswers[f.id] === '')) {
        toast.error(`Please answer required question: "${f.label}"`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const responsePayload = {
        responseId: `RESP-${Date.now()}`,
        formId: form.formId,
        studyId,
        studentName,
        studentEmail,
        answers: formAnswers,
        submittedAt: new Date().toISOString(),
      };

      localDb.submitFormResponse(responsePayload);
      api.submitFormResponse(responsePayload).catch(() => {});

      toast.success('Your response has been sent to the teachers & administrators!');
      loadInbox();
      setActiveFormMessage(null);
    } catch (e: any) {
      toast.error('Failed to submit response: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#FBF9F5] dark:bg-[#111614] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-xl">
        <DialogHeader className="pb-3 border-b border-[#E5DDD0] dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-[#EFE9DF] dark:bg-white/[0.05] border border-[#E5DDD0] dark:border-white/[0.08] flex items-center justify-center text-[#132219] dark:text-[#F2EFE9]">
              <Inbox className="h-5 w-5 text-[#C85A32]" strokeWidth={1.5} />
            </div>
            <div>
              <DialogTitle className="text-lg font-serif font-medium text-[#132219] dark:text-[#F2EFE9]">
                Scholar Dispatch & Surveys
              </DialogTitle>
              <DialogDescription className="text-xs text-[#697D72] dark:text-[#8E9A90]">
                Institutional questionnaires, study feedback, and coordinator notices
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {activeFormMessage && activeFormMessage.form ? (
          /* Active Form Runner View */
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFormMessage(null)}
                className="h-8 text-xs text-[#697D72] dark:text-[#8E9A90] hover:text-[#132219] p-0 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Back to Inbox
              </Button>
              <span className="text-[11px] text-[#C85A32] font-mono font-medium">
                Official Questionnaire
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F1E9] dark:bg-[#17201D] border border-[#E5DDD0] dark:border-white/[0.08] space-y-1">
              <h3 className="text-base font-serif font-medium text-[#132219] dark:text-[#F2EFE9]">
                {activeFormMessage.form.title}
              </h3>
              {activeFormMessage.form.description && (
                <p className="text-xs text-[#697D72] dark:text-[#8E9A90]">
                  {activeFormMessage.form.description}
                </p>
              )}
            </div>

            {/* Questions Runner */}
            <div className="space-y-4 pt-1">
              {activeFormMessage.form.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="p-4 rounded-xl bg-[#F5F1E9] dark:bg-[#17201D] border border-[#E5DDD0] dark:border-white/[0.08] space-y-2.5"
                >
                  <Label className="text-xs font-medium text-[#132219] dark:text-[#F2EFE9] flex items-start gap-1">
                    <span className="text-[#C85A32] font-mono">{idx + 1}.</span>
                    <span>{field.label}</span>
                    {field.required && <span className="text-[#C85A32]">*</span>}
                  </Label>

                  {field.type === 'text' && (
                    <Input
                      placeholder={field.placeholder || 'Type your answer...'}
                      value={formAnswers[field.id] || ''}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      className="bg-[#FBF9F5] dark:bg-[#111614] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] text-xs h-9 rounded-lg"
                    />
                  )}

                  {field.type === 'textarea' && (
                    <Textarea
                      placeholder={field.placeholder || 'Type your answer...'}
                      value={formAnswers[field.id] || ''}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      rows={3}
                      className="bg-[#FBF9F5] dark:bg-[#111614] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] text-xs rounded-lg"
                    />
                  )}

                  {field.type === 'radio' && (
                    <div className="space-y-1.5 pt-1">
                      {(field.options || []).map((opt, oi) => (
                        <label
                          key={oi}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            formAnswers[field.id] === opt
                              ? 'bg-[#EFE9DF] dark:bg-white/[0.08] border-[#132219] dark:border-white/30 text-[#132219] dark:text-[#F2EFE9] font-medium'
                              : 'bg-[#FBF9F5] dark:bg-[#111614] border-[#E5DDD0] dark:border-white/[0.08] text-[#697D72] dark:text-[#8E9A90] hover:text-[#132219]'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q_${field.id}`}
                            checked={formAnswers[field.id] === opt}
                            onChange={() => handleAnswerChange(field.id, opt)}
                            className="text-[#C85A32]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === 'rating' && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {Array.from({ length: (field.maxRating || 10) - (field.minRating || 1) + 1 }).map((_, rIdx) => {
                        const score = (field.minRating || 1) + rIdx;
                        const isSelected = formAnswers[field.id] === score;
                        return (
                          <Button
                            key={score}
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleAnswerChange(field.id, score)}
                            className={`h-9 w-9 p-0 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#C85A32] border-[#C85A32] text-white shadow-sm'
                                : 'bg-[#FBF9F5] dark:bg-[#111614] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] hover:bg-[#EFE9DF]'
                            }`}
                          >
                            {score}
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  {field.type === 'date' && (
                    <Input
                      type="date"
                      value={formAnswers[field.id] || ''}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      className="bg-[#FBF9F5] dark:bg-[#111614] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] text-xs h-9 rounded-lg font-mono"
                    />
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubmitForm}
              disabled={submitting}
              className="w-full h-11 bg-[#C85A32] hover:bg-[#B04C27] text-white rounded-xl font-serif font-medium flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-3"
            >
              <Send className="h-4 w-4" strokeWidth={1.5} />
              <span>{submitting ? 'Submitting Answers...' : 'Submit Answers'}</span>
            </Button>
          </div>
        ) : (
          /* Messages List View */
          <div className="space-y-3 pt-2">
            {messages.length === 0 ? (
              <div className="py-12 text-center text-[#697D72] dark:text-[#8E9A90] text-xs font-mono">
                Your archive inbox is clear. No active questionnaires or notices.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    !msg.read
                      ? 'bg-[#F5F1E9] dark:bg-[#17201D] border-[#C85A32]/40 shadow-sm'
                      : 'bg-[#FBF9F5] dark:bg-[#111614] border-[#E5DDD0] dark:border-white/[0.08] hover:bg-[#F5F1E9]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        msg.type === 'form'
                          ? 'bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/20'
                          : 'bg-[#2D5A43]/10 text-[#2D5A43] border border-[#2D5A43]/20'
                      }`}
                    >
                      {msg.type === 'form' ? (
                        <FileQuestion className="h-4 w-4" strokeWidth={1.5} />
                      ) : (
                        <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-serif font-medium text-[#132219] dark:text-[#F2EFE9]">
                          {msg.title}
                        </span>
                        {!msg.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#C85A32]" />
                        )}
                        {msg.responded && (
                          <span className="text-[10px] text-[#2D5A43] font-mono px-2 py-0.2 rounded-md bg-[#2D5A43]/10">
                            Answered
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#697D72] dark:text-[#8E9A90] line-clamp-1">
                        {msg.body}
                      </p>
                      <span className="text-[10px] text-[#697D72] dark:text-[#8E9A90] font-mono">
                        From: {msg.sender}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-[#697D72] dark:text-[#8E9A90] shrink-0" strokeWidth={1.5} />
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
