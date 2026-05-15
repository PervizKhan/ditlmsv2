// app/api/admin/transcript/[studentId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/jwt';
import { cookies } from 'next/headers';
import { CourseRepository } from '@/lib/repositories/course.repository';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // ✅ Await the params Promise to get studentId
    const { studentId } = await params;
    
    const enrollment = await CourseRepository.getEnrollmentByStudentId(studentId);
    
    return NextResponse.json({
      courses: enrollment?.courses || [],
      status: enrollment?.status || 'active'
    });
    
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}