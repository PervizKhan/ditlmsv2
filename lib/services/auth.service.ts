// lib/services/auth.service.ts (updated login method)

import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { Result, ok, err } from '../core/result';
import { signToken } from '../utils/jwt'; // Now async
import { isEmailValid, isPasswordStrong } from '../utils/validation';
import { UserRole } from '../core/types';
import { OTP_EXPIRY_MINUTES } from '../core/constants';
import { EmailService } from './email.service';

// Update RegisterDTO interface
export interface RegisterDTO {
  name: string;        // ✅ Add name field
  email: string;
  password: string;
  role: UserRole;
}

export const AuthService = {
 // Update register method
async register(data: RegisterDTO): Promise<Result<string>> {
  const { name, email, password, role } = data;  // ✅ Include name

  if (!name || name.trim().length < 2) {
    return err('Please enter a valid name (minimum 2 characters)');
  }
  
  if (!isEmailValid(email)) return err('Invalid email');
  if (!isPasswordStrong(password)) return err('Password must be at least 6 characters');

  const existing = await UserRepository.findByEmail(email);
  if (existing) return err('User already exists');

  const hashed = await bcrypt.hash(password, 10);
  
  await UserRepository.create({
    name: name.trim(),  // ✅ Save name
    email,
    password: hashed,
    role,
    isVerified: false,
  });

  const otpResult = await AuthService.sendOTP(email);
  if (!otpResult.success) {
    return err('User created but failed to send OTP');
  }

  return ok('User registered successfully. Please check your email for OTP.');
},

  async login(email: string, password: string): Promise<Result<string>> {
    const user = await UserRepository.findByEmail(email);
    if (!user) return err('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return err('Invalid credentials');

    if (!user.isVerified) {
      return err('Please verify your email first. Check your inbox for OTP.');
    }

    // IMPORTANT: Use await with signToken
    const token = await signToken({
      userId: user._id.toString(),
      role: user.role,
      isVerified: user.isVerified,
    });

    return ok(token);
  },

  async sendOTP(email: string): Promise<Result<string>> {
    const user = await UserRepository.findByEmail(email);
    if (!user) return err('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await UserRepository.saveOTP(email, otp, expiresAt);
    const emailResult = await EmailService.sendOTP(email, otp);
    
    if (!emailResult.success) {
      return err('Failed to send OTP email');
    }

    return ok('OTP sent successfully');
  },

  async verifyOTP(email: string, otp: string): Promise<Result<string>> {
    if (!email || !otp) return err('Email and OTP are required');
    if (otp.length !== 6) return err('OTP must be 6 digits');

    const isValid = await UserRepository.verifyOTP(email, otp);
    if (!isValid) return err('Invalid or expired OTP');

    await UserRepository.verifyUser(email);
    await UserRepository.clearOTP(email);

    // Send welcome email
    await EmailService.sendWelcomeEmail(email);

    return ok('Email verified successfully');
  },

  async resendOTP(email: string): Promise<Result<string>> {
    const user = await UserRepository.findByEmail(email);
    if (!user) return err('User not found');
    if (user.isVerified) return err('User is already verified');

    return await AuthService.sendOTP(email);
  },

  async getUserByEmail(email: string): Promise<Result<any>> {
    const user = await UserRepository.findByEmail(email);
    if (!user) return err('User not found');

    return ok({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  },

  // Add this method to AuthService
async getUserById(userId: string): Promise<Result<any>> {
  const user = await UserRepository.findById(userId);
  if (!user) return err('User not found');

  return ok({
    _id: user._id.toString(),
    name: user.name,  // ✅ Include name in response
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
},
};