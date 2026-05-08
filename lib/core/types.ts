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

export interface Course {
  _id?: string;
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

export interface Enrollment {
  _id?: string;
  studentId: string;
  courses: Course[];
  currentSemester: string;
  academicYear: string;
  status: 'active' | 'withdrawn' | 'graduated' | 'suspended';
}