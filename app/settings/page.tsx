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
  const [coachProfile, setCoachProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');

  const [parentCode, setParentCode] = useState('');
  const [coachCode, setCoachCode] = useState('');
  const [playerCode, setPlayerCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');

  const [linkCode, setLinkCode] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);

      // Load owned players
      const { data: pl } = await supabase.from('players').select('*').eq('owner_user_id', user.id);

      // Also load linked players for parents
      const { data: linked } = await supabase.from('parent_links').select('player_id').eq('parent_user_id', user.id).eq('status', 'active');
      let allPlayers = pl || [];
      if (linked && linked.length > 0) {
        const linkedIds = linked.map((lp: any) => lp.player_id);
        const { data: lp } = await supabase.from('players').select('*').in('id', linkedIds);
        if (lp) allPlayers = [...allPlayers, ...lp];
      }
      setPlayers(allPlayers);
      if (allPlayers.length > 0) setSelectedPlayer(allPlayers[0].id);

      // Load coach profile if coach
      if (p?.role === 'coach') {
        const { data: cp } = await supabase.from('coach_profiles').select('*').eq('user_id', user.id).single();
        setCoachProfile(cp);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  async function handleGenerateParentCode() {
    if (!selectedPlayer) return;
    setCodeError('');
    setCodeLoading(true);
    const code = generateCode('PL-');
    const { error } = await supabase.from('parent_links').insert({
      player_id: selectedPlayer, parent_user_id: null,
      access_level: 'view_only', status: 'pending', link_code: code,
    });
    if (error) { setCodeError(error.message); setCodeLoading(false); return; }
    setParentCode(code);
    setCodeLoading(false);
  }

  async function handleGenerateCoachCode() {
    if (!selectedPlayer) return;
    setCodeError('');
    setCodeLoading(true);
    const code = generateCode('CT-');
    const { error } = await supabase.from('player_coaches').insert({
      player_id: selectedPlayer, coach_profile_id: null,
      invite_code: code, status: 'pending',
    });
    if (error) { setCodeError(error.message); setCodeLoading(false); return; }
    setCoachCode(code);
    setCodeLoading(false);
  }

  // Coach generates a code that a player/parent can enter to connect
  async function handleGeneratePlayerInvite() {
    if (!coachProfile) return;
    setCodeError('');
    setCodeLoading(true);
    const code = generateCode('CT-');
    // Store as a pending connection with no player yet - player will claim it
    const { error } = await supabase.from('player_coaches').insert({
      player_id: null, coach_profile_id: coachProfile.id,
      invite_code: code, status: 'pending_player',
    });
    if (error) { setCodeError(error.message); setCodeLoading(false); return; }
    setPlayerCode(code);
    setCodeLoading(false);
  }

  async function handleLinkToPlayer(e: React.FormEvent) {
    e.preventDefault();
    setLinkError('');
    setLinkLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const trimmedCode = linkCode.trim().toUpperCase();

    // Check if it's a PL- code (parent link)
    if (trimmedCode.startsWith('PL-')) {
      const { error: updateError } = await supabase.from('parent_links').update({
        parent_user_id: user.id, status: 'active',
      }).eq('link_code', trimmedCode).eq('status', 'pending');
      if (updateError) { setLinkError('Invalid or expired code.'); setLinkLoading(false); return; }
      setLinkLoading(false);
      window.location.href = '/dashboard';
      return;
    }

    // Check if it's a CT- code (coach invite to player)
    if (trimmedCode.startsWith('CT-')) {
      // Find the pending coach invite
      const { data: invite } = await supabase.from('player_coaches').select('*').eq('invite_code', trimmedCode).eq('status', 'pending_player').single();

      if (invite) {
        // Coach generated this code - player/parent needs to connect their player
        if (players.length === 0) {
          setLinkError('Create a player profile first, then enter this code.');
          setLinkLoading(false);
          return;
        }
        // Check subscription
        const { data: sub } = await supabase.from('subscriptions').select('id').eq('billing_user_id', user.id).eq('status', 'active').single();
        if (!sub) {
          setLinkError('Upgrade to a paid plan to connect with coaches.');
          setLinkLoading(false);
          return;
        }
        const { error: updateError } = await supabase.from('player_coaches').update({
          player_id: players[0].id, status: 'pending_approval', connected_at: new Date().toISOString(),
        }).eq('id', invite.id);
        if (updateError) { setLinkError(updateError.message); setLinkLoading(false); return; }
        setLinkLoading(false);
        window.location.href = '/dashboard';
        return;
      }

      setLinkError('Invalid or expired code.');
      setLinkLoading(false);
      return;
    }

    setLinkError('Invalid code format. Codes start with PL- or CT-.');
    setLinkLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="text-wheat font-display text-xl animate-pulse">Loading...</div></div>);
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
              <div className="flex justify-between"><span className="text-offwhite/40">Name</span><span>{profile?.name || '—'}</span></div>
              <div className="flex justify-between"><span className="text-offwhite/40">Email</span><span>{profile?.email || '—'}</span></div>
              <div className="flex justify-between"><span className="text-offwhite/40">Role</span><span className="capitalize">{profile?.role || '—'}</span></div>
            </div>
          </div>

          {/* === PLAYER/PARENT CODE SECTIONS === */}

          {/* Invite Parent / Invite Player (for players and parents with players) */}
          {(isPlayer || isFamily) && players.length > 0 && (
            <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
              <h2 className="font-display text-lg text-wheat mb-1">{isPlayer ? 'Invite a Parent' : 'Invite Your Player'}</h2>
              <p className="text-xs text-offwhite/40 mb-4">{isPlayer ? 'Generate a code to share with your parent so they can follow your progress.' : 'Generate a code to share with your player so you can track their development.'}</p>

              {players.length > 1 && (
                <div className="mb-3">
                  <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Select Player</label>
                  <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)} className="w-full p-2 bg-navy border border-wheat/15 rounded-lg text-offwhite text-sm outline-none">
                    {players.map((p) => (<option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>))}
                  </select>
                </div>
              )}

              {parentCode ? (
                <div className="text-center p-4 bg-navy rounded-lg border border-wheat/15">
                  <p className="text-xs text-offwhite/40 mb-2">{isPlayer ? 'Share this code with your parent:' : 'Share this code with your player:'}</p>
                  <div className="font-display text-3xl tracking-[0.3em] text-wheat">{parentCode}</div>
                  <button onClick={() => { navigator.clipboard.writeText(parentCode); }} className="mt-2 text-xs text-offwhite/30 hover:text-wheat transition-colors">Copy to clipboard</button>
                </div>
              ) : (
                <button onClick={handleGenerateParentCode} disabled={codeLoading} className="px-4 py-2 bg-wheat/10 border border-wheat/20 text-wheat text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-wheat/20 transition-colors disabled:opacity-50">
                  {codeLoading ? 'Generating...' : 'Generate Code'}
                </button>
              )}
            </div>
          )}

          {/* Link to Existing Player (for parents without a player) */}
          {isFamily && (
            <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
              <h2 className="font-display text-lg text-wheat mb-1">Link to Existing Player</h2>
              <p className="text-xs text-offwhite/40 mb-4">If your player already has an account, enter the code they shared with you.</p>
              <form onSubmit={handleLinkToPlayer} className="flex gap-2">
                <input type="text" value={linkCode} onChange={(e) => setLinkCode(e.target.value)} className="flex-1 p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors font-display tracking-widest uppercase text-center" placeholder="PL-XXXXX" maxLength={10} />
                <button type="submit" disabled={linkLoading || !linkCode} className="px-5 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50">{linkLoading ? '...' : 'Link'}</button>
              </form>
              {linkError && <p className="text-red-400 text-xs mt-2">{linkError}</p>}
            </div>
          )}

          {/* Invite a Coach (for players and parents) */}
          {(isPlayer || isFamily) && players.length > 0 && (
            <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
              <h2 className="font-display text-lg text-wheat mb-1">Invite a Coach</h2>
              <p className="text-xs text-offwhite/40 mb-4">Generate a code to share with your coach so they can connect to your profile.</p>
              {coachCode ? (
                <div className="text-center p-4 bg-navy rounded-lg border border-wheat/15">
                  <p className="text-xs text-offwhite/40 mb-2">Share this code with your coach:</p>
                  <div className="font-display text-3xl tracking-[0.3em] text-wheat">{coachCode}</div>
                  <button onClick={() => { navigator.clipboard.writeText(coachCode); }} className="mt-2 text-xs text-offwhite/30 hover:text-wheat transition-colors">Copy to clipboard</button>
                </div>
              ) : (
                <button onClick={handleGenerateCoachCode} disabled={codeLoading} className="px-4 py-2 bg-wheat/10 border border-wheat/20 text-wheat text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-wheat/20 transition-colors disabled:opacity-50">
                  {codeLoading ? 'Generating...' : 'Generate Coach Invite Code'}
                </button>
              )}
              {codeError && !parentCode && !coachCode && <p className="text-red-400 text-xs mt-2">{codeError}</p>}
            </div>
          )}

          {/* === COACH CODE SECTIONS === */}

          {/* Coach: Invite a Player or Parent */}
          {isCoach && coachProfile && (
            <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
              <h2 className="font-display text-lg text-wheat mb-1">Invite a Player</h2>
              <p className="text-xs text-offwhite/40 mb-4">Generate a code to share with a player or parent. They enter it after signing up to connect with you.</p>
              {playerCode ? (
                <div className="text-center p-4 bg-navy rounded-lg border border-wheat/15">
                  <p className="text-xs text-offwhite/40 mb-2">Share this code with a player or parent:</p>
                  <div className="font-display text-3xl tracking-[0.3em] text-wheat">{playerCode}</div>
                  <button onClick={() => { navigator.clipboard.writeText(playerCode); }} className="mt-2 text-xs text-offwhite/30 hover:text-wheat transition-colors">Copy to clipboard</button>
                </div>
              ) : (
                <button onClick={handleGeneratePlayerInvite} disabled={codeLoading} className="px-4 py-2 bg-wheat/10 border border-wheat/20 text-wheat text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-wheat/20 transition-colors disabled:opacity-50">
                  {codeLoading ? 'Generating...' : 'Generate Invite Code'}
                </button>
              )}
              {codeError && <p className="text-red-400 text-xs mt-2">{codeError}</p>}
            </div>
          )}

          {/* Coach: Enter a code from a player */}
          {isCoach && (
            <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
              <h2 className="font-display text-lg text-wheat mb-1">Enter Player Code</h2>
              <p className="text-xs text-offwhite/40 mb-4">If a player or parent shared a code with you, enter it here to connect.</p>
              <CoachCodeEntry coachProfile={coachProfile} />
            </div>
          )}

          {/* Player/Parent: Enter a coach code */}
          {(isPlayer || isFamily) && (
            <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
              <h2 className="font-display text-lg text-wheat mb-1">Enter a Coach Code</h2>
              <p className="text-xs text-offwhite/40 mb-4">If a coach shared a code with you, enter it here to connect.</p>
              <form onSubmit={handleLinkToPlayer} className="flex gap-2">
                <input type="text" value={linkCode} onChange={(e) => setLinkCode(e.target.value)} className="flex-1 p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors font-display tracking-widest uppercase text-center" placeholder="CT-XXXXX" maxLength={10} />
                <button type="submit" disabled={linkLoading || !linkCode} className="px-5 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50">{linkLoading ? '...' : 'Connect'}</button>
              </form>
              {linkError && <p className="text-red-400 text-xs mt-2">{linkError}</p>}
            </div>
          )}

          {/* Subscription - at bottom, not for coaches */}
          {!isCoach && (
            <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
              <h2 className="font-display text-lg text-wheat mb-3">Subscription</h2>
              <SubscriptionSection players={players} />
            </div>
          )}
          <Link href="/help" className="block w-full p-4 rounded-xl bg-navy-light border border-wheat/8 text-center text-sm text-offwhite/50 hover:text-wheat hover:border-wheat/20 transition-all">Help Center</Link>
          {/* Sign Out */}
          <button onClick={handleSignOut} className="w-full p-4 rounded-xl border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all text-sm">Sign Out</button>

        </div>
      </main>

      <nav className="fixed bottom-0 w-full z-50 bg-navy/95 backdrop-blur-xl border-t border-wheat/8 sm:hidden">
        <div className="flex justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">🏠</span><span className="text-[10px] text-offwhite/30">Home</span></Link>
          <Link href="/drills" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">📋</span><span className="text-[10px] text-offwhite/30">Drills</span></Link>
          <Link href="/coaches" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">🧢</span><span className="text-[10px] text-offwhite/30">Coaches</span></Link>
          <Link href="/settings" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">⚙️</span><span className="text-[10px] text-wheat">Settings</span></Link>
        </div>
      </nav>
    </div>
  );
}

function CoachCodeEntry({ coachProfile }: { coachProfile: any }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = createClient();

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!coachProfile) { setError('Set up your coach profile first.'); return; }
    setError(''); setSuccess(''); setLoading(true);
    const { data, error: lookupError } = await supabase.from('player_coaches').select('*, players(first_name, last_name)').eq('invite_code', code.trim().toUpperCase()).eq('status', 'pending').single();
    if (lookupError || !data) { setError('Invalid or expired code.'); setLoading(false); return; }
    const { error: updateError } = await supabase.from('player_coaches').update({ coach_profile_id: coachProfile.id, status: 'active', connected_at: new Date().toISOString() }).eq('id', data.id);
    if (updateError) { setError(updateError.message); setLoading(false); return; }
    setSuccess(`Connected to ${data.players.first_name} ${data.players.last_name}!`);
    setCode(''); setLoading(false);
    setTimeout(() => window.location.href = '/dashboard', 1500);
  }

  return (
    <div>
      <form onSubmit={handleConnect} className="flex gap-2">
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors font-display tracking-widest uppercase text-center" placeholder="CT-XXXXX" maxLength={10} />
        <button type="submit" disabled={loading || !code} className="px-5 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50">{loading ? '...' : 'Connect'}</button>
      </form>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      {success && <p className="text-green-400 text-xs mt-2">{success}</p>}
    </div>
  );
}

function SubscriptionSection({ players }: { players: any[] }) {
  const supabase = createClient();
  const [subscription, setSubscription] = useState<any>(null);
  const [checkingOut, setCheckingOut] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadSub() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('subscriptions').select('*').eq('billing_user_id', user.id).eq('status', 'active').single();
      setSubscription(data);
      setLoaded(true);
    }
    loadSub();
  }, []);

  async function handleCheckout(plan: string) {
    setCheckingOut(plan);
    const playerId = players.length > 0 ? players[0].id : null;
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, playerId }),
    });
    const data = await response.json();
    if (data.url) { window.location.href = data.url; } else { setCheckingOut(''); }
  }

  async function handleManageSub() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const res = await fetch('/api/stripe/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; } else { alert('Error: ' + (data.error || 'Could not open portal')); }
    } catch (err: any) { alert('Error: ' + err.message); }
  }

  if (!loaded) return <p className="text-sm text-offwhite/30 animate-pulse">Loading...</p>;

  if (subscription) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Active</span>
          <span className="text-sm text-offwhite/60 capitalize">{subscription.plan_type} plan</span>
        </div>
        <p className="text-xs text-offwhite/30 mb-3">
          {subscription.current_period_end ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'Active subscription'}
        </p>
        <button onClick={handleManageSub} className="text-xs text-wheat hover:underline">Manage Subscription →</button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-offwhite/40 mb-4">Choose a plan to unlock all features.</p>
      <div className="flex gap-3">
        <button onClick={() => handleCheckout('monthly')} disabled={checkingOut !== ''} className="flex-1 p-3 rounded-lg border border-wheat/20 text-center hover:border-wheat/40 transition-colors disabled:opacity-50">
          <div className="font-display text-xl text-wheat">$10</div>
          <div className="text-[10px] text-offwhite/40 mt-0.5">{checkingOut === 'monthly' ? 'Redirecting...' : 'per month'}</div>
        </button>
        <button onClick={() => handleCheckout('yearly')} disabled={checkingOut !== ''} className="flex-1 p-3 rounded-lg border border-wheat/20 text-center hover:border-wheat/40 transition-colors disabled:opacity-50 relative">
          <div className="absolute -top-2 right-2 text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">SAVE $20</div>
          <div className="font-display text-xl text-wheat">$100</div>
          <div className="text-[10px] text-offwhite/40 mt-0.5">{checkingOut === 'yearly' ? 'Redirecting...' : 'per year'}</div>
        </button>
      </div>
    </div>
  );
}
