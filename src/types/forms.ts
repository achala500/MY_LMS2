/**
 * StudySync â€” Admin Custom Forms & Student Inbox Types
 */

export type FormFieldType = 
  | 'text' 
  | 'textarea' 
  | 'radio' 
  | 'select' 
  | 'rating' 
  | 'checkbox' 
  | 'date'
  | 'file'
  | 'pdf';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For radio, select, or multi-checkbox
  minRating?: number; // Default 1
  maxRating?: number; // Default 10
  allowedExtensions?: string[]; // e.g. ['.pdf', '.png', '.jpg']
}

export interface AdminForm {
  formId: string;
  title: string;
  description?: string;
  targetAudience: 'all' | 'Biological Science' | 'Physical Science';
  fields: FormField[];
  createdBy: string;
  createdAt: string;
  startDate?: string; // ISO String for submission start window
  endDate?: string;   // ISO String for submission deadline
  isActive: boolean;
  responseCount: number;
}

export interface FormResponse {
  responseId: string;
  formId: string;
  studyId: string;
  studentName: string;
  studentEmail: string;
  answers: Record<string, any>;
  submittedAt: string;
  score?: number;     // Evaluation mark (e.g. 0-100)
  rank?: number;      // Calculated rank within cohort
  feedback?: string;  // Evaluator notes
  pdfUrl?: string;    // Attached PDF paper / submission
}

export interface InboxMessage {
  id: string;
  type: 'form' | 'announcement' | 'verification' | 'system';
  title: string;
  sender: string;
  body?: string;
  form?: AdminForm;
  date: string;
  read: boolean;
  responded?: boolean;
}
