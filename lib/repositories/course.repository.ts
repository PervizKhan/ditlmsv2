// lib/repositories/course.repository.ts

import mongoose, { Schema, Model } from 'mongoose';
import { Course, Enrollment } from '../core/types';
import { connectDB } from './db';

interface CourseDocument extends Omit<Course, '_id'>, mongoose.Document {}
interface EnrollmentDocument extends Omit<Enrollment, '_id' | 'studentId'>, mongoose.Document {
  studentId: mongoose.Types.ObjectId;
}

const CourseSchema = new Schema<CourseDocument>({
  code: { type: String, required: true },
  title: { type: String, required: true },
  credits: { type: Number, required: true },
  grade: { type: String, required: true },
  gp: { type: Number, required: true },
  semester: { type: String, required: true },
  semesterCode: { type: String, required: true },
  year: { type: Number, required: true },
  remarks: { type: String },
}, { timestamps: true });

const EnrollmentSchema = new Schema<EnrollmentDocument>({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courses: [CourseSchema],
  currentSemester: { type: String, required: true },
  academicYear: { type: String, required: true },
  status: { type: String, enum: ['active', 'withdrawn', 'graduated', 'suspended'], default: 'active' },
}, { timestamps: true });

const CourseModel: Model<CourseDocument> = mongoose.models.Course || mongoose.model<CourseDocument>('Course', CourseSchema);
const EnrollmentModel: Model<EnrollmentDocument> = mongoose.models.Enrollment || mongoose.model<EnrollmentDocument>('Enrollment', EnrollmentSchema);

export const CourseRepository = {
  async createEnrollment(data: Partial<Enrollment>): Promise<EnrollmentDocument> {
    await connectDB();
    return EnrollmentModel.create(data);
  },

  async getEnrollmentByStudentId(studentId: string): Promise<EnrollmentDocument | null> {
    await connectDB();
    return EnrollmentModel.findOne({ studentId }).populate('studentId');
  },

  async updateEnrollment(studentId: string, data: Partial<Enrollment>): Promise<void> {
    await connectDB();
    await EnrollmentModel.updateOne({ studentId }, data);
  },

  async addCourse(studentId: string, course: Course): Promise<void> {
    await connectDB();
    await EnrollmentModel.updateOne(
      { studentId },
      { $push: { courses: course } }
    );
  },

  async updateCourseGrade(studentId: string, courseCode: string, grade: string, gp: number): Promise<void> {
    await connectDB();
    await EnrollmentModel.updateOne(
      { studentId, 'courses.code': courseCode },
      { $set: { 'courses.$.grade': grade, 'courses.$.gp': gp } }
    );
  },
};