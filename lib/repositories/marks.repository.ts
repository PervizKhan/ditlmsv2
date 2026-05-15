import mongoose, { Schema, Model } from 'mongoose';
import { Marks } from '../core/types';
import { connectDB } from './db';

interface MarksDocument extends Document {
  studentId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: string;
  remarks?: string;
  enteredBy: string;
  enteredAt: Date;
}

const MarksSchema = new Schema<MarksDocument>({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  obtainedMarks: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  grade: { type: String, required: true },
  status: { type: String, enum: ['Pass', 'Fail'], required: true },
  remarks: { type: String },
  enteredBy: { type: String, required: true },
  enteredAt: { type: Date, default: Date.now },
}, { timestamps: true });

const MarksModel: Model<MarksDocument> =
  mongoose.models.Marks || mongoose.model<MarksDocument>('Marks', MarksSchema);

export const MarksRepository = {
  async create(data: Partial<Marks>): Promise<MarksDocument> {
    await connectDB();
    return MarksModel.create(data);
  },

  async findByStudentAndExam(studentId: string, examId: string): Promise<MarksDocument[]> {
    await connectDB();
    return MarksModel.find({ studentId, examId }).populate('courseId');
  },

  async findByExam(examId: string): Promise<MarksDocument[]> {
    await connectDB();
    return MarksModel.find({ examId }).populate('studentId', 'name studentId').populate('courseId');
  },

  async updateMarks(id: string, obtainedMarks: number): Promise<void> {
    await connectDB();
    const totalMarks = (await MarksModel.findById(id))?.totalMarks || 100;
    const percentage = (obtainedMarks / totalMarks) * 100;
    const grade = percentage >= 40 ? 'Pass' : 'Fail';
    
    await MarksModel.findByIdAndUpdate(id, {
      obtainedMarks,
      percentage,
      grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : percentage >= 40 ? 'E' : 'F',
      status: percentage >= 40 ? 'Pass' : 'Fail',
    });
  },

  async deleteByExam(examId: string): Promise<void> {
    await connectDB();
    await MarksModel.deleteMany({ examId });
  },
};