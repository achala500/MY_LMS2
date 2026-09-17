'use client';

import React, { useState, useEffect } from 'react';
import { safeStorage } from '@/lib/storage/safeStorage';
import { localDb } from '@/lib/storage/localDb';
import { AdminForm, FormField, FormFieldType, FormResponse } from '@/types/forms';
import { Plus, Trash2, Download, FileText, CheckCircle2, Layers, Award, Sparkles, Send } from 'lucide-react';
import { toast } from 'sonner';

export const FormStudioAdminEngine: React.FC = () => {
  const [forms, setForms] = useState<AdminForm[]>(() => localDb.getAdminForms());
  const [selectedFormId, setSelectedFormId] = useState<string>('');

  // Builder State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState<'all' | 'Biological Science' | 'Physical Science'>('all');
  const [fields, setFields] = useState<FormField[]>([
    {
      id: 'f-1',
      label: 'Paper Question Identification',
      type: 'text',
      required: true,
      placeholder: 'e.g. Question 04 (Integration by Parts)',
    },
    {
      id: 'f-2',
      label: 'Detailed Mathematical Derivation or Query',
      type: 'textarea',
      required: true,
      placeholder: 'Type your question or query here...',
    },
    {
      id: 'f-3',
      label: 'Attach Handwritten Script (PDF)',
      type: 'pdf',
      required: false,
    },
  ]);

  useEffect(() => {
    const list = localDb.getAdminForms();
    setForms(list);
    if (list.length > 0 && !selectedFormId) {
      setSelectedFormId(list[0].formId);
    }
  }, [selectedFormId]);

  const addField = (type: FormFieldType) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: `New ${type} field`,
      type,
      required: false,
      placeholder: type === 'text' ? 'Enter text...' : undefined,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleCreateForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Form title is required');
      return;
    }

    const newForm: AdminForm = {
      formId: `form-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      targetAudience: audience,
      fields,
      createdBy: 'admin@studysync.lk',
      createdAt: new Date().toISOString(),
      isActive: true,
      responseCount: 0,
    };

    localDb.saveAdminForm(newForm);
    const updated = localDb.getAdminForms();
    setForms(updated);
    setSelectedFormId(newForm.formId);
    setTitle('');
    setDescription('');
    toast.success(`Form "${newForm.title}" published`);
  };

  const responses: FormResponse[] = selectedFormId ? localDb.getFormResponses(selectedFormId) : [];

  const handleExportCsv = () => {
    if (responses.length === 0) {
      toast.error('No responses recorded yet to export.');
      return;
    }

    const headers = ['Response ID', 'Candidate', 'Study ID', 'Email', 'Submitted At'];
    const rows = responses.map((r) => [
      r.responseId,
      r.studentName,
      r.studyId,
      r.studentEmail,
      r.submittedAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studysync_form_responses_${selectedFormId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Responses exported to CSV');
  };

  return (
    <div className="w-full rounded-3xl bg-white border border-[#e7e1de] p-6 sm:p-8 shadow-xs font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#f3ede9]">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold text-[#c85a32] tracking-wider">
            Administrative Instrumentation
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#1d1b19] mt-0.5">
            Form Studio Admin Engine
          </h2>
          <p className="text-xs text-[#57423b]">
            Design A/L quiz forms, doubt sheets, and intake surveys &middot; Instant CSV exports
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-full bg-[#19202e] hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-[#fcd34d]" />
          <span>Export Responses CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Form Visual Builder */}
        <div className="lg:col-span-7 space-y-5">
          <h3 className="font-serif font-bold text-base text-[#1d1b19]">
            Visual Form Constructor
          </h3>

          <form onSubmit={handleCreateForm} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1d1b19] mb-1">
                Form Title
              </label>
              <input
                type="text"
                placeholder="e.g. Combined Maths Model Paper 03 Doubt Intake"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#e7e1de] bg-[#f8f2ef] text-xs text-[#1d1b19] outline-none focus:border-[#c85a32]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1d1b19] mb-1">
                  Target Stream
                </label>
                <select
                  value={audience}
                  onChange={(e: any) => setAudience(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#e7e1de] bg-[#f8f2ef] text-xs text-[#1d1b19] outline-none"
                >
                  <option value="all">All Candidates (Common)</option>
                  <option value="Physical Science">Physical Science Only</option>
                  <option value="Biological Science">Biological Science Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1d1b19] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Short intake instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-[#e7e1de] bg-[#f8f2ef] text-xs text-[#1d1b19] outline-none"
                />
              </div>
            </div>

            {/* Fields List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#8a726a] uppercase">
                  Form Fields ({fields.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => addField('text')}
                    className="px-2.5 py-1 rounded-lg bg-[#f8f2ef] hover:bg-[#ede7e3] text-[11px] font-semibold text-[#1d1b19]"
                  >
                    + Text
                  </button>
                  <button
                    type="button"
                    onClick={() => addField('textarea')}
                    className="px-2.5 py-1 rounded-lg bg-[#f8f2ef] hover:bg-[#ede7e3] text-[11px] font-semibold text-[#1d1b19]"
                  >
                    + Essay
                  </button>
                  <button
                    type="button"
                    onClick={() => addField('pdf')}
                    className="px-2.5 py-1 rounded-lg bg-[#f8f2ef] hover:bg-[#ede7e3] text-[11px] font-semibold text-[#1d1b19]"
                  >
                    + PDF
                  </button>
                </div>
              </div>

              {fields.map((f) => (
                <div key={f.id} className="p-3.5 rounded-2xl border border-[#e7e1de] bg-[#fef8f4] flex items-center justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={f.label}
                      onChange={(e) => updateField(f.id, { label: e.target.value })}
                      className="w-full text-xs font-bold text-[#1d1b19] bg-transparent outline-none border-b border-dashed border-[#dec0b7]"
                    />
                    <span className="text-[10px] font-mono text-[#8a726a] uppercase block">
                      Type: {f.type}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeField(f.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-full bg-[#c85a32] hover:bg-[#b04b25] active:scale-95 text-white font-semibold text-xs transition-all shadow-xs"
            >
              Publish Form to Candidate Portal
            </button>
          </form>
        </div>

        {/* Existing Forms & Responses */}
        <div className="lg:col-span-5 space-y-4 border-l border-[#f3ede9] pl-0 lg:pl-6">
          <h3 className="font-serif font-bold text-base text-[#1d1b19]">
            Active Intakes ({forms.length})
          </h3>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {forms.map((fm) => (
              <div
                key={fm.formId}
                onClick={() => setSelectedFormId(fm.formId)}
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                  selectedFormId === fm.formId
                    ? 'bg-[#fef8f4] border-[#c85a32] shadow-xs'
                    : 'bg-white border-[#e7e1de] hover:border-[#8a726a]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-[#1d1b19]">{fm.title}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#c6edc1] text-[#022106] text-[10px] font-bold">
                    {fm.isActive ? 'Active' : 'Archived'}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#8a726a] mt-1">
                  Target: {fm.targetAudience} &middot; {fm.fields.length} Fields
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f2ef]/60 border border-[#e7e1de] text-xs">
            <span className="font-bold text-[#1d1b19] block mb-1">
              Response Count for Selected Form
            </span>
            <span className="font-serif text-2xl font-bold text-[#c85a32]">
              {responses.length} Submissions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStudioAdminEngine;
