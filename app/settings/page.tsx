import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen">
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

      <main className="pt-20 pb-24 px-4 max-w-2xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-8">Settings</h1>

        <div className="space-y-4">
          <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
            <h2 className="font-display text-lg text-wheat mb-3">Account</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-offwhite/40">Name</span>
                <span>{profile?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-offwhite/40">Email</span>
                <span>{profile?.email || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-offwhite/40">Role</span>
                <span className="capitalize">{profile?.role || '—'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
            <h2 className="font-display text-lg text-wheat mb-3">Subscription</h2>
            <p className="text-sm text-offwhite/40">No active subscription. Start your free trial to access all features.</p>
          </div>

          <div className="rounded-xl bg-navy-light border border-wheat/8 p-6">
            <h2 className="font-display text-lg text-wheat mb-3">Invite Codes</h2>
            <p className="text-sm text-offwhite/40">Generate invite codes to connect coaches or link a parent account.</p>
            <button className="mt-3 px-4 py-2 bg-wheat/10 border border-wheat/20 text-wheat text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-wheat/20 transition-colors">
              Generate Code
            </button>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full z-50 bg-navy/95 backdrop-blur-xl border-t border-wheat/8 sm:hidden">
        <div className="flex justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <span className="text-lg">🏠</span>
            <span className="text-[10px] text-offwhite/30">Home</span>
          </Link>
          <Link href="/drills" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <span className="text-lg">📋</span>
            <span className="text-[10px] text-offwhite/30">Drills</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <span className="text-lg">🧠</span>
            <span className="text-[10px] text-offwhite/30">AI</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <span className="text-lg">⚙️</span>
            <span className="text-[10px] text-wheat">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
