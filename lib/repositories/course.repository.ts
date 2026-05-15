import mongoose, { Schema, Model } from 'mongoose';
import { Course } from '../core/types';
import { connectDB } from './db';

interface CourseDocument extends Document {
  code: string;
  title: string;
  credits: number;
  program: string;
  semester: string;
  department?: string;
}

const CourseSchema = new Schema<CourseDocument>({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  credits: { type: Number, required: true, default: 3 },
  program: { type: String, required: true },
  semester: { type: String, required: true },
  department: { type: String },
}, { timestamps: true });

const CourseModel: Model<CourseDocument> =
  mongoose.models.Course || mongoose.model<CourseDocument>('Course', CourseSchema);

export const CourseRepository = {
  async create(data: Partial<Course>): Promise<CourseDocument> {
    await connectDB();
    return CourseModel.create({
      code: data.code,
      title: data.title,
      credits: data.credits || 3,
      program: data.program,
      semester: data.semester,
      department: data.department,
    });
  },

  async findAll(): Promise<CourseDocument[]> {
    await connectDB();
    return CourseModel.find().sort({ program: 1, semester: 1, code: 1 });
  },

  async findByProgram(program: string): Promise<CourseDocument[]> {
    await connectDB();
    return CourseModel.find({ program }).sort({ semester: 1, code: 1 });
  },

  async findBySemester(program: string, semester: string): Promise<CourseDocument[]> {
    await connectDB();
    return CourseModel.find({ program, semester });
  },

  async findById(id: string): Promise<CourseDocument | null> {
    await connectDB();
    return CourseModel.findById(id);
  },

  async update(id: string, data: Partial<Course>): Promise<CourseDocument | null> {
    await connectDB();
    return CourseModel.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id: string): Promise<void> {
    await connectDB();
    await CourseModel.findByIdAndDelete(id);
  },
};