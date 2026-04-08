'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-texture">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 rounded-xl border-2 border-wheat flex items-center justify-center mx-auto mb-6 text-wheat font-display text-xl -rotate-3">CT</div>
          <h1 className="font-display text-4xl mb-4 text-wheat">Check Your Email</h1>
          <p className="text-offwhite/60 mb-2">We sent a password reset link to <strong className="text-offwhite">{email}</strong></p>
          <p className="text-offwhite/40 text-sm mb-6">Click the link in your email to set a new password.</p>
          <Link href="/auth/login" className="text-xs text-wheat hover:underline">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-texture">
      <div className="max-w-md w-full animate-fade-in">
        <Link href="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-sm -rotate-3">CT</div>
          <span className="font-display text-2xl tracking-wider">CAGETRACK</span>
        </Link>

        <h1 className="font-display text-4xl sm:text-5xl text-center mb-2">Reset Password</h1>
        <p className="text-offwhite/50 text-center mb-8">Enter your email and we&apos;ll send you a reset link.</p>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-4 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors text-base" placeholder="your@email.com" />
          </div>

          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          <button type="submit" disabled={loading} className="w-full p-4 bg-wheat text-navy font-display text-lg tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-offwhite/30 text-sm mt-8">
          Remember your password? <Link href="/auth/login" className="text-wheat hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
