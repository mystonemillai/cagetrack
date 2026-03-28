'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardClientProps {
  profile: any;
  ownedPlayers: any[];
  coachProfile: any;
  connectedPlayers: any[];
}

const AGE_GROUPS = ['8U','9U','10U','11U','12U','13U','14U','15U','16U','17U','18U'];
const POSITIONS = ['P','C','1B','2B','SS','3B','LF','CF','RF','DH','UTL'];

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CT-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function DashboardClient({
  profile,
  ownedPlayers,
  coachProfile,
  connectedPlayers,
}: DashboardClientProps) {
  const supabase = createClient();
  const router = useRouter();

  const isCoach = profile?.role === 'coach';
  const isPlayer = profile?.role === 'player';
  const isFamily = profile?.role === 'family';
  const hasPlayers = ownedPlayers.length > 0;

  // Player creation form
  const [showCreatePlayer, setShowCreatePlayer] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [currentTeam, setCurrentTeam] = useState('');
  const [playerCity, setPlayerCity] = useState('');
  const [playerState, setPlayerState] = useState('');
  const [playerZip, setPlayerZip] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // For player role, pre-fill from profile
  const [playerFirstName, setPlayerFirstName] = useState(
    isPlayer ? (profile?.name?.split(' ')[0] || '') : ''
  );
  const [playerLastName, setPlayerLastName] = useState(
    isPlayer ? (profile?.name?.split(' ').slice(1).join(' ') || '') : ''
  );

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  function togglePosition(pos: string) {
    setSelectedPositions(prev =>
      prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
    );
  }

  async function handleCreatePlayer(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    const fName = isPlayer ? playerFirstName : firstName;
    const lName = isPlayer ? playerLastName : lastName;

    if (!fName || !lName || !ageGroup) {
      setCreateError('First name, last name, and age group are required.');
      setCreateLoading(false);
      return;
    }

    const { error } = await supabase.from('players').insert({
      owner_user_id: profile.id,
      first_name: fName,
      last_name: lName,
      age_group: ageGroup,
      positions: selectedPositions,
      current_team: currentTeam || null,
      city: playerCity || null,
      state: playerState || null,
      zip_code: playerZip || null,
    });

    if (error) {
      setCreateError(error.message);
      setCreateLoading(false);
      return;
    }

    // Also update profile location if provided
    if (playerCity || playerState || playerZip) {
      await supabase.from('profiles').update({
        city: playerCity || null,
        state: playerState || null,
        zip_code: playerZip || null,
      }).eq('id', profile.id);
    }

    setCreateLoading(false);
   window.location.href = '/dashboard';
  }

  // ── PLAYER CREATION FORM ──
  if (showCreatePlayer || (!hasPlayers && !isCoach)) {
    return (
      <div className="min-h-screen">
        <nav className="fixed top-0 w-full z-50 px-4 py-3 bg-navy/90 backdrop-blur-xl border-b border-wheat/8">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-xs -rotate-3">CT</div>
              <span className="font-display text-lg tracking-wider">CAGETRACK</span>
            </Link>
            <button onClick={handleSignOut} className="text-xs text-offwhite/40 hover:text-wheat transition-colors">
              Sign Out
            </button>
          </div>
        </nav>

        <main className="pt-20 pb-8 px-4 max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-wheat/10 flex items-center justify-center mx-auto mb-4 text-2xl">⚾</div>
            <h1 className="font-display text-3xl sm:text-4xl mb-2">
              {isPlayer ? 'Complete Your Profile' : 'Add Your Player'}
            </h1>
            <p className="text-offwhite/40">
              {isPlayer ? 'Set up your development profile.' : "Create your player's development profile."}
            </p>
          </div>

          <form onSubmit={handleCreatePlayer} className="space-y-5">
            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">First Name</label>
                <input
                  type="text"
                  value={isPlayer ? playerFirstName : firstName}
                  onChange={(e) => isPlayer ? setPlayerFirstName(e.target.value) : setFirstName(e.target.value)}
                  required
                  className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Last Name</label>
                <input
                  type="text"
                  value={isPlayer ? playerLastName : lastName}
                  onChange={(e) => isPlayer ? setPlayerLastName(e.target.value) : setLastName(e.target.value)}
                  required
                  className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Age Group */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Age Group</label>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map((ag) => (
                  <button
                    key={ag}
                    type="button"
                    onClick={() => setAgeGroup(ag)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      ageGroup === ag
                        ? 'bg-wheat text-navy'
                        : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'
                    }`}
                  >
                    {ag}
                  </button>
                ))}
              </div>
            </div>

            {/* Positions */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Positions (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => togglePosition(pos)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      selectedPositions.includes(pos)
                        ? 'bg-wheat text-navy'
                        : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Team */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Current Team <span className="text-offwhite/20">(optional)</span></label>
              <input
                type="text"
                value={currentTeam}
                onChange={(e) => setCurrentTeam(e.target.value)}
                className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors"
                placeholder="Team name"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Location</label>
              <div className="grid grid-cols-5 gap-3">
                <input
                  type="text"
                  value={playerCity}
                  onChange={(e) => setPlayerCity(e.target.value)}
                  className="col-span-2 p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={playerState}
                  onChange={(e) => setPlayerState(e.target.value)}
                  maxLength={2}
                  className="col-span-1 p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors uppercase"
                  placeholder="ST"
                />
                <input
                  type="text"
                  value={playerZip}
                  onChange={(e) => setPlayerZip(e.target.value)}
                  maxLength={5}
                  className="col-span-2 p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors"
                  placeholder="Zip code"
                />
              </div>
              <p className="text-[11px] text-offwhite/25 mt-1.5">Used to find coaches in your area.</p>
            </div>

            {createError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {createError}
              </div>
            )}

            <button
              type="submit"
              disabled={createLoading}
              className="w-full p-4 bg-wheat text-navy font-display text-lg tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50"
            >
              {createLoading ? 'Creating...' : isPlayer ? 'Complete Profile' : 'Create Player Profile'}
            </button>
          </form>
        </main>
      </div>
    );
  }

  // ── MAIN DASHBOARD ──
  return (
    <div className="min-h-screen">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 px-4 py-3 bg-navy/90 backdrop-blur-xl border-b border-wheat/8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-xs -rotate-3">CT</div>
            <span className="font-display text-lg tracking-wider">CAGETRACK</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-offwhite/40 hidden sm:block">{profile?.name}</span>
            <button onClick={handleSignOut} className="text-xs text-offwhite/40 hover:text-wheat transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-24 px-4 max-w-5xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl">
            {profile?.name ? `Hey, ${profile.name.split(' ')[0]}` : 'Welcome'}
          </h1>
          <p className="text-offwhite/40 mt-1">
            {isCoach ? 'Your coaching dashboard' : isPlayer ? 'Your development dashboard' : "Your player's development"}
          </p>
        </div>

        {/* ── PLAYER/FAMILY VIEW ── */}
        {!isCoach && hasPlayers && (
          <>
            {/* Player Cards */}
            <div className="space-y-4 mb-8">
              {ownedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="rounded-xl bg-navy-light border border-wheat/8 p-6 hover:border-wheat/20 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-xl tracking-wide">
                        {player.first_name} {player.last_name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-wheat bg-wheat/10 px-2 py-0.5 rounded">{player.age_group}</span>
                        {player.current_team && (
                          <span className="text-xs text-offwhite/40">{player.current_team}</span>
                        )}
                        {player.city && player.state && (
                          <span className="text-xs text-offwhite/30">{player.city}, {player.state}</span>
                        )}
                      </div>
                      {player.positions && player.positions.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {player.positions.map((pos: string) => (
                            <span key={pos} className="text-xs text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded">{pos}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-offwhite/20 text-xl">→</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <QuickAction icon="📋" label="Drills" href="/drills" />
              <QuickAction icon="🧢" label="Find Coaches" href="/coaches" />
              <QuickAction icon="🧠" label="AI Plans" href="/dashboard" />
              <QuickAction icon="⚙️" label="Settings" href="/settings" />
            </div>

            {/* Add another player (for families with multiple kids) */}
            {isFamily && (
              <button
                onClick={() => setShowCreatePlayer(true)}
                className="mt-6 w-full p-4 rounded-xl border border-dashed border-wheat/15 text-offwhite/30 hover:text-wheat hover:border-wheat/30 transition-all text-sm"
              >
                + Add Another Player
              </button>
            )}
          </>
        )}

        {/* ── COACH VIEW ── */}
        {isCoach && (
          <>
            {/* Coach profile setup prompt */}
            {!coachProfile && (
              <div className="rounded-xl bg-navy-light border border-wheat/10 p-8 text-center mb-6">
                <div className="w-14 h-14 rounded-xl bg-wheat/10 flex items-center justify-center mx-auto mb-4 text-2xl">🧢</div>
                <h2 className="font-display text-2xl mb-2">Set Up Your Coach Profile</h2>
                <p className="text-offwhite/40 mb-6 max-w-sm mx-auto">
                  Build your profile so players and families can find you. Add your specialty, bio, and location.
                </p>
                <Link
                  href="/coach-setup"
                  className="inline-block px-6 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors"
                >
                  Set Up Profile
                </Link>
              </div>
            )}

            {/* Coach has profile */}
            {coachProfile && (
              <div className="rounded-xl bg-navy-light border border-wheat/8 p-6 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg text-wheat">{coachProfile.display_name}</h3>
                    <div className="flex gap-2 mt-1">
                      {coachProfile.specialty && (
                        <span className="text-xs text-wheat bg-wheat/10 px-2 py-0.5 rounded">{coachProfile.specialty}</span>
                      )}
                      {coachProfile.coach_type && (
                        <span className="text-xs text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded capitalize">{coachProfile.coach_type}</span>
                      )}
                      {coachProfile.city && coachProfile.state && (
                        <span className="text-xs text-offwhite/30">{coachProfile.city}, {coachProfile.state}</span>
                      )}
                    </div>
                  </div>
                  <Link href="/coach-setup" className="text-xs text-offwhite/30 hover:text-wheat transition-colors">Edit</Link>
                </div>
              </div>
            )}

            {/* Connected Players */}
            {connectedPlayers.length > 0 && (
              <div className="mb-6">
                <h2 className="font-display text-xl text-offwhite/60 mb-3">Your Players</h2>
                <div className="space-y-3">
                  {connectedPlayers.map((connection) => (
                    <div key={connection.id} className="rounded-xl bg-navy-light border border-wheat/8 p-5 hover:border-wheat/20 transition-all cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-lg tracking-wide">
                            {connection.players.first_name} {connection.players.last_name}
                          </h3>
                          <span className="text-xs text-wheat bg-wheat/10 px-2 py-0.5 rounded">{connection.players.age_group}</span>
                        </div>
                        <span className="text-offwhite/20 text-xl">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enter invite code */}
            <CoachInviteCodeEntry coachProfile={coachProfile} />

            {/* Coach Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <QuickAction icon="📋" label="Drill Library" href="/drills" />
              <QuickAction icon="✏️" label="My Drills" href="/coach-setup" />
              <QuickAction icon="🧠" label="AI Plans" href="/dashboard" />
              <QuickAction icon="⚙️" label="Settings" href="/settings" />
            </div>
          </>
        )}
      </main>

      {/* Bottom Nav (Mobile) */}
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

// ── Coach Invite Code Entry Component ──
function CoachInviteCodeEntry({ coachProfile }: { coachProfile: any }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = createClient();
  const router = useRouter();

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!coachProfile) {
      setError('Set up your coach profile first before connecting to players.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    // Look up invite code in player_coaches
    const { data, error: lookupError } = await supabase
      .from('player_coaches')
      .select('*, players(first_name, last_name)')
      .eq('invite_code', code.trim().toUpperCase())
      .eq('status', 'pending')
      .single();

    if (lookupError || !data) {
      setError('Invalid or expired invite code.');
      setLoading(false);
      return;
    }

    // Update the connection
    const { error: updateError } = await supabase
      .from('player_coaches')
      .update({
        coach_profile_id: coachProfile.id,
        status: 'active',
        connected_at: new Date().toISOString(),
      })
      .eq('id', data.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(`Connected to ${data.players.first_name} ${data.players.last_name}!`);
    setCode('');
    setLoading(false);
    setTimeout(() => router.refresh(), 1500);
  }

  return (
    <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
      <h3 className="font-display text-lg mb-1">Connect to a Player</h3>
      <p className="text-xs text-offwhite/40 mb-4">Enter the invite code from a player or parent.</p>
      <form onSubmit={handleConnect} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors font-display tracking-widest uppercase text-center"
          placeholder="CT-XXXXX"
          maxLength={10}
        />
        <button
          type="submit"
          disabled={loading || !code}
          className="px-5 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Connect'}
        </button>
      </form>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      {success && <p className="text-green-400 text-xs mt-2">{success}</p>}
    </div>
  );
}

// ── Reusable Components ──
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
