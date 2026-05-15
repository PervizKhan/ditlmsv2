import { UserRepository } from '../repositories/user.repository';
import { StudentService } from './student.service';
import { Result, ok, err } from '../core/result';
import { User, UserRole } from '../core/types';

export interface AdminContext {
  userId: string;
  role: UserRole;
}

const isAdmin = (ctx: AdminContext): boolean => {
  return ctx.role === 'admin';
};

export const AdminService = {
  async getAllUsers(ctx: AdminContext): Promise<Result<User[]>> {
    if (!isAdmin(ctx)) return err('Unauthorized');

    // Use StudentService to get complete student data
    const studentsResult = await StudentService.getAllStudents();
    if (!studentsResult.success) {
      return err(studentsResult.error);
    }

    // Also get admins separately if needed
    const users = await UserRepository.getAll();
    const admins = users.filter(user => user.role === 'admin').map(admin => ({
      _id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isVerified: admin.isVerified,
      studentId: '',
      program: '',
      fatherName: '',
      parentEmail: '',
      phone: '',
      cnic: '',
      address: '',
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    }));

    // Combine students and admins
    const allUsers = [...studentsResult.data, ...admins];
    return ok(allUsers as any);
  },

  async getUserByEmail(ctx: AdminContext, email: string): Promise<Result<User>> {
    if (!isAdmin(ctx)) return err('Unauthorized');

    const user = await UserRepository.findByEmail(email);
    if (!user) return err('User not found');

    return ok({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      studentId: user.studentId || '',
      program: user.program || '',
      fatherName: user.fatherName || '',
      parentEmail: user.parentEmail || '',
      phone: user.phone || '',
      cnic: user.cnic || '',
      address: user.address || '',
      enrollmentYear: user.enrollmentYear,
      cgpa: user.cgpa,
      totalCredits: user.totalCredits,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  },

  async changeUserRole(ctx: AdminContext, email: string, role: UserRole): Promise<Result<string>> {
    if (!isAdmin(ctx)) return err('Unauthorized');

    const user = await UserRepository.findByEmail(email);
    if (!user) return err('User not found');

    await UserRepository.updateRole(email, role);

    return ok('User role updated');
  },

  async deleteUser(ctx: AdminContext, email: string): Promise<Result<string>> {
    if (!isAdmin(ctx)) return err('Unauthorized');

    const user = await UserRepository.findByEmail(email);
    if (!user) return err('User not found');

    await UserRepository.deleteByEmail(email);

    return ok('User deleted successfully');
  },
};