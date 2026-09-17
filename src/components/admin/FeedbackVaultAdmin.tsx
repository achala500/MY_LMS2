'use client';

import React, { useState, useEffect } from 'react';
import { localDb } from '@/lib/storage/localDb';
import { FeedbackEntry, FeedbackCategory, FeedbackStatus } from '@/types/feedback';
import {
  MessageSquare,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
  Download,
  Search,
  User,
  BookOpen,
  Bug,
  Lightbulb,
  FileCheck,
  Heart,
  Save,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackVaultAdminProps {
  adminEmail?: string;
}

export const FeedbackVaultAdmin: React.FC<FeedbackVaultAdminProps> = ({
  adminEmail = 'admin@studysync.lk',
}) => {
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackEntry | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [editingStatus, setEditingStatus] = useState<FeedbackStatus>('pending');

  const loadFeedback = () => {
    try {
      const items = localDb.getFeedbackList();
      setFeedbackList(items);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFeedback();
    const handleUpdate = () => loadFeedback();
    if (typeof window !== 'undefined') {
      window.addEventListener('studysync_feedback_updated', handleUpdate);
      return () => {
        window.removeEventListener('studysync_feedback_updated', handleUpdate);
      };
    }
  }, []);

  const filteredItems = feedbackList.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.message.toLowerCase().includes(q) ||
      (item.studentName && item.studentName.toLowerCase().includes(q)) ||
      (item.studyId && item.studyId.toLowerCase().includes(q)) ||
      (item.subject && item.subject.toLowerCase().includes(q));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const pendingCount = feedbackList.filter((f) => f.status === 'pending').length;
  const resolvedCount = feedbackList.filter((f) => f.status === 'resolved').length;
  const averageRating =
    feedbackList.length > 0
      ? (feedbackList.reduce((acc, f) => acc + (f.rating || 5), 0) / feedbackList.length).toFixed(1)
      : '5.0';

  const handleUpdateStatus = (id: string, newStatus: FeedbackStatus, note?: string) => {
    localDb.updateFeedbackStatus(id, newStatus, note, adminEmail);
    toast.success(`Feedback status updated to ${newStatus}`);
    if (selectedFeedback?.id === id) {
      setSelectedFeedback((prev) => (prev ? { ...prev, status: newStatus, adminNotes: note ?? prev.adminNotes } : null));
    }
    loadFeedback();
  };

  const handleExportCsv = () => {
    if (feedbackList.length === 0) {
      toast.info('No feedback to export.');
      return;
    }
    const headers = ['ID', 'Date', 'Category', 'Status', 'Rating', 'Student Name', 'Study ID', 'Subject', 'Message', 'Admin Notes'];
    const rows = feedbackList.map((f) => [
      `"${f.id}"`,
      `"${f.createdAt}"`,
      `"${f.category}"`,
      `"${f.status}"`,
      f.rating || 5,
      `"${f.studentName || 'Anonymous'}"`,
      `"${f.studyId || 'N/A'}"`,
      `"${f.subject || 'N/A'}"`,
      `"${f.message.replace(/"/g, '""')}"`,
      `"${(f.adminNotes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `studysync_student_feedback_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Feedback CSV exported successfully.');
  };

  const getCategoryBadge = (cat: FeedbackCategory) => {
    switch (cat) {
      case 'feature_request':
        return { label: 'Feature', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'curriculum':
        return { label: 'Curriculum', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'bug_report':
        return { label: 'Bug Report', color: 'bg-red-100 text-red-900 border-red-300' };
      case 'paper_correction':
        return { label: 'Past Paper', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'general_appreciation':
        return { label: 'Mentor Praise', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      default:
        return { label: cat, color: 'bg-gray-100 text-gray-900 border-gray-300' };
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border-2 border-[#19202e] shadow-[3px_3px_0px_#19202e]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#8a726a] tracking-wider block">
            Total Submissions
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-3xl font-bold text-[#19202e]">
              {feedbackList.length}
            </span>
            <span className="text-xs text-[#57423b]">records</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-[#19202e] shadow-[3px_3px_0px_#19202e]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#ba1a1a] tracking-wider block">
            Pending Attention
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-3xl font-bold text-[#ba1a1a]">
              {pendingCount}
            </span>
            <span className="text-xs text-[#ba1a1a] font-medium">unresolved</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-[#19202e] shadow-[3px_3px_0px_#19202e]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#456644] tracking-wider block">
            Resolved Inquiries
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-3xl font-bold text-[#456644]">
              {resolvedCount}
            </span>
            <span className="text-xs text-[#456644] font-medium">actioned</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-[#19202e] shadow-[3px_3px_0px_#19202e]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#854f00] tracking-wider block">
            Mean Candidate Rating
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-3xl font-bold text-[#854f00]">
              {averageRating}
            </span>
            <span className="text-xs text-[#854f00]">/ 5.0 stars</span>
          </div>
        </div>
      </div>

      {/* Control Strip & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border-2 border-[#19202e] shadow-[2px_2px_0px_#19202e]">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-[#f8f2ef] rounded-xl px-3 py-2 border border-[#e7e1de]">
          <Search className="w-3.5 h-3.5 text-[#8a726a]" />
          <input
            type="text"
            placeholder="Search feedback content, student names, IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-[#19202e] placeholder:text-[#8a726a]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-[#e7e1de] rounded-xl px-3 py-2 text-xs text-[#19202e] font-medium cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="feature_request">Feature Request</option>
            <option value="curriculum">Curriculum</option>
            <option value="bug_report">Bug Report</option>
            <option value="paper_correction">Paper Marking</option>
            <option value="general_appreciation">Mentor Message</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#e7e1de] rounded-xl px-3 py-2 text-xs text-[#19202e] font-medium cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
          </select>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-[#f8f2ef] hover:bg-[#ede7e3] border border-[#e7e1de] text-[#19202e] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Feedback Feed & Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Feed List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border-2 border-[#19202e] space-y-2">
              <MessageSquare className="w-8 h-8 text-[#dec0b7] mx-auto" />
              <h4 className="font-serif font-bold text-base text-[#19202e]">No Feedback Found</h4>
              <p className="text-xs text-[#57423b]">No student inquiries match the selected criteria.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const badge = getCategoryBadge(item.category);
              const isSelected = selectedFeedback?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedFeedback(item);
                    setAdminNoteInput(item.adminNotes || '');
                    setEditingStatus(item.status);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-white border-[#c85a32] shadow-[4px_4px_0px_#c85a32]'
                      : 'bg-white border-[#19202e] shadow-[2px_2px_0px_#19202e] hover:bg-[#fcfaf8]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="font-mono text-[11px] text-[#8a726a]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= (item.rating || 5)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        item.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'under_review'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#19202e] leading-relaxed font-sans line-clamp-2">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#57423b] pt-1 border-t border-[#f3ede9]">
                    <span className="font-semibold truncate">
                      {item.studentName || 'Anonymous Scholar'} {item.studyId ? `(${item.studyId})` : ''}
                    </span>
                    <span className="font-mono text-[10px] text-[#8a726a]">
                      {item.subject || 'A/L Common'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Feedback Resolution Panel */}
        <div className="lg:col-span-5">
          {selectedFeedback ? (
            <div className="p-6 rounded-2xl bg-white border-2 border-[#19202e] shadow-[4px_4px_0px_#19202e] space-y-5 sticky top-24">
              <div className="pb-3 border-b border-[#f3ede9]">
                <span className="font-mono text-[10px] uppercase font-bold text-[#c85a32] tracking-wider block">
                  Feedback Resolution Desk
                </span>
                <h3 className="font-serif font-bold text-lg text-[#19202e] mt-0.5">
                  {selectedFeedback.category.replace('_', ' ').toUpperCase()}
                </h3>
              </div>

              {/* Student Metadata Card */}
              <div className="p-3.5 rounded-xl bg-[#f8f2ef] border border-[#e7e1de] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8a726a] font-medium">Candidate:</span>
                  <span className="font-semibold text-[#19202e]">{selectedFeedback.studentName || 'Anonymous Scholar'}</span>
                </div>
                {selectedFeedback.studyId && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a726a] font-medium">Study ID:</span>
                    <span className="font-mono font-bold text-[#c85a32]">{selectedFeedback.studyId}</span>
                  </div>
                )}
                {selectedFeedback.subject && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a726a] font-medium">Subject:</span>
                    <span className="text-[#19202e]">{selectedFeedback.subject}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#8a726a] font-medium">Date Received:</span>
                  <span className="font-mono text-[11px] text-[#19202e]">
                    {new Date(selectedFeedback.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Full Message */}
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase font-bold text-[#57423b] tracking-wider block">
                  Original Student Inquiry
                </label>
                <div className="p-3.5 rounded-xl bg-[#fcfaf8] border border-[#e7e1de] text-xs text-[#19202e] leading-relaxed whitespace-pre-wrap">
                  {selectedFeedback.message}
                </div>
              </div>

              {/* Status Update & Admin Notes */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase font-bold text-[#57423b] tracking-wider block">
                    Update Audit Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['pending', 'under_review', 'resolved'] as FeedbackStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEditingStatus(st)}
                        className={`p-2 rounded-xl border text-center text-xs font-semibold cursor-pointer transition-all ${
                          editingStatus === st
                            ? 'bg-[#19202e] text-white border-[#19202e] shadow-xs'
                            : 'bg-white text-[#19202e] border-[#e7e1de] hover:bg-[#f8f2ef]'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase font-bold text-[#57423b] tracking-wider block">
                    Admin Action Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter resolution notes, curriculum adjustments, or mentor follow-up details..."
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-[#e7e1de] text-xs text-[#19202e] placeholder:text-[#8a726a] focus:outline-none focus:border-[#c85a32] resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedFeedback.id, editingStatus, adminNoteInput)}
                  className="w-full py-2.5 rounded-xl bg-[#c85a32] hover:bg-[#b04b25] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Resolution &amp; Archive</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[#f8f2ef] border-2 border-dashed border-[#dec0b7] space-y-2">
              <Shield className="w-8 h-8 text-[#8a726a] mx-auto" />
              <h4 className="font-serif font-bold text-sm text-[#19202e]">Select a Feedback Item</h4>
              <p className="text-xs text-[#57423b]">
                Click any submission on the left to review its content, adjust its status, and record mentor resolution remarks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
