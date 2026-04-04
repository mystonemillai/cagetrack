import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, coachProfileId } = await request.json();

    if (!userId || !coachProfileId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Get coach profile to verify it exists
    const { data: coach } = await supabase.from('coach_profiles').select('id, display_name').eq('id', coachProfileId).single();
    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Get the user's players
    const { data: players } = await supabase.from('players').select('id').eq('owner_user_id', userId);

    // Also check linked players
    const { data: linked } = await supabase.from('parent_links').select('player_id').eq('parent_user_id', userId).eq('status', 'active');

    let playerIds = (players || []).map(p => p.id);
    if (linked) {
      playerIds = [...playerIds, ...linked.map(l => l.player_id)];
    }

    if (playerIds.length === 0) {
      return NextResponse.json({ error: 'No players found. Create a player first.' }, { status: 400 });
    }

    // Create pending connection for the first player
    const { error } = await supabase.from('player_coaches').insert({
      player_id: playerIds[0],
      coach_profile_id: coachProfileId,
      status: 'pending_approval',
      invite_code: 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, coachName: coach.display_name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
