import { UserRepository } from '../repositories/user.repository';
import { Result, ok, err } from '../core/result';
import { User, UserRole } from '../core/types';

export interface AdminContext {
  userId: string;
  role: UserRole;
}

const isAdmin = (ctx: AdminContext): boolean => {
  return ctx.role === 'admin';
};

// Create a safe user type without password
export type SafeUser = Omit<User, 'password'>;

export const AdminService = {
  async getAllUsers(ctx: AdminContext): Promise<Result<SafeUser[]>> {
    if (!isAdmin(ctx)) return err('Unauthorized');

    const users = await UserRepository.getAll();
    
    // Return users without password field
    const safeUsers: SafeUser[] = users.map(user => ({
      _id: user._id.toString(),
      id: user._id.toString(),
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
      profilePicture: user.profilePicture || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || 'male',
      enrollmentYear: user.enrollmentYear,
      cgpa: user.cgpa || 0,
      totalCredits: user.totalCredits || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
    
    return ok(safeUsers);
  },

  async getUserByEmail(ctx: AdminContext, email: string): Promise<Result<SafeUser>> {
    if (!isAdmin(ctx)) return err('Unauthorized');

    const user = await UserRepository.findByEmail(email);
    if (!user) return err('User not found');

    return ok({
      _id: user._id.toString(),
      id: user._id.toString(),
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
      profilePicture: user.profilePicture || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || 'male',
      enrollmentYear: user.enrollmentYear,
      cgpa: user.cgpa || 0,
      totalCredits: user.totalCredits || 0,
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