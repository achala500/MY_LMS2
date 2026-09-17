'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ExamType, TestMarkEntry } from '@/types/testMarks';
import { BookOpen, PlusCircle, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddTestMarkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streamSubjects: string[];
  onAddTest: (entry: Omit<TestMarkEntry, 'id' | 'createdAt'>) => void;
  studyId: string;
  studentEmail: string;
}

export const AddTestMarkModal: React.FC<AddTestMarkModalProps> = ({
  open,
  onOpenChange,
  streamSubjects,
  onAddTest,
  studyId,
  studentEmail,
}) => {
  const [subject, setSubject] = useState(streamSubjects[0] || 'Combined Maths');
  const [paperTitle, setPaperTitle] = useState('');
  const [examType, setExamType] = useState<ExamType>('Model Paper');
  const [hasMcq, setHasMcq] = useState<boolean>(true);
  const [mcqScore, setMcqScore] = useState<string>('');
  const [essayScore, setEssayScore] = useState<string>('');
  const [score, setScore] = useState<string>('');
  const [rank, setRank] = useState<string>('');
  const [difficultyRating, setDifficultyRating] = useState<number>(3);
  const [testDate, setTestDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState('');

  // Auto calculate total score when MCQ or Essay updates
  const handleMcqChange = (val: string) => {
    setMcqScore(val);
    const m = parseFloat(val);
    const e = parseFloat(essayScore);
    if (!isNaN(m) && !isNaN(e)) {
      setScore(((m + e) / 2).toFixed(1));
    } else if (!isNaN(m) && isNaN(e)) {
      setScore(m.toFixed(1));
    }
  };

  const handleEssayChange = (val: string) => {
    setEssayScore(val);
    const e = parseFloat(val);
    if (!hasMcq) {
      if (!isNaN(e)) setScore(e.toFixed(1));
    } else {
      const m = parseFloat(mcqScore);
      if (!isNaN(m) && !isNaN(e)) {
        setScore(((m + e) / 2).toFixed(1));
      } else if (!isNaN(e) && isNaN(m)) {
        setScore(e.toFixed(1));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      toast.error('Please enter a valid test score between 0 and 100.');
      return;
    }

    if (!paperTitle.trim()) {
      toast.error('Please enter the paper title or examination source.');
      return;
    }

    onAddTest({
      studyId,
      studentEmail,
      testDate,
      examType,
      subject,
      paperTitle: paperTitle.trim(),
      score: numScore,
      totalPossible: 100,
      hasMcq,
      mcqScore: hasMcq && mcqScore ? parseFloat(mcqScore) : undefined,
      essayScore: essayScore ? parseFloat(essayScore) : numScore,
      rank: rank ? parseInt(rank, 10) : null,
      difficultyRating,
      notes: notes.trim(),
    });

    toast.success(`Test mark for ${subject} (${numScore}%) logged successfully!`);
    onOpenChange(false);
    setPaperTitle('');
    setScore('');
    setMcqScore('');
    setEssayScore('');
    setRank('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#FBF9F5] dark:bg-[#111614] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-serif font-medium text-[#132219] dark:text-[#F2EFE9] flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-[#C85A32]" strokeWidth={1.5} />
            <span>Log Exam / Model Paper Mark</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-[#697D72] dark:text-[#8E9A90]">
            Feed raw test marks to update your Z-Score model and study prescriptions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#697D72] dark:text-[#8E9A90]">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="bg-[#F5F1E9] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] text-xs h-9 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#FBF9F5] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] text-xs">
                  {streamSubjects.map((sub) => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#697D72] dark:text-[#8E9A90]">Exam Type</Label>
              <Select value={examType} onValueChange={(val) => setExamType(val as ExamType)}>
                <SelectTrigger className="bg-[#F5F1E9] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] text-xs h-9 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#FBF9F5] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] text-xs">
                  <SelectItem value="Model Paper">Model Paper</SelectItem>
                  <SelectItem value="Past Paper">Past Paper</SelectItem>
                  <SelectItem value="Term Test">Term Test</SelectItem>
                  <SelectItem value="Tuition Assessment">Tuition Assessment</SelectItem>
                  <SelectItem value="Revision Quiz">Revision Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-[#697D72] dark:text-[#8E9A90]">Paper Title / Source</Label>
            <Input
              placeholder="e.g. 2024 Provincial Term 1 Paper / Apex Revision Test 04"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              className="bg-[#F5F1E9] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] text-xs h-9 rounded-lg"
            />
          </div>

          {/* Paper Structure: MCQ & Essay breakdown */}
          <div className="p-3 rounded-xl bg-[#F5F1E9]/60 dark:bg-[#17201D]/60 border border-[#E5DDD0] dark:border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#132219] dark:text-[#F2EFE9] flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasMcq}
                  onChange={(e) => setHasMcq(e.target.checked)}
                  className="rounded border-[#E5DDD0] text-[#C85A32] focus:ring-[#C85A32] w-4 h-4"
                />
                <span>Includes MCQ Section (Part I)</span>
              </label>
              <span className="text-[10px] font-mono text-[#697D72] dark:text-[#8E9A90]">
                {hasMcq ? 'Part I + Part II' : 'Essay / Structured Only'}
              </span>
            </div>

            <div className={`grid ${hasMcq ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
              {hasMcq && (
                <div className="space-y-1">
                  <Label className="text-[11px] text-[#697D72] dark:text-[#8E9A90]">MCQ Score (Part I %)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    placeholder="e.g. 42/50 (84%)"
                    value={mcqScore}
                    onChange={(e) => handleMcqChange(e.target.value)}
                    className="bg-[#ffffff] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] text-xs h-8 rounded-lg font-mono"
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-[11px] text-[#697D72] dark:text-[#8E9A90]">
                  {hasMcq ? 'Essay Score (Part II %)' : 'Essay / Structured Score (%)'}
                </Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  placeholder="e.g. 74.0"
                  value={essayScore}
                  onChange={(e) => handleEssayChange(e.target.value)}
                  className="bg-[#ffffff] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] text-xs h-8 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#697D72] dark:text-[#8E9A90]">Total Score (%)</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max="100"
                placeholder="78.5"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="bg-[#F5F1E9] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] text-xs h-9 rounded-lg font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#697D72] dark:text-[#8E9A90]">Rank (Optional)</Label>
              <Input
                type="number"
                min="1"
                placeholder="14"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="bg-[#F5F1E9] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] text-xs h-9 rounded-lg font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#697D72] dark:text-[#8E9A90]">Test Date</Label>
              <Input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="bg-[#F5F1E9] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] text-xs h-9 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-[#697D72] dark:text-[#8E9A90]">Subjective Difficulty (1 = Easy, 5 = Brutal)</Label>
              <span className="text-[11px] font-mono text-[#C85A32] font-semibold">{difficultyRating}/5</span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficultyRating(lvl)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer ${
                    difficultyRating === lvl
                      ? 'bg-[#C85A32] border-[#C85A32] text-white shadow-sm'
                      : 'bg-[#F5F1E9] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] text-[#697D72] dark:text-[#8E9A90] hover:text-[#132219]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-[#697D72] dark:text-[#8E9A90]">Mistakes & Reflection Notes</Label>
            <Textarea
              placeholder="e.g. Lost marks in Mechanics derivation and Organic chemistry reaction mechanism."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-[#F5F1E9] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9] text-xs min-h-[60px] rounded-lg"
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-[#E5DDD0] dark:border-white/[0.08] text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#C85A32] hover:bg-[#B04C27] text-white text-xs font-serif font-medium rounded-xl h-9 px-4"
            >
              Log Test Mark
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
