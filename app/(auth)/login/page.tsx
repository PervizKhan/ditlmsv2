// app/(auth)/login/page.tsx - Add this at the top
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAction } from '@/lib/actions/auth.actions';
import { ThemeToggle } from '@/components/theme-toggle';
import { logoutAction } from '@/lib/actions/auth.actions';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (data.authenticated) {
        setIsLoggedIn(true);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    setIsLoggedIn(false);
    router.refresh();
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await loginAction(formData);
      
      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }
      
      window.location.href = result.redirectTo || '/dashboard';
      
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  }

  if (isLoggedIn) {
    return (
      <div className="auth-container">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="auth-card text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="auth-title">Already Logged In</h1>
          <p className="auth-subtitle">You are already logged into the portal</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push('/dashboard')} className="btn-primary w-full">
              Go to Dashboard
            </button>
            <button onClick={handleLogout} className="btn-secondary w-full">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm opacity-70">
          Don't have an account?{' '}
          <Link href="/register" className="text-accent hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}