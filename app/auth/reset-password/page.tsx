'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push('/dashboard'), 2000);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-texture">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 rounded-xl border-2 border-wheat flex items-center justify-center mx-auto mb-6 text-wheat font-display text-xl -rotate-3">CT</div>
          <h1 className="font-display text-4xl mb-4 text-wheat">Password Updated!</h1>
          <p className="text-offwhite/60">Redirecting to your dashboard...</p>
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

        <h1 className="font-display text-4xl sm:text-5xl text-center mb-2">New Password</h1>
        <p className="text-offwhite/50 text-center mb-8">Enter your new password below.</p>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">New Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full p-4 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors text-base" placeholder="6+ characters" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="w-full p-4 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors text-base" placeholder="Confirm your password" />
          </div>

          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          <button type="submit" disabled={loading} className="w-full p-4 bg-wheat text-navy font-display text-lg tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
