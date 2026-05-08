// app/page.tsx (Home Page)

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by checking for token
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        setIsLoggedIn(data.authenticated);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>DIT Portal</h1>
          <p className="text-sm opacity-70">Diploma in Information Technology</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-primary">
              Dashboard →
            </Link>
          ) : (
            <Link href="/login" className="btn-primary">
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--text)' }}>
            Welcome to{' '}
            <span style={{ color: 'var(--accent)' }}>DIT Portal</span>
          </h1>
          <p className="text-xl opacity-70 mb-8 max-w-2xl mx-auto">
            Your complete learning management system for Diploma in Information Technology.
            Access courses, track progress, and connect with instructors.
          </p>
          <div className="flex gap-4 justify-center">
            {!isLoggedIn && (
              <>
                <Link href="/register" className="btn-primary px-8 py-3 text-lg">
                  Get Started
                </Link>
                <Link href="/login" className="btn-secondary px-8 py-3 text-lg">
                  Sign In
                </Link>
              </>
            )}
            {isLoggedIn && (
              <Link href="/dashboard" className="btn-primary px-8 py-3 text-lg">
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4" style={{ background: 'var(--surface)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: '📚 Course Materials',
                description: 'Access all course materials, lectures, and resources in one place.'
              },
              {
                title: '📝 Assignments',
                description: 'Submit assignments online and track your grades.'
              },
              {
                title: '👨‍🏫 Instructor Support',
                description: 'Get help from instructors and connect with fellow students.'
              }
            ].map((feature, i) => (
              <div key={i} className="card text-center">
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="opacity-70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { number: '500+', label: 'Students' },
              { number: '30+', label: 'Courses' },
              { number: '15+', label: 'Instructors' },
              { number: '95%', label: 'Success Rate' }
            ].map((stat, i) => (
              <div key={i} className="card">
                <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{stat.number}</p>
                <p className="opacity-70 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-16 px-4 text-center" style={{ background: 'var(--surface)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-lg opacity-70 mb-8">
              Join hundreds of students in the Diploma in Information Technology program.
            </p>
            <Link href="/register" className="btn-primary px-8 py-3 text-lg inline-block">
              Register Now
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 text-center opacity-60 text-sm" style={{ borderTop: '1px solid var(--border)' }}>
        <p>&copy; {new Date().getFullYear()} DIT Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}