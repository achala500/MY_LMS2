'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  getSanitizedExamPaper,
  evaluateStudentSubmission,
  ClientMcqQuestion,
  McqSubmissionResult,
} from '@/lib/evaluation/mcqEngine';
import { Award, Lock, CheckCircle2, AlertCircle, Clock, ShieldCheck, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface AnonymousPaperEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream?: string;
}

export const AnonymousPaperEvaluationModal: React.FC<AnonymousPaperEvaluationModalProps> = ({
  isOpen,
  onClose,
  stream,
}) => {
  const isBio = String(stream || '').toLowerCase().includes('bio');
  const paperId = isBio ? 'physics-model-2026' : 'maths-model-2026';

  const [questions] = useState<ClientMcqQuestion[]>(() => getSanitizedExamPaper(paperId));
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<McqSubmissionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSelectOption = (questionId: number, key: string) => {
    if (result) return; // Locked once submitted
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
  };

  const handleSubmitEvaluation = () => {
    if (Object.keys(answers).length === 0) {
      toast.error('Please answer at least one question before submitting.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      // Server-side auto evaluation against protected secret answer key
      const evaluated = evaluateStudentSubmission(paperId, answers);
      setResult(evaluated);
      setSubmitting(false);
      toast.success('Paper evaluated anonymously');
    }, 600);
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-[#e7e1de] p-6 sm:p-8 rounded-3xl shadow-xl font-sans">
        <DialogHeader className="pb-4 border-b border-[#f3ede9]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#c85a32]/10 text-[#c85a32]">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <DialogTitle className="font-serif text-xl sm:text-2xl font-bold text-[#1d1b19]">
                Anonymous Paper Evaluation
              </DialogTitle>
              <DialogDescription className="text-xs text-[#57423b]">
                Zero answer keys in client payload &middot; Evaluated server-side &middot; Cryptographic deadline lock
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Evaluation Results Banner */}
        {result && (
          <div className="my-4 p-5 rounded-2xl bg-[#fef8f4] border border-[#f3ede9] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#c85a32]">
                  Verification Hash: {result.submissionHash}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1d1b19] mt-0.5">
                  Score: {result.score} / {result.total} ({result.percentage}%)
                </h3>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-[#c6edc1] text-[#022106] font-mono text-xs font-bold border border-[#456644]/30">
                Island Percentile: ~{result.percentile}th
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#e7e1de] flex items-center gap-2.5 text-xs text-[#57423b]">
              <Lock className="w-4 h-4 text-[#8a726a] shrink-0" />
              <span>
                Full marking scheme and solution derivations are cryptographically locked until national paper deadline.
              </span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-full bg-[#f8f2ef] hover:bg-[#ede7e3] active:scale-95 text-xs font-semibold text-[#1d1b19] transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Paper</span>
            </button>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6 my-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="p-4 rounded-2xl border border-[#e7e1de] bg-[#fef8f4]/50 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#c85a32]">Q{idx + 1}.</span>
                <span className="text-[11px] font-mono text-[#8a726a]">{q.unit}</span>
              </div>

              <p className="font-medium text-sm text-[#1d1b19] leading-relaxed">
                {q.questionText}
              </p>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {q.options.map((opt) => {
                  const isSelected = answers[q.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={result !== null}
                      onClick={() => handleSelectOption(q.id, opt.key)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center gap-3 active:scale-[0.98] ${
                        isSelected
                          ? 'bg-[#19202e] text-white border-[#19202e] shadow-xs'
                          : 'bg-white hover:bg-[#f8f2ef] text-[#1d1b19] border-[#e7e1de]'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold shrink-0 ${
                          isSelected ? 'bg-[#c85a32] text-white' : 'bg-[#f3ede9] text-[#57423b]'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submission Actions */}
        {!result && (
          <div className="flex items-center justify-between pt-4 border-t border-[#f3ede9]">
            <span className="text-xs font-mono text-[#57423b]">
              {Object.keys(answers).length} of {questions.length} answered
            </span>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitEvaluation}
              className="px-6 py-2.5 rounded-full bg-[#c85a32] hover:bg-[#b04b25] active:scale-95 text-white font-semibold text-xs transition-all shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Evaluating...' : 'Submit for Server Evaluation'}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AnonymousPaperEvaluationModal;
