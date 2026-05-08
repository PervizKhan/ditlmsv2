// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log('API Login attempt:', email);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      );
    }

    const result = await AuthService.login(email, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    
    cookieStore.set('token', result.data, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    const user = await AuthService.getUserByEmail(email);
    const redirectTo = user.success && user.data.role === 'admin' 
      ? '/dashboard/admin' 
      : '/dashboard';

    console.log('Login successful, redirecting to:', redirectTo);

    return NextResponse.json({ 
      success: true, 
      redirectTo,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}