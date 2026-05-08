// app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerAction } from '@/lib/actions/auth.actions';
import { ThemeToggle } from '@/components/theme-toggle';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (!name || (name as string).trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters)');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if ((password as string).length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await registerAction(formData);

    if (!result.success) {
      setError(result.message);
      setLoading(false);
    } else {
      setSuccess(result.message);
      setTimeout(() => {
        router.push('/verify?email=' + encodeURIComponent(email as string));
      }, 2000);
    }
  }

  return (
    <div className="auth-container">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="auth-card" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the DIT Student Portal</p>

        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="input"
              placeholder="e.g., John Doe"
              autoComplete="name"
            />
          </div>

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
              autoComplete="email"
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
              autoComplete="new-password"
            />
            <p className="text-xs opacity-60 mt-1">Minimum 6 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              className="input"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm opacity-70">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}