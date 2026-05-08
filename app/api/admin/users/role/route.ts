// app/api/admin/users/role/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/admin.service';
import { verifyToken } from '@/lib/utils/jwt';
import { cookies } from 'next/headers';

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role required' }, { status: 400 });
    }

    if (role !== 'student' && role !== 'admin') {
      return NextResponse.json({ error: 'Invalid role. Must be student or admin' }, { status: 400 });
    }

    const result = await AdminService.changeUserRole(
      { userId: payload.userId, role: payload.role },
      email,
      role
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: result.data });
    
  } catch (error) {
    console.error('Admin role update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}