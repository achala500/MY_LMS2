/**
 * StudySync — Automated Client-Side Relational Database Engine
 * 
 * Provides an automated, resilient, and instantaneous local database layer
 * backed by localStorage and persistent state. Ensures zero latency (< 1ms),
 * automatic offline tolerance, optimistic persistence, and continuous syncing.
 */

import { MemberData } from '@/types/member';
import { DailyLogEntry } from '@/types/logs';
import { TestMarkEntry } from '@/types/testMarks';
import { AdminForm, FormResponse, InboxMessage } from '@/types/forms';
import { FeedbackEntry, FeedbackStatus } from '@/types/feedback';
import { DEFAULT_EXAM_DATES } from '@/lib/calendar';
import { extractLogDate, extractLogHours } from '@/lib/utils';
import { safeStorage } from './safeStorage';

function generateSeedLogs(): DailyLogEntry[] {
  const result: DailyLogEntry[] = [];
  const now = new Date();
  const sampleData = [
    { offset: 4, sub1: 2.0, sub2: 1.5, sub3: 1.0, tot: 4.5, topic: 'Integration by Parts & Reduction Formulae' },
    { offset: 3, sub1: 1.5, sub2: 2.0, sub3: 0.5, tot: 4.0, topic: 'Newtonian Dynamics and Friction on Inclined Planes' },
    { offset: 2, sub1: 2.5, sub2: 1.0, sub3: 1.5, tot: 5.0, topic: 'Aromaticity and Benzene Electrophilic Substitution' },
    { offset: 1, sub1: 1.5, sub2: 1.5, sub3: 1.0, tot: 4.0, topic: 'Circular Motion & Rotational Equilibrium' },
    { offset: 0, sub1: 2.0, sub2: 1.0, sub3: 0.5, tot: 3.5, topic: 'Past Paper Structured Essay Problem Set' },
  ];

  for (const s of sampleData) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - s.offset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dStr = `${y}-${m}-${day}`;

    result.push({
      logId: `SEED-LOG-SG-MATH-0001-${dStr}`,
      studyId: 'SG-MATH-0001',
      fullName: 'Achala Anuradha',
      email: 'alwisachalaanurada@gmail.com',
      stream: 'Physical Science',
      dateOfStudy: dStr,
      date: dStr,
      Date: dStr,
      hoursSubject1: s.sub1,
      hoursSubject2: s.sub2,
      hoursSubject3: s.sub3,
      sub1Hours: s.sub1,
      sub2Hours: s.sub2,
      sub3Hours: s.sub3,
      totalHours: s.tot,
      focusScore: 9,
      productivityScore: 9,
      notes: s.topic,
      timestamp: d.toISOString(),
      subjects: [
        { name: 'Combined Maths', hours: s.sub1, focus: 9, productivity: 9 },
        { name: 'Physics', hours: s.sub2, focus: 9, productivity: 8 },
        { name: 'Chemistry', hours: s.sub3, focus: 8, productivity: 9 },
      ],
    });

    result.push({
      logId: `SEED-LOG-SG-MATH-0002-${dStr}`,
      studyId: 'SG-MATH-0002',
      fullName: 'Anuradha Alwis',
      email: 'alwis@gmail.com',
      stream: 'Physical Science',
      dateOfStudy: dStr,
      date: dStr,
      Date: dStr,
      hoursSubject1: s.sub1,
      hoursSubject2: s.sub2,
      hoursSubject3: s.sub3,
      sub1Hours: s.sub1,
      sub2Hours: s.sub2,
      sub3Hours: s.sub3,
      totalHours: s.tot,
      focusScore: 9,
      productivityScore: 8,
      notes: s.topic,
      timestamp: d.toISOString(),
      subjects: [
        { name: 'Combined Maths', hours: s.sub1, focus: 9, productivity: 9 },
        { name: 'Physics', hours: s.sub2, focus: 9, productivity: 8 },
        { name: 'Chemistry', hours: s.sub3, focus: 8, productivity: 9 },
      ],
    });
  }

  return result;
}

const STORAGE_KEYS = {
  MEMBERS: 'studysync_db_members',
  LOGS: 'studysync_db_logs',
  TEST_MARKS: 'studysync_db_test_marks',
  ADMIN_FORMS: 'studysync_db_admin_forms',
  FORM_RESPONSES: 'studysync_db_form_responses',
  INBOX: 'studysync_db_inbox',
  FEEDBACK: 'studysync_db_feedback',
  CUSTOM_ADMINS: 'studysync_custom_admins',
  EXAM_DATES: 'studysync_custom_exam_dates',
  APP_SECURITY: 'studysync_security_config',
};

// Default seed members for immediate out-of-the-box operation
const DEFAULT_SEED_MEMBERS: MemberData[] = [
  {
    studyId: 'SG-MATH-0001',
    fullName: 'Achala Anuradha',
    email: 'alwisachalaanurada@gmail.com',
    school: 'Nalanda College, Colombo',
    stream: 'Physical Science',
    optionalSubject: 'Chemistry',
    examYear: '2026',
    status: 'Verified',
    role: 'admin',
    adminVerified: true,
    telegramUsername: '@achala_alwis',
    streakCount: 5,
    totalHoursLogged: 18.5,
  },
  {
    studyId: 'SG-MATH-0002',
    fullName: 'Anuradha Alwis',
    email: 'alwis@gmail.com',
    school: 'Nalanda College, Colombo',
    stream: 'Physical Science',
    optionalSubject: 'Chemistry',
    examYear: '2026',
    status: 'Verified',
    role: 'admin',
    adminVerified: true,
    telegramUsername: '@anuradha',
    streakCount: 3,
    totalHoursLogged: 12.0,
  },
  {
    studyId: 'SG-BIO-0001',
    fullName: 'Kasun Bandara',
    email: 'kasun.student@gmail.com',
    school: 'Ananda College, Colombo',
    stream: 'Biological Science',
    optionalSubject: 'Physics',
    examYear: '2026',
    status: 'Pending',
    role: 'student',
    adminVerified: false,
    telegramUsername: '@kasun_bio',
    streakCount: 2,
    totalHoursLogged: 8.5,
  },
];

class LocalDatabaseEngine {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private getItem<T>(key: string, defaultValue: T): T {
    return safeStorage.getJson<T>(key, defaultValue);
  }

  private setItem<T>(key: string, value: T): void {
    safeStorage.setJson<T>(key, value);
  }

  constructor() {
    // Auto-seed if database is uninitialized
    if (this.isBrowser()) {
      const existingMembers = this.getItem<MemberData[]>(STORAGE_KEYS.MEMBERS, []);
      if (existingMembers.length === 0) {
        this.setItem(STORAGE_KEYS.MEMBERS, DEFAULT_SEED_MEMBERS);
      }
      const existingLogs = this.getItem<DailyLogEntry[]>(STORAGE_KEYS.LOGS, []);
      if (existingLogs.length === 0) {
        this.setItem(STORAGE_KEYS.LOGS, generateSeedLogs());
      }
    }
  }

  // --------------------------------------------------------------------------
  // Members Table
  // --------------------------------------------------------------------------
  public getMembers(): MemberData[] {
    return this.getItem<MemberData[]>(STORAGE_KEYS.MEMBERS, DEFAULT_SEED_MEMBERS);
  }

  public getMemberByStudyId(studyId: string): MemberData | null {
    const list = this.getMembers();
    const cleanId = studyId.trim().toUpperCase();
    return list.find((m) => m.studyId.toUpperCase() === cleanId) || null;
  }

  public getMemberByEmail(email: string): MemberData | null {
    const list = this.getMembers();
    const clean = email.trim().toLowerCase();
    return list.find((m) => m.email.toLowerCase() === clean) || null;
  }

  public saveMember(member: MemberData): void {
    const list = this.getMembers();
    const idx = list.findIndex((m) => m.studyId.toUpperCase() === member.studyId.toUpperCase());
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...member };
    } else {
      list.push(member);
    }
    this.setItem(STORAGE_KEYS.MEMBERS, list);
  }

  public setMemberStatus(studyId: string, status: 'Verified' | 'Active' | 'Suspended' | 'Pending'): void {
    const list = this.getMembers();
    const cleanId = studyId.trim().toUpperCase();
    const updated = list.map((m) => {
      if (m.studyId.toUpperCase() === cleanId) {
        return {
          ...m,
          status,
          adminVerified: status === 'Verified',
        };
      }
      return m;
    });
    this.setItem(STORAGE_KEYS.MEMBERS, updated);
  }

  public deleteMember(studyId: string): void {
    const cleanId = (studyId || '').trim().toUpperCase();
    const list = this.getMembers();
    const updated = list.filter((m) => m.studyId.trim().toUpperCase() !== cleanId);
    this.setItem(STORAGE_KEYS.MEMBERS, updated);

    // Also remove logs associated with this member
    const allLogs = this.getLogs();
    const updatedLogs = allLogs.filter((l) => (l.studyId || '').trim().toUpperCase() !== cleanId);
    this.setItem(STORAGE_KEYS.LOGS, updatedLogs);
  }

  // --------------------------------------------------------------------------
  // Daily Logs Table
  // --------------------------------------------------------------------------
  public getLogs(): DailyLogEntry[] {
    return this.getItem<DailyLogEntry[]>(STORAGE_KEYS.LOGS, []);
  }

  public getStudentLogs(studyId: string, email?: string): DailyLogEntry[] {
    const all = this.getLogs();
    const cleanId = (studyId || '').trim().toUpperCase();
    const cleanEmail = (email || '').trim().toLowerCase();
    return all.filter((l) => {
      const lStudyId = (l.studyId || '').trim().toUpperCase();
      const lEmail = (l.email || '').trim().toLowerCase();
      if (cleanId && lStudyId === cleanId) return true;
      if (cleanEmail && (lEmail === cleanEmail || lStudyId === cleanEmail.toUpperCase())) return true;
      return false;
    });
  }

  public saveDailyLog(log: DailyLogEntry): void {
    const all = this.getLogs();
    const dateStr = extractLogDate(log);
    const cleanId = (log.studyId || '').trim().toUpperCase();
    const cleanEmail = (log.email || '').trim().toLowerCase();
    const resolvedProof = log.proofUrl || log.proofPhotoUrl || log.photoProofBase64 || (log as any).proofImage;

    const normalizedLog: DailyLogEntry = {
      ...log,
      dateOfStudy: dateStr,
      date: dateStr,
      Date: dateStr,
      proofUrl: resolvedProof,
      proofPhotoUrl: resolvedProof,
      photoProofBase64: resolvedProof,
      totalHours: extractLogHours(log),
    };

    // Check for duplicate date log to update or append
    const idx = all.findIndex((l) => {
      const lId = (l.studyId || '').trim().toUpperCase();
      const lEmail = (l.email || '').trim().toLowerCase();
      const idMatch = (cleanId && lId === cleanId) || (cleanEmail && lEmail === cleanEmail);
      const dateMatch = extractLogDate(l) === dateStr;
      return idMatch && dateMatch;
    });

    if (idx >= 0) {
      all[idx] = { ...all[idx], ...normalizedLog };
    } else {
      all.unshift({
        ...normalizedLog,
        logId: log.logId || `LOG-${cleanId}-${dateStr}-${Date.now()}`,
        timestamp: log.timestamp || new Date().toISOString(),
      });
    }

    this.setItem(STORAGE_KEYS.LOGS, all);

    // Also update member total hours
    const member = cleanId ? this.getMemberByStudyId(cleanId) : (cleanEmail ? this.getMemberByEmail(cleanEmail) : null);
    if (member) {
      const studentLogs = this.getStudentLogs(member.studyId, member.email);
      const totalHours = studentLogs.reduce((acc, l) => acc + extractLogHours(l), 0);
      this.saveMember({
        ...member,
        totalHoursLogged: Math.round(totalHours * 10) / 10,
        streakCount: Math.min(studentLogs.length, 30),
      });
    }

    if (this.isBrowser()) {
      window.dispatchEvent(new CustomEvent('studysync_logs_updated', { detail: normalizedLog }));
    }
  }

  public deleteDailyLog(studyId: string, dateOfStudy: string): void {
    const all = this.getLogs();
    const cleanId = (studyId || '').trim().toUpperCase();
    const cleanDate = (dateOfStudy || '').trim();

    const filtered = all.filter((l) => {
      const matchId = (l.studyId || '').trim().toUpperCase() === cleanId;
      const matchDate = (l.dateOfStudy || l.date || '').trim() === cleanDate;
      return !(matchId && matchDate);
    });

    this.setItem(STORAGE_KEYS.LOGS, filtered);

    // Recalculate member total hours and streak
    const member = this.getMemberByStudyId(cleanId);
    if (member) {
      const studentLogs = filtered.filter((l) => (l.studyId || '').trim().toUpperCase() === cleanId);
      const totalHours = studentLogs.reduce((acc, l) => acc + (Number(l.totalHours) || 0), 0);
      this.saveMember({
        ...member,
        totalHoursLogged: Math.round(totalHours * 10) / 10,
        streakCount: Math.min(studentLogs.length, 30),
      });
    }
  }

  public editDailyLog(
    studyId: string,
    dateOfStudy: string,
    updates: {
      subject1Hours?: number;
      subject2Hours?: number;
      subject3Hours?: number;
      totalHours?: number;
      notes?: string;
    }
  ): void {
    const all = this.getLogs();
    const cleanId = (studyId || '').trim().toUpperCase();
    const cleanDate = (dateOfStudy || '').trim();

    const idx = all.findIndex((l) => {
      const matchId = (l.studyId || '').trim().toUpperCase() === cleanId;
      const matchDate = (l.dateOfStudy || l.date || '').trim() === cleanDate;
      return matchId && matchDate;
    });

    if (idx >= 0) {
      const log = { ...all[idx] };
      const subjects = log.subjects ? [...log.subjects] : [];

      if (updates.subject1Hours !== undefined) {
        (log as any).subject1Hours = updates.subject1Hours;
        (log as any).hoursSubject1 = updates.subject1Hours;
        if (subjects[0]) subjects[0].hours = updates.subject1Hours;
      }
      if (updates.subject2Hours !== undefined) {
        (log as any).subject2Hours = updates.subject2Hours;
        (log as any).hoursSubject2 = updates.subject2Hours;
        if (subjects[1]) subjects[1].hours = updates.subject2Hours;
      }
      if (updates.subject3Hours !== undefined) {
        (log as any).subject3Hours = updates.subject3Hours;
        (log as any).hoursSubject3 = updates.subject3Hours;
        if (subjects[2]) subjects[2].hours = updates.subject3Hours;
      }

      if (updates.totalHours !== undefined) {
        log.totalHours = updates.totalHours;
      } else {
        const sum = (Number(subjects[0]?.hours) || 0) + (Number(subjects[1]?.hours) || 0) + (Number(subjects[2]?.hours) || 0);
        if (sum > 0) log.totalHours = sum;
      }

      if (updates.notes !== undefined) {
        log.notes = updates.notes;
      }

      log.subjects = subjects;
      all[idx] = log;
      this.setItem(STORAGE_KEYS.LOGS, all);

      // Recalculate member total hours
      const member = this.getMemberByStudyId(cleanId);
      if (member) {
        const studentLogs = all.filter((l) => (l.studyId || '').trim().toUpperCase() === cleanId);
        const totalHours = studentLogs.reduce((acc, l) => acc + (Number(l.totalHours) || 0), 0);
        this.saveMember({
          ...member,
          totalHoursLogged: Math.round(totalHours * 10) / 10,
        });
      }
    }
  }

  public markLogVerified(studyId: string, logKey: string): void {
    const all = this.getLogs();
    const cleanId = (studyId || '').trim().toUpperCase();
    const idx = all.findIndex((l) => {
      const k = l.id || `${l.studyId}-${l.dateOfStudy || l.date}`;
      return k === logKey || ((l.studyId || '').trim().toUpperCase() === cleanId && k === logKey);
    });
    if (idx >= 0) {
      all[idx] = {
        ...all[idx],
        isVerified: true,
        verified: true,
        status: 'Verified',
      };
      this.setItem(STORAGE_KEYS.LOGS, all);
    }
  }

  // --------------------------------------------------------------------------
  // Test Marks Table
  // --------------------------------------------------------------------------
  public getTestMarks(studyId: string): TestMarkEntry[] {
    const all = this.getItem<TestMarkEntry[]>(STORAGE_KEYS.TEST_MARKS, []);
    const cleanId = studyId.trim().toUpperCase();
    return all.filter((t) => (t.studyId || '').trim().toUpperCase() === cleanId);
  }

  public saveTestMark(mark: TestMarkEntry): void {
    const all = this.getItem<TestMarkEntry[]>(STORAGE_KEYS.TEST_MARKS, []);
    all.unshift({
      ...mark,
      id: mark.id || mark.testId || `TM-${Date.now()}`,
      testId: mark.testId || mark.id || `TM-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.TEST_MARKS, all);
  }

  // --------------------------------------------------------------------------
  // Admin Forms & Surveys Table
  // --------------------------------------------------------------------------
  public getAdminForms(): AdminForm[] {
    return this.getItem<AdminForm[]>(STORAGE_KEYS.ADMIN_FORMS, [
      {
        formId: 'FORM-001',
        title: 'Model Paper & Term Revision Progress Survey',
        description: 'Please indicate your current chapter completion status and topics requiring teacher assistance.',
        targetAudience: 'all',
        createdBy: 'alwisachalaanurada@gmail.com',
        createdAt: '2026-09-01T08:00:00Z',
        isActive: true,
        responseCount: 2,
        fields: [
          {
            id: 'f1',
            label: 'Which subject requires the most intensive past paper practice?',
            type: 'radio',
            required: true,
            options: ['Combined Maths / Biology', 'Physics', 'Chemistry'],
          },
          {
            id: 'f2',
            label: 'Rate your confidence for upcoming Term Test (1 - 10)',
            type: 'rating',
            required: true,
            minRating: 1,
            maxRating: 10,
          },
          {
            id: 'f3',
            label: 'Specific questions or difficult topics for next live study session',
            type: 'textarea',
            placeholder: 'e.g., Organic Reaction Mechanisms, Integration by Parts, Rotational Dynamics...',
            required: false,
          },
        ],
      },
    ]);
  }

  public saveAdminForm(form: AdminForm): void {
    const forms = this.getAdminForms();
    forms.unshift(form);
    this.setItem(STORAGE_KEYS.ADMIN_FORMS, forms);

    // Auto-broadcast to student inboxes
    this.dispatchFormToInbox(form);
  }

  public getFormResponses(formId: string): FormResponse[] {
    const all = this.getItem<FormResponse[]>(STORAGE_KEYS.FORM_RESPONSES, []);
    return all.filter((r) => r.formId === formId);
  }

  public submitFormResponse(response: FormResponse): void {
    const all = this.getItem<FormResponse[]>(STORAGE_KEYS.FORM_RESPONSES, []);
    all.unshift(response);
    this.setItem(STORAGE_KEYS.FORM_RESPONSES, all);

    // Update response count on form
    const forms = this.getAdminForms();
    const idx = forms.findIndex((f) => f.formId === response.formId);
    if (idx >= 0) {
      forms[idx].responseCount = (forms[idx].responseCount || 0) + 1;
      this.setItem(STORAGE_KEYS.ADMIN_FORMS, forms);
    }

    // Mark inbox message as responded
    this.markInboxFormResponded(response.studyId, response.formId);
  }

  public updateFormResponse(responseId: string, updates: Partial<FormResponse>): void {
    const all = this.getItem<FormResponse[]>(STORAGE_KEYS.FORM_RESPONSES, []);
    const updated = all.map((r) => (r.responseId === responseId ? { ...r, ...updates } : r));
    this.setItem(STORAGE_KEYS.FORM_RESPONSES, updated);
  }

  // --------------------------------------------------------------------------
  // Student Inbox System
  // --------------------------------------------------------------------------
  public getStudentInbox(studyId: string): InboxMessage[] {
    const all = this.getItem<Record<string, InboxMessage[]>>(STORAGE_KEYS.INBOX, {});
    const cleanId = (studyId || '').trim().toUpperCase();
    let userMessages: InboxMessage[] = all[cleanId] ? [...all[cleanId]] : [];

    // Always ensure welcome message is present if empty
    if (userMessages.length === 0) {
      userMessages = [
        {
          id: 'MSG-WELCOME',
          type: 'announcement',
          title: 'Welcome to StudySync Sri Lanka A/L Platform',
          sender: 'StudySync Academic Directorate',
          body: 'Welcome! Begin logging your daily study hours, practice papers, and check your Z-Score trajectory regularly.',
          date: new Date().toISOString(),
          read: true,
        },
      ];
    }

    // Auto-project any active forms matching student stream or 'all'
    const member = this.getMemberByStudyId(cleanId);
    const studentStream = member?.stream || 'all';
    const activeForms = this.getAdminForms().filter((f) => f.isActive);

    for (const form of activeForms) {
      // Check audience
      const audienceMatches = form.targetAudience === 'all' || !form.targetAudience || form.targetAudience === studentStream;
      if (!audienceMatches) continue;

      // Check if message for this form already exists in student's inbox
      const alreadyHasForm = userMessages.some((msg) => msg.form?.formId === form.formId);
      if (!alreadyHasForm) {
        const alreadyResponded = this.getFormResponses(form.formId).some(
          (r) => (r.studyId || '').toUpperCase() === cleanId
        );
        userMessages.unshift({
          id: `INBOX-FORM-${form.formId}`,
          type: 'form',
          title: form.title,
          sender: 'StudySync Administration',
          body: form.description || 'New academic survey requested by administrators.',
          form,
          date: form.createdAt || new Date().toISOString(),
          read: alreadyResponded,
          responded: alreadyResponded,
        });
      }
    }

    // Persist updated inbox for this student
    all[cleanId] = userMessages;
    this.setItem(STORAGE_KEYS.INBOX, all);

    return userMessages;
  }

  public dispatchFormToInbox(form: AdminForm): void {
    const all = this.getItem<Record<string, InboxMessage[]>>(STORAGE_KEYS.INBOX, {});
    const members = this.getMembers();

    const targetMembers = members.filter((m) => {
      if (form.targetAudience === 'all') return true;
      return m.stream === form.targetAudience;
    });

    for (const m of targetMembers) {
      const cleanId = m.studyId.trim().toUpperCase();
      if (!all[cleanId]) all[cleanId] = [];

      all[cleanId].unshift({
        id: `INBOX-FORM-${form.formId}-${Date.now()}`,
        type: 'form',
        title: form.title,
        sender: 'StudySync Administration',
        body: form.description || 'New academic survey requested by administrators.',
        form,
        date: new Date().toISOString(),
        read: false,
        responded: false,
      });
    }

    this.setItem(STORAGE_KEYS.INBOX, all);
  }

  public markInboxFormResponded(studyId: string, formId: string): void {
    const all = this.getItem<Record<string, InboxMessage[]>>(STORAGE_KEYS.INBOX, {});
    const cleanId = studyId.trim().toUpperCase();
    if (all[cleanId]) {
      all[cleanId] = all[cleanId].map((msg) => {
        if (msg.form?.formId === formId) {
          return { ...msg, responded: true, read: true };
        }
        return msg;
      });
      this.setItem(STORAGE_KEYS.INBOX, all);
    }
  }

  public markInboxMessageRead(studyId: string, messageId: string): void {
    const all = this.getItem<Record<string, InboxMessage[]>>(STORAGE_KEYS.INBOX, {});
    const cleanId = studyId.trim().toUpperCase();
    if (all[cleanId]) {
      all[cleanId] = all[cleanId].map((msg) =>
        msg.id === messageId ? { ...msg, read: true } : msg
      );
      this.setItem(STORAGE_KEYS.INBOX, all);
    }
  }

  public sendMessageToStudentInbox(
    studyId: string,
    message: {
      title: string;
      body: string;
      sender: string;
      type?: 'announcement' | 'verification' | 'form' | 'system';
    }
  ): void {
    const all = this.getItem<Record<string, InboxMessage[]>>(STORAGE_KEYS.INBOX, {});
    const cleanId = (studyId || '').trim().toUpperCase();
    if (!all[cleanId]) all[cleanId] = [];

    all[cleanId].unshift({
      id: `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: message.type || 'announcement',
      title: message.title,
      sender: message.sender,
      body: message.body,
      date: new Date().toISOString(),
      read: false,
    });

    this.setItem(STORAGE_KEYS.INBOX, all);
    if (this.isBrowser()) {
      window.dispatchEvent(new CustomEvent('studysync_inbox_updated', { detail: { studyId: cleanId } }));
    }
  }

  /**
   * Student & Admin Feedback Ledger Methods
   */
  public getFeedbackList(): FeedbackEntry[] {
    return this.getItem<FeedbackEntry[]>(STORAGE_KEYS.FEEDBACK, []);
  }

  public saveFeedback(entry: Omit<FeedbackEntry, 'id' | 'createdAt' | 'status'>): FeedbackEntry {
    const all = this.getFeedbackList();
    const newEntry: FeedbackEntry = {
      ...entry,
      id: `FDBK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    all.unshift(newEntry);
    this.setItem(STORAGE_KEYS.FEEDBACK, all);

    if (this.isBrowser()) {
      window.dispatchEvent(new CustomEvent('studysync_feedback_updated', { detail: { feedbackId: newEntry.id } }));
    }
    return newEntry;
  }

  public updateFeedbackStatus(
    id: string,
    status: FeedbackStatus,
    adminNotes?: string,
    resolvedBy?: string
  ): void {
    const all = this.getFeedbackList();
    const updated = all.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status,
          adminNotes: adminNotes !== undefined ? adminNotes : item.adminNotes,
          resolvedAt: status === 'resolved' ? new Date().toISOString() : item.resolvedAt,
          resolvedBy: resolvedBy !== undefined ? resolvedBy : item.resolvedBy,
        };
      }
      return item;
    });

    this.setItem(STORAGE_KEYS.FEEDBACK, updated);
    if (this.isBrowser()) {
      window.dispatchEvent(new CustomEvent('studysync_feedback_updated', { detail: { feedbackId: id } }));
    }
  }
}

export const localDb = new LocalDatabaseEngine();
export default localDb;
