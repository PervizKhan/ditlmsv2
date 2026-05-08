// lib/services/admin.service.ts

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

export const AdminService = {
  async getAllUsers(ctx: AdminContext): Promise<Result<User[]>> {
    if (!isAdmin(ctx)) return err('Unauthorized');

    const users = await UserRepository.getAll();
    return ok(users.map((u) => mapUser(u)));
  },

  async getUserByEmail(
    ctx: AdminContext,
    email: string
  ): Promise<Result<User>> {
    if (!isAdmin(ctx)) return err('Unauthorized');

    const user = await UserRepository.findByEmail(email);
    if (!user) return err('User not found');

    return ok(mapUser(user));
  },

  async changeUserRole(
    ctx: AdminContext,
    email: string,
    role: UserRole
  ): Promise<Result<string>> {
    if (!isAdmin(ctx)) return err('Unauthorized');

    const user = await UserRepository.findByEmail(email);
    if (!user) return err('User not found');

    await UserRepository.updateRole(email, role);

    return ok('User role updated');
  },

  async deleteUser(
    ctx: AdminContext,
    email: string
  ): Promise<Result<string>> {
    if (!isAdmin(ctx)) return err('Unauthorized');

    const user = await UserRepository.findByEmail(email);
    if (!user) return err('User not found');

    await UserRepository.deleteByEmail(email);

    return ok('User deleted successfully');
  },
};

/**
 * Prevent leaking sensitive fields
 */
const mapUser = (user: any): User => {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    password: '', // never expose
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};