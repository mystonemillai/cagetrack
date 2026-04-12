'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardClientProps {
  profile: any;
  userId: string;
}

const AGE_GROUPS = ['8U','9U','10U','11U','12U','13U','14U','15U','16U','17U','18U'];
const POSITIONS = ['P','C','1B','2B','SS','3B','LF','CF','RF','DH','UTL'];

export default function DashboardClient({ profile, userId }: DashboardClientProps) {
  const supabase = createClient();
  const router = useRouter();

  const isCoach = profile?.role === 'coach';
  const isPlayer = profile?.role === 'player';
  const isFamily = profile?.role === 'family';

  const [ownedPlayers, setOwnedPlayers] = useState<any[]>([]);
  const [coachProfile, setCoachProfile] = useState<any>(null);
  const [connectedPlayers, setConnectedPlayers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(() => { if (typeof window !== 'undefined') { return localStorage.getItem('notif_dismissed_' + userId) !== new Date().toDateString(); } return true; });
  const [coachReferral, setCoachReferral] = useState<any>(null);

  const [showCreatePlayer, setShowCreatePlayer] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [currentTeam, setCurrentTeam] = useState('');
  const [playerCity, setPlayerCity] = useState('');
  const [playerState, setPlayerState] = useState('');
  const [playerZip, setPlayerZip] = useState('');
  const [playerSport, setPlayerSport] = useState('Baseball');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [connectingCoach, setConnectingCoach] = useState(false);

  const [playerFirstName, setPlayerFirstName] = useState(isPlayer ? (profile?.name?.split(' ')[0] || '') : '');
  const [playerLastName, setPlayerLastName] = useState(isPlayer ? (profile?.name?.split(' ').slice(1).join(' ') || '') : '');

  useEffect(() => {
    async function loadData() {
      const { data: players } = await supabase.from('players').select('*').eq('owner_user_id', userId);

      const { data: linkedPlayers } = await supabase.from('parent_links').select('player_id').eq('parent_user_id', userId).eq('status', 'active');
      let allPlayers = players || [];
      if (linkedPlayers && linkedPlayers.length > 0) {
        const linkedIds = linkedPlayers.map((lp: any) => lp.player_id);
        const { data: parentPlayers } = await supabase.from('players').select('*').in('id', linkedIds);
        if (parentPlayers) allPlayers = [...allPlayers, ...parentPlayers];
      }
      setOwnedPlayers(allPlayers);

      if (!isCoach) {
        const { data: sub } = await supabase.from('subscriptions').select('id').eq('billing_user_id', userId).eq('status', 'active').single();
        setHasSubscription(!!sub);
      }

      if (isCoach) {
        const { data: cp } = await supabase.from('coach_profiles').select('*').eq('user_id', userId).single();
        setCoachProfile(cp);
        if (cp) {
          const { data: connected } = await supabase.from('player_coaches').select('*, players(*)').eq('coach_profile_id', cp.id).eq('status', 'active');
          setConnectedPlayers(connected || []);
          const { data: pending } = await supabase.from('player_coaches').select('*, players(first_name, last_name, age_group, sport)').eq('coach_profile_id', cp.id).eq('status', 'pending_approval');
          setPendingRequests(pending || []);
        }
      }

      // Load notifications based on last_seen_at
      const lastSeen = profile?.last_seen_at || new Date(0).toISOString();
      const playerIds = allPlayers.map((p: any) => p.id);

      // For coaches, also get their connected players
      if (isCoach) {
        const { data: cp2 } = await supabase.from('coach_profiles').select('id').eq('user_id', userId).single();
        if (cp2) {
          const { data: coachPlayers } = await supabase.from('player_coaches').select('player_id').eq('coach_profile_id', cp2.id).eq('status', 'active');
          if (coachPlayers) coachPlayers.forEach((cp3: any) => { if (!playerIds.includes(cp3.player_id)) playerIds.push(cp3.player_id); });
        }
      }

      if (playerIds.length > 0) {
        const notifs: any[] = [];

        const { data: newObs } = await supabase.from('observations').select('*, coach_profiles(display_name), players(first_name)').in('player_id', playerIds).gt('created_at', lastSeen).order('created_at', { ascending: false }).limit(10);
        if (newObs) newObs.forEach(o => notifs.push({ type: 'observation', text: `${o.coach_profiles?.display_name || 'A coach'} added an observation for ${o.players?.first_name || 'your player'}`, date: o.created_at }));

        const { data: newDrills } = await supabase.from('drill_assignments').select('*, coach_profiles(display_name), players(first_name), master_drills(drill_name), coach_drills(drill_name)').in('player_id', playerIds).gt('assigned_at', lastSeen).order('assigned_at', { ascending: false }).limit(10);
        if (newDrills) newDrills.forEach(d => notifs.push({ type: 'drill', text: `${d.coach_profiles?.display_name || 'A coach'} assigned "${d.master_drills?.drill_name || d.coach_drills?.drill_name || 'a drill'}" to ${d.players?.first_name || 'your player'}`, date: d.assigned_at }));

        const { data: newPlans } = await supabase.from('ai_plans').select('*, coach_profiles(display_name), players(first_name)').in('player_id', playerIds).gt('created_at', lastSeen).order('created_at', { ascending: false }).limit(5);
        if (newPlans) newPlans.forEach(p => notifs.push({ type: 'ai', text: `${p.coach_profiles?.display_name || 'A coach'} created a custom plan for ${p.players?.first_name || 'your player'}`, date: p.created_at }));

        const { data: newMsgs } = await supabase.from('messages').select('*, players(first_name)').in('player_id', playerIds).gt('created_at', lastSeen).neq('sender_user_id', userId).order('created_at', { ascending: false }).limit(10);
        if (newMsgs) newMsgs.forEach(m => notifs.push({ type: 'message', text: `${m.sender_name || 'Someone'} sent a message on ${m.players?.first_name || 'your player'}'s profile`, date: m.created_at }));

        // Connection approval notifications
        const { data: newConnections } = await supabase.from('player_coaches').select('*, coach_profiles(display_name)').in('player_id', playerIds).eq('status', 'active').gt('connected_at', lastSeen);
        if (!isCoach && newConnections) newConnections.forEach(c => notifs.push({ type: 'connection', text: `${c.coach_profiles?.display_name || 'A coach'} accepted your connection request!`, date: c.connected_at }));

        notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotifications(notifs);
      }

      // Coach referral check
      if (typeof window !== 'undefined' && !isCoach) {
        const coachRef = localStorage.getItem('coach_ref');
        if (coachRef) {
          const { data: refCoach } = await supabase.from('coach_profiles').select('id, display_name').eq('id', coachRef).single();
          if (refCoach) setCoachReferral(refCoach);
        }
      }

      // Update last_seen_at
      await supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', userId);

      setDataLoaded(true);
    }
    loadData();
  }, []);

  const hasPlayers = ownedPlayers.length > 0;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  function togglePosition(pos: string) {
    setSelectedPositions(prev => prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]);
  }

  async function handleConnectCoachRef() {
    if (!coachReferral || ownedPlayers.length === 0) return;
    setConnectingCoach(true);
    const { error } = await supabase.from('player_coaches').insert({
      player_id: ownedPlayers[0].id,
      coach_profile_id: coachReferral.id,
      status: 'active',
      invite_code: 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      connected_at: new Date().toISOString(),
    });
    if (!error) {
      localStorage.removeItem('coach_ref');
      setCoachReferral(null);
    }
    setConnectingCoach(false);
    window.location.reload();
  }

  function dismissCoachRef() {
    localStorage.removeItem('coach_ref');
    setCoachReferral(null);
  }

  async function handleApproveRequest(requestId: string) {
    await supabase.from('player_coaches').update({ status: 'active', connected_at: new Date().toISOString() }).eq('id', requestId);
    window.location.reload();
  }

  async function handleDenyRequest(requestId: string) {
    await supabase.from('player_coaches').delete().eq('id', requestId);
    window.location.reload();
  }

  async function handleCreatePlayer(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    const fName = isPlayer ? playerFirstName : firstName;
    const lName = isPlayer ? playerLastName : lastName;
    if (!fName || !lName || !ageGroup) { setCreateError('First name, last name, and age group are required.'); setCreateLoading(false); return; }

    const { error } = await supabase.from('players').insert({
      owner_user_id: userId, first_name: fName, last_name: lName, age_group: ageGroup,
      positions: selectedPositions, current_team: currentTeam || null,
      city: playerCity || null, state: playerState || null, zip_code: playerZip || null, sport: playerSport,
    });

    if (error) { setCreateError(error.message); setCreateLoading(false); return; }

    if (playerCity || playerState || playerZip) {
      await supabase.from('profiles').update({ city: playerCity || null, state: playerState || null, zip_code: playerZip || null }).eq('id', userId);
    }
    setCreateLoading(false);
    window.location.href = '/dashboard';
  }

  if (!dataLoaded) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="text-wheat font-display text-xl animate-pulse">Loading...</div></div>);
  }

  if (showCreatePlayer) {
    return (
      <div className="min-h-screen">
        <nav className="fixed top-0 w-full z-50 px-4 py-3 bg-navy/90 backdrop-blur-xl border-b border-wheat/8">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-xs -rotate-3">CT</div>
              <span className="font-display text-lg tracking-wider">CAGETRACK</span>
            </Link>
            <button onClick={() => setShowCreatePlayer(false)} className="text-xs text-offwhite/40 hover:text-wheat transition-colors">← Back to Dashboard</button>
          </div>
        </nav>
        <main className="pt-20 pb-8 px-4 max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-wheat/10 flex items-center justify-center mx-auto mb-4 text-2xl">⚾</div>
            <h1 className="font-display text-3xl sm:text-4xl mb-2">{isPlayer ? 'Complete Your Profile' : 'Add Your Player'}</h1>
            <p className="text-offwhite/40">{isPlayer ? 'Set up your development profile.' : "Create your player's development profile."}</p>
          </div>
          <form onSubmit={handleCreatePlayer} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">First Name</label>
                <input type="text" value={isPlayer ? playerFirstName : firstName} onChange={(e) => isPlayer ? setPlayerFirstName(e.target.value) : setFirstName(e.target.value)} required className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="First name" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Last Name</label>
                <input type="text" value={isPlayer ? playerLastName : lastName} onChange={(e) => isPlayer ? setPlayerLastName(e.target.value) : setLastName(e.target.value)} required className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="Last name" />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Age Group</label>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map((ag) => (<button key={ag} type="button" onClick={() => setAgeGroup(ag)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${ageGroup === ag ? 'bg-wheat text-navy' : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{ag}</button>))}
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Positions (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {POSITIONS.map((pos) => (<button key={pos} type="button" onClick={() => togglePosition(pos)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${selectedPositions.includes(pos) ? 'bg-wheat text-navy' : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{pos}</button>))}
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Sport</label>
              <div className="flex gap-3">
                {['Baseball', 'Softball'].map((s) => (<button key={s} type="button" onClick={() => setPlayerSport(s)} className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all ${playerSport === s ? 'bg-wheat text-navy' : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{s}</button>))}
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Current Team <span className="text-offwhite/20">(optional)</span></label>
              <input type="text" value={currentTeam} onChange={(e) => setCurrentTeam(e.target.value)} className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="Team name" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Location</label>
              <div className="grid grid-cols-5 gap-3">
                <input type="text" value={playerCity} onChange={(e) => setPlayerCity(e.target.value)} className="col-span-2 p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="City" />
                <input type="text" value={playerState} onChange={(e) => setPlayerState(e.target.value)} maxLength={2} className="col-span-1 p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors uppercase" placeholder="ST" />
                <input type="text" value={playerZip} onChange={(e) => setPlayerZip(e.target.value)} maxLength={5} className="col-span-2 p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="Zip code" />
              </div>
              <p className="text-[11px] text-offwhite/25 mt-1.5">Used to find coaches in your area.</p>
            </div>
            {createError && (<div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{createError}</div>)}
            <button type="submit" disabled={createLoading} className="w-full p-4 bg-wheat text-navy font-display text-lg tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50">
              {createLoading ? 'Creating...' : isPlayer ? 'Complete Profile' : 'Create Player Profile'}
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 px-4 py-3 bg-navy/90 backdrop-blur-xl border-b border-wheat/8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-xs -rotate-3">CT</div>
            <span className="font-display text-lg tracking-wider">CAGETRACK</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 hidden sm:flex">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover border border-wheat/20" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-wheat/10 flex items-center justify-center text-[10px]">👤</div>
              )}
              <span className="text-xs text-offwhite/40">{profile?.name}</span>
            </div>
            {profile?.email === 'cagetrack@gmail.com' && <Link href="/admin" className="text-xs text-red-400 hover:text-red-300 transition-colors">Admin</Link>}
            <Link href="/edit-profile" className="text-xs text-offwhite/40 hover:text-wheat transition-colors">Edit Profile</Link>
            <button onClick={handleSignOut} className="text-xs text-offwhite/40 hover:text-wheat transition-colors">Sign Out</button>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-24 px-4 max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:text-left gap-5">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-wheat/25 shadow-lg" />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-wheat/10 flex items-center justify-center text-3xl flex-shrink-0">👤</div>
          )}
          <div>
          <h1 className="font-display text-4xl sm:text-5xl">{profile?.name ? `Hey, ${profile.name.split(' ')[0]}` : 'Welcome'}</h1>
          <p className="text-offwhite/40 mt-1">{isCoach ? 'Your coaching dashboard' : isPlayer ? 'Your development dashboard' : "Your player's development"}</p>
          </div>
        </div>

        {/* Notifications */}
        {showNotifications && notifications.length > 0 && (
          <div className="mb-6 rounded-xl bg-wheat/5 border border-wheat/15 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-wheat">What&apos;s New</div>
              <button onClick={() => { setShowNotifications(false); localStorage.setItem('notif_dismissed_' + userId, new Date().toDateString()); }} className="text-[10px] text-offwhite/30 hover:text-wheat">Dismiss</button>
            </div>
            <div className="space-y-2">
              {notifications.slice(0, 5).map((n, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs mt-0.5">{n.type === 'observation' ? '👁️' : n.type === 'drill' ? '📋' : n.type === 'ai' ? '🧠' : n.type === 'connection' ? '🤝' : '💬'}</span>
                  <span className="text-xs text-offwhite/60">{n.text}</span>
                </div>
              ))}
              {notifications.length > 5 && (
                <p className="text-[10px] text-offwhite/30 mt-1">+ {notifications.length - 5} more updates</p>
              )}
            </div>
          </div>
        )}

        {/* Coach referral prompt */}
        {coachReferral && hasPlayers && (
          <div className="mb-6 rounded-xl bg-wheat/5 border border-wheat/15 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-wheat">Connect with {coachReferral.display_name}?</div>
                <div className="text-xs text-offwhite/40 mt-0.5">This coach invited you to CageTrack.</div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleConnectCoachRef} disabled={connectingCoach} className="px-4 py-1.5 bg-wheat text-navy text-xs font-display tracking-wider rounded-lg hover:bg-wheat/90 disabled:opacity-50">{connectingCoach ? '...' : 'Connect'}</button>
                <button onClick={dismissCoachRef} className="px-3 py-1.5 text-xs text-offwhite/30 hover:text-wheat">Dismiss</button>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade banner - only for non-coaches without subscription */}
        {!isCoach && !hasSubscription && (
          <Link href="/settings" className="block mb-6 p-4 rounded-xl bg-wheat/5 border border-wheat/15 hover:border-wheat/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-wheat">Upgrade to unlock all features</div>
                <div className="text-xs text-offwhite/40 mt-0.5">Starting at $10/mo — AI plans, full drill library, and more</div>
              </div>
              <span className="text-wheat text-xs font-display tracking-wider">UPGRADE →</span>
            </div>
          </Link>
        )}

        {!isCoach && (
          <>
            {!hasPlayers && (
              <div className="rounded-xl bg-navy-light border border-wheat/10 p-8 text-center mb-8">
                <div className="w-14 h-14 rounded-xl bg-wheat/10 flex items-center justify-center mx-auto mb-4 text-2xl">⚾</div>
                <h2 className="font-display text-2xl mb-2">Get Started</h2>
                <p className="text-offwhite/40 mb-6 max-w-sm mx-auto">Add your player or link to an existing profile.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => setShowCreatePlayer(true)} className="px-6 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors">Add a New Player</button>
                  <Link href="/settings" className="px-6 py-3 bg-wheat/10 border border-wheat/20 text-wheat font-display text-sm tracking-wider rounded-lg hover:bg-wheat/20 transition-colors text-center">Link to Existing Player</Link>
                </div>
              </div>
            )}

            {hasPlayers && (
              <div className="space-y-4 mb-8">
                {ownedPlayers.map((player) => (
                  <Link key={player.id} href={`/player/${player.id}`} className="block rounded-xl bg-navy-light border border-wheat/8 p-6 hover:border-wheat/20 transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display text-xl tracking-wide">{player.first_name} {player.last_name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-wheat bg-wheat/10 px-2 py-0.5 rounded">{player.age_group}</span>
                          {player.current_team && <span className="text-xs text-offwhite/40">{player.current_team}</span>}
                          {player.city && player.state && <span className="text-xs text-offwhite/30">{player.city}, {player.state}</span>}
                        </div>
                        {player.positions && player.positions.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {player.positions.map((pos: string) => (<span key={pos} className="text-xs text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded">{pos}</span>))}
                          </div>
                        )}
                      </div>
                      <span className="text-offwhite/20 text-xl">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <QuickAction icon="🧢" label="Find Coaches" href="/coaches" />
              <QuickAction icon="📖" label="Dev Blog" href="/blog" />
              <QuickAction icon="⚙️" label="Settings" href="/settings" />
            </div>

            {isFamily && hasPlayers && (
              <button onClick={() => setShowCreatePlayer(true)} className="mt-6 w-full p-4 rounded-xl border border-dashed border-wheat/15 text-offwhite/30 hover:text-wheat hover:border-wheat/30 transition-all text-sm">+ Add Another Player</button>
            )}
          </>
        )}

        {isCoach && (
          <>
            {!coachProfile && (
              <div className="rounded-xl bg-navy-light border border-wheat/10 p-8 text-center mb-6">
                <div className="w-14 h-14 rounded-xl bg-wheat/10 flex items-center justify-center mx-auto mb-4 text-2xl">🧢</div>
                <h2 className="font-display text-2xl mb-2">Set Up Your Coach Profile</h2>
                <p className="text-offwhite/40 mb-6 max-w-sm mx-auto">Build your profile so players and families can find you.</p>
                <Link href="/coach-setup" className="inline-block px-6 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors">Set Up Profile</Link>
              </div>
            )}
            {coachProfile && (
              <div className="rounded-xl bg-navy-light border border-wheat/8 p-6 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg text-wheat">{coachProfile.display_name}</h3>
                    <div className="flex gap-2 mt-1">
                      {coachProfile.specialty && <span className="text-xs text-wheat bg-wheat/10 px-2 py-0.5 rounded">{coachProfile.specialty}</span>}
                      {coachProfile.coach_type && <span className="text-xs text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded capitalize">{coachProfile.coach_type.replace(/_/g, ' ')}</span>}
                      {coachProfile.city && coachProfile.state && <span className="text-xs text-offwhite/30">{coachProfile.city}, {coachProfile.state}</span>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { navigator.clipboard.writeText(`https://cagetrack.com/coach/${coachProfile.id}`); alert('Profile link copied!'); }} className="text-xs text-wheat hover:underline">Share</button>
                    <Link href="/coach-setup" className="text-xs text-offwhite/30 hover:text-wheat transition-colors">Edit</Link>
                  </div>
                </div>
              </div>
            )}
            {pendingRequests.length > 0 && (
              <div className="mb-6">
                <h2 className="font-display text-xl text-wheat mb-3">Connection Requests ({pendingRequests.length})</h2>
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="rounded-xl bg-wheat/5 border border-wheat/15 p-5">
                      <div className="mb-3">
                        <h3 className="font-display text-lg tracking-wide">{req.players?.first_name} {req.players?.last_name}</h3>
                        <div className="flex gap-2 mt-1">
                          {req.players?.age_group && <span className="text-xs text-wheat bg-wheat/10 px-2 py-0.5 rounded">{req.players.age_group}</span>}
                          {req.players?.sport && <span className="text-xs text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded">{req.players.sport}</span>}
                        </div>
                        {req.requested_by_name && <p className="text-xs text-offwhite/40 mt-2">Requested by {req.requested_by_name}</p>}
                      </div>
                      {req.request_message && (
                        <div className="p-3 bg-navy rounded-lg border border-wheat/8 mb-3">
                          <p className="text-sm text-offwhite/60 italic">&ldquo;{req.request_message}&rdquo;</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveRequest(req.id)} className="px-5 py-2 bg-wheat text-navy text-xs font-display tracking-wider rounded-lg hover:bg-wheat/90">Approve</button>
                        <button onClick={() => handleDenyRequest(req.id)} className="px-5 py-2 bg-offwhite/5 border border-offwhite/10 text-offwhite/40 text-xs font-display tracking-wider rounded-lg hover:text-red-400 hover:border-red-400/20">Deny</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {connectedPlayers.length > 0 && (
              <div className="mb-6">
                <h2 className="font-display text-xl text-offwhite/60 mb-3">Your Players</h2>
                <div className="space-y-3">
                  {connectedPlayers.map((connection) => (
                    <Link key={connection.id} href={`/player/${connection.players.id}`} className="block rounded-xl bg-navy-light border border-wheat/8 p-5 hover:border-wheat/20 transition-all cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-lg tracking-wide">{connection.players.first_name} {connection.players.last_name}</h3>
                          <span className="text-xs text-wheat bg-wheat/10 px-2 py-0.5 rounded">{connection.players.age_group}</span>
                        </div>
                        <span className="text-offwhite/20 text-xl">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <CoachInviteCodeEntry coachProfile={coachProfile} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <QuickAction icon="📋" label="Drill Library" href="/drills" />
              <QuickAction icon="✏️" label="My Drills" href="/my-drills" />
              <QuickAction icon="📖" label="Dev Blog" href="/blog" />
              <QuickAction icon="⚙️" label="Settings" href="/settings" />
            </div>
          </>
        )}
      </main>

      <nav className="fixed bottom-0 w-full z-50 bg-navy/95 backdrop-blur-xl border-t border-wheat/8 sm:hidden">
        <div className="flex justify-around py-2">
          <BottomNavItem icon="🏠" label="Home" href="/dashboard" active />
          <BottomNavItem icon="📋" label="Drills" href="/drills" />
          <BottomNavItem icon="🧢" label="Coaches" href="/coaches" />
          <BottomNavItem icon="⚙️" label="Settings" href="/settings" />
        </div>
      </nav>
    </div>
  );
}

function CoachInviteCodeEntry({ coachProfile }: { coachProfile: any }) {
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
    if (lookupError || !data) { setError('Invalid or expired invite code.'); setLoading(false); return; }
    const { error: updateError } = await supabase.from('player_coaches').update({ coach_profile_id: coachProfile.id, status: 'active', connected_at: new Date().toISOString() }).eq('id', data.id);
    if (updateError) { setError(updateError.message); setLoading(false); return; }
    setSuccess(`Connected to ${data.players.first_name} ${data.players.last_name}!`);
    setCode(''); setLoading(false);
    setTimeout(() => window.location.reload(), 1500);
  }

  return (
    <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
      <h3 className="font-display text-lg mb-1">Connect to a Player</h3>
      <p className="text-xs text-offwhite/40 mb-4">Enter the invite code from a player or parent.</p>
      <form onSubmit={handleConnect} className="flex gap-2">
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors font-display tracking-widest uppercase text-center" placeholder="CT-XXXXX" maxLength={10} />
        <button type="submit" disabled={loading || !code} className="px-5 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50">{loading ? '...' : 'Connect'}</button>
      </form>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      {success && <p className="text-green-400 text-xs mt-2">{success}</p>}
    </div>
  );
}

function QuickAction({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link href={href} className="rounded-xl bg-navy-light border border-wheat/6 p-4 text-center hover:border-wheat/15 transition-all">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-xs text-offwhite/50 font-medium">{label}</div>
    </Link>
  );
}

function BottomNavItem({ icon, label, href, active }: { icon: string; label: string; href: string; active?: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 px-3 py-1">
      <span className="text-lg">{icon}</span>
      <span className={`text-[10px] ${active ? 'text-wheat' : 'text-offwhite/30'}`}>{label}</span>
    </Link>
  );
}
