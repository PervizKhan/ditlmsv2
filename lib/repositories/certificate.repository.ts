import mongoose, { Schema, Model, Document } from 'mongoose';
import { connectDB } from './db';

interface CertificateDocument extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  fatherName?: string;
  studentIdNo?: string;
  program?: string;
  type: 'leaving';
  leavingReason: string;
  lastAttendanceDate: Date;
  conduct: string;
  characterCertificate: string;
  nextAdmissionClass?: string;
  remarks?: string;
  certificateId: string;
  issueDate: Date;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<CertificateDocument>(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    fatherName: { type: String, default: '' },
    studentIdNo: { type: String, default: '' },
    program: { type: String, default: '' },
    type: { type: String, enum: ['leaving'], default: 'leaving' },
    leavingReason: { type: String, required: true },
    lastAttendanceDate: { type: Date, default: Date.now },
    conduct: { type: String, default: 'Good' },
    characterCertificate: { type: String, default: 'Yes' },
    nextAdmissionClass: { type: String, default: '' },
    remarks: { type: String, default: '' },
    certificateId: { type: String, unique: true, required: true },
    issueDate: { type: Date, default: Date.now },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const CertificateModel: Model<CertificateDocument> =
  mongoose.models.Certificate || mongoose.model<CertificateDocument>('Certificate', CertificateSchema);

export const CertificateRepository = {
  async create(data: {
    studentId: string;
    studentName: string;
    fatherName?: string;
    studentIdNo?: string;
    program?: string;
    leavingReason: string;
    lastAttendanceDate?: Date;
    conduct?: string;
    characterCertificate?: string;
    nextAdmissionClass?: string;
    remarks?: string;
    certificateId: string;
    issueDate?: Date;
  }): Promise<CertificateDocument> {
    await connectDB();
    return CertificateModel.create({
      studentId: new mongoose.Types.ObjectId(data.studentId),
      studentName: data.studentName,
      fatherName: data.fatherName || '',
      studentIdNo: data.studentIdNo || '',
      program: data.program || '',
      type: 'leaving',
      leavingReason: data.leavingReason,
      lastAttendanceDate: data.lastAttendanceDate || new Date(),
      conduct: data.conduct || 'Good',
      characterCertificate: data.characterCertificate || 'Yes',
      nextAdmissionClass: data.nextAdmissionClass || '',
      remarks: data.remarks || '',
      certificateId: data.certificateId,
      issueDate: data.issueDate || new Date(),
      downloadCount: 0,
    });
  },

  async findById(id: string): Promise<CertificateDocument | null> {
    await connectDB();
    return CertificateModel.findById(id);
  },

  async findByStudentId(studentId: string): Promise<CertificateDocument[]> {
    await connectDB();
    return CertificateModel.find({ studentId }).sort({ issueDate: -1 });
  },

  async incrementDownloadCount(id: string): Promise<void> {
    await connectDB();
    await CertificateModel.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });
  },

  async getAll(): Promise<CertificateDocument[]> {
    await connectDB();
    return CertificateModel.find().populate('studentId', 'name email').sort({ issueDate: -1 });
  },
};