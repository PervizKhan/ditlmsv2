'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { logoutAction } from '@/lib/actions/auth.actions';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'student' | 'admin'>('student');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const getRole = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (!data.user) {
          router.push('/login');
          return;
        }
        
        setUserRole(data.user.role === 'admin' ? 'admin' : 'student');
        setUserName(data.user.name || 'User');
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    getRole();
  }, [router]);

  const handleLogout = async () => {
    await logoutAction();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 p-3 flex justify-between items-center" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg btn-secondary"
        >
          ☰
        </button>
        <span className="font-bold" style={{ color: 'var(--accent)' }}>OXFORD Portal</span>
        <button onClick={handleLogout} className="btn-secondary text-sm px-3 py-1">
          🚪 Logout
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar 
        userRole={userRole} 
        mobileOpen={mobileMenuOpen} 
        setMobileOpen={setMobileMenuOpen} 
      />

      {/* Main Content */}
      <main className="main-content min-h-screen pt-16 md:pt-0">
        <div className="container mx-auto p-4 md:p-6">
          {/* Desktop Header with Yellow Line */}
          <div className="hidden md:block">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                  {userRole === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}
                </h1>
                <p className="text-sm opacity-70">Welcome back, {userName}!</p>
              </div>
              <div className="flex gap-3 items-center">
                <ThemeToggle />
                <button onClick={handleLogout} className="btn-secondary">
                  🚪 Logout
                </button>
              </div>
            </div>
            {/* Yellow Horizontal Line */}
            <div style={{ 
              height: '4px', 
              background: 'linear-gradient(90deg, #d4af37, #f3920a, #137e0a, #d4af37)',
              marginBottom: '20px',
              width: '100%'
            }} />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}