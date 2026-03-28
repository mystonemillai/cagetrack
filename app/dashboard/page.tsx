import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get players (owned by this user OR linked as parent)
  const { data: ownedPlayers } = await supabase
    .from('players')
    .select('*')
    .eq('owner_user_id', user.id);

  // Get coach profile if they are a coach
  const { data: coachProfile } = await supabase
    .from('coach_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Get connected players for coaches
  let connectedPlayers: any[] = [];
  if (coachProfile) {
    const { data } = await supabase
      .from('player_coaches')
      .select('*, players(*)')
      .eq('coach_profile_id', coachProfile.id)
      .eq('status', 'active');
    connectedPlayers = data || [];
  }

  return (
    <DashboardClient
      profile={profile}
      ownedPlayers={ownedPlayers || []}
      coachProfile={coachProfile}
      connectedPlayers={connectedPlayers}
    />
  );
}
