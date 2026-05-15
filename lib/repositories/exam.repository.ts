import mongoose, { Schema, Model } from 'mongoose';
import { Exam } from '../core/types';
import { connectDB } from './db';

interface ExamDocument extends Document {
  name: string;
  type: string;
  semester: string;
  academicYear: string;
  program: string;
  startDate: Date;
  endDate: Date;
  status: string;
  courses: mongoose.Types.ObjectId[];
}

const ExamSchema = new Schema<ExamDocument>({
  name: { type: String, required: true },
  type: { type: String, enum: ['1st Term', '2nd Term', 'Final Term', 'Annual'], required: true },
  semester: { type: String, required: true },
  academicYear: { type: String, required: true },
  program: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
}, { timestamps: true });

const ExamModel: Model<ExamDocument> =
  mongoose.models.Exam || mongoose.model<ExamDocument>('Exam', ExamSchema);

export const ExamRepository = {
  async create(data: Partial<Exam>): Promise<ExamDocument> {
    await connectDB();
    return ExamModel.create({
      ...data,
      courses: data.courses || [],
    });
  },

  async findAll(): Promise<ExamDocument[]> {
    await connectDB();
    return ExamModel.find().populate('courses').sort({ createdAt: -1 });
  },

  async findById(id: string): Promise<ExamDocument | null> {
    await connectDB();
    return ExamModel.findById(id).populate('courses');
  },

  async findByProgram(program: string): Promise<ExamDocument[]> {
    await connectDB();
    return ExamModel.find({ program }).populate('courses');
  },

  async update(id: string, data: Partial<Exam>): Promise<ExamDocument | null> {
    await connectDB();
    return ExamModel.findByIdAndUpdate(id, data, { new: true });
  },

  async updateStatus(id: string, status: string): Promise<void> {
    await connectDB();
    await ExamModel.findByIdAndUpdate(id, { status });
  },

  async delete(id: string): Promise<void> {
    await connectDB();
    await ExamModel.findByIdAndDelete(id);
  },
};