import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, transactionId, originalTransactionId } = await request.json();

    if (!userId || !productId || !transactionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Determine plan type from product ID
    let planType = 'monthly';
    if (productId === 'CTAN100') {
      planType = 'annual';
    }

    // Check if subscription already exists for this transaction
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('apple_transaction_id', originalTransactionId)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: 'Subscription already exists' });
    }

    // Create subscription record
    const { error: subError } = await supabase.from('subscriptions').insert({
      billing_user_id: userId,
      status: 'active',
      plan_type: planType,
      payment_provider: 'apple',
      apple_transaction_id: originalTransactionId,
      apple_product_id: productId,
    });

    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
