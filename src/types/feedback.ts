/**
 * StudySync Student & Admin Feedback Types
 * Structured under NIST SP 800-53 accountability and student voice requirements.
 */

export type FeedbackCategory =
  | 'curriculum'
  | 'feature_request'
  | 'bug_report'
  | 'paper_correction'
  | 'general_appreciation';

export type FeedbackSentiment = 'positive' | 'neutral' | 'critical';

export type FeedbackStatus = 'pending' | 'under_review' | 'resolved';

export interface FeedbackEntry {
  id: string;
  studyId?: string;
  studentName?: string;
  studentEmail?: string;
  category: FeedbackCategory;
  sentiment: FeedbackSentiment;
  rating?: number; // 1 - 5
  subject?: string;
  stream?: string;
  district?: string;
  message: string;
  createdAt: string;
  status: FeedbackStatus;
  adminNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
