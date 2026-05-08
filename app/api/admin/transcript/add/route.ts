// app/api/admin/transcript/add/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/jwt';
import { cookies } from 'next/headers';
import { CourseRepository } from '@/lib/repositories/course.repository';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await req.json();
    const { studentId, course } = body;
    
    // Check if enrollment exists
    let enrollment = await CourseRepository.getEnrollmentByStudentId(studentId);
    
    if (!enrollment) {
      // Create new enrollment
      await CourseRepository.createEnrollment({
        studentId,
        courses: [course],
        currentSemester: course.semester,
        academicYear: `${course.year}-${course.year + 1}`,
        status: 'active'
      });
    } else {
      // Add course to existing enrollment
      await CourseRepository.addCourse(studentId, course);
    }
    
    return NextResponse.json({ success: true, message: 'Course added successfully' });
    
  } catch (error) {
    console.error('Error adding course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}