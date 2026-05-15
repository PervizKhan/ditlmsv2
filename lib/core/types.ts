// lib/core/types.ts

export type UserRole = 'student' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  // New profile fields
  studentId?: string;
  fatherName?: string;
  parentEmail?: string;
  cnic?: string;
  address?: string;
  profilePicture?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  enrollmentYear?: number;
  program?: string;
  cgpa?: number;
  totalCredits?: number;
  otp?: string;
  otpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// COURSE & ACADEMIC TYPES
// ============================================

export interface Course {
  _id?: string;
  code: string;
  credits: number; 
  title: string;
  program: string;
  semester: string;
  department?: string;
}

export interface Enrollment {
  _id?: string;
  studentId: string;
  program: string;
  semester: string;
  academicYear: string;
  courses: string[]; // Course IDs
  status: 'active' | 'completed' | 'withdrawn';
}

// For transcript/grades (legacy - keep for compatibility)
export interface TranscriptCourse {
  code: string;
  title: string;
  credits: number;
  grade: string;
  gp: number;
  semester: string;
  semesterCode: string;
  year: number;
  remarks?: string;
}

export interface TranscriptEnrollment {
  _id?: string;
  studentId: string;
  courses: TranscriptCourse[];
  currentSemester: string;
  academicYear: string;
  status: 'active' | 'withdrawn' | 'graduated' | 'suspended';
}

// ============================================
// CERTIFICATE TYPES
// ============================================

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  courseCode: string;
  grade: string;
  percentage: number;
  issueDate: Date;
  certificateId: string;
  downloadCount: number;
  fatherName: string;
}

// ============================================
// DMC (Detailed Marks Certificate) TYPES
// ============================================

export interface DMCSubject {
  subjectCode: string;
  subjectName: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

export interface DMC {
  id: string;
  studentId: string;
  studentName: string;
  studentIdNo: string;
  program: string;
  semester: string;
  
  examType: '1st Term' | '2nd Term' | 'Final Term' | 'Annual';
  academicYear: string;
  subjects: DMCSubject[];
  totalMarks: number;
  obtainedMarks: number;
  overallPercentage: number;
  overallGrade: string;
  overallStatus: 'Pass' | 'Fail';
  remarks?: string;
  issueDate: Date;
  dmcId: string;
  generatedBy?: string;
  createdAt: Date;
}

// ============================================
// EXAM & MARKS TYPES
// ============================================

export interface Exam {
  _id?: string;
  name: string;
  type: '1st Term' | '2nd Term' | 'Final Term' | 'Annual';
  semester: string;  // Can be any string: "1st Semester", "2nd Term", etc.
  academicYear: string;
  program: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'ongoing' | 'completed';
  courses: string[];
}


export interface Marks {
  _id?: string;
  studentId: string;
  examId: string;
  courseId: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: 'Pass' | 'Fail';
  remarks?: string;
  enteredBy: string;
  enteredAt: Date;
}