import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/user.repository';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    console.log('Headers found:', headers);
    
    let successCount = 0;
    const errors = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      const studentData: any = {};
      
      // Map CSV columns to database fields
      headers.forEach((header, idx) => {
        const value = values[idx] || '';
        
        if (header === 'name') studentData.name = value;
        else if (header === 'email') studentData.email = value;
        else if (header === 'password') studentData.password = value;
        else if (header === 'role') studentData.role = value;
        else if (header === 'studentid') studentData.studentId = value;
        else if (header === 'program') studentData.program = value;
        else if (header === 'parentemail') studentData.parentEmail = value;
        else if (header === 'fathername') studentData.fatherName = value;
        else if (header === 'phone') studentData.phone = value;
        else if (header === 'cnic') studentData.cnic = value;
        else if (header === 'address') studentData.address = value;
        else if (header === 'enrollmentyear') studentData.enrollmentYear = parseInt(value) || 2024;
      });
      
      // Validate required fields
      if (!studentData.name || !studentData.email || !studentData.password) {
        errors.push(`Row ${i}: Missing required fields (name, email, password)`);
        continue;
      }
      
      // Check if user exists
      const existing = await UserRepository.findByEmail(studentData.email);
      if (existing) {
        errors.push(`Row ${i}: Email ${studentData.email} already exists`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(studentData.password, 10);
      
      // Create student with all fields
      await UserRepository.create({
        name: studentData.name,
        email: studentData.email,
        password: hashedPassword,
        role: studentData.role || 'student',
        isVerified: true,
        studentId: studentData.studentId || '',
        program: studentData.program || '',
        parentEmail: studentData.parentEmail || '',
        fatherName: studentData.fatherName || '',
        phone: studentData.phone || '',
        cnic: studentData.cnic || '',
        address: studentData.address || '',
        enrollmentYear: studentData.enrollmentYear || 2024,
      });
      
      successCount++;
    }
    
    return NextResponse.json({
      success: true,
      total: lines.length - 1,
      successCount,
      errorCount: errors.length,
      errors,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}