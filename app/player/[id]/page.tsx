'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function PlayerDetailPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const playerId = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [observations, setObservations] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [aiPlans, setAiPlans] = useState<any[]>([]);
  const [coachProfile, setCoachProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Observation form
  const [showObsForm, setShowObsForm] = useState(false);
  const [obsText, setObsText] = useState('');
  const [obsCategory, setObsCategory] = useState('');
  const [obsSaving, setObsSaving] = useState(false);
  const [obsError, setObsError] = useState('');

  // AI Plan form
  const [showAiForm, setShowAiForm] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  // Drill assignment
  const [showDrillAssign, setShowDrillAssign] = useState(false);
  const [drillSearch, setDrillSearch] = useState('');
  const [drillResults, setDrillResults] = useState<any[]>([]);
  const [assignNote, setAssignNote] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);

  const OBS_CATEGORIES = ['Hitting', 'Pitching', 'Fielding', 'Catching', 'Baserunning', 'Mental Game', 'General'];

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);

      const { data: pl } = await supabase.from('players').select('*').eq('id', playerId).single();
      setPlayer(pl);

      if (p?.role === 'coach') {
        const { data: cp } = await supabase.from('coach_profiles').select('*').eq('user_id', user.id).single();
        setCoachProfile(cp);
      }

      const { data: obs } = await supabase.from('observations').select('*, coach_profiles(display_name)').eq('player_id', playerId).order('created_at', { ascending: false });
      setObservations(obs || []);

      const { data: assigns } = await supabase.from('drill_assignments').select('*, coach_profiles(display_name), master_drills(drill_name, category, description, sets_reps, difficulty), coach_drills(drill_name, category, description, sets_reps, difficulty)').eq('player_id', playerId).order('assigned_at', { ascending: false });
      setAssignments(assigns || []);

      const { data: plans } = await supabase.from('ai_plans').select('*, coach_profiles(display_name)').eq('player_id', playerId).order('created_at', { ascending: false });
      setAiPlans(plans || []);

      setLoading(false);
    }
    loadData();
  }, [playerId]);

  const isCoach = profile?.role === 'coach' && coachProfile;

  async function handleAddObservation(e: React.FormEvent) {
    e.preventDefault();
    if (!coachProfile || !obsText) return;
    setObsError('');
    setObsSaving(true);

    const { error } = await supabase.from('observations').insert({
      player_id: playerId,
      coach_profile_id: coachProfile.id,
      observation_text: obsText,
      category: obsCategory || null,
    });

    if (error) { setObsError(error.message); setObsSaving(false); return; }

    setObsText('');
    setObsCategory('');
    setShowObsForm(false);
    setObsSaving(false);
    window.location.reload();
  }

  async function handleSearchDrills(query: string) {
    setDrillSearch(query);
    if (query.length < 2) { setDrillResults([]); return; }

    const sport = player?.sport || 'Baseball';
    const { data } = await supabase.from('master_drills').select('*').or(`sport.eq.${sport},sport.eq.Both`).ilike('drill_name', `%${query}%`).limit(10);
    setDrillResults(data || []);
  }

  async function handleAssignDrill(drill: any) {
    if (!coachProfile) return;
    setAssignSaving(true);

    const { error } = await supabase.from('drill_assignments').insert({
      player_id: playerId,
      coach_profile_id: coachProfile.id,
      master_drill_id: drill.id,
      coach_notes: assignNote || null,
      status: 'assigned',
    });

    if (error) { setAssignSaving(false); return; }

    setDrillSearch('');
    setDrillResults([]);
    setAssignNote('');
    setShowDrillAssign(false);
    setAssignSaving(false);
    window.location.reload();
  }

  async function handleGenerateAiPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!coachProfile || !aiInput) return;
    setAiError('');
    setAiGenerating(true);

    // For now, generate a placeholder AI response
    // This will be replaced with actual Claude API call
    const aiResponse = generatePlaceholderPlan(aiInput, player);

    const { error } = await supabase.from('ai_plans').insert({
      player_id: playerId,
      coach_profile_id: coachProfile.id,
      observation_id: null,
      input_text: aiInput,
      ai_response: aiResponse,
      status: 'active',
    });

    if (error) { setAiError(error.message); setAiGenerating(false); return; }

    setAiInput('');
    setShowAiForm(false);
    setAiGenerating(false);
    window.location.reload();
  }

  function generatePlaceholderPlan(input: string, player: any) {
    return `**Development Plan for ${player?.first_name || 'Player'}**\n\nBased on observation: "${input}"\n\n**Week 1-2: Foundation**\n- Focus on identifying the root cause\n- 3 sets of targeted reps daily\n- Film review after each session\n\n**Week 3-4: Progression**\n- Increase intensity and game-speed reps\n- Coach feedback after each session\n- Track improvement markers\n\n*This is a placeholder plan. AI-generated plans coming soon with Claude API integration.*`;
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (loading) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="text-wheat font-display text-xl animate-pulse">Loading...</div></div>);
  }

  if (!player) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="text-offwhite/40">Player not found.</div></div>);
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
        {/* Player Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl sm:text-4xl">{player.first_name} {player.last_name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-wheat bg-wheat/10 px-2 py-0.5 rounded">{player.age_group}</span>
            <span className="text-xs text-wheat bg-wheat/10 px-2 py-0.5 rounded">{player.sport || 'Baseball'}</span>
            {player.current_team && <span className="text-xs text-offwhite/40">{player.current_team}</span>}
            {player.city && player.state && <span className="text-xs text-offwhite/30">{player.city}, {player.state}</span>}
          </div>
          {player.positions && player.positions.length > 0 && (
            <div className="flex gap-2 mt-2">
              {player.positions.map((pos: string) => (<span key={pos} className="text-xs text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded">{pos}</span>))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-navy-light rounded-lg p-1 overflow-x-auto">
          {['overview', 'observations', 'drills', 'ai-plans'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-wheat text-navy' : 'text-offwhite/40 hover:text-offwhite/60'}`}>
              {tab === 'overview' ? 'Overview' : tab === 'observations' ? 'Observations' : tab === 'drills' ? 'Drills' : 'AI Plans'}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-navy-light border border-wheat/8 p-4 text-center">
                <div className="font-display text-2xl text-wheat">{observations.length}</div>
                <div className="text-[10px] text-offwhite/40 uppercase tracking-wider mt-1">Observations</div>
              </div>
              <div className="rounded-xl bg-navy-light border border-wheat/8 p-4 text-center">
                <div className="font-display text-2xl text-wheat">{assignments.length}</div>
                <div className="text-[10px] text-offwhite/40 uppercase tracking-wider mt-1">Drills Assigned</div>
              </div>
              <div className="rounded-xl bg-navy-light border border-wheat/8 p-4 text-center">
                <div className="font-display text-2xl text-wheat">{aiPlans.length}</div>
                <div className="text-[10px] text-offwhite/40 uppercase tracking-wider mt-1">AI Plans</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
              <h2 className="font-display text-lg text-wheat mb-4">Recent Activity</h2>
              {observations.length === 0 && assignments.length === 0 && aiPlans.length === 0 ? (
                <p className="text-sm text-offwhite/30 text-center py-4">No activity yet. {isCoach ? 'Start by adding an observation.' : 'Ask your coach to log observations and assign drills.'}</p>
              ) : (
                <div className="space-y-3">
                  {[...observations.map(o => ({ type: 'observation', date: o.created_at, data: o })),
                    ...assignments.map(a => ({ type: 'drill', date: a.assigned_at, data: a })),
                    ...aiPlans.map(p => ({ type: 'ai', date: p.created_at, data: p }))
                  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8).map((item, i) => (
                    <div key={i} className="flex gap-3 items-start py-2 border-b border-wheat/5 last:border-0">
                      <div className="text-lg mt-0.5">{item.type === 'observation' ? '👁️' : item.type === 'drill' ? '📋' : '🧠'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-offwhite/80 line-clamp-2">
                          {item.type === 'observation' && item.data.observation_text}
                          {item.type === 'drill' && `Drill assigned: ${item.data.master_drills?.drill_name || item.data.coach_drills?.drill_name || 'Custom drill'}`}
                          {item.type === 'ai' && `AI Plan: ${item.data.input_text}`}
                        </div>
                        <div className="text-[10px] text-offwhite/30 mt-1">
                          {item.data.coach_profiles?.display_name || 'Coach'} · {formatTime(item.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coach Quick Actions */}
            {isCoach && (
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => { setActiveTab('observations'); setShowObsForm(true); }} className="rounded-xl bg-navy-light border border-wheat/8 p-4 text-center hover:border-wheat/20 transition-all">
                  <div className="text-xl mb-1">👁️</div>
                  <div className="text-[10px] text-offwhite/50">Add Observation</div>
                </button>
                <button onClick={() => { setActiveTab('drills'); setShowDrillAssign(true); }} className="rounded-xl bg-navy-light border border-wheat/8 p-4 text-center hover:border-wheat/20 transition-all">
                  <div className="text-xl mb-1">📋</div>
                  <div className="text-[10px] text-offwhite/50">Assign Drill</div>
                </button>
                <button onClick={() => { setActiveTab('ai-plans'); setShowAiForm(true); }} className="rounded-xl bg-navy-light border border-wheat/8 p-4 text-center hover:border-wheat/20 transition-all">
                  <div className="text-xl mb-1">🧠</div>
                  <div className="text-[10px] text-offwhite/50">AI Plan</div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* OBSERVATIONS TAB */}
        {activeTab === 'observations' && (
          <div className="space-y-4">
            {isCoach && (
              <div className="rounded-xl bg-navy-light border border-wheat/10 p-6">
                <h3 className="font-display text-lg text-wheat mb-3">Add Observation</h3>
                <form onSubmit={handleAddObservation} className="space-y-3">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-offwhite/40 mb-2">Category <span className="text-offwhite/20">(optional)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {OBS_CATEGORIES.map((cat) => (
                        <button key={cat} type="button" onClick={() => setObsCategory(obsCategory === cat ? '' : cat)} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${obsCategory === cat ? 'bg-wheat text-navy' : 'bg-navy border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{cat}</button>
                      ))}
                    </div>
                  </div>
                  <textarea value={obsText} onChange={(e) => setObsText(e.target.value)} rows={4} required className="w-full p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors resize-none" placeholder="What are you seeing? Be specific — dropping back elbow, stepping in the bucket, good bat path but needs to stay through the ball..." />
                  {obsError && <p className="text-red-400 text-xs">{obsError}</p>}
                  <button type="submit" disabled={obsSaving || !obsText} className="px-6 py-2 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50">{obsSaving ? 'Saving...' : 'Save Observation'}</button>
                </form>
              </div>
            )}

            {observations.length === 0 ? (
              <div className="text-center py-8 text-offwhite/30 text-sm">No observations yet.</div>
            ) : (
              observations.map((obs) => (
                <div key={obs.id} className="rounded-xl bg-navy-light border border-wheat/8 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-wheat">{obs.coach_profiles?.display_name || 'Coach'}</span>
                      {obs.category && <span className="text-[10px] text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded">{obs.category}</span>}
                    </div>
                    <span className="text-[10px] text-offwhite/25">{formatDate(obs.created_at)}</span>
                  </div>
                  <p className="text-sm text-offwhite/70 leading-relaxed">{obs.observation_text}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* DRILLS TAB */}
        {activeTab === 'drills' && (
          <div className="space-y-4">
            {isCoach && (
              <div className="rounded-xl bg-navy-light border border-wheat/10 p-6">
                <h3 className="font-display text-lg text-wheat mb-3">Assign a Drill</h3>
                <input type="text" value={drillSearch} onChange={(e) => handleSearchDrills(e.target.value)} className="w-full p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors mb-2" placeholder="Search drills by name..." />
                {drillResults.length > 0 && (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {drillResults.map((drill) => (
                      <div key={drill.id} className="p-3 bg-navy rounded-lg border border-wheat/8 hover:border-wheat/20 transition-all cursor-pointer" onClick={() => handleAssignDrill(drill)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium">{drill.drill_name}</div>
                            <div className="text-[10px] text-offwhite/40 mt-0.5">{drill.category} · {drill.difficulty} · {drill.sets_reps}</div>
                          </div>
                          <span className="text-wheat text-xs">+ Assign</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {drillSearch.length >= 2 && drillResults.length === 0 && (
                  <p className="text-xs text-offwhite/30 py-2">No drills found matching "{drillSearch}"</p>
                )}
              </div>
            )}

            {assignments.length === 0 ? (
              <div className="text-center py-8 text-offwhite/30 text-sm">No drills assigned yet.</div>
            ) : (
              assignments.map((assign) => {
                const drill = assign.master_drills || assign.coach_drills;
                return (
                  <div key={assign.id} className="rounded-xl bg-navy-light border border-wheat/8 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold">{drill?.drill_name || 'Custom Drill'}</h4>
                        <div className="flex gap-2 mt-1">
                          {drill?.category && <span className="text-[10px] text-wheat bg-wheat/10 px-2 py-0.5 rounded">{drill.category}</span>}
                          {drill?.difficulty && <span className="text-[10px] text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded">{drill.difficulty}</span>}
                          <span className={`text-[10px] px-2 py-0.5 rounded ${assign.status === 'completed' ? 'text-green-400 bg-green-400/10' : assign.status === 'in_progress' ? 'text-yellow-400 bg-yellow-400/10' : 'text-offwhite/30 bg-offwhite/5'}`}>{assign.status}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-offwhite/25">{formatDate(assign.assigned_at)}</span>
                    </div>
                    {drill?.description && <p className="text-xs text-offwhite/40 mt-2 line-clamp-2">{drill.description}</p>}
                    {drill?.sets_reps && <p className="text-xs text-offwhite/50 mt-1">{drill.sets_reps}</p>}
                    {assign.coach_notes && <p className="text-xs text-wheat/60 mt-2 italic">Coach: {assign.coach_notes}</p>}
                    <div className="text-[10px] text-offwhite/25 mt-2">Assigned by {assign.coach_profiles?.display_name || 'Coach'}</div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* AI PLANS TAB */}
        {activeTab === 'ai-plans' && (
          <div className="space-y-4">
            {isCoach && (
              <div className="rounded-xl bg-navy-light border border-wheat/10 p-6">
                <h3 className="font-display text-lg text-wheat mb-1">Generate AI Development Plan</h3>
                <p className="text-xs text-offwhite/40 mb-4">Describe what you're observing and CageTrack AI will create a targeted drill plan.</p>
                <form onSubmit={handleGenerateAiPlan} className="space-y-3">
                  <textarea value={aiInput} onChange={(e) => setAiInput(e.target.value)} rows={4} required className="w-full p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none transition-colors resize-none" placeholder="Dropping back elbow on outside pitches. Gets jammed inside but decent bat path when he stays through the ball..." />
                  {aiError && <p className="text-red-400 text-xs">{aiError}</p>}
                  <button type="submit" disabled={aiGenerating || !aiInput} className="px-6 py-2 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors disabled:opacity-50">{aiGenerating ? 'Generating Plan...' : 'Generate AI Plan'}</button>
                </form>
              </div>
            )}

            {aiPlans.length === 0 ? (
              <div className="text-center py-8 text-offwhite/30 text-sm">No AI plans yet.</div>
            ) : (
              aiPlans.map((plan) => (
                <div key={plan.id} className="rounded-xl bg-navy-light border border-wheat/8 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold text-wheat">{plan.coach_profiles?.display_name || 'Coach'}</span>
                    <span className="text-[10px] text-offwhite/25">{formatDate(plan.created_at)}</span>
                  </div>
                  <div className="mb-3 p-3 bg-navy rounded-lg border border-wheat/10">
                    <div className="text-[10px] uppercase tracking-widest text-offwhite/30 mb-1">Coach Observation</div>
                    <p className="text-sm text-offwhite/60 italic">{plan.input_text}</p>
                  </div>
                  <div className="text-sm text-offwhite/70 leading-relaxed whitespace-pre-line">{plan.ai_response}</div>
                </div>
              ))
            )}
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
