'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AvatarUpload from '@/components/AvatarUpload';

const AGE_GROUPS = ['8U','9U','10U','11U','12U','13U','14U','15U','16U','17U','18U'];
const POSITIONS = ['P','C','1B','2B','SS','3B','LF','CF','RF','DH','UTL'];

export default function EditProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);

  // Account fields
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Player fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [currentTeam, setCurrentTeam] = useState('');
  const [sport, setSport] = useState('Baseball');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      setName(p?.name || '');
      setAvatarUrl(p?.avatar_url || '');
      setCity(p?.city || '');
      setState(p?.state || '');
      setZipCode(p?.zip_code || '');

      // Load player if player or family role
      if (p?.role === 'player' || p?.role === 'family') {
        const { data: players } = await supabase.from('players').select('*').eq('owner_user_id', user.id);

        // Also check linked players for parents
        let allPlayers = players || [];
        if (p?.role === 'family') {
          const { data: linked } = await supabase.from('parent_links').select('player_id').eq('parent_user_id', user.id).eq('status', 'active');
          if (linked && linked.length > 0) {
            const linkedIds = linked.map((lp: any) => lp.player_id);
            const { data: lp } = await supabase.from('players').select('*').in('id', linkedIds);
            if (lp) allPlayers = [...allPlayers, ...lp];
          }
        }

        if (allPlayers.length > 0) {
          const pl = allPlayers[0];
          setPlayer(pl);
          setFirstName(pl.first_name || '');
          setLastName(pl.last_name || '');
          setAgeGroup(pl.age_group || '');
          setSelectedPositions(pl.positions || []);
          setCurrentTeam(pl.current_team || '');
          setSport(pl.sport || 'Baseball');
          if (pl.city) setCity(pl.city);
          if (pl.state) setState(pl.state);
          if (pl.zip_code) setZipCode(pl.zip_code);
        }
      }

      setLoading(false);
    }
    loadData();
  }, []);

  function togglePosition(pos: string) {
    setSelectedPositions(prev => prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    // Update profile
    const { error: profileError } = await supabase.from('profiles').update({
      name: name,
      avatar_url: avatarUrl || null,
      city: city || null,
      state: state || null,
      zip_code: zipCode || null,
    }).eq('id', profile.id);

    if (profileError) { setError(profileError.message); setSaving(false); return; }

    // Update player if exists
    if (player) {
      const { error: playerError } = await supabase.from('players').update({
        first_name: firstName,
        last_name: lastName,
        age_group: ageGroup,
        positions: selectedPositions,
        current_team: currentTeam || null,
        sport: sport,
        city: city || null,
        state: state || null,
        zip_code: zipCode || null,
      }).eq('id', player.id);

      if (playerError) { setError(playerError.message); setSaving(false); return; }
    }

    setSaving(false);
    setSuccess('Profile updated!');
    setTimeout(() => window.location.href = '/dashboard', 1000);
  }

  if (loading) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="text-wheat font-display text-xl animate-pulse">Loading...</div></div>);
  }

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

      <main className="pt-20 pb-24 px-4 max-w-lg mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-8">Edit Profile</h1>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Profile Photo */}
          <div className="flex justify-center mb-2">
            <AvatarUpload currentUrl={avatarUrl} onUpload={(url) => setAvatarUrl(url)} size={96} />
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Your Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" />
          </div>

          {/* Player fields */}
          {player && (
            <>
              <div className="border-t border-wheat/10 pt-5">
                <h2 className="font-display text-lg text-wheat mb-4">Player Details</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">First Name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Sport</label>
                <div className="flex gap-3">
                  {['Baseball', 'Softball'].map((s) => (<button key={s} type="button" onClick={() => setSport(s)} className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all ${sport === s ? 'bg-wheat text-navy' : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{s}</button>))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Age Group</label>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map((ag) => (<button key={ag} type="button" onClick={() => setAgeGroup(ag)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${ageGroup === ag ? 'bg-wheat text-navy' : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{ag}</button>))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Positions</label>
                <div className="flex flex-wrap gap-2">
                  {POSITIONS.map((pos) => (<button key={pos} type="button" onClick={() => togglePosition(pos)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${selectedPositions.includes(pos) ? 'bg-wheat text-navy' : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{pos}</button>))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Current Team <span className="text-offwhite/20">(optional)</span></label>
                <input type="text" value={currentTeam} onChange={(e) => setCurrentTeam(e.target.value)} className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="Team name" />
              </div>
            </>
          )}

          {/* Coach redirect */}
          {isCoach && (
            <div className="rounded-xl bg-navy-light border border-wheat/10 p-4">
              <p className="text-sm text-offwhite/50">To edit your coaching profile (specialty, bio, location), go to <Link href="/coach-setup" className="text-wheat hover:underline">Coach Profile Setup</Link>.</p>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Location</label>
            <div className="grid grid-cols-5 gap-3">
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="col-span-2 p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="City" />
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} className="col-span-1 p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors uppercase" placeholder="ST" />
              <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} maxLength={5} className="col-span-2 p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="Zip code" />
            </div>
          </div>

          {error && (<div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>)}
          {success && (<div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">{success}</div>)}

          <button type="submit" disabled={saving} className="w-full p-4 bg-wheat text-navy font-display text-lg tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  );
}
