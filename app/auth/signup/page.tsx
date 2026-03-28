'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function SignupPage() {
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<'player' | 'family'>('player');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-xl border-2 border-wheat flex items-center justify-center mx-auto mb-6 text-wheat font-display text-xl -rotate-3">
            CT
          </div>
          <h1 className="font-display text-4xl mb-4 text-wheat">Check Your Email</h1>
          <p className="text-offwhite/60 mb-2">
            We sent a confirmation link to <strong className="text-offwhite">{email}</strong>
          </p>
          <p className="text-offwhite/40 text-sm">
            Click the link in your email to activate your account.
          </p>
        </div>
      </div>
    );
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

        {step === 'role' ? (
          <>
            <h1 className="font-display text-4xl text-center mb-2">Get Started</h1>
            <p className="text-offwhite/50 text-center mb-8">Which best describes you?</p>

            <div className="space-y-3">
              <button
                onClick={() => { setRole('player'); setStep('details'); }}
                className="w-full p-5 rounded-xl bg-navy-light border border-wheat/10 hover:border-wheat/30 transition-all text-left group"
              >
                <div className="font-display text-xl tracking-wide mb-1 group-hover:text-wheat transition-colors">
                  I&apos;m a Player
                </div>
                <div className="text-sm text-offwhite/40">
                  Create your own development profile. Track your progress.
                </div>
              </button>

              <button
                onClick={() => { setRole('family'); setStep('details'); }}
                className="w-full p-5 rounded-xl bg-navy-light border border-wheat/10 hover:border-wheat/30 transition-all text-left group"
              >
                <div className="font-display text-xl tracking-wide mb-1 group-hover:text-wheat transition-colors">
                  I&apos;m a Parent
                </div>
                <div className="text-sm text-offwhite/40">
                  Set up a profile for your player. Manage their development.
                </div>
              </button>

              <button
                onClick={() => { window.location.href = '/auth/login'; }}
                className="w-full p-5 rounded-xl bg-navy-light border border-wheat/10 hover:border-wheat/30 transition-all text-left group"
              >
                <div className="font-display text-xl tracking-wide mb-1 group-hover:text-wheat transition-colors">
                  I&apos;m a Coach
                </div>
                <div className="text-sm text-offwhite/40">
                  Have an invite code? Sign up and connect to your player.
                </div>
              </button>
            </div>

            <p className="text-center text-offwhite/30 text-sm mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-wheat hover:underline">
                Log in
              </Link>
            </p>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep('role')}
              className="text-offwhite/40 hover:text-offwhite text-sm mb-6 flex items-center gap-1"
            >
              ← Back
            </button>

            <h1 className="font-display text-4xl text-center mb-2">
              {role === 'player' ? 'Create Your Profile' : 'Set Up Your Player'}
            </h1>
            <p className="text-offwhite/50 text-center mb-8">
              {role === 'player'
                ? 'Own your development story.'
                : "You'll create your player's profile next."}
            </p>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors"
                  placeholder={role === 'player' ? 'Your name' : 'Parent name'}
                />
              </div>

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
                  minLength={6}
                  className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors"
                  placeholder="6+ characters"
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-offwhite/30 text-sm mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-wheat hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
