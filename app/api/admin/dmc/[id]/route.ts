import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/repositories/db';
import { DMCRepository } from '@/lib/repositories/dmc.repository';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const dmc = await DMCRepository.findByDmcId(params.id);
    
    if (!dmc) {
      return NextResponse.json({ error: 'DMC not found' }, { status: 404 });
    }
    
    // Convert to plain object
    const dmcData = {
      studentName: dmc.studentName,
      studentIdNo: dmc.studentIdNo,
      program: dmc.program,
      semester: dmc.semester,
      examType: dmc.examType,
      academicYear: dmc.academicYear,
      subjects: dmc.subjects,
      totalMarks: dmc.totalMarks,
      obtainedMarks: dmc.obtainedMarks,
      overallPercentage: dmc.overallPercentage,
      overallGrade: dmc.overallGrade,
      overallStatus: dmc.overallStatus,
      remarks: dmc.remarks,
      issueDate: dmc.issueDate,
      dmcId: dmc.dmcId,
    };
    
    return NextResponse.json(dmcData);
  } catch (error) {
    console.error('Error fetching DMC:', error);
    return NextResponse.json({ error: 'Failed to fetch DMC' }, { status: 500 });
  }
}