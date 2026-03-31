import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DrillsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: drills } = await supabase
    .from('master_drills')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('sort_order');

  const categories = [
    'Hitting', 'Pitching Fundamentals', 'Pitching Accuracy', 'Pitcher Recovery',
    'Catcher', 'First Base', 'Third Base', 'Middle Infield',
    'Infield Fundamentals', 'Outfield Fundamentals', 'Center Field',
    'Corner Outfield', 'Mental Game'
  ];

  const drillsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = (drills || []).filter(d => d.category === cat);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 px-4 py-3 bg-navy/90 backdrop-blur-xl border-b border-wheat/8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-xs -rotate-3">
              CT
            </div>
            <span className="font-display text-lg tracking-wider">CAGETRACK</span>
          </Link>
          <Link href="/dashboard" className="text-xs text-offwhite/40 hover:text-wheat transition-colors">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="pt-20 pb-24 px-4 max-w-5xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-2">Drill Library</h1>
        <p className="text-offwhite/40 mb-8">Browse drills by category. Coaches can assign these to players.</p>

        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="font-display text-xl text-wheat mb-3">{category}</h2>
            {drillsByCategory[category].length > 0 ? (
              <div className="space-y-2">
                {drillsByCategory[category].map((drill) => (
                  <div
                    key={drill.id}
                    className="rounded-lg bg-navy-light border border-wheat/6 p-4 hover:border-wheat/15 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{drill.drill_name}</h3>
                        <p className="text-xs text-offwhite/40 mt-1 line-clamp-2">{drill.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] text-wheat bg-wheat/10 px-2 py-0.5 rounded">
                            {drill.difficulty}
                          </span>
                          <span className="text-[10px] text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded">
                            {drill.sets_reps}
                          </span>
                        </div>
                      </div>
                      {drill.video_url && (
                        <span className="text-offwhite/20 text-xs">▶</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-offwhite/20 italic">No drills added yet.</p>
            )}
          </div>
        ))}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 w-full z-50 bg-navy/95 backdrop-blur-xl border-t border-wheat/8 sm:hidden">
        <div className="flex justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <span className="text-lg">🏠</span>
            <span className="text-[10px] text-offwhite/30">Home</span>
          </Link>
          <Link href="/drills" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <span className="text-lg">📋</span>
            <span className="text-[10px] text-wheat">Drills</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <span className="text-lg">🧠</span>
            <span className="text-[10px] text-offwhite/30">AI</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <span className="text-lg">⚙️</span>
            <span className="text-[10px] text-offwhite/30">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
