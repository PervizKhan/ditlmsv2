// app/api/auth/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/jwt';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    
    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    
    return NextResponse.json({ 
      authenticated: true, 
      user: {
        userId: payload.userId,
        role: payload.role,
        isVerified: payload.isVerified,
       
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}