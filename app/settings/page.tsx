'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function generateCode(prefix: string) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = prefix;
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [parentLinks, setParentLinks] = useState<any[]>([]);
  const [coachConnections, setCoachConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');

  // Code generation
  const [parentCode, setParentCode] = useState('');
  const [coachCode, setCoachCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');

  // Parent link code entry (for parent role)
  const [linkCode, setLinkCode] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);

      const { data: pl } = await supabase.from('players').select('*').eq('owner_user_id', user.id);
      setPlayers(pl || []);
      if (pl && pl.length > 0) setSelectedPlayer(pl[0].id);

      setLoading(false);
    }
    loadData();
  }, []);

  async function handleGenerateParentCode() {
    if (!selectedPlayer) return;
    setCodeError('');
    setCodeSuccess('');
    setCodeLoading(true);

    const code = generateCode('PL-');

    const { error } = await supabase.from('parent_links').insert({
      player_id: selectedPlayer,
      parent_user_id: null,
      access_level: 'view_only',
      status: 'pending',
      link_code: code,
    });

    if (error) {
      setCodeError(error.message);
      setCodeLoading(false);
      return;
    }

    setParentCode(code);
    setCodeSuccess('');
    setCodeLoading(false);
  }

  async function handleGenerateCoachCode() {
    if (!selectedPlayer) return;
    setCodeError('');
    setCodeSuccess('');
    setCodeLoading(true);

    const code = generateCode('CT-');

    const { error } = await supabase.from('player_coaches').insert({
      player_id: selectedPlayer,
      coach_profile_id: null,
      invite_code: code,
      status: 'pending',
    });

    if (error) {
      // coach_profile_id can't be null with current schema, let's use a placeholder approach
      setCodeError('Could not generate code. Please try again.');
      setCodeLoading(false);
      return;
    }

    setCoachCode(code);
    setCodeSuccess('Share this code with your coach. They enter it on their dashboard.');
    setCodeLoading(false);
  }

  async function handleLinkToPlayer(e: React.FormEvent) {
    e.preventDefault();
    setLinkError('');
    setLinkSuccess('');
    setLinkLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Look up the parent link code
const { error: updateError } = await supabase
      .from('parent_links')
      .update({
        parent_user_id: user.id,
        status: 'active',
      })
      .eq('link_code', linkCode.trim().toUpperCase())
      .eq('status', 'pending');

    if (updateError) {
      setLinkError(updateError.message);
      setLinkLoading(false);
      return;
    }

    setLinkLoading(false);
    window.location.href = '/dashboard';

    // Update the parent link with this user's ID and activate it
    const { error: updateError } = await supabase
      .from('parent_links')
      .update({
        parent_user_id: null,
        status: 'active',
      })
      .eq('id', data.id);

    if (updateError) {
      setLinkError(updateError.message);
      setLinkLoading(false);
      return;
    }

    setLinkSuccess(`Linked to ${data.players.first_name} ${data.players.last_name}!`);
    setLinkCode('');
    setLinkLoading(false);
    setTimeout(() => window.location.href = '/dashboard', 1500);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-wheat font-display text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  const isPlayer = profile?.role === 'player';
  const isFamily = profile?.role === 'family';
  const isCoach = profile?.role === 'coach';

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 px-4 py-3 bg-navy/90 backdrop-blur-xl border-b border-wheat/8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-xs -rotate-3">CT</div>
            <span className="font-display text-lg tracking-wider">CAGETRACK</span>
          </Link>
          <Link href="/dashboard" className="text-xs text-offwhite/40 hover:text-wheat transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <main className="pt-20 pb-24 px-4 max-w-2xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-8">Settings</h1>

        <div className="space-y-4">
          {/* Account Info */}
          <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
            <h2 className="font-display text-lg text-wheat mb-3">Account</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-offwhite/40">Name</span>
                <span>{profile?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-offwhite/40">Email</span>
                <span>{profile?.email || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-offwhite/40">Role</span>
                <span className="capitalize">{profile?.role || '—'}</span>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
            <h2 className="font-display text-lg text-wheat mb-3">Subscription</h2>
            <p className="text-sm text-offwhite/40 mb-4">No active subscription. You&apos;re on the free beta.</p>
            <button className="px-4 py-2 bg-wheat text-navy text-xs font-display tracking-wider rounded-lg hover:bg-wheat/90 transition-colors">
              Upgrade — $20/mo
            </button>
          </div>

          {/* Link Parent (for players) */}
          {(isPlayer || isFamily) && players.length > 0 && (
            <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
              <h2 className="font-display text-lg text-wheat mb-1">Link a Parent</h2>
              <p className="text-xs text-offwhite/40 mb-4">Generate a code to share with your parent so they can follow your progress.</p>

              {players.length > 1 && (
                <div className="mb-3">
                  <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Select Player</label>
                  <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="w-full p-2 bg-navy border border-wheat/15 rounded-lg text-offwhite text-sm outline-none"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                    ))}
                  </select>
                </div>
              )}

              {parentCode ? (
                <div className="text-center p-4 bg-navy rounded-lg border border-wheat/15">
                  <p className="text-xs text-offwhite/40 mb-2">Share this code with your parent:</p>
                  <div className="font-display text-3xl tracking-[0.3em] text-wheat">{parentCode}</div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(parentCode); }}
                    className="mt-2 text-xs text-offwhite/30 hover:text-wheat transition-colors"
                  >
                    Copy to clipboard
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerateParentCode}
                  disabled={codeLoading}
                  className="px-4 py-2 bg-wheat/10 border border-wheat/20 text-wheat text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-wheat/20 transition-colors disabled:opacity-50"
                >
                  {codeLoading ? 'Generating...' : 'Generate Parent Code'}
                </button>
              )}
            </div>
          )}

          {/* Link to Existing Player (for parents) */}
          {isFamily && (
            <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
              <h2 className="font-display text-lg text-wheat mb-1">Link to Existing Player</h2>
              <p className="text-xs text-offwhite/40 mb-4">If your player already has an account, enter the code they shared with you.</p>

              <form onSubmit={handleLinkToPlayer} className="flex gap-2">
                <input
                  type="text"
                  value={linkCode}
                  onChange={(e) => setLinkCode(e.target.value)}
                  className="flex-1 p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors font-display tracking-widest uppercase text-center"
                  placeholder="PL-XXXXX"
                  maxLength={10}
                />
                <button
                  type="submit"
                  disabled={linkLoading || !linkCode}
                  className="px-5 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50"
                >
                  {linkLoading ? '...' : 'Link'}
                </button>
              </form>
              {linkError && <p className="text-red-400 text-xs mt-2">{linkError}</p>}
              {linkSuccess && <p className="text-green-400 text-xs mt-2">{linkSuccess}</p>}
            </div>
          )}

          {/* Invite Coach (for players and families) */}
          {(isPlayer || isFamily) && players.length > 0 && (
            <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
              <h2 className="font-display text-lg text-wheat mb-1">Invite a Coach</h2>
              <p className="text-xs text-offwhite/40 mb-4">Generate a code to share with your coach so they can connect to your profile.</p>

              {coachCode ? (
                <div className="text-center p-4 bg-navy rounded-lg border border-wheat/15">
                  <p className="text-xs text-offwhite/40 mb-2">Share this code with your coach:</p>
                  <div className="font-display text-3xl tracking-[0.3em] text-wheat">{coachCode}</div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(coachCode); }}
                    className="mt-2 text-xs text-offwhite/30 hover:text-wheat transition-colors"
                  >
                    Copy to clipboard
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerateCoachCode}
                  disabled={codeLoading}
                  className="px-4 py-2 bg-wheat/10 border border-wheat/20 text-wheat text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-wheat/20 transition-colors disabled:opacity-50"
                >
                  {codeLoading ? 'Generating...' : 'Generate Coach Invite Code'}
                </button>
              )}

              {codeError && <p className="text-red-400 text-xs mt-2">{codeError}</p>}
              {codeSuccess && <p className="text-green-400 text-xs mt-2">{codeSuccess}</p>}
            </div>
          )}

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full p-4 rounded-xl border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all text-sm"
          >
            Sign Out
          </button>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full z-50 bg-navy/95 backdrop-blur-xl border-t border-wheat/8 sm:hidden">
        <div className="flex justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <span className="text-lg">🏠</span><span className="text-[10px] text-offwhite/30">Home</span>
          </Link>
          <Link href="/drills" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <span className="text-lg">📋</span><span className="text-[10px] text-offwhite/30">Drills</span>
          </Link>
          <Link href="/coaches" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <span className="text-lg">🧢</span><span className="text-[10px] text-offwhite/30">Coaches</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <span className="text-lg">⚙️</span><span className="text-[10px] text-wheat">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
