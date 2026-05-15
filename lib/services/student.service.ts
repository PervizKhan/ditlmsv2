import { UserRepository } from '../repositories/user.repository';
import { CourseRepository } from '../repositories/course.repository';
import { Result, ok, err } from '../core/result';
import { User, Course } from '../core/types';

export const StudentService = {
  async getStudentProfile(studentId: string): Promise<Result<any>> {
    const student = await UserRepository.findById(studentId);
    if (!student) return err('Student not found');
    if (student.role !== 'student') return err('User is not a student');

    return ok({
      id: student._id,
      name: student.name,
      email: student.email,
      studentId: student.studentId || '',
      fatherName: student.fatherName || '',
      program: student.program || '',
      parentEmail: student.parentEmail || '',
      phone: student.phone || '',
      address: student.address || '',
      enrollmentYear: student.enrollmentYear,
      cgpa: student.cgpa || 0,
      totalCredits: student.totalCredits || 0,
    });
  },

  async getAllStudents(): Promise<Result<any[]>> {
    const users = await UserRepository.getAll();
    const students = users.filter(user => user.role === 'student');
    
    return ok(students.map(student => ({
      id: student._id,
      name: student.name,
      email: student.email,
      studentId: student.studentId || '',
      fatherName: student.fatherName || '',
      program: student.program || '',
      parentEmail: student.parentEmail || '',
      phone: student.phone || '',
      address: student.address || '',
      enrollmentYear: student.enrollmentYear,
      cgpa: student.cgpa || 0,
      totalCredits: student.totalCredits || 0,
    })));
  },

  async getStudentTranscript(studentId: string): Promise<Result<any>> {
    const enrollment = await CourseRepository.getEnrollmentByStudentId(studentId);
    if (!enrollment) return err('No transcript found for this student');

    // Group courses by semester
    const transcript: { [key: string]: { semester: string; semesterCode: string; courses: Course[]; year: number } } = {};
    
    enrollment.courses.forEach(course => {
      const key = `${course.year}-${course.semesterCode}`;
      if (!transcript[key]) {
        transcript[key] = {
          semester: course.semester,
          semesterCode: course.semesterCode,
          year: course.year,
          courses: []
        };
      }
      transcript[key].courses.push(course);
    });

    // Calculate CGPA
    let totalPoints = 0;
    let totalCredits = 0;
    enrollment.courses.forEach(course => {
      totalPoints += course.gp * course.credits;
      totalCredits += course.credits;
    });
    const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    return ok({
      transcript: Object.values(transcript).sort((a, b) => a.year - b.year),
      cgpa: cgpa.toFixed(2),
      totalCredits,
      totalCourses: enrollment.courses.length,
      status: enrollment.status,
      currentSemester: enrollment.currentSemester,
      academicYear: enrollment.academicYear,
    });
  },

  async updateStudentAcademicInfo(studentId: string, data: Partial<any>): Promise<Result<string>> {
    await UserRepository.updateAcademicInfo(studentId, data);
    return ok('Academic info updated successfully');
  },
};