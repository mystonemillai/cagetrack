'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-sm -rotate-3">
            CT
          </div>
          <span className="font-display text-2xl tracking-wider">CAGETRACK</span>
        </Link>

        <h1 className="font-display text-4xl text-center mb-2">Welcome Back</h1>
        <p className="text-offwhite/50 text-center mb-8">Log in to your account</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors"
              placeholder="Your password"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-wheat text-navy font-display text-lg tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-offwhite/30 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-wheat hover:underline">
            Sign up
          </Link>
        </p>

        <p className="text-center text-offwhite/30 text-sm mt-2">
          Have an invite code?{' '}
          <Link href="/auth/claim-profile" className="text-wheat hover:underline">
            Claim Your Profile
          </Link>
        </p>
      </div>
    </div>
  );
}
