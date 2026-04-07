import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function PublicCoachProfile({ params }: { params: { id: string } }) {
  const { data: coach } = await supabase
    .from('coach_profiles')
    .select('*, profiles(name, avatar_url)')
    .eq('id', params.id)
    .eq('is_active', true)
    .single();

  if (!coach) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="font-display text-3xl mb-4">Coach Not Found</h1>
          <p className="text-offwhite/40 mb-6">This profile doesn&apos;t exist or is no longer active.</p>
          <Link href="/" className="px-6 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg">Go Home</Link>
        </div>
      </div>
    );
  }

  const signupUrl = `/auth/signup?ref=${coach.id}`;

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 px-4 py-3 bg-navy/90 backdrop-blur-xl border-b border-wheat/8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-xs -rotate-3">CT</div>
            <span className="font-display text-lg tracking-wider">CAGETRACK</span>
          </Link>
          <Link href="/auth/login" className="text-xs text-offwhite/40 hover:text-wheat transition-colors">Log In</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          {coach.profiles?.avatar_url ? (
            <img src={coach.profiles.avatar_url} alt={coach.display_name} className="w-24 h-24 rounded-full object-cover border-2 border-wheat/20 mx-auto mb-4" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-wheat/10 flex items-center justify-center mx-auto mb-4 text-4xl">🧢</div>
          )}
          <h1 className="font-display text-3xl sm:text-4xl mb-1">{coach.display_name}</h1>
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {coach.specialties && coach.specialties.length > 0 ? (
              coach.specialties.map((s: string) => <span key={s} className="text-xs text-wheat bg-wheat/10 px-3 py-1 rounded-full">{s}</span>)
            ) : coach.specialty ? (
              <span className="text-xs text-wheat bg-wheat/10 px-3 py-1 rounded-full">{coach.specialty}</span>
            ) : null}
            {coach.coach_type && <span className="text-xs text-offwhite/40 bg-offwhite/5 px-3 py-1 rounded-full capitalize">{coach.coach_type.replace(/_/g, ' ')}</span>}
            {coach.sports && coach.sports.map((s: string) => (
              <span key={s} className="text-xs text-offwhite/40 bg-offwhite/5 px-3 py-1 rounded-full">{s}</span>
            ))}
          </div>
          {coach.city && coach.state && (
            <p className="text-sm text-offwhite/40 mt-2">{coach.city}, {coach.state} {coach.service_radius_miles ? `· ${coach.service_radius_miles} mile radius` : ''}</p>
          )}
        </div>

        {coach.bio && (
          <div className="rounded-xl bg-navy-light border border-wheat/8 p-6 mb-4">
            <h2 className="font-display text-lg text-wheat mb-3">About</h2>
            <p className="text-sm text-offwhite/60 leading-relaxed">{coach.bio}</p>
          </div>
        )}

        {coach.video_intro_url && (
          <div className="rounded-xl bg-navy-light border border-wheat/8 p-6 mb-4">
            <h2 className="font-display text-lg text-wheat mb-3">Video Introduction</h2>
            <a href={coach.video_intro_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-wheat hover:underline">▶ Watch Coach {coach.display_name}&apos;s intro video</a>
          </div>
        )}

        <div className="rounded-xl bg-wheat/5 border border-wheat/15 p-8 text-center mt-6">
          <h2 className="font-display text-2xl mb-2">Connect with {coach.display_name}</h2>
          <p className="text-sm text-offwhite/40 mb-6 max-w-sm mx-auto">Sign up for CageTrack to connect and start tracking your player&apos;s development.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={signupUrl} className="px-8 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors">Sign Up to Connect</Link>
            <Link href="/auth/login" className="px-8 py-3 bg-wheat/10 border border-wheat/20 text-wheat font-display text-sm tracking-wider rounded-lg hover:bg-wheat/20 transition-colors">Already have an account? Log In</Link>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-offwhite/20">Powered by</p>
          <Link href="/" className="font-display text-sm text-offwhite/30 hover:text-wheat transition-colors tracking-wider">CAGETRACK</Link>
        </div>
      </main>
    </div>
  );
}
