import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/repositories/db';
import { CertificateRepository } from '@/lib/repositories/certificate.repository';

export const dynamic = 'force-dynamic';

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

    await connectDB();

    // Generate unique certificate ID
    const certificateId = leavingCertificateNumber || `LC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create certificate (type is set automatically in repository)
    const certificate = await CertificateRepository.create({
      studentId,
      studentName,
      fatherName: fatherName || '',
      studentIdNo: studentIdNo || '',
      program: program || '',
      leavingReason,
      lastAttendanceDate: lastAttendanceDate ? new Date(lastAttendanceDate) : new Date(),
      conduct: conduct || 'Good',
      characterCertificate: characterCertificate || 'Yes',
      nextAdmissionClass: nextAdmissionClass || '',
      remarks: remarks || '',
      certificateId,
      issueDate: new Date(),
      downloadCount: 0,
    });

    console.log('Certificate created:', certificate._id);

    return NextResponse.json({ 
      success: true, 
      certificate: { id: certificate._id } 
    });
    
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}