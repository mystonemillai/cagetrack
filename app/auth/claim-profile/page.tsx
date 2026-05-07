'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function ClaimProfilePage() {
  const [step, setStep] = useState<'code' | 'signup'>('code');
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState('');

  const supabase = createClient();

  async function handleCheckCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Look up the invite code in parent_links
    const { data, error: lookupError } = await supabase
      .from('parent_links')
      .select('player_id, link_code')
      .eq('link_code', inviteCode.trim().toUpperCase())
      .eq('status', 'pending')
      .single();
    if (lookupError || !data) {
      setError('Invalid or expired invite code. Check with your parent and try again.');
      setLoading(false);
      return;
    }
    const { data: playerData } = await supabase
      .from('players')
      .select('first_name, last_name, owner_user_id')
      .eq('id', data.player_id)
      .single();
    const pName = playerData ? `${playerData.first_name} ${playerData.last_name}` : 'Your Player';
    setPlayerName(pName);
    setName(pName);
    if (playerData) {
      const { data: parentProfile } = await supabase.from('profiles').select('email').eq('id', playerData.owner_user_id || '').single();
      if (parentProfile?.email) {
        const [localPart, domain] = parentProfile.email.split('@');
        const playerFirst = playerData.first_name?.toLowerCase() || 'player';
        setEmail(`${localPart}+${playerFirst}@${domain}`);
      }
    }
    setStep('signup');
    setLoading(false);
  }

  async function handleClaimProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'player' },
        emailRedirectTo: `${window.location.origin}/auth/claim-callback?code=${inviteCode.trim().toUpperCase()}`,
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
          <h1 className="font-display text-4xl mb-4 text-wheat">Almost There!</h1>
          <p className="text-offwhite/60 mb-2">
            Check <strong className="text-offwhite">{email}</strong> for a confirmation link.
          </p>
          <p className="text-offwhite/40 text-sm">
            Once confirmed, your profile will be ready to go.
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

        {step === 'code' ? (
          <>
            <h1 className="font-display text-4xl text-center mb-2">Claim Your Profile</h1>
            <p className="text-offwhite/50 text-center mb-8">
              Enter the code your parent shared with you.
            </p>

            <form onSubmit={handleCheckCode} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                  className="w-full p-4 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors text-center font-display text-2xl tracking-[0.3em] uppercase"
                  placeholder="CT-XXXX"
                  maxLength={10}
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
                {loading ? 'Checking...' : 'Find My Profile'}
              </button>
            </form>

            <p className="text-center text-offwhite/30 text-sm mt-6">
              Don&apos;t have a code?{' '}
              <Link href="/auth/signup" className="text-wheat hover:underline">
                Sign up directly
              </Link>
            </p>
          </>
        ) : (
          <>
            <button
              onClick={() => { setStep('code'); setError(''); }}
              className="text-offwhite/40 hover:text-offwhite text-sm mb-6 flex items-center gap-1"
            >
              ← Back
            </button>

            <div className="text-center mb-8">
              <div className="inline-block px-4 py-2 rounded-full bg-wheat/10 border border-wheat/20 text-wheat text-sm font-semibold mb-4">
                Profile found!
              </div>
              <h1 className="font-display text-4xl mb-2">Claim Your Profile</h1>
              <p className="text-offwhite/50">
                Create your account to take over <strong className="text-offwhite">{playerName}&apos;s</strong> profile.
              </p>
            </div>

            <form onSubmit={handleClaimProfile} className="space-y-4">
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
                  placeholder="Your name"
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
                {loading ? 'Setting Up...' : 'Claim Your Profile'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
