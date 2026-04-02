'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DRILL_CATEGORIES = ['Hitting', 'Pitching Fundamentals', 'Pitching Accuracy', 'Pitcher Recovery', 'Catcher', 'First Base', 'Third Base', 'Middle Infield', 'Infield Fundamentals', 'Outfield Fundamentals', 'Center Field', 'Corner Outfield', 'Mental Game'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export default function MyDrillsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [coachProfile, setCoachProfile] = useState<any>(null);
  const [drills, setDrills] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDrill, setEditingDrill] = useState<any>(null);

  const [drillName, setDrillName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [coachingPoints, setCoachingPoints] = useState('');
  const [setsReps, setSetsReps] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sport, setSport] = useState('Both');
  const [videoUrl, setVideoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: cp } = await supabase.from('coach_profiles').select('*').eq('user_id', user.id).single();
      setCoachProfile(cp);

      if (cp) {
        const { data: d } = await supabase.from('coach_drills').select('*').eq('coach_profile_id', cp.id).eq('is_active', true).order('created_at', { ascending: false });
        setDrills(d || []);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  function resetForm() {
    setDrillName(''); setCategory(''); setDescription(''); setCoachingPoints('');
    setSetsReps(''); setDifficulty(''); setSport('Both'); setVideoUrl('');
    setEditingDrill(null); setError('');
  }

  function handleEdit(drill: any) {
    setDrillName(drill.drill_name);
    setCategory(drill.category);
    setDescription(drill.description || '');
    setCoachingPoints(drill.coaching_points || '');
    setSetsReps(drill.sets_reps || '');
    setDifficulty(drill.difficulty || '');
    setSport(drill.sport || 'Both');
    setVideoUrl(drill.video_url || '');
    setEditingDrill(drill);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!coachProfile) return;
    if (!drillName || !category) { setError('Drill name and category are required.'); return; }
    setError(''); setSaving(true);

    const drillData = {
      coach_profile_id: coachProfile.id,
      drill_name: drillName,
      category: category,
      description: description || null,
      coaching_points: coachingPoints || null,
      sets_reps: setsReps || null,
      difficulty: difficulty || null,
      sport: sport,
      video_url: videoUrl || null,
      is_active: true,
    };

    if (editingDrill) {
      const { error: updateErr } = await supabase.from('coach_drills').update(drillData).eq('id', editingDrill.id);
      if (updateErr) { setError(updateErr.message); setSaving(false); return; }
    } else {
      const { error: insertErr } = await supabase.from('coach_drills').insert(drillData);
      if (insertErr) { setError(insertErr.message); setSaving(false); return; }
    }

    setSaving(false);
    resetForm();
    setShowForm(false);
    window.location.reload();
  }

  async function handleDelete(drillId: string) {
    if (!confirm('Delete this drill?')) return;
    await supabase.from('coach_drills').update({ is_active: false }).eq('id', drillId);
    window.location.reload();
  }

  if (loading) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="text-wheat font-display text-xl animate-pulse">Loading...</div></div>);
  }

  if (!coachProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="font-display text-2xl mb-4">Set Up Your Coach Profile First</h2>
          <p className="text-offwhite/40 mb-6">You need a coach profile before creating drills.</p>
          <Link href="/coach-setup" className="px-6 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg">Set Up Profile</Link>
        </div>
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
          <Link href="/dashboard" className="text-xs text-offwhite/40 hover:text-wheat transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <main className="pt-20 pb-24 px-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl">My Drills</h1>
            <p className="text-offwhite/40 mt-1">Your personal drill library. Assign these to any player you coach.</p>
          </div>
          {!showForm && (
            <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-wheat text-navy font-display text-xs tracking-wider rounded-lg hover:bg-wheat/90 transition-colors">+ New Drill</button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="rounded-xl bg-navy-light border border-wheat/10 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-wheat">{editingDrill ? 'Edit Drill' : 'Create New Drill'}</h2>
              <button onClick={() => { resetForm(); setShowForm(false); }} className="text-xs text-offwhite/30 hover:text-wheat">Cancel</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Drill Name</label>
                <input type="text" value={drillName} onChange={(e) => setDrillName(e.target.value)} required className="w-full p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="Name your drill" />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {DRILL_CATEGORIES.map((cat) => (
                    <button key={cat} type="button" onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${category === cat ? 'bg-wheat text-navy' : 'bg-navy border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{cat}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Sport</label>
                <div className="flex gap-2">
                  {['Baseball', 'Softball', 'Both'].map((s) => (
                    <button key={s} type="button" onClick={() => setSport(s)} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${sport === s ? 'bg-wheat text-navy' : 'bg-navy border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors resize-none" placeholder="Describe what the player does in this drill..." />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Coaching Points</label>
                <textarea value={coachingPoints} onChange={(e) => setCoachingPoints(e.target.value)} rows={2} className="w-full p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors resize-none" placeholder="Key things to focus on..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Sets/Reps</label>
                  <input type="text" value={setsReps} onChange={(e) => setSetsReps(e.target.value)} className="w-full p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="3 sets of 10" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Difficulty</label>
                  <div className="flex gap-2">
                    {DIFFICULTIES.map((d) => (
                      <button key={d} type="button" onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${difficulty === d ? 'bg-wheat text-navy' : 'bg-navy border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{d}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Video Link <span className="text-offwhite/20">(optional)</span></label>
                <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors" placeholder="YouTube or Vimeo link" />
                <p className="text-[11px] text-offwhite/25 mt-1.5">Add a video demonstration for players to reference.</p>
              </div>

              {error && (<div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>)}

              <button type="submit" disabled={saving} className="w-full p-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : editingDrill ? 'Save Changes' : 'Create Drill'}
              </button>
            </form>
          </div>
        )}

        {/* Drill List */}
        {drills.length === 0 && !showForm ? (
          <div className="rounded-xl bg-navy-light border border-wheat/8 p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-wheat/10 flex items-center justify-center mx-auto mb-4 text-2xl">✏️</div>
            <h2 className="font-display text-xl mb-2">No Custom Drills Yet</h2>
            <p className="text-offwhite/40 text-sm max-w-sm mx-auto mb-6">Create your own drills with descriptions, coaching points, and video demos. Assign them to any player you coach.</p>
            <button onClick={() => { resetForm(); setShowForm(true); }} className="px-6 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors">Create Your First Drill</button>
          </div>
        ) : (
          <div className="space-y-3">
            {drills.map((drill) => (
              <div key={drill.id} className="rounded-xl bg-navy-light border border-wheat/8 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold">{drill.drill_name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="text-[10px] text-wheat bg-wheat/10 px-2 py-0.5 rounded">{drill.category}</span>
                      {drill.difficulty && <span className="text-[10px] text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded">{drill.difficulty}</span>}
                      {drill.sport && <span className="text-[10px] text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded">{drill.sport}</span>}
                      {drill.sets_reps && <span className="text-[10px] text-offwhite/25">{drill.sets_reps}</span>}
                    </div>
                    {drill.description && <p className="text-xs text-offwhite/40 mt-2 line-clamp-2">{drill.description}</p>}
                    {drill.coaching_points && <p className="text-xs text-offwhite/30 mt-1 line-clamp-1 italic">{drill.coaching_points}</p>}
                    {drill.video_url && (
                      <a href={drill.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-wheat hover:underline">▶ Watch Demo</a>
                    )}
                  </div>
                  <div className="flex gap-2 ml-3 flex-shrink-0">
                    <button onClick={() => handleEdit(drill)} className="text-xs text-offwhite/30 hover:text-wheat transition-colors">Edit</button>
                    <button onClick={() => handleDelete(drill.id)} className="text-xs text-red-400/40 hover:text-red-400 transition-colors">Delete</button>
                  </div>
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
          <Link href="/coaches" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">🧢</span><span className="text-[10px] text-offwhite/30">Coaches</span></Link>
          <Link href="/settings" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">⚙️</span><span className="text-[10px] text-offwhite/30">Settings</span></Link>
        </div>
      </nav>
    </div>
  );
}
