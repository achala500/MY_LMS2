"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { localDb } from '@/lib/storage/localDb';
import { api } from '@/lib/api';
import { AdminForm, FormField, FormFieldType, FormResponse } from '@/types/forms';
import { PdfDocumentViewerModal } from '@/components/forms/PdfDocumentViewerModal';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Trash2,
  Send,
  Eye,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Users,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  UploadCloud,
  FileCheck,
  Star,
  Search,
  Filter,
} from 'lucide-react';

export default function FormStudioPage() {
  const { user, member } = useAuth();
  const isAdmin = member?.role === 'admin' || user?.email === 'alwisachalaanurada@gmail.com';

  const [activeTab, setActiveTab] = useState<'builder' | 'candidate' | 'ledger'>('candidate');

  // Existing Forms State
  const [forms, setForms] = useState<AdminForm[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');

  // Builder State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'Biological Science' | 'Physical Science'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fields, setFields] = useState<FormField[]>([
    {
      id: 'f_init_1',
      label: 'Target Stream & Subject Focus',
      type: 'radio',
      required: true,
      options: ['Combined Mathematics', 'Biology', 'Physics', 'Chemistry'],
    },
    {
      id: 'f_init_2',
      label: 'Exam Confidence Rating (1-10)',
      type: 'rating',
      required: true,
      minRating: 1,
      maxRating: 10,
    },
    {
      id: 'f_init_3',
      label: 'Upload Handwritten Answer Script (PDF)',
      type: 'pdf',
      required: false,
    },
  ]);

  // Candidate Submission State
  const [candidateAnswers, setCandidateAnswers] = useState<Record<string, any>>({});
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // PDF Viewer Modal State
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [activePdfUrl, setActivePdfUrl] = useState('');
  const [activePdfTitle, setActivePdfTitle] = useState('');
  const [activeCandidateName, setActiveCandidateName] = useState('');

  // Ledger / Evaluation State
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [evalScore, setEvalScore] = useState<number>(85);
  const [evalFeedback, setEvalFeedback] = useState<string>('');

  // Load forms on mount
  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = () => {
    const loaded = localDb.getAdminForms();
    setForms(loaded);
    if (loaded.length > 0 && !selectedFormId) {
      setSelectedFormId(loaded[0].formId);
    }
  };

  // Sync responses when selected form changes
  useEffect(() => {
    if (selectedFormId) {
      const resp = localDb.getFormResponses(selectedFormId);
      const sorted = [...resp].sort((a, b) => (b.score || 0) - (a.score || 0));
      sorted.forEach((r, idx) => {
        r.rank = idx + 1;
      });
      setResponses(sorted);
    }
  }, [selectedFormId]);

  const activeForm = useMemo(() => {
    return forms.find((f) => f.formId === selectedFormId) || forms[0];
  }, [forms, selectedFormId]);

  const handleAddField = (type: FormFieldType) => {
    const newField: FormField = {
      id: 'field_' + Date.now(),
      label: type === 'pdf' || type === 'file' ? 'Upload Answer Script / Document (PDF)' : ('Question ' + (fields.length + 1)),
      type,
      required: false,
      options: type === 'radio' || type === 'select' || type === 'checkbox' ? ['Option 1', 'Option 2'] : undefined,
      minRating: type === 'rating' ? 1 : undefined,
      maxRating: type === 'rating' ? 10 : undefined,
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleDeleteField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleAddOption = (fieldId: string) => {
    setFields(
      fields.map((f) => {
        if (f.id === fieldId) {
          const opts = f.options ? [...f.options] : [];
          opts.push('Option ' + (opts.length + 1));
          return { ...f, options: opts };
        }
        return f;
      })
    );
  };

  const handlePublishForm = () => {
    if (!newTitle.trim()) {
      toast.error('Please specify a form title');
      return;
    }
    if (fields.length === 0) {
      toast.error('Add at least one question to your form');
      return;
    }

    const formId = 'FORM-' + Date.now().toString().slice(-5);
    const newForm: AdminForm = {
      formId,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      targetAudience,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      fields,
      createdBy: user?.email || 'admin@studysync.lk',
      createdAt: new Date().toISOString(),
      isActive: true,
      responseCount: 0,
    };

    localDb.saveAdminForm(newForm);
    api.adminCreateForm(user?.email || 'admin@studysync.lk', newForm).catch(() => {});

    toast.success('Form Intake Published & Dispatched to Student Inboxes!');
    loadForms();
    setSelectedFormId(formId);
    setNewTitle('');
    setNewDescription('');
    setActiveTab('candidate');
  };

  const handleFileUpload = (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      toast.error('Only PDF documents are accepted for past paper evaluation.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCandidateAnswers((prev) => ({ ...prev, [fieldId]: file.name }));
      setUploadedPdfUrl(result);
      toast.success('Attached ' + file.name + ' successfully.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeForm) return;

    for (const f of activeForm.fields) {
      if (f.required && !candidateAnswers[f.id] && !(f.type === 'pdf' && uploadedPdfUrl)) {
        toast.error('Please answer: ' + f.label);
        return;
      }
    }

    setIsSubmitting(true);
    const responseId = 'RESP-' + Date.now().toString().slice(-6);
    const newResponse: FormResponse = {
      responseId,
      formId: activeForm.formId,
      studyId: member?.studyId || 'ST-2026-DEMO',
      studentName: member?.fullName || user?.displayName || 'Scholar Candidate',
      studentEmail: user?.email || 'student@studysync.lk',
      answers: candidateAnswers,
      pdfUrl: uploadedPdfUrl || undefined,
      submittedAt: new Date().toISOString(),
      score: 88,
    };

    setTimeout(() => {
      localDb.submitFormResponse(newResponse);
      setIsSubmitting(false);
      setSubmissionSuccess(true);
      toast.success('Response successfully submitted to examiners!');
      loadForms();
    }, 600);
  };

  const handleSaveEvaluation = () => {
    if (!selectedResponse) return;
    localDb.updateFormResponse(selectedResponse.responseId, { score: evalScore, feedback: evalFeedback });
    toast.success('Evaluation recorded: ' + evalScore + '/100 for ' + selectedResponse.studentName);
    setEvalModalOpen(false);
    setSelectedResponse(null);

    const resp = localDb.getFormResponses(selectedFormId);
    const sorted = [...resp].sort((a, b) => (b.score || 0) - (a.score || 0));
    sorted.forEach((r, idx) => {
      r.rank = idx + 1;
    });
    setResponses(sorted);
  };

  const handleExportCsv = () => {
    if (responses.length === 0) {
      toast.error('No responses available to export.');
      return;
    }
    const headers = ['Rank', 'Study ID', 'Candidate Name', 'Email', 'Score', 'Submitted At'];
    const rows = responses.map((r) => [
      r.rank || '',
      r.studyId,
      '"' + r.studentName + '"',
      r.studentEmail,
      r.score || 'Unscored',
      r.submittedAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', (activeForm?.title || 'Form') + '_Responses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported responses to CSV.');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="w-14 h-14 rounded-2xl bg-[#c85a32]/10 border border-[#c85a32]/30 flex items-center justify-center text-[#c85a32] mb-4 shadow-xs">
          <Layers className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#c85a32] uppercase mb-1">
          Restricted Portal
        </span>
        <h2 className="text-2xl font-serif font-bold text-[#1d1b19] mb-2">
          Coordinator Access Required
        </h2>
        <p className="text-xs text-[#57423b] max-w-md mb-6 leading-relaxed">
          Form Studio is restricted strictly to authenticated coordinators and administrators.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-[#c85a32] text-white text-xs font-semibold hover:bg-[#b04b25] active:scale-95 transition-all shadow-xs"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 bg-[#fef8f4] text-[#1d1b19] pb-16 selection:bg-[#ffdbcf] selection:text-[#9f3c16]">
      <div className="w-full max-w-[1440px] mx-auto pt-6 px-4 md:px-12">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-2">
          <div className="space-y-1">
            <p className="font-sans text-xs text-[#9f3c16] tracking-wider uppercase font-semibold">
              Kinfolk Academic Suite
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-[#1d1b19] tracking-tight italic">
              Form Studio &amp; Response Ledger
            </h1>
            <p className="font-sans text-sm text-[#57423b] max-w-2xl leading-relaxed">
              Design multi-step examination intakes, manage student submissions, preview handwritten PDF papers in-browser, and review top ranker evaluations.
            </p>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="flex items-center bg-[#f8f2ef] p-1.5 rounded-2xl border border-[#dec0b7]/60 shadow-xs">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('builder')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'builder'
                    ? 'bg-white text-[#9f3c16] shadow-xs'
                    : 'text-[#57423b] hover:text-[#1d1b19]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Form Builder</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveTab('candidate');
                setSubmissionSuccess(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'candidate'
                  ? 'bg-white text-[#9f3c16] shadow-xs'
                  : 'text-[#57423b] hover:text-[#1d1b19]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Candidate Intake</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-white text-[#9f3c16] shadow-xs'
                  : 'text-[#57423b] hover:text-[#1d1b19]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Response Ledger</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#ffdbcf] text-[#9f3c16] text-[10px] font-bold">
                {responses.length}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: BUILDER */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#dec0b7]/60 shadow-xs space-y-5">
                <div>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Form Title (e.g. 2026 Term 2 Model Exam Intake)"
                    className="w-full font-serif text-2xl sm:text-3xl text-[#1d1b19] placeholder:text-[#dec0b7] border-0 border-b border-transparent focus:border-[#c85a32] focus:ring-0 px-0 pb-2 bg-transparent transition-all outline-hidden"
                  />
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Add instructions, exam syllabus coverage, or submission guidelines..."
                    rows={2}
                    className="w-full text-xs text-[#57423b] placeholder:text-[#dec0b7] border-0 border-b border-transparent focus:border-[#c85a32] focus:ring-0 px-0 pt-2 bg-transparent resize-none transition-all outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#dec0b7]/30">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#57423b] uppercase tracking-wider mb-1.5">
                      Target Audience
                    </label>
                    <select
                      value={targetAudience}
                      onChange={(e: any) => setTargetAudience(e.target.value)}
                      className="w-full bg-[#f8f2ef] border border-[#dec0b7]/50 rounded-xl px-3 py-2 text-xs text-[#1d1b19] focus:outline-hidden"
                    >
                      <option value="all">All Stream Candidates</option>
                      <option value="Physical Science">Physical Science Only</option>
                      <option value="Biological Science">Biological Science Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#57423b] uppercase tracking-wider mb-1.5">
                      Start Date / Time
                    </label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#f8f2ef] border border-[#dec0b7]/50 rounded-xl px-3 py-2 text-xs text-[#1d1b19] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#57423b] uppercase tracking-wider mb-1.5">
                      End Deadline
                    </label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-[#f8f2ef] border border-[#dec0b7]/50 rounded-xl px-3 py-2 text-xs text-[#1d1b19] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="bg-white rounded-2xl p-6 border border-[#dec0b7]/60 shadow-xs transition-all hover:border-[#c85a32]/40 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#f8f2ef] text-[#9f3c16] font-mono text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-[#57423b]">
                          {field.type.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-[#57423b] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                            className="rounded border-[#dec0b7] text-[#9f3c16] focus:ring-[#9f3c16]"
                          />
                          <span>Required</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleDeleteField(field.id)}
                          className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-colors cursor-pointer"
                          title="Delete question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                      placeholder="Question prompt..."
                      className="w-full font-sans text-sm font-semibold text-[#1d1b19] bg-[#f8f2ef] border border-[#dec0b7]/40 rounded-xl px-3.5 py-2.5 focus:outline-hidden"
                    />

                    {(field.type === 'radio' || field.type === 'select' || field.type === 'checkbox') && (
                      <div className="space-y-2 pl-2">
                        {field.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full border border-[#8a726a]" />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(field.options || [])];
                                newOpts[oIdx] = e.target.value;
                                handleUpdateField(field.id, { options: newOpts });
                              }}
                              className="bg-transparent border-b border-[#dec0b7]/40 text-xs text-[#1d1b19] px-1 py-0.5 focus:outline-hidden focus:border-[#9f3c16]"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddOption(field.id)}
                          className="text-xs text-[#9f3c16] font-semibold hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Option
                        </button>
                      </div>
                    )}

                    {field.type === 'pdf' && (
                      <div className="p-4 rounded-xl bg-[#f8f2ef] border border-dashed border-[#dec0b7] flex items-center justify-center gap-3 text-xs text-[#57423b]">
                        <UploadCloud className="w-5 h-5 text-[#9f3c16]" />
                        <span>Accepts student PDF past paper upload with in-browser zoom &amp; rotation</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#dec0b7]/60 shadow-xs flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-semibold text-[#57423b]">Add New Field:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAddField('text')}
                    className="px-3 py-1.5 rounded-xl bg-[#f8f2ef] hover:bg-[#ede7e3] text-xs font-medium text-[#1d1b19] cursor-pointer"
                  >
                    Short Text
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddField('textarea')}
                    className="px-3 py-1.5 rounded-xl bg-[#f8f2ef] hover:bg-[#ede7e3] text-xs font-medium text-[#1d1b19] cursor-pointer"
                  >
                    Long Essay
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddField('radio')}
                    className="px-3 py-1.5 rounded-xl bg-[#f8f2ef] hover:bg-[#ede7e3] text-xs font-medium text-[#1d1b19] cursor-pointer"
                  >
                    Radio Options
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddField('rating')}
                    className="px-3 py-1.5 rounded-xl bg-[#f8f2ef] hover:bg-[#ede7e3] text-xs font-medium text-[#1d1b19] cursor-pointer"
                  >
                    Rating (1-10)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddField('pdf')}
                    className="px-3 py-1.5 rounded-xl bg-[#ffdbcf] text-[#9f3c16] hover:bg-[#ffb59c] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    PDF Script Upload
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-[#dec0b7]/60 shadow-xs space-y-5 sticky top-24">
                <h3 className="font-serif text-lg font-semibold text-[#1d1b19]">Publish &amp; Broadcast</h3>
                <p className="text-xs text-[#57423b] leading-relaxed">
                  Publishing saves this intake to the Examination Database and automatically delivers an intake prompt into eligible candidates&apos; inboxes.
                </p>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handlePublishForm}
                    className="w-full h-11 rounded-xl bg-[#9f3c16] hover:bg-[#822801] text-white font-sans text-xs font-semibold shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publish Intake Form</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('candidate')}
                    className="w-full h-10 rounded-xl border border-[#dec0b7]/60 bg-white hover:bg-[#f8f2ef] text-[#2d2420] text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Test Fill as Student</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-[#dec0b7]/30 text-xs text-[#57423b] space-y-2">
                  <div className="flex justify-between">
                    <span>Total Questions:</span>
                    <span className="font-semibold text-[#1d1b19]">{fields.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Stream:</span>
                    <span className="font-semibold text-[#1d1b19]">{targetAudience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Includes PDF Upload:</span>
                    <span className="font-semibold text-[#456644]">
                      {fields.some((f) => f.type === 'pdf') ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CANDIDATE VIEW */}
        {activeTab === 'candidate' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-4 border border-[#dec0b7]/60 shadow-xs flex items-center justify-between gap-4 flex-wrap">
              <span className="text-xs font-semibold text-[#57423b]">Select Form Intake:</span>
              <select
                value={selectedFormId}
                onChange={(e) => {
                  setSelectedFormId(e.target.value);
                  setSubmissionSuccess(false);
                  setCandidateAnswers({});
                  setUploadedPdfUrl('');
                }}
                className="flex-1 max-w-md bg-[#f8f2ef] border border-[#dec0b7]/50 rounded-xl px-3 py-2 text-xs font-semibold text-[#1d1b19] focus:outline-hidden"
              >
                {forms.map((f) => (
                  <option key={f.formId} value={f.formId}>
                    {f.title} ({f.responseCount || 0} responses)
                  </option>
                ))}
              </select>
            </div>

            {submissionSuccess ? (
              <div className="bg-white rounded-2xl p-10 border border-[#dec0b7]/60 shadow-xs text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#c6edc1] text-[#456644] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="font-serif text-2xl text-[#1d1b19] font-semibold">Response Recorded!</h2>
                <p className="text-xs text-[#57423b] max-w-md mx-auto leading-relaxed">
                  Thank you, {member?.fullName || 'Scholar'}. Your submission has been saved to the ledger and dispatched to evaluators.
                </p>
                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ledger')}
                    className="h-10 px-5 rounded-xl bg-[#9f3c16] hover:bg-[#822801] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Rankers Ledger</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmissionSuccess(false);
                      setCandidateAnswers({});
                      setUploadedPdfUrl('');
                    }}
                    className="h-10 px-5 rounded-xl border border-[#dec0b7]/60 bg-white hover:bg-[#f8f2ef] text-[#1d1b19] text-xs font-medium cursor-pointer"
                  >
                    Submit Another Response
                  </button>
                </div>
              </div>
            ) : activeForm ? (
              <form onSubmit={handleSubmitResponse} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#dec0b7]/60 shadow-xs space-y-3">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#9f3c16] font-semibold">
                    Candidate Entry Form
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#1d1b19] font-medium">
                    {activeForm.title}
                  </h2>
                  {activeForm.description && (
                    <p className="text-xs text-[#57423b] leading-relaxed">
                      {activeForm.description}
                    </p>
                  )}
                  {activeForm.endDate && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdad6]/60 text-[#ba1a1a] text-xs font-medium mt-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Deadline: {new Date(activeForm.endDate).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {activeForm.fields?.map((field, idx) => (
                    <div
                      key={field.id}
                      className="bg-white rounded-2xl p-6 border border-[#dec0b7]/60 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-[#1d1b19] flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#f8f2ef] text-[#9f3c16] text-[11px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span>{field.label}</span>
                          {field.required && <span className="text-[#ba1a1a]">*</span>}
                        </label>
                      </div>

                      {field.type === 'text' && (
                        <input
                          type="text"
                          required={field.required}
                          value={candidateAnswers[field.id] || ''}
                          onChange={(e) =>
                            setCandidateAnswers({ ...candidateAnswers, [field.id]: e.target.value })
                          }
                          placeholder={field.placeholder || 'Type your answer here...'}
                          className="w-full bg-[#f8f2ef] border border-[#dec0b7]/50 rounded-xl px-3.5 py-2.5 text-xs text-[#1d1b19] focus:outline-hidden"
                        />
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          required={field.required}
                          rows={3}
                          value={candidateAnswers[field.id] || ''}
                          onChange={(e) =>
                            setCandidateAnswers({ ...candidateAnswers, [field.id]: e.target.value })
                          }
                          placeholder={field.placeholder || 'Elaborate your answer...'}
                          className="w-full bg-[#f8f2ef] border border-[#dec0b7]/50 rounded-xl px-3.5 py-2.5 text-xs text-[#1d1b19] focus:outline-hidden resize-none"
                        />
                      )}

                      {field.type === 'radio' && field.options && (
                        <div className="space-y-2 pt-1">
                          {field.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              className="flex items-center gap-3 p-2.5 rounded-xl border border-[#dec0b7]/40 hover:bg-[#f8f2ef] cursor-pointer transition-colors"
                            >
                              <input
                                type="radio"
                                name={field.id}
                                required={field.required}
                                checked={candidateAnswers[field.id] === opt}
                                onChange={() =>
                                  setCandidateAnswers({ ...candidateAnswers, [field.id]: opt })
                                }
                                className="text-[#9f3c16] focus:ring-[#9f3c16]"
                              />
                              <span className="text-xs text-[#1d1b19]">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {field.type === 'rating' && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {Array.from({ length: (field.maxRating || 10) - (field.minRating || 1) + 1 }).map(
                            (_, rIdx) => {
                              const scoreVal = (field.minRating || 1) + rIdx;
                              const isSelected = candidateAnswers[field.id] === scoreVal;
                              return (
                                <button
                                  key={scoreVal}
                                  type="button"
                                  onClick={() =>
                                    setCandidateAnswers({ ...candidateAnswers, [field.id]: scoreVal })
                                  }
                                  className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#9f3c16] text-white shadow-xs'
                                      : 'bg-[#f8f2ef] border border-[#dec0b7]/40 text-[#57423b] hover:bg-[#ede7e3]'
                                  }`}
                                >
                                  {scoreVal}
                                </button>
                              );
                            }
                          )}
                        </div>
                      )}

                      {field.type === 'pdf' && (
                        <div className="space-y-3 pt-1">
                          <label className="border-2 border-dashed border-[#dec0b7] hover:border-[#c85a32] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#f8f2ef]/50 hover:bg-[#f8f2ef] transition-colors">
                            <UploadCloud className="w-8 h-8 text-[#9f3c16]" />
                            <span className="text-xs font-semibold text-[#1d1b19]">
                              Click to attach past paper script (PDF)
                            </span>
                            <span className="text-[11px] text-[#57423b]">Max file size 25MB</span>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => handleFileUpload(field.id, e)}
                              className="hidden"
                            />
                          </label>

                          {uploadedPdfUrl && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#c6edc1]/50 border border-[#456644]/20 text-xs">
                              <div className="flex items-center gap-2 text-[#456644] font-medium">
                                <FileCheck className="w-4 h-4" />
                                <span>{candidateAnswers[field.id] || 'Attached Document.pdf'}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePdfUrl(uploadedPdfUrl);
                                  setActivePdfTitle(activeForm.title);
                                  setActiveCandidateName(member?.fullName || 'Candidate');
                                  setPdfModalOpen(true);
                                }}
                                className="px-3 py-1 rounded-lg bg-white border border-[#456644]/30 text-[#456644] font-semibold hover:bg-[#f8f2ef] transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> Preview PDF
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl bg-[#9f3c16] hover:bg-[#822801] text-white font-sans text-xs font-semibold shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Recording Response...' : 'Submit Official Response'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-16 text-[#57423b] text-xs">
                No active forms found.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LEDGER & EVALUATION */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-[#dec0b7]/60 shadow-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#57423b]">Total Responses</span>
                <p className="font-serif text-2xl text-[#1d1b19] font-semibold mt-1">{responses.length}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[#dec0b7]/60 shadow-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#57423b]">Highest Mark</span>
                <p className="font-serif text-2xl text-[#456644] font-semibold mt-1">
                  {responses.length > 0 ? (Math.max(...responses.map((r) => r.score || 0)) + '/100') : 'N/A'}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[#dec0b7]/60 shadow-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#57423b]">Average Mark</span>
                <p className="font-serif text-2xl text-[#9f3c16] font-semibold mt-1">
                  {responses.length > 0
                    ? ((responses.reduce((acc, curr) => acc + (curr.score || 0), 0) / responses.length).toFixed(1) + '/100')
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[#dec0b7]/60 shadow-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#57423b]">Submissions with PDF</span>
                <p className="font-serif text-2xl text-[#1d1b19] font-semibold mt-1">
                  {responses.filter((r) => r.pdfUrl).length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#dec0b7]/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  className="bg-[#f8f2ef] border border-[#dec0b7]/50 rounded-xl px-3 py-2 text-xs font-semibold text-[#1d1b19] focus:outline-hidden"
                >
                  {forms.map((f) => (
                    <option key={f.formId} value={f.formId}>
                      {f.title}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8a726a]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate or Study ID..."
                    className="w-full pl-8 pr-3 py-2 bg-[#f8f2ef] border border-[#dec0b7]/50 rounded-xl text-xs text-[#1d1b19] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="h-9 px-4 rounded-xl border border-[#dec0b7]/60 bg-white hover:bg-[#f8f2ef] text-[#1d1b19] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#dec0b7]/60 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#dec0b7]/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#9f3c16]" />
                  <h3 className="font-serif text-lg font-semibold text-[#1d1b19]">
                    Top Rankers &amp; Examination Submission Ledger
                  </h3>
                </div>
                <span className="text-xs text-[#57423b] font-mono">
                  {responses.length} Submissions Logged
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8f2ef] text-[#57423b] uppercase tracking-wider font-mono text-[10px] border-b border-[#dec0b7]/40">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Study ID</th>
                      <th className="py-3 px-4">Evaluated Score</th>
                      <th className="py-3 px-4">Paper Script (PDF)</th>
                      <th className="py-3 px-4">Submitted Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dec0b7]/30 text-[#1d1b19]">
                    {responses
                      .filter((r) =>
                        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.studyId.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((resp) => (
                        <tr key={resp.responseId} className="hover:bg-[#f8f2ef]/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#9f3c16]">
                            #{resp.rank || '-'}
                          </td>
                          <td className="py-3.5 px-4 font-medium">
                            <div className="font-semibold">{resp.studentName}</div>
                            <div className="text-[11px] text-[#57423b]">{resp.studentEmail}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs">{resp.studyId}</td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c6edc1] text-[#456644]">
                              {resp.score ? (resp.score + ' / 100') : 'Pending Review'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {resp.pdfUrl ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePdfUrl(resp.pdfUrl!);
                                  setActivePdfTitle(activeForm?.title || 'Exam Submission');
                                  setActiveCandidateName(resp.studentName);
                                  setPdfModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f8f2ef] border border-[#dec0b7]/60 hover:bg-[#ede7e3] text-xs font-semibold text-[#9f3c16] transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview Script</span>
                              </button>
                            ) : (
                              <span className="text-gray-400 text-[11px]">No PDF attached</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-[#57423b]">
                            {new Date(resp.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedResponse(resp);
                                  setEvalScore(resp.score || 85);
                                  setEvalFeedback(resp.feedback || '');
                                  setEvalModalOpen(true);
                                }}
                                className="px-3 py-1 rounded-lg bg-[#9f3c16] hover:bg-[#822801] text-white font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                Score / Grade
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}

                    {responses.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[#57423b] text-xs">
                          No candidate responses recorded for this form yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <PdfDocumentViewerModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        pdfUrl={activePdfUrl}
        title={activePdfTitle}
        studentName={activeCandidateName}
      />

      {evalModalOpen && selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fef8f4] border border-[#dec0b7] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-semibold text-[#1d1b19]">
              Evaluate Submission: {selectedResponse.studentName}
            </h3>
            <p className="text-xs text-[#57423b]">
              Assign authoritative marks and academic notes for Study ID: {selectedResponse.studyId}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#57423b] mb-1">
                  Examination Score (0 - 100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={evalScore}
                  onChange={(e) => setEvalScore(Number(e.target.value))}
                  className="w-full bg-white border border-[#dec0b7] rounded-xl px-3 py-2 text-sm font-bold text-[#1d1b19]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#57423b] mb-1">
                  Evaluator Feedback / Remarks
                </label>
                <textarea
                  rows={3}
                  value={evalFeedback}
                  onChange={(e) => setEvalFeedback(e.target.value)}
                  placeholder="e.g., Excellent step-by-step working on Part B Integration question..."
                  className="w-full bg-white border border-[#dec0b7] rounded-xl px-3 py-2 text-xs text-[#1d1b19] resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEvalModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#dec0b7] bg-white text-xs font-medium hover:bg-[#f8f2ef] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEvaluation}
                className="px-4 py-2 rounded-xl bg-[#9f3c16] text-white text-xs font-semibold hover:bg-[#822801] cursor-pointer"
              >
                Save Evaluation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
