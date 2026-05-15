import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/repositories/db';
import { UserRepository } from '@/lib/repositories/user.repository';
import { DMCRepository } from '@/lib/repositories/dmc.repository';

export const dynamic = 'force-dynamic';

interface SubjectInput {
  code: string;
  name: string;
  totalMarks: number;
  obtainedMarks: number;
}

interface SubjectResult {
  subjectCode: string;
  subjectName: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

// Grade calculation helper
function calculateGrade(percentage: number): { grade: string; status: 'Pass' | 'Fail' } {
  if (percentage >= 90) return { grade: 'A+', status: 'Pass' };
  if (percentage >= 80) return { grade: 'A', status: 'Pass' };
  if (percentage >= 70) return { grade: 'B', status: 'Pass' };
  if (percentage >= 60) return { grade: 'C', status: 'Pass' };
  if (percentage >= 50) return { grade: 'D', status: 'Pass' };
  if (percentage >= 40) return { grade: 'E', status: 'Pass' };
  return { grade: 'F', status: 'Fail' };
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { program, semester, examType, academicYear, subjects, studentIds } = body;

    const results: Array<{
      studentId: string;
      studentName: string;
      dmcId: string;
      overallPercentage: number;
      overallGrade: string;
      overallStatus: string;
    }> = [];
    
    const errors: Array<{ studentId: string; error: string }> = [];

    for (const studentId of studentIds) {
      try {
        const student = await UserRepository.findById(studentId);
        if (!student) {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }

        // Calculate subject results
        const subjectResults: SubjectResult[] = subjects.map((subject: SubjectInput) => {
          const obtainedMarks = subject.obtainedMarks;
          const totalMarks = subject.totalMarks;
          const percentage = (obtainedMarks / totalMarks) * 100;
          const { grade, status } = calculateGrade(percentage);
          
          return {
            subjectCode: subject.code,
            subjectName: subject.name,
            totalMarks,
            obtainedMarks,
            percentage: Math.round(percentage * 100) / 100,
            grade,
            status,
          };
        });

        // Calculate overall totals
        const totalMarks = subjectResults.reduce((sum: number, s: SubjectResult) => sum + s.totalMarks, 0);
        const obtainedMarks = subjectResults.reduce((sum: number, s: SubjectResult) => sum + s.obtainedMarks, 0);
        const overallPercentage = (obtainedMarks / totalMarks) * 100;
        const { grade: overallGrade, status: overallStatus } = calculateGrade(overallPercentage);

        // Generate unique DMC ID
        const dmcId = `DMC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Create DMC
        await DMCRepository.create({
          studentId: student._id,
          studentName: student.name,
          studentIdNo: student.studentId || '',
          program: student.program || '',
          semester,
          examType,
          academicYear,
          subjects: subjectResults,
          totalMarks,
          obtainedMarks,
          overallPercentage: Math.round(overallPercentage * 100) / 100,
          overallGrade,
          overallStatus,
          dmcId,
          issueDate: new Date(),
        });

        results.push({
          studentId: student._id.toString(),
          studentName: student.name,
          dmcId,
          overallPercentage: Math.round(overallPercentage * 100) / 100,
          overallGrade,
          overallStatus,
        });

      } catch (err) {
        errors.push({ studentId, error: String(err) });
      }
    }

    return NextResponse.json({
      success: true,
      total: studentIds.length,
      generated: results.length,
      failed: errors.length,
      results,
      errors,
    });

  } catch (error) {
    console.error('DMC generation error:', error);
    return NextResponse.json({ error: 'Failed to generate DMCs' }, { status: 500 });
  }
}