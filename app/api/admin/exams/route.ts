import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/repositories/db';
import { ExamRepository } from '@/lib/repositories/exam.repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const exams = await ExamRepository.findAll();
    return NextResponse.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Convert date strings to Date objects
    const examData = {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    };
    
    const exam = await ExamRepository.create(examData);
    return NextResponse.json(exam);
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Exam ID required' }, { status: 400 });
    }
    
    // Convert date strings to Date objects if they exist
    const updateData: any = { ...body };
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);
    
    const exam = await ExamRepository.update(id, updateData);
    
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    
    return NextResponse.json(exam);
  } catch (error) {
    console.error('Error updating exam:', error);
    return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Exam ID required' }, { status: 400 });
    }
    
    await ExamRepository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exam:', error);
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
  }
}