import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all players owned by this user
    const { data: players } = await supabase.from('players').select('id').eq('owner_user_id', userId);
    const playerIds = players ? players.map(p => p.id) : [];

    // Delete player-related data
    if (playerIds.length > 0) {
      await supabase.from('messages').delete().in('player_id', playerIds);
      await supabase.from('session_reports').delete().in('player_id', playerIds);
      await supabase.from('ai_plans').delete().in('player_id', playerIds);
      await supabase.from('drill_assignments').delete().in('player_id', playerIds);
      await supabase.from('observations').delete().in('player_id', playerIds);
      await supabase.from('player_coaches').delete().in('player_id', playerIds);
      await supabase.from('parent_links').delete().in('player_id', playerIds);
      await supabase.from('players').delete().in('id', playerIds);
    }

    // Delete parent links where user is the parent
    await supabase.from('parent_links').delete().eq('parent_user_id', userId);

    // Delete coach profile if exists
    const { data: coachProfile } = await supabase.from('coach_profiles').select('id').eq('user_id', userId).single();
    if (coachProfile) {
      await supabase.from('player_coaches').delete().eq('coach_profile_id', coachProfile.id);
      await supabase.from('coach_drills').delete().eq('coach_profile_id', coachProfile.id);
      await supabase.from('coach_profiles').delete().eq('id', coachProfile.id);
    }

    // Delete user data
    await supabase.from('drill_favorites').delete().eq('user_id', userId);
    await supabase.from('push_tokens').delete().eq('user_id', userId);
    await supabase.from('subscriptions').delete().eq('billing_user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);

    // Delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      return NextResponse.json({ error: 'Failed to delete auth user: ' + authError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
