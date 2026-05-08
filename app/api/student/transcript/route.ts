// app/api/student/transcript/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/jwt';
import { cookies } from 'next/headers';
import { StudentService } from '@/lib/services/student.service';

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
    
    const transcript = await StudentService.getStudentTranscript(payload.userId);
    
    // Return empty data instead of 404
    if (!transcript.success) {
      return NextResponse.json({ 
        transcript: [],
        cgpa: '0.00',
        totalCredits: 0,
        totalCourses: 0,
        status: 'active',
        message: 'No transcript data available'
      });
    }
    
    return NextResponse.json(transcript.data);
    
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json({ 
      transcript: [],
      cgpa: '0.00',
      totalCredits: 0,
      totalCourses: 0,
      message: 'No transcript data available'
    });
  }
}