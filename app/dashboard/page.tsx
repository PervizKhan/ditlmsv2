// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({
    cgpa: '3.65',
    credits: 72,
    courses: 24
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
          {greeting}! 👋
        </h1>
        <p className="text-sm opacity-70 mt-1">Welcome to your student dashboard</p>
      </div>

      {/* Stats Cards - Mobile optimized */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <h3>📊 CGPA</h3>
          <p>{stats.cgpa} / 4.00</p>
        </div>
        <div className="stat-card">
          <h3>📚 Credits</h3>
          <p>{stats.credits}</p>
        </div>
        <div className="stat-card">
          <h3>📖 Courses</h3>
          <p>{stats.courses}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/dashboard/transcript" className="card text-center hover:opacity-80">
          <div className="text-2xl mb-1">📜</div>
          <div className="text-sm font-medium">Transcript</div>
        </Link>
        <Link href="/dashboard/profile" className="card text-center hover:opacity-80">
          <div className="text-2xl mb-1">👤</div>
          <div className="text-sm font-medium">Profile</div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="font-semibold mb-3">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--bg)' }}>
            <div className="text-xl">📝</div>
            <div>
              <p className="text-sm font-medium">Assignment Submitted</p>
              <p className="text-xs opacity-60">Web Development - 2 days ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--bg)' }}>
            <div className="text-xl">✅</div>
            <div>
              <p className="text-sm font-medium">Quiz Completed</p>
              <p className="text-xs opacity-60">Database Systems - 5 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}