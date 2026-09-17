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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  FileQuestion,
  Send,
  Users,
  CheckCircle2,
  Download,
  ListOrdered,
  Eye,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminForm, FormField, FormFieldType, FormResponse } from '@/types/forms';
import { localDb } from '@/lib/storage/localDb';
import { api } from '@/lib/api';
import { downloadCsvFile, generateCsvString, getTodayDateString } from '@/lib/utils';

interface FormBuilderModalProps {
  adminEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FormBuilderModal({
  adminEmail,
  isOpen,
  onClose,
}: FormBuilderModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'Biological Science' | 'Physical Science'>('all');
  const [fields, setFields] = useState<FormField[]>([
    {
      id: 'f1',
      label: 'Which chapter or topic are you currently studying?',
      type: 'text',
      placeholder: 'e.g., Organic Chemistry / Newton Laws',
      required: true,
    },
    {
      id: 'f2',
      label: 'Confidence level for next school/tuition term exam (1-10)',
      type: 'rating',
      required: true,
      minRating: 1,
      maxRating: 10,
    },
  ]);

  const [existingForms, setExistingForms] = useState<AdminForm[]>([]);
  const [selectedFormResponses, setSelectedFormResponses] = useState<FormResponse[]>([]);
  const [viewingFormId, setViewingFormId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const forms = localDb.getAdminForms();
      setExistingForms(forms);
    }
  }, [isOpen]);

  const handleAddField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: 'New Question',
      type: 'text',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (id: string) => {
    if (fields.length <= 1) {
      toast.error('Form must have at least one question.');
      return;
    }
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleFieldChange = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleAddOption = (fieldId: string) => {
    setFields(
      fields.map((f) => {
        if (f.id === fieldId) {
          const opts = f.options || ['Option 1'];
          return { ...f, options: [...opts, `Option ${opts.length + 1}`] };
        }
        return f;
      })
    );
  };

  const handleOptionChange = (fieldId: string, optIndex: number, val: string) => {
    setFields(
      fields.map((f) => {
        if (f.id === fieldId && f.options) {
          const next = [...f.options];
          next[optIndex] = val;
          return { ...f, options: next };
        }
        return f;
      })
    );
  };

  const handleCreateAndSendForm = () => {
    if (!title.trim()) {
      toast.error('Please enter a form title.');
      return;
    }
    if (fields.some((f) => !f.label.trim())) {
      toast.error('All questions must have labels.');
      return;
    }

    const newForm: AdminForm = {
      formId: `FORM-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      targetAudience,
      fields,
      createdBy: adminEmail,
      createdAt: new Date().toISOString(),
      isActive: true,
      responseCount: 0,
    };

    localDb.saveAdminForm(newForm);
    api.adminCreateForm(adminEmail, newForm).catch(() => {});
    toast.success(`Form "${title}" sent to all matching student inboxes!`);

    setTitle('');
    setDescription('');
    setExistingForms(localDb.getAdminForms());
    setActiveTab('manage');
  };

  const handleViewResponses = (formId: string) => {
    setViewingFormId(formId);
    const responses = localDb.getFormResponses(formId);
    setSelectedFormResponses(responses);
  };

  const handleExportResponsesCsv = (form: AdminForm) => {
    const responses = localDb.getFormResponses(form.formId);
    if (responses.length === 0) {
      toast.info('No responses received yet for this form.');
      return;
    }

    // Build CSV rows
    const headers = ['Study ID', 'Student Name', 'Email', 'Submitted At', ...form.fields.map((f) => f.label)];
    const rows = responses.map((r) => [
      r.studyId,
      r.studentName,
      r.studentEmail,
      r.submittedAt,
      ...form.fields.map((f) => String(r.answers[f.id] ?? '')),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    downloadCsvFile(`Form_Responses_${form.formId}_${getTodayDateString()}.csv`, csvContent);
    toast.success('Form responses exported to CSV!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="pb-2 border-b border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <FileQuestion className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  Student Survey & Form Builder
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Create Google Forms-style surveys and dispatch them directly to student inboxes
                </DialogDescription>
              </div>
            </div>

            <div className="flex rounded-xl bg-zinc-900 border border-zinc-800 p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('create')}
                className={`h-7 px-3 text-xs rounded-lg ${
                  activeTab === 'create' ? 'bg-purple-600 text-white font-semibold' : 'text-zinc-400'
                }`}
              >
                Create Form
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('manage')}
                className={`h-7 px-3 text-xs rounded-lg ${
                  activeTab === 'manage' ? 'bg-purple-600 text-white font-semibold' : 'text-zinc-400'
                }`}
              >
                Responses ({existingForms.length})
              </Button>
            </div>
          </div>
        </DialogHeader>

        {activeTab === 'create' ? (
          <div className="space-y-4 pt-3">
            {/* Form Title & Target */}
            <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
              <div className="space-y-1">
                <Label className="text-xs text-zinc-300">Form Title</Label>
                <Input
                  placeholder="e.g., Term 2 Model Paper Feedback & Difficult Topics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white text-sm h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-zinc-300">Description / Instructions</Label>
                <Textarea
                  placeholder="Explain what information you are collecting from students..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-zinc-300">Send to Audience</Label>
                <Select
                  value={targetAudience}
                  onValueChange={(val: any) => setTargetAudience(val)}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white text-xs h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white text-xs">
                    <SelectItem value="all">All Students (Bio & Maths Streams)</SelectItem>
                    <SelectItem value="Biological Science">Biological Science Students Only</SelectItem>
                    <SelectItem value="Physical Science">Physical Science Students Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-white uppercase tracking-wider">
                  Questions ({fields.length})
                </Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddField}
                  className="h-8 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Question</span>
                </Button>
              </div>

              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-zinc-500">Q{idx + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveField(field.id)}
                      className="h-7 w-7 p-0 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-[11px] text-zinc-400">Question Label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => handleFieldChange(field.id, { label: e.target.value })}
                        className="bg-zinc-950 border-zinc-800 text-white text-xs h-9 rounded-lg"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-zinc-400">Answer Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(val: FormFieldType) => {
                          const updates: Partial<FormField> = { type: val };
                          if (val === 'radio' && !field.options) {
                            updates.options = ['Option 1', 'Option 2'];
                          }
                          handleFieldChange(field.id, updates);
                        }}
                      >
                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white text-xs h-9 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white text-xs">
                          <SelectItem value="text">Short Text</SelectItem>
                          <SelectItem value="textarea">Paragraph</SelectItem>
                          <SelectItem value="radio">Multiple Choice</SelectItem>
                          <SelectItem value="rating">Rating (1-10)</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Multiple Choice Options Builder */}
                  {field.type === 'radio' && (
                    <div className="pl-2 space-y-2 border-l-2 border-purple-500/30">
                      <Label className="text-[10px] text-zinc-400">Choice Options</Label>
                      {(field.options || []).map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-purple-400" />
                          <Input
                            value={opt}
                            onChange={(e) => handleOptionChange(field.id, oi, e.target.value)}
                            className="bg-zinc-950 border-zinc-800 text-white text-xs h-8 rounded-lg"
                          />
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddOption(field.id)}
                        className="h-6 text-[11px] text-purple-400 hover:text-purple-300 p-0 cursor-pointer"
                      >
                        + Add Choice Option
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id={`req_${field.id}`}
                      checked={field.required}
                      onChange={(e) => handleFieldChange(field.id, { required: e.target.checked })}
                      className="rounded cursor-pointer"
                    />
                    <label
                      htmlFor={`req_${field.id}`}
                      className="text-[11px] text-zinc-400 cursor-pointer"
                    >
                      Required answer
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleCreateAndSendForm}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 cursor-pointer mt-2"
            >
              <Send className="h-4 w-4" />
              <span>Publish & Send to Student Inboxes</span>
            </Button>
          </div>
        ) : (
          /* Manage & View Responses Tab */
          <div className="space-y-4 pt-3">
            {existingForms.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                No forms created yet. Click &quot;Create Form&quot; above to build your first survey.
              </div>
            ) : (
              <div className="space-y-3">
                {existingForms.map((f) => (
                  <div
                    key={f.formId}
                    className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{f.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {f.responseCount} responses
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Target: {f.targetAudience === 'all' ? 'All Students' : f.targetAudience} â€¢ {f.fields.length} questions
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewResponses(f.formId)}
                        className="h-8 border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 text-xs rounded-lg cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        <span>View</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleExportResponsesCsv(f)}
                        className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        <span>Export CSV</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Drill-down Responses Modal/Section */}
            {viewingFormId && (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Student Submissions ({selectedFormResponses.length})
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewingFormId(null)}
                    className="h-6 text-xs text-zinc-400 cursor-pointer"
                  >
                    Close
                  </Button>
                </div>

                {selectedFormResponses.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center">
                    No student has answered this form yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedFormResponses.map((r, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{r.studentName} ({r.studyId})</span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {new Date(r.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="space-y-1 pt-1">
                          {Object.entries(r.answers).map(([qid, ans]) => (
                            <div key={qid} className="text-zinc-300 text-[11px]">
                              <span className="text-zinc-500 font-mono">Q: </span>
                              <span>{String(ans)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
