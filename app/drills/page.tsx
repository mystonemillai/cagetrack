'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = [
  'Hitting', 'Pitching Fundamentals', 'Pitching Accuracy', 'Pitcher Recovery',
  'Catcher', 'First Base', 'Third Base', 'Middle Infield',
  'Infield Fundamentals', 'Outfield Fundamentals', 'Center Field',
  'Corner Outfield', 'Mental Game'
];

export default function DrillsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [drills, setDrills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDrill, setExpandedDrill] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showToolbox, setShowToolbox] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUserId(user.id);

      const { data } = await supabase.from('master_drills').select('*').eq('is_active', true).order('category').order('sort_order');
      setDrills(data || []);

      const { data: favs } = await supabase.from('drill_favorites').select('master_drill_id').eq('user_id', user.id);
      if (favs) setFavorites(favs.map((f: any) => f.master_drill_id).filter(Boolean));

      setLoading(false);
    }
    loadData();
  }, []);

  async function toggleFavorite(drillId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (favorites.includes(drillId)) {
      await supabase.from('drill_favorites').delete().eq('user_id', userId).eq('master_drill_id', drillId);
      setFavorites(favorites.filter(f => f !== drillId));
    } else {
      await supabase.from('drill_favorites').insert({ user_id: userId, master_drill_id: drillId });
      setFavorites([...favorites, drillId]);
    }
  }

  let filteredDrills = drills;
  if (showToolbox) filteredDrills = filteredDrills.filter(d => favorites.includes(d.id));
  if (selectedCategory && !showToolbox) filteredDrills = filteredDrills.filter(d => d.category === selectedCategory);
  if (sportFilter !== 'All' && !showToolbox) filteredDrills = filteredDrills.filter(d => d.sport === sportFilter || d.sport === 'Both');
  if (searchQuery.length >= 2) filteredDrills = filteredDrills.filter(d => d.drill_name.toLowerCase().includes(searchQuery.toLowerCase()));

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = drills.filter(d => d.category === cat && (sportFilter === 'All' || d.sport === sportFilter || d.sport === 'Both')).length;
    return acc;
  }, {} as Record<string, number>);

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
          <h1 className="font-display text-4xl sm:text-5xl mb-2">Drill Library</h1>
          <p className="text-offwhite/40">{drills.length} drills across {CATEGORIES.length} categories</p>
        </div>

        {/* Search and filters */}
        <div className="mb-6 space-y-3 animate-fade-in-delay-1">
          <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSelectedCategory(''); }} className="w-full p-4 bg-navy-light border border-wheat/15 rounded-xl text-offwhite focus:border-wheat outline-none transition-colors text-base" placeholder="Search drills by name..." />

          <div className="flex gap-2 flex-wrap">
            {['All', 'Baseball', 'Softball'].map((s) => (
              <button key={s} onClick={() => { setSportFilter(s); setShowToolbox(false); }} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${sportFilter === s && !showToolbox ? 'bg-wheat text-navy' : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{s}</button>
            ))}
            <button onClick={() => setShowToolbox(!showToolbox)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${showToolbox ? 'bg-wheat text-navy' : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>⭐ My Toolbox ({favorites.length})</button>
            <span className="text-xs text-offwhite/30 self-center ml-2">{filteredDrills.length} drills</span>
          </div>
        </div>

        {/* Category pills */}
        {!searchQuery && (
          <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-delay-2">
            <button onClick={() => setSelectedCategory('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!selectedCategory ? 'bg-wheat text-navy' : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>All</button>
            {CATEGORIES.map((cat) => (
              categoryCounts[cat] > 0 && (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat ? 'bg-wheat text-navy' : 'bg-navy-light border border-wheat/10 text-offwhite/50 hover:border-wheat/25'}`}>{cat} ({categoryCounts[cat]})</button>
              )
            ))}
          </div>
        )}

        {/* Drill list */}
        {filteredDrills.length === 0 ? (
          <div className="text-center py-12 text-offwhite/30 text-sm">No drills found.</div>
        ) : selectedCategory || searchQuery ? (
          // Flat list when filtered
          <div className="space-y-2">
            {filteredDrills.map((drill) => (
              <div key={drill.id} onClick={() => setExpandedDrill(expandedDrill === drill.id ? null : drill.id)} className="rounded-xl bg-navy-light border border-wheat/8 p-4 hover:border-wheat/15 transition-all cursor-pointer card-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{drill.drill_name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="text-[10px] text-wheat bg-wheat/10 px-2 py-0.5 rounded">{drill.difficulty}</span>
                      <span className="text-[10px] text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded">{drill.sport}</span>
                      <span className="text-[10px] text-offwhite/25">{drill.sets_reps}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2"><button onClick={(e) => toggleFavorite(drill.id, e)} className={`text-sm ${favorites.includes(drill.id) ? 'text-yellow-400' : 'text-offwhite/15 hover:text-yellow-400/50'} transition-colors`}>{favorites.includes(drill.id) ? '★' : '☆'}</button><span className={`text-offwhite/20 text-xs transition-transform ${expandedDrill === drill.id ? 'rotate-90' : ''}`}>→</span></div>
                </div>
                {expandedDrill === drill.id && (
                  <div className="mt-3 pt-3 border-t border-wheat/5 animate-fade-in">
                    {drill.description && <p className="text-xs text-offwhite/50 leading-relaxed mb-2">{drill.description}</p>}
                    {drill.coaching_points && (
                      <div className="text-xs text-offwhite/40">
                        <span className="text-wheat text-[10px] uppercase tracking-wider">Coaching Points:</span>
                        <p className="mt-1 leading-relaxed">{drill.coaching_points}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Grouped by category when no filter
          <div className="space-y-6">
            {CATEGORIES.map((category) => {
              const catDrills = filteredDrills.filter(d => d.category === category);
              if (catDrills.length === 0) return null;
              return (
                <div key={category}>
                  <h2 className="font-display text-xl text-wheat mb-3">{category} <span className="text-offwhite/20 text-sm">({catDrills.length})</span></h2>
                  <div className="space-y-2">
                    {catDrills.map((drill) => (
                      <div key={drill.id} onClick={() => setExpandedDrill(expandedDrill === drill.id ? null : drill.id)} className="rounded-xl bg-navy-light border border-wheat/8 p-4 hover:border-wheat/15 transition-all cursor-pointer card-hover">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{drill.drill_name}</h3>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              <span className="text-[10px] text-wheat bg-wheat/10 px-2 py-0.5 rounded">{drill.difficulty}</span>
                              <span className="text-[10px] text-offwhite/25">{drill.sets_reps}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2"><button onClick={(e) => toggleFavorite(drill.id, e)} className={`text-sm ${favorites.includes(drill.id) ? 'text-yellow-400' : 'text-offwhite/15 hover:text-yellow-400/50'} transition-colors`}>{favorites.includes(drill.id) ? '★' : '☆'}</button><span className={`text-offwhite/20 text-xs transition-transform ${expandedDrill === drill.id ? 'rotate-90' : ''}`}>→</span></div>
                        </div>
                        {expandedDrill === drill.id && (
                          <div className="mt-3 pt-3 border-t border-wheat/5 animate-fade-in">
                            {drill.description && <p className="text-xs text-offwhite/50 leading-relaxed mb-2">{drill.description}</p>}
                            {drill.coaching_points && (
                              <div className="text-xs text-offwhite/40">
                                <span className="text-wheat text-[10px] uppercase tracking-wider">Coaching Points:</span>
                                <p className="mt-1 leading-relaxed">{drill.coaching_points}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full z-50 bg-navy/95 backdrop-blur-xl border-t border-wheat/8 sm:hidden">
        <div className="flex justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">🏠</span><span className="text-[10px] text-offwhite/30">Home</span></Link>
          <Link href="/drills" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">📋</span><span className="text-[10px] text-wheat">Drills</span></Link>
          <Link href="/coaches" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">🧢</span><span className="text-[10px] text-offwhite/30">Coaches</span></Link>
          <Link href="/settings" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">⚙️</span><span className="text-[10px] text-offwhite/30">Settings</span></Link>
        </div>
      </nav>
    </div>
  );
}
