/**
 * StudySync — Member Domain Models & Types
 */

export type StreamType = 'Biological Science' | 'Physical Science';

export type GenderType = 'Male' | 'Female' | 'Other';

export type MemberStatus = 'Active' | 'Verified' | 'Suspended' | 'Pending';



/**
 * Authenticated user profile extracted from Firebase Auth or direct login session
 */
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified?: boolean;
}

/**
 * Full Member record representing a row in the 10-column Google Sheet 'Members'
 */
export interface MemberData {
  studyId: string;           // Col A: e.g. "SG-BIO-0001" or "SG-MATH-0001"
  fullName: string;          // Col B: Student Full Name
  name?: string;
  email: string;             // Col C: Unique Email Key
  gender?: GenderType | string; // Col D: Gender
  telegram?: string;          // Col E: Telegram Handle (e.g. "@student")
  telegramUsername?: string;
  school: string;            // Col F: School Name
  stream: StreamType | string; // Col G: Stream
  optionalSubject: string;   // Col H: 3rd Subject (e.g. "Physics", "Chemistry", "ICT", "Agriculture")
  registrationDate?: string;  // Col I: ISO 8601 string or YYYY-MM-DD
  status: MemberStatus | string; // Col J: "Active" or "Inactive"
  examYear?: string;         // A/L Exam Target Year (e.g. "2026", "2027", "2028")
  targetYear?: string;       // Alias for examYear
  role?: 'admin' | 'student' | string;
  adminVerified?: boolean;
  streakCount?: number;
  totalHours?: number;
  totalHoursLogged?: number;
  district?: string;
  targetWeeklyHours?: number;
  passwordHash?: string;
  passwordSalt?: string;
  nic?: string;
  paymentSlipUrl?: string;
  bankSlipUrl?: string;
}


/**
 * Sanitized Public Member record for Digital ID & QR Verification
 * (Omits sensitive email and telegram handles)
 */
export interface VerifiedMember {
  studyId: string;
  fullName: string;
  name?: string;
  school: string;
  stream: StreamType | string;
  optionalSubject: string;
  registrationDate: string;
  status: MemberStatus | string;
  examYear?: string;
}


/**
 * Partial update payload for profile / member updates
 */
export interface UpdateMemberPayload {
  fullName?: string;
  gender?: GenderType | string;
  telegram?: string;
  school?: string;
  stream?: StreamType | string;
  optionalSubject?: string;
  status?: MemberStatus | string;
}
