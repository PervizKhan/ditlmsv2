import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/repositories/db';
import { DMCRepository } from '@/lib/repositories/dmc.repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const dmcs = await DMCRepository.getAll();
    
    // Convert to plain objects
    const dmcList = dmcs.map(dmc => ({
      _id: dmc._id,
      studentName: dmc.studentName,
      studentIdNo: dmc.studentIdNo,
      program: dmc.program,
      semester: dmc.semester,
      examType: dmc.examType,
      academicYear: dmc.academicYear,
      overallPercentage: dmc.overallPercentage,
      overallGrade: dmc.overallGrade,
      overallStatus: dmc.overallStatus,
      dmcId: dmc.dmcId,
      issueDate: dmc.issueDate,
    }));
    
    return NextResponse.json(dmcList);
  } catch (error) {
    console.error('Error fetching DMCs:', error);
    return NextResponse.json({ error: 'Failed to fetch DMCs' }, { status: 500 });
  }
}