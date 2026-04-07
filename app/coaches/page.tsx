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
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);

      // Pre-fill location from user profile
      if (profile?.city) setSearchCity(profile.city);
      if (profile?.state) setSearchState(profile.state);

      // Load all searchable coaches
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

    if (searchState) {
      results = results.filter(c => c.state && c.state.toLowerCase() === searchState.toLowerCase());
    }

    if (searchCity) {
      results = results.filter(c => c.city && c.city.toLowerCase().includes(searchCity.toLowerCase()));
    }

    if (searchSport !== 'All') {
      results = results.filter(c => c.sports && c.sports.includes(searchSport));
    }

    if (searchSpecialty !== 'All') {
      results = results.filter(c => (c.specialties && c.specialties.includes(searchSpecialty)) || c.specialty === searchSpecialty);
    }

    setFilteredCoaches(results);
  }, [searchCity, searchState, searchSport, searchSpecialty, coaches]);

  if (loading) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="text-wheat font-display text-xl animate-pulse">Loading...</div></div>);
  }

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

      <main className="pt-20 pb-24 px-4 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-2">Find a Coach</h1>
        <p className="text-offwhite/40 mb-6">Search for coaches in your area by sport and specialty.</p>

        {/* Search Filters */}
        <div className="rounded-xl bg-navy-light border border-wheat/8 p-5 mb-6 space-y-4">
          <div className="grid grid-cols-5 gap-3">
            <input type="text" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} className="col-span-3 p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="City" />
            <input type="text" value={searchState} onChange={(e) => setSearchState(e.target.value)} maxLength={2} className="col-span-2 p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors uppercase" placeholder="State (IL)" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Sport</label>
            <div className="flex gap-2">
              {['All', 'Baseball', 'Softball'].map((s) => (
                <button key={s} onClick={() => setSearchSport(s)} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${searchSport === s ? 'bg-wheat text-navy' : 'bg-navy border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{s}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Specialty</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <button key={s} onClick={() => setSearchSpecialty(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${searchSpecialty === s ? 'bg-wheat text-navy' : 'bg-navy border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-3 flex justify-between items-center">
          <span className="text-xs text-offwhite/40">{filteredCoaches.length} coach{filteredCoaches.length !== 1 ? 'es' : ''} found</span>
          {(searchCity || searchState !== '' || searchSport !== 'All' || searchSpecialty !== 'All') && (
            <button onClick={() => { setSearchCity(''); setSearchState(''); setSearchSport('All'); setSearchSpecialty('All'); }} className="text-xs text-wheat hover:underline">Clear filters</button>
          )}
        </div>

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
              <div key={coach.id} className="rounded-xl bg-navy-light border border-wheat/8 p-5 hover:border-wheat/20 transition-all">
                <div className="flex items-start gap-4">
                  {coach.profiles?.avatar_url ? (
                    <img src={coach.profiles.avatar_url} alt={coach.display_name} className="w-14 h-14 rounded-full object-cover border border-wheat/20 flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-wheat/10 flex items-center justify-center flex-shrink-0 text-xl">🧢</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg tracking-wide text-wheat">{coach.display_name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {coach.specialties && coach.specialties.length > 0 ? (
                        coach.specialties.map((s: string) => <span key={s} className="text-[10px] text-wheat bg-wheat/10 px-2 py-0.5 rounded">{s}</span>)
                      ) : coach.specialty ? (
                        <span className="text-[10px] text-wheat bg-wheat/10 px-2 py-0.5 rounded">{coach.specialty}</span>
                      ) : null}
                      {coach.coach_type && (
                        <span className="text-[10px] text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded capitalize">{coach.coach_type.replace(/_/g, ' ')}</span>
                      )}
                      {coach.sports && coach.sports.map((s: string) => (
                        <span key={s} className="text-[10px] text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                    {coach.city && coach.state && (
                      <p className="text-xs text-offwhite/30 mt-1.5">{coach.city}, {coach.state} {coach.service_radius_miles ? `· ${coach.service_radius_miles} mi radius` : ''}</p>
                    )}
                    {coach.bio && (
                      <p className="text-xs text-offwhite/40 mt-2 line-clamp-2">{coach.bio}</p>
                    )}
                  </div>
                  {coach.video_intro_url && (
                    <a href={coach.video_intro_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 ml-3 px-3 py-1.5 bg-wheat/10 border border-wheat/20 text-wheat text-xs rounded-md hover:bg-wheat/20 transition-colors">
                      Watch Intro
                    </a>
                  )}
                </div>
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
