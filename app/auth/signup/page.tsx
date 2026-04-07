'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function SignupPage() {
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<'player' | 'family' | 'coach'>('player');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) localStorage.setItem('coach_ref', ref);
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-texture">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 rounded-xl border-2 border-wheat flex items-center justify-center mx-auto mb-6 text-wheat font-display text-xl -rotate-3">CT</div>
          <h1 className="font-display text-4xl mb-4 text-wheat">Check Your Email</h1>
          <p className="text-offwhite/60 mb-2">We sent a confirmation link to <strong className="text-offwhite">{email}</strong></p>
          <p className="text-offwhite/40 text-sm mb-6">Click the link in your email to activate your account.</p>
          <Link href="/auth/login" className="text-xs text-wheat hover:underline">Or log in if you already confirmed →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-texture">
      <div className="max-w-md w-full">
        <Link href="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-sm -rotate-3">CT</div>
          <span className="font-display text-2xl tracking-wider">CAGETRACK</span>
        </Link>

        {step === 'role' ? (
          <div className="animate-fade-in">
            <h1 className="font-display text-4xl sm:text-5xl text-center mb-2">Get Started</h1>
            <p className="text-offwhite/50 text-center mb-8">Which best describes you?</p>

            <div className="space-y-3">
              <button
                onClick={() => { setRole('player'); setStep('details'); }}
                className="w-full p-6 rounded-xl bg-navy-light border border-wheat/10 hover:border-wheat/30 transition-all text-left group card-hover"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-wheat/10 flex items-center justify-center text-2xl flex-shrink-0">⚾</div>
                  <div>
                    <div className="font-display text-xl tracking-wide mb-0.5 group-hover:text-wheat transition-colors">I&apos;m a Player</div>
                    <div className="text-sm text-offwhite/40">Track your progress and own your development story.</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { setRole('family'); setStep('details'); }}
                className="w-full p-6 rounded-xl bg-navy-light border border-wheat/10 hover:border-wheat/30 transition-all text-left group card-hover"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-wheat/10 flex items-center justify-center text-2xl flex-shrink-0">👨‍👩‍👦</div>
                  <div>
                    <div className="font-display text-xl tracking-wide mb-0.5 group-hover:text-wheat transition-colors">I&apos;m a Parent</div>
                    <div className="text-sm text-offwhite/40">Set up and manage your player&apos;s development profile.</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { setRole('coach'); setStep('details'); }}
                className="w-full p-6 rounded-xl bg-navy-light border border-wheat/10 hover:border-wheat/30 transition-all text-left group card-hover"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-wheat/10 flex items-center justify-center text-2xl flex-shrink-0">🧢</div>
                  <div>
                    <div className="font-display text-xl tracking-wide mb-0.5 group-hover:text-wheat transition-colors">I&apos;m a Coach</div>
                    <div className="text-sm text-offwhite/40">Build your profile and connect with players. Always free.</div>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-center text-offwhite/30 text-sm mt-8">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-wheat hover:underline">Log in</Link>
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <button onClick={() => setStep('role')} className="text-offwhite/40 hover:text-offwhite text-sm mb-6 flex items-center gap-1">← Back</button>

            <h1 className="font-display text-4xl sm:text-5xl text-center mb-2">
              {role === 'player' ? 'Create Your Profile' : role === 'family' ? 'Set Up Your Player' : 'Join as a Coach'}
            </h1>
            <p className="text-offwhite/50 text-center mb-8">
              {role === 'player' ? 'Own your development story.' : role === 'family' ? "You'll create your player's profile next." : 'Free forever. Build your coaching profile.'}
            </p>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Your Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-4 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors text-base" placeholder={role === 'coach' ? 'Coach name' : role === 'player' ? 'Your name' : 'Parent name'} />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-4 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors text-base" placeholder="your@email.com" />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full p-4 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors text-base" placeholder="6+ characters" />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
              )}

              <button type="submit" disabled={loading} className="w-full p-4 bg-wheat text-navy font-display text-lg tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-offwhite/30 text-sm mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-wheat hover:underline">Log in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
