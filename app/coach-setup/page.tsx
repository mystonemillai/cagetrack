'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SPECIALTIES = ['Hitting', 'Pitching', 'Catching', 'Fielding', 'Baserunning', 'Mental Game', 'Strength & Conditioning', 'General'];
const COACH_TYPES = ['Head Coach', 'Hitting Coach', 'Pitching Coach', 'Catching Coach', 'Private Instructor', 'Strength Coach', 'Mental Performance', 'Other'];

export default function CoachSetupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [existingProfile, setExistingProfile] = useState<any>(null);

  const [displayName, setDisplayName] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [coachType, setCoachType] = useState('');
  const [bio, setBio] = useState('');
  const [videoIntroUrl, setVideoIntroUrl] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [sports, setSports] = useState<string[]>(['Baseball']);
  const [isSearchable, setIsSearchable] = useState(true);
  const [serviceRadius, setServiceRadius] = useState(25);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUserId(user.id);

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      const { data: cp } = await supabase.from('coach_profiles').select('*').eq('user_id', user.id).single();

      if (cp) {
        setExistingProfile(cp);
        setDisplayName(cp.display_name || '');
        setSpecialties(cp.specialties || (cp.specialty ? [cp.specialty] : []));
        setCoachType(cp.coach_type || '');
        setBio(cp.bio || '');
        setVideoIntroUrl(cp.video_intro_url || '');
        setCity(cp.city || '');
        setState(cp.state || '');
        setZipCode(cp.zip_code || '');
        setSports(cp.sports || ['Baseball']);
        setIsSearchable(cp.is_searchable !== false);
        setServiceRadius(cp.service_radius_miles || 25);
      } else {
        setDisplayName(profile?.name || '');
        setCity(profile?.city || '');
        setState(profile?.state || '');
        setZipCode(profile?.zip_code || '');
      }

      setLoading(false);
    }
    loadData();
  }, []);

  function toggleSpecialty(spec: string) {
    setSpecialties(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);
  }

  function toggleSport(sport: string) {
    setSports(prev => prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (!displayName) { setError('Display name is required.'); setSaving(false); return; }

    // Geocode zip code if provided
    let latitude = null;
    let longitude = null;
    if (zipCode) {
      try {
        const geoRes = await fetch(`/api/geocode?zip=${zipCode}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          latitude = geoData.latitude;
          longitude = geoData.longitude;
        }
      } catch (e) {}
    }

    const profileData = {
      user_id: userId,
      display_name: displayName,
      specialty: specialties.length > 0 ? specialties[0] : null,
      specialties: specialties,
      coach_type: coachType.toLowerCase().replace(/ /g, '_') || null,
      bio: bio || null,
      video_intro_url: videoIntroUrl || null,
      city: city || null,
      state: state || null,
      zip_code: zipCode || null,
      sports: sports,
      is_searchable: isSearchable,
      service_radius_miles: serviceRadius,
      is_active: true,
      latitude: latitude,
      longitude: longitude,
    };

    if (existingProfile) {
      const { error: updateError } = await supabase.from('coach_profiles').update(profileData).eq('id', existingProfile.id);
      if (updateError) { setError(updateError.message); setSaving(false); return; }
    } else {
      const { error: insertError } = await supabase.from('coach_profiles').insert(profileData);
      if (insertError) { setError(insertError.message); setSaving(false); return; }
    }

    if (city || state || zipCode) {
      await supabase.from('profiles').update({ city: city || null, state: state || null, zip_code: zipCode || null }).eq('id', userId);
    }

    setSaving(false);
    window.location.href = '/dashboard';
  }

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

      <main className="pt-20 pb-24 px-4 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-wheat/10 flex items-center justify-center mx-auto mb-4 text-2xl">🧢</div>
          <h1 className="font-display text-3xl sm:text-4xl mb-2">{existingProfile ? 'Edit Coach Profile' : 'Set Up Coach Profile'}</h1>
          <p className="text-offwhite/40">Build your profile so players and families can find you.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="Coach Nick" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Sport(s) You Coach</label>
            <div className="flex gap-3">
              {['Baseball', 'Softball'].map((sport) => (
                <button key={sport} type="button" onClick={() => toggleSport(sport)} className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all ${sports.includes(sport) ? 'bg-wheat text-navy' : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{sport}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Specialties <span className="text-offwhite/20">(select all that apply)</span></label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <button key={s} type="button" onClick={() => toggleSpecialty(s)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${specialties.includes(s) ? 'bg-wheat text-navy' : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{s}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Coach Type</label>
            <div className="flex flex-wrap gap-2">
              {COACH_TYPES.map((ct) => (
                <button key={ct} type="button" onClick={() => setCoachType(ct)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${coachType === ct ? 'bg-wheat text-navy' : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{ct}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Bio <span className="text-offwhite/20">(optional)</span></label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors resize-none" placeholder="Tell players and families about your coaching background, philosophy, and experience..." />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Video Intro URL <span className="text-offwhite/20">(optional)</span></label>
            <input type="url" value={videoIntroUrl} onChange={(e) => setVideoIntroUrl(e.target.value)} className="w-full p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="https://youtube.com/watch?v=..." />
            <p className="text-[11px] text-offwhite/25 mt-1.5">YouTube or Vimeo link to introduce yourself to potential players.</p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Location</label>
            <div className="grid grid-cols-5 gap-3">
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="col-span-2 p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="City" />
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} className="col-span-1 p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors uppercase" placeholder="ST" />
              <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} maxLength={5} className="col-span-2 p-3 bg-navy-light border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="Zip code" />
            </div>
            <p className="text-[11px] text-offwhite/25 mt-1.5">Helps players and families find you in the coach directory.</p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Service Radius</label>
            <div className="flex items-center gap-3">
              <input type="range" min="5" max="100" step="5" value={serviceRadius} onChange={(e) => setServiceRadius(Number(e.target.value))} className="flex-1" />
              <span className="text-sm text-offwhite/60 min-w-[60px] text-right">{serviceRadius} miles</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-navy-light border border-wheat/10 rounded-lg">
            <div>
              <div className="text-sm font-medium">Show in Coach Directory</div>
              <div className="text-xs text-offwhite/40">Let players and families find you by location.</div>
            </div>
            <button type="button" onClick={() => setIsSearchable(!isSearchable)} className={`w-12 h-6 rounded-full transition-colors relative ${isSearchable ? 'bg-wheat' : 'bg-offwhite/20'}`}>
              <div className={`w-5 h-5 rounded-full bg-navy absolute top-0.5 transition-transform ${isSearchable ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {error && (<div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>)}

          <button type="submit" disabled={saving} className="w-full p-4 bg-wheat text-navy font-display text-lg tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : existingProfile ? 'Save Changes' : 'Create Coach Profile'}
          </button>
        </form>
      </main>
    </div>
  );
}
