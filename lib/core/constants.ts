// lib/core/constants.ts

export const JWT_EXPIRES_IN = '15m';
export const REFRESH_TOKEN_EXPIRES_IN = '7d';

export const OTP_EXPIRY_MINUTES = 10;

export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
} as const;