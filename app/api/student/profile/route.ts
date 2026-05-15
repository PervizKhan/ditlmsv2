// app/api/student/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/jwt';
import { cookies } from 'next/headers';
import { StudentService } from '@/lib/services/student.service';
import { UserRepository } from '@/lib/repositories/user.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const profile = await StudentService.getStudentProfile(payload.userId);
    if (!profile.success) {
      return NextResponse.json({ error: profile.error }, { status: 404 });
    }
    
    return NextResponse.json(profile.data);
    
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { fatherName, program } = body;
    
    await UserRepository.updateAcademicInfo(payload.userId, { fatherName, program });
    
    return NextResponse.json({ success: true, message: 'Profile updated' });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}