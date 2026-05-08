// lib/repositories/user.repository.ts

import mongoose, { Schema, Model } from 'mongoose';
import { User } from '../core/types';
import { connectDB } from './db';

interface UserDocument extends Omit<User, '_id'>, mongoose.Document {
  otp?: string;
  otpExpiresAt?: Date;
}

// Update UserSchema to include name
const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], required: true, default: 'student' },
    isVerified: { type: Boolean, default: false },
    // New profile fields
    studentId: { type: String, unique: true, sparse: true },
    fatherName: { type: String, default: '' },
    cnic: { type: String, unique: true, sparse: true },
    address: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    phone: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    enrollmentYear: { type: Number },
    program: { type: String, default: '' },
    cgpa: { type: Number, default: 0 },
    totalCredits: { type: Number, default: 0 },
    otp: { type: String },
    otpExpiresAt: { type: Date },
  },
  { timestamps: true }
);

const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

export const UserRepository = {
  async findByEmail(email: string): Promise<UserDocument | null> {
    await connectDB();
    return UserModel.findOne({ email });
  },

  // Add this method to UserRepository
async findById(id: string): Promise<UserDocument | null> {
  await connectDB();
  return UserModel.findById(id);
},

  async create(data: Partial<User>): Promise<UserDocument> {
    await connectDB();
    return UserModel.create(data);
  },

  async verifyUser(email: string): Promise<void> {
    await connectDB();
    await UserModel.updateOne({ email }, { isVerified: true, otp: null, otpExpiresAt: null });
  },

  async getAll(): Promise<UserDocument[]> {
    await connectDB();
    return UserModel.find();
  },

  async updateRole(email: string, role: string): Promise<void> {
    await connectDB();
    await UserModel.updateOne({ email }, { role });
  },

  async deleteByEmail(email: string): Promise<void> {
    await connectDB();
    await UserModel.deleteOne({ email });
  },

  // ✅ NEW OTP METHODS
  async saveOTP(email: string, otp: string, expiresAt: Date): Promise<void> {
    await connectDB();
    await UserModel.updateOne({ email }, { otp, otpExpiresAt: expiresAt });
  },

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    await connectDB();
    const user = await UserModel.findOne({
      email,
      otp,
      otpExpiresAt: { $gt: new Date() }
    });
    return !!user;
  },

  async clearOTP(email: string): Promise<void> {
    await connectDB();
    await UserModel.updateOne({ email }, { otp: null, otpExpiresAt: null });
  },

async updateProfile(userId: string, profileData: Partial<User>): Promise<void> {
  await connectDB();
  await UserModel.updateOne({ _id: userId }, profileData);
},

async getUserProfile(userId: string): Promise<UserDocument | null> {
  await connectDB();
  return UserModel.findById(userId).select('-password -otp -otpExpiresAt');
},
  // Add to UserRepository



async updateAcademicInfo(userId: string, data: any): Promise<void> {
  await connectDB();
  await UserModel.updateOne({ _id: userId }, data);
},

async updateStudentId(email: string, studentId: string): Promise<void> {
  await connectDB();
  await UserModel.updateOne({ email }, { studentId });
},
};