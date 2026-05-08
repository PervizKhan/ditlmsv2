// lib/actions/auth.actions.ts
'use server';

import { cookies } from 'next/headers';
import { AuthService } from '../services/auth.service';

interface ActionResponse {
  success: boolean;
  message: string;
  redirectTo?: string;
}

// Update registerAction to include name
export const registerAction = async (
  formData: FormData
): Promise<ActionResponse> => {
  const name = formData.get('name');        // ✅ Get name
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return { success: false, message: 'Invalid form data' };
  }

  const result = await AuthService.register({
    name,      // ✅ Pass name
    email,
    password,
    role: 'student',
  });

  if (!result.success) {
    return { success: false, message: result.error };
  }

  return { 
    success: true, 
    message: result.data, 
    redirectTo: '/verify?email=' + encodeURIComponent(email) 
  };
};

export const loginAction = async (
  formData: FormData
): Promise<ActionResponse> => {
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { success: false, message: 'Invalid form data' };
  }

  const result = await AuthService.login(email, password);

  if (!result.success) {
    return { success: false, message: result.error };
  }

  const cookieStore = await cookies();
  
  cookieStore.set({
  name: 'token',
  value: result.data,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
});

  const user = await AuthService.getUserByEmail(email);
  const redirectTo = user.success && user.data.role === 'admin' 
    ? '/dashboard/admin' 
    : '/dashboard';

  return { 
    success: true, 
    message: 'Login successful', 
    redirectTo 
  };
};

export const logoutAction = async (): Promise<ActionResponse> => {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  
  return { success: true, message: 'Logged out' };
};