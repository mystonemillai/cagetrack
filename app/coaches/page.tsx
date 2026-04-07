'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SPECIALTIES = ['All', 'Hitting', 'Pitching', 'Catching', 'Infield', 'Outfield', '1st Base', '3rd Base', 'Middle Infield', 'Baserunning', 'Fielding', 'Mental Game', 'Strength & Conditioning', 'General'];

export default function CoachDirectoryPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [filteredCoaches, setFilteredCoaches] = useState<any[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [searchState, setSearchState] = useState('');
  const [searchSport, setSearchSport] = useState('All');
  const [searchSpecialty, setSearchSpecialty] = useState('All');
  const [expandedCoach, setExpandedCoach] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile?.city) setSearchCity(profile.city);
      if (profile?.state) setSearchState(profile.state);

      // Load user's players for connecting
      const { data: pl } = await supabase.from('players').select('*').eq('owner_user_id', user.id);
      const { data: linked } = await supabase.from('parent_links').select('player_id').eq('parent_user_id', user.id).eq('status', 'active');
      let allPlayers = pl || [];
      if (linked && linked.length > 0) {
        const linkedIds = linked.map((lp: any) => lp.player_id);
        const { data: lp } = await supabase.from('players').select('*').in('id', linkedIds);
        if (lp) allPlayers = [...allPlayers, ...lp];
      }
      setPlayers(allPlayers);
      const { data: sub } = await supabase.from('subscriptions').select('id').eq('billing_user_id', user.id).eq('status', 'active').single();
      setHasSubscription(!!sub);

      const { data: coachData } = await supabase
        .from('coach_profiles')
        .select('*, profiles(name, email, avatar_url)')
        .eq('is_searchable', true)
        .eq('is_active', true);

      setCoaches(coachData || []);
      setFilteredCoaches(coachData || []);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    let results = [...coaches];
    if (searchState) results = results.filter(c => c.state && c.state.toLowerCase() === searchState.toLowerCase());
    if (searchCity) results = results.filter(c => c.city && c.city.toLowerCase().includes(searchCity.toLowerCase()));
    if (searchSport !== 'All') results = results.filter(c => c.sports && c.sports.includes(searchSport));
    if (searchSpecialty !== 'All') results = results.filter(c => (c.specialties && c.specialties.includes(searchSpecialty)) || c.specialty === searchSpecialty);
    setFilteredCoaches(results);
  }, [searchCity, searchState, searchSport, searchSpecialty, coaches]);

  async function handleConnect(coachId: string) {
    if (!hasSubscription) {
      setConnectError(null);
      setExpandedCoach(null);
      router.push('/settings');
      return;
    }
    if (players.length === 0) {
      setConnectError('Create a player profile first before connecting with a coach.');
      return;
    }
    setConnecting(coachId);
    setConnectError(null);

    const { error } = await supabase.from('player_coaches').insert({
      player_id: players[0].id,
      coach_profile_id: coachId,
      status: 'active',
      invite_code: 'DIR-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      connected_at: new Date().toISOString(),
    });

    if (error) {
      if (error.message.includes('duplicate')) {
        setConnectSuccess(coachId);
        setConnectError(null);
      } else {
        setConnectError(error.message);
      }
      setConnecting(null);
      return;
    }

    setConnectSuccess(coachId);
    setConnecting(null);
  }

  if (loading) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="text-wheat font-display text-xl animate-pulse">Loading...</div></div>);
  }

  return (
    <div className="min-h-screen bg-texture">
      <nav className="fixed top-0 w-full z-50 px-4 py-3 bg-navy/90 backdrop-blur-xl border-b border-wheat/8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-xs -rotate-3">CT</div>
            <span className="font-display text-lg tracking-wider">CAGETRACK</span>
          </Link>
          <Link href="/dashboard" className="text-xs text-offwhite/40 hover:text-wheat transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <main className="pt-20 pb-24 px-4 max-w-3xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl mb-2">Find a Coach</h1>
          <p className="text-offwhite/40">Search for coaches in your area by sport and specialty.</p>
        </div>

        {/* Filters */}
        <div className="rounded-xl bg-navy-light border border-wheat/8 p-5 mb-6 space-y-4 animate-fade-in-delay-1">
          <div className="grid grid-cols-5 gap-3">
            <input type="text" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} className="col-span-3 p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="City" />
            <input type="text" value={searchState} onChange={(e) => setSearchState(e.target.value)} maxLength={2} className="col-span-2 p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors uppercase" placeholder="State (IL)" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Sport</label>
            <div className="flex gap-2">
              {['All', 'Baseball', 'Softball'].map((s) => (
                <button key={s} onClick={() => setSearchSport(s)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${searchSport === s ? 'bg-wheat text-navy' : 'bg-navy border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Specialty</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <button key={s} onClick={() => setSearchSpecialty(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${searchSpecialty === s ? 'bg-wheat text-navy' : 'bg-navy border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Results header */}
        <div className="mb-3 flex justify-between items-center">
          <span className="text-xs text-offwhite/40">{filteredCoaches.length} coach{filteredCoaches.length !== 1 ? 'es' : ''} found</span>
          {(searchCity || searchState || searchSport !== 'All' || searchSpecialty !== 'All') && (
            <button onClick={() => { setSearchCity(''); setSearchState(''); setSearchSport('All'); setSearchSpecialty('All'); }} className="text-xs text-wheat hover:underline">Clear filters</button>
          )}
        </div>

        {connectError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{connectError}</div>
        )}

        {/* Results */}
        {filteredCoaches.length === 0 ? (
          <div className="rounded-xl bg-navy-light border border-wheat/8 p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-wheat/10 flex items-center justify-center mx-auto mb-4 text-2xl">🧢</div>
            <h2 className="font-display text-xl mb-2">No Coaches Found</h2>
            <p className="text-offwhite/40 text-sm max-w-sm mx-auto">
              {searchCity || searchState ? 'Try expanding your search area or adjusting filters.' : 'No coaches have signed up yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCoaches.map((coach) => (
              <div key={coach.id} className="rounded-xl bg-navy-light border border-wheat/8 hover:border-wheat/15 transition-all card-hover">
                <div className="p-5 cursor-pointer" onClick={() => setExpandedCoach(expandedCoach === coach.id ? null : coach.id)}>
                  <div className="flex items-start gap-4">
                    {coach.profiles?.avatar_url ? (
                      <img src={coach.profiles.avatar_url} alt={coach.display_name} className="w-16 h-16 rounded-full object-cover border-2 border-wheat/20 flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-wheat/10 flex items-center justify-center flex-shrink-0 text-2xl">🧢</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-display text-lg tracking-wide text-wheat">{coach.display_name}</h3>
                        <span className={`text-offwhite/20 text-xs transition-transform ${expandedCoach === coach.id ? 'rotate-90' : ''}`}>→</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {coach.specialties && coach.specialties.length > 0 ? (
                          coach.specialties.map((s: string) => <span key={s} className="text-[10px] text-wheat bg-wheat/10 px-2 py-0.5 rounded">{s}</span>)
                        ) : coach.specialty ? (
                          <span className="text-[10px] text-wheat bg-wheat/10 px-2 py-0.5 rounded">{coach.specialty}</span>
                        ) : null}
                        {coach.sports && coach.sports.map((s: string) => (
                          <span key={s} className="text-[10px] text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                      {coach.city && coach.state && (
                        <p className="text-xs text-offwhite/30 mt-2">{coach.city}, {coach.state} {coach.service_radius_miles ? `· ${coach.service_radius_miles} mi radius` : ''}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedCoach === coach.id && (
                  <div className="px-5 pb-5 border-t border-wheat/5 pt-4 animate-fade-in">
                    {coach.bio && (
                      <p className="text-sm text-offwhite/50 leading-relaxed mb-4">{coach.bio}</p>
                    )}
                    {coach.video_intro_url && (
                      <a href={coach.video_intro_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-wheat hover:underline mb-4">▶ Watch Intro Video</a>
                    )}
                    <div className="flex gap-3">
                      {connectSuccess === coach.id ? (
                        <span className="px-6 py-2.5 bg-green-500/10 text-green-400 text-sm font-display tracking-wider rounded-lg">Connected!</span>
                      ) : (
                        <button onClick={() => handleConnect(coach.id)} disabled={connecting === coach.id} className="px-6 py-2.5 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50">
                          {connecting === coach.id ? 'Connecting...' : 'Connect with ' + coach.display_name}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full z-50 bg-navy/95 backdrop-blur-xl border-t border-wheat/8 sm:hidden">
        <div className="flex justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">🏠</span><span className="text-[10px] text-offwhite/30">Home</span></Link>
          <Link href="/drills" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">📋</span><span className="text-[10px] text-offwhite/30">Drills</span></Link>
          <Link href="/coaches" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">🧢</span><span className="text-[10px] text-wheat">Coaches</span></Link>
          <Link href="/settings" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">⚙️</span><span className="text-[10px] text-offwhite/30">Settings</span></Link>
        </div>
      </nav>
    </div>
  );
}
