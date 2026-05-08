// components/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  userRole: 'student' | 'admin';
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ userRole, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null && isDesktop) {
      setIsCollapsed(saved === 'true');
    }
  }, [isDesktop]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  const navItems = {
    student: [
      { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { href: '/dashboard/transcript', icon: '📚', label: 'Transcript' },
      { href: '/dashboard/profile', icon: '👤', label: 'Profile' },
    ],
    admin: [
      { href: '/dashboard/admin', icon: '👥', label: 'Users' },
      { href: '/dashboard/admin/transcript', icon: '📚', label: 'Transcripts' },
      { href: '/dashboard/admin/profile', icon: '👤', label: 'Student Profiles' },
    ],
  };

  const items = navItems[userRole];
  const sidebarWidth = isCollapsed && isDesktop ? 'w-20' : 'w-64';

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full ${sidebarWidth} z-50 transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Header with Collapse Button */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          {(!isCollapsed || !isDesktop) && (
            <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
              DIT Portal
            </span>
          )}
          {isCollapsed && isDesktop && (
            <span className="text-xl font-bold mx-auto" style={{ color: 'var(--accent)' }}>
              DP
            </span>
          )}
          {/* Collapse Button - Only on desktop */}
          {isDesktop && (
            <button
              onClick={toggleCollapse}
              className="p-1 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? '→' : '←'}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition ${
                      isActive
                        ? 'bg-accent text-primary font-medium'
                        : 'hover:bg-opacity-10 hover:bg-gray-500'
                    }`}
                    style={isActive ? { background: 'var(--accent)', color: '#0b1f3a' } : {}}
                    title={isCollapsed && isDesktop ? item.label : undefined}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {(!isCollapsed || !isDesktop) && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content margin adjustment for desktop */}
      <style jsx global>{`
        .main-content {
          transition: margin-left 0.3s ease;
          margin-left: ${isDesktop ? (isCollapsed ? '5rem' : '16rem') : '0'};
        }
      `}</style>
    </>
  );
}