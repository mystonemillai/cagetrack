'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ADMIN_EMAIL = 'cagetrack@gmail.com';

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Stats
  const [stats, setStats] = useState({ users: 0, players: 0, coaches: 0, families: 0, observations: 0, drillAssignments: 0, aiPlans: 0, messages: 0, subscriptions: 0, drills: 0 });

  // Users
  const [users, setUsers] = useState<any[]>([]);

  // Drills
  const [drills, setDrills] = useState<any[]>([]);
  const [drillFilter, setDrillFilter] = useState('');

  // Drill form
  const [showDrillForm, setShowDrillForm] = useState(false);
  const [editDrill, setEditDrill] = useState<any>(null);
  const [dName, setDName] = useState('');
  const [dCategory, setDCategory] = useState('');
  const [dDescription, setDDescription] = useState('');
  const [dCoachingPoints, setDCoachingPoints] = useState('');
  const [dSetsReps, setDSetsReps] = useState('');
  const [dDifficulty, setDDifficulty] = useState('');
  const [dSport, setDSport] = useState('Both');
  const [dSaving, setDSaving] = useState(false);

  const CATEGORIES = ['Hitting', 'Pitching Fundamentals', 'Pitching Accuracy', 'Pitcher Recovery', 'Catcher', 'First Base', 'Third Base', 'Middle Infield', 'Infield Fundamentals', 'Outfield Fundamentals', 'Center Field', 'Corner Outfield', 'Mental Game'];

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: profile } = await supabase.from('profiles').select('email').eq('id', user.id).single();
      if (profile?.email !== ADMIN_EMAIL) { router.push('/dashboard'); return; }

      setAuthorized(true);
      await loadStats();
      await loadUsers();
      await loadDrills();
      setLoading(false);
    }
    checkAuth();
  }, []);

  async function loadStats() {
    const [{ count: users }, { count: players }, { count: coaches }, { count: families }, { count: observations }, { count: drillAssignments }, { count: aiPlans }, { count: messages }, { count: subscriptions }, { count: drills }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('players').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'coach'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'family'),
      supabase.from('observations').select('*', { count: 'exact', head: true }),
      supabase.from('drill_assignments').select('*', { count: 'exact', head: true }),
      supabase.from('ai_plans').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('master_drills').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ]);
    setStats({ users: users || 0, players: players || 0, coaches: coaches || 0, families: families || 0, observations: observations || 0, drillAssignments: drillAssignments || 0, aiPlans: aiPlans || 0, messages: messages || 0, subscriptions: subscriptions || 0, drills: drills || 0 });
  }

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
  }

  async function loadDrills() {
    const { data } = await supabase.from('master_drills').select('*').eq('is_active', true).order('category').order('sort_order');
    setDrills(data || []);
  }

  function openDrillForm(drill?: any) {
    if (drill) {
      setEditDrill(drill);
      setDName(drill.drill_name);
      setDCategory(drill.category);
      setDDescription(drill.description || '');
      setDCoachingPoints(drill.coaching_points || '');
      setDSetsReps(drill.sets_reps || '');
      setDDifficulty(drill.difficulty || '');
      setDSport(drill.sport || 'Both');
    } else {
      setEditDrill(null);
      setDName(''); setDCategory(''); setDDescription(''); setDCoachingPoints(''); setDSetsReps(''); setDDifficulty(''); setDSport('Both');
    }
    setShowDrillForm(true);
  }

  async function handleSaveDrill(e: React.FormEvent) {
    e.preventDefault();
    if (!dName || !dCategory) return;
    setDSaving(true);

    const drillData = {
      drill_name: dName, category: dCategory, description: dDescription || null,
      coaching_points: dCoachingPoints || null, sets_reps: dSetsReps || null,
      difficulty: dDifficulty || null, sport: dSport, is_active: true,
    };

    if (editDrill) {
      await supabase.from('master_drills').update(drillData).eq('id', editDrill.id);
    } else {
      await supabase.from('master_drills').insert({ ...drillData, sort_order: drills.length });
    }

    setDSaving(false);
    setShowDrillForm(false);
    await loadDrills();
    await loadStats();
  }

  async function handleDeleteDrill(id: string) {
    if (!confirm('Deactivate this drill?')) return;
    await supabase.from('master_drills').update({ is_active: false }).eq('id', id);
    await loadDrills();
    await loadStats();
  }

  const filteredDrills = drillFilter ? drills.filter(d => d.category === drillFilter) : drills;

  if (loading) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="text-wheat font-display text-xl animate-pulse">Loading...</div></div>);
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 px-4 py-3 bg-navy/90 backdrop-blur-xl border-b border-wheat/8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-xs -rotate-3">CT</div>
            <span className="font-display text-lg tracking-wider">CAGETRACK</span>
          </Link>
          <span className="text-xs text-red-400 font-display tracking-wider">ADMIN</span>
        </div>
      </nav>

      <main className="pt-20 pb-24 px-4 max-w-5xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-6">Admin Panel</h1>

        <div className="flex gap-1 mb-6 bg-navy-light rounded-lg p-1 overflow-x-auto">
          {['overview', 'users', 'drills'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-wheat text-navy' : 'text-offwhite/40 hover:text-offwhite/60'}`}>
              {tab === 'overview' ? 'Overview' : tab === 'users' ? 'Users' : 'Drill Library'}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatCard label="Total Users" value={stats.users} />
              <StatCard label="Players" value={stats.players} />
              <StatCard label="Coaches" value={stats.coaches} />
              <StatCard label="Families" value={stats.families} />
              <StatCard label="Active Subs" value={stats.subscriptions} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Observations" value={stats.observations} />
              <StatCard label="Drill Assigns" value={stats.drillAssignments} />
              <StatCard label="AI Plans" value={stats.aiPlans} />
              <StatCard label="Messages" value={stats.messages} />
            </div>
            <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
              <h2 className="font-display text-lg text-wheat mb-3">Master Drill Library</h2>
              <div className="flex items-center justify-between">
                <span className="text-sm text-offwhite/40">{stats.drills} active drills</span>
                <button onClick={() => setActiveTab('drills')} className="text-xs text-wheat hover:underline">Manage →</button>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <div className="text-xs text-offwhite/40 mb-2">{users.length} total users</div>
            {users.map((user) => (
              <div key={user.id} className="rounded-xl bg-navy-light border border-wheat/8 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-wheat/20" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-wheat/10 flex items-center justify-center text-xs">👤</div>
                    )}
                    <div>
                      <div className="text-sm font-medium">{user.name || 'No name'}</div>
                      <div className="text-[10px] text-offwhite/30">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${user.role === 'coach' ? 'text-blue-400 bg-blue-400/10' : user.role === 'family' ? 'text-green-400 bg-green-400/10' : 'text-wheat bg-wheat/10'}`}>{user.role}</span>
                    {user.city && user.state && <span className="text-[10px] text-offwhite/20">{user.city}, {user.state}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DRILLS */}
        {activeTab === 'drills' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setDrillFilter('')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${!drillFilter ? 'bg-wheat text-navy' : 'bg-navy border border-wheat/10 text-offwhite/50'}`}>All ({drills.length})</button>
                {CATEGORIES.map((cat) => {
                  const count = drills.filter(d => d.category === cat).length;
                  if (count === 0) return null;
                  return <button key={cat} onClick={() => setDrillFilter(cat)} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${drillFilter === cat ? 'bg-wheat text-navy' : 'bg-navy border border-wheat/10 text-offwhite/50'}`}>{cat} ({count})</button>;
                })}
              </div>
              <button onClick={() => openDrillForm()} className="px-4 py-2 bg-wheat text-navy font-display text-xs tracking-wider rounded-lg hover:bg-wheat/90">+ Add Drill</button>
            </div>

            {showDrillForm && (
              <div className="rounded-xl bg-navy-light border border-wheat/10 p-6">
                <div className="flex justify-between mb-4">
                  <h3 className="font-display text-lg text-wheat">{editDrill ? 'Edit Drill' : 'Add Drill'}</h3>
                  <button onClick={() => setShowDrillForm(false)} className="text-xs text-offwhite/30 hover:text-wheat">Cancel</button>
                </div>
                <form onSubmit={handleSaveDrill} className="space-y-3">
                  <input type="text" value={dName} onChange={(e) => setDName(e.target.value)} required className="w-full p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none" placeholder="Drill name" />
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button key={cat} type="button" onClick={() => setDCategory(cat)} className={`px-3 py-1 rounded-md text-xs font-medium ${dCategory === cat ? 'bg-wheat text-navy' : 'bg-navy border border-wheat/10 text-offwhite/50'}`}>{cat}</button>
                    ))}
                  </div>
                  <textarea value={dDescription} onChange={(e) => setDDescription(e.target.value)} rows={2} className="w-full p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none resize-none" placeholder="Description" />
                  <textarea value={dCoachingPoints} onChange={(e) => setDCoachingPoints(e.target.value)} rows={2} className="w-full p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none resize-none" placeholder="Coaching points" />
                  <div className="grid grid-cols-3 gap-3">
                    <input type="text" value={dSetsReps} onChange={(e) => setDSetsReps(e.target.value)} className="p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite focus:border-wheat outline-none" placeholder="Sets/Reps" />
                    <select value={dDifficulty} onChange={(e) => setDDifficulty(e.target.value)} className="p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite outline-none">
                      <option value="">Difficulty</option>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                    <select value={dSport} onChange={(e) => setDSport(e.target.value)} className="p-3 bg-navy border border-wheat/15 rounded-lg text-offwhite outline-none">
                      <option>Both</option>
                      <option>Baseball</option>
                      <option>Softball</option>
                    </select>
                  </div>
                  <button type="submit" disabled={dSaving} className="px-6 py-2 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 disabled:opacity-50">{dSaving ? 'Saving...' : editDrill ? 'Save Changes' : 'Add Drill'}</button>
                </form>
              </div>
            )}

            {filteredDrills.map((drill) => (
              <div key={drill.id} className="rounded-xl bg-navy-light border border-wheat/8 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{drill.drill_name}</div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] text-wheat bg-wheat/10 px-2 py-0.5 rounded">{drill.category}</span>
                      {drill.difficulty && <span className="text-[10px] text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded">{drill.difficulty}</span>}
                      <span className="text-[10px] text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded">{drill.sport}</span>
                    </div>
                    {drill.description && <p className="text-xs text-offwhite/30 mt-1 line-clamp-1">{drill.description}</p>}
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button onClick={() => openDrillForm(drill)} className="text-xs text-offwhite/30 hover:text-wheat">Edit</button>
                    <button onClick={() => handleDeleteDrill(drill.id)} className="text-xs text-red-400/40 hover:text-red-400">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-navy-light border border-wheat/8 p-4 text-center">
      <div className="font-display text-2xl text-wheat">{value}</div>
      <div className="text-[10px] text-offwhite/40 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}
