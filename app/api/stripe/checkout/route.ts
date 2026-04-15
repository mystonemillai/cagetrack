import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
});

const PRICES: Record<string, string> = {
  monthly: 'price_1TMW1NDzOr0cH3oF64h1qww6',
  yearly: 'price_1TMW2SDzOr0cH3oF4pcTvAdb',
};

export async function POST(request: NextRequest) {
  try {
    const { plan, playerId } = await request.json();

    if (!plan || !PRICES[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const origin = request.headers.get('origin') || 'https://cagetrack.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRICES[plan], quantity: 1 }],
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/settings`,
      metadata: {
        userId: user.id,
        playerId: playerId || '',
        plan: plan,
      },
     subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: user.id,
          playerId: playerId || '',
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
