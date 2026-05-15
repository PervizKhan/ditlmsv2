import { NextRequest, NextResponse } from 'next/server';
import { CertificateService } from '@/lib/services/certificate.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received body:', body);
    
    const {
      studentId,
      studentName,
      fatherName,
      studentIdNo,
      program,
      leavingReason,
      lastAttendanceDate,
      conduct,
      characterCertificate,
      nextAdmissionClass,
      remarks,
      leavingCertificateNumber,
    } = body;

    // Validate required fields
    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
    }
    if (!studentName) {
      return NextResponse.json({ error: 'studentName is required' }, { status: 400 });
    }
    if (!leavingReason) {
      return NextResponse.json({ error: 'leavingReason is required' }, { status: 400 });
    }

    const result = await CertificateService.generateLeavingCertificate({
      studentId,
      studentName,
      fatherName,
      studentIdNo,
      program,
      leavingReason,
      lastAttendanceDate: lastAttendanceDate ? new Date(lastAttendanceDate) : new Date(),
      conduct,
      characterCertificate,
      nextAdmissionClass,
      remarks,
      certificateId: leavingCertificateNumber,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      certificate: { id: result.data.id } 
    });
    
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}