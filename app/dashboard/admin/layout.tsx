// app/dashboard/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (!data.authenticated || data.user?.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Admin Navigation Tabs - NO header, NO logout, NO theme toggle here */}
      {/* <div className="mb-6 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-2 md:gap-4 overflow-x-auto">
          <Link
            href="/dashboard/admin"
            className={`px-3 py-2 text-sm md:text-base rounded-t-lg transition whitespace-nowrap ${
              pathname === '/dashboard/admin'
                ? 'text-accent border-b-2 border-accent font-medium'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            👥 User Management
          </Link>
          <Link
            href="/dashboard/admin/transcript"
            className={`px-3 py-2 text-sm md:text-base rounded-t-lg transition whitespace-nowrap ${
              pathname === '/dashboard/admin/transcript'
                ? 'text-accent border-b-2 border-accent font-medium'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            📚 Manage Transcripts
          </Link>
          <Link
            href="/dashboard/admin/profile"
            className={`px-3 py-2 text-sm md:text-base rounded-t-lg transition whitespace-nowrap ${
              pathname === '/dashboard/admin/profile'
                ? 'text-accent border-b-2 border-accent font-medium'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            👤 Student Profiles
          </Link>
        </div>
      </div> */}

      {/* Page Content */}
      {children}
    </div>
  );
}