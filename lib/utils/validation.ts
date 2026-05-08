// lib/utils/validation.ts

export const isEmailValid = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isPasswordStrong = (password: string): boolean => {
  return password.length >= 6;
};