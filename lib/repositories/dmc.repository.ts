import mongoose, { Schema, Model, Document } from 'mongoose';
import { DMCSubject } from '../core/types';
import { connectDB } from './db';

interface DMCDocument extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentIdNo: string;
  program: string;
  semester: string;
  examType: string;
  academicYear: string;
  subjects: DMCSubject[];
  totalMarks: number;
  obtainedMarks: number;
  overallPercentage: number;
  overallGrade: string;
  overallStatus: string;
  remarks?: string;
  issueDate: Date;
  dmcId: string;
  generatedBy?: string;
  createdAt: Date;
}

const DMCSubjectSchema = new Schema({
  subjectCode: { type: String, required: true },
  subjectName: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  obtainedMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  grade: { type: String, required: true },
  status: { type: String, enum: ['Pass', 'Fail'], required: true },
});

const DMCSchema = new Schema<DMCDocument>(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    studentIdNo: { type: String, required: true },
    program: { type: String, required: true },
    semester: { type: String, required: true },
    examType: { type: String, enum: ['1st Term', '2nd Term', 'Final Term', 'Annual'], required: true },
    academicYear: { type: String, required: true },
    subjects: [DMCSubjectSchema],
    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    overallPercentage: { type: Number, required: true },
    overallGrade: { type: String, required: true },
    overallStatus: { type: String, enum: ['Pass', 'Fail'], required: true },
    remarks: { type: String },
    issueDate: { type: Date, default: Date.now },
    dmcId: { type: String, unique: true, required: true },
    generatedBy: { type: String },
  },
  { timestamps: true }
);

const DMCModel: Model<DMCDocument> =
  mongoose.models.DMC || mongoose.model<DMCDocument>('DMC', DMCSchema);

export const DMCRepository = {
  async create(data: any): Promise<DMCDocument> {
    await connectDB();
    return DMCModel.create(data);
  },

  async findById(id: string): Promise<DMCDocument | null> {
    await connectDB();
    return DMCModel.findById(id);
  },

  async findByDmcId(dmcId: string): Promise<DMCDocument | null> {
    await connectDB();
    return DMCModel.findOne({ dmcId });
  },

  async findByStudentId(studentId: string): Promise<DMCDocument[]> {
    await connectDB();
    return DMCModel.find({ studentId }).sort({ issueDate: -1 });
  },

  async getAll(): Promise<any[]> {
    await connectDB();
    const dmcs = await DMCModel.find().populate('studentId', 'name email').sort({ createdAt: -1 });
    // Convert to plain objects with string IDs
    return dmcs.map(dmc => ({
      _id: dmc._id.toString(),
      studentName: dmc.studentName,
      studentIdNo: dmc.studentIdNo,
      program: dmc.program,
      semester: dmc.semester,
      examType: dmc.examType,
      academicYear: dmc.academicYear,
      overallPercentage: dmc.overallPercentage,
      overallGrade: dmc.overallGrade,
      overallStatus: dmc.overallStatus,
      dmcId: dmc.dmcId,
      issueDate: dmc.issueDate,
    }));
  },

  async delete(id: string): Promise<void> {
    await connectDB();
    await DMCModel.findByIdAndDelete(id);
  },
};