'use client';
import { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useSearchParams, useRouter } from 'next/navigation';

function ClaimCallbackContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('Linking your profile...');

  useEffect(() => {
    async function linkProfile() {
      const code = searchParams.get('code');
      if (!code) { setStatus('Missing code. Please try again.'); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStatus('Please log in first.'); return; }

      const { data: link } = await supabase
        .from('parent_links')
        .select('player_id')
        .eq('link_code', code)
        .eq('status', 'pending')
        .single();

      if (!link) { setStatus('Invalid or already claimed code.'); return; }

      await supabase.from('players').update({ owner_user_id: user.id }).eq('id', link.player_id);
      await supabase.from('parent_links').update({ status: 'active' }).eq('link_code', code);

      setStatus('Profile linked! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 1500);
    }
    linkProfile();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-xl border-2 border-wheat flex items-center justify-center mx-auto mb-6 text-wheat font-display text-xl -rotate-3">CT</div>
        <p className="text-offwhite/60 text-lg">{status}</p>
      </div>
    </div>
  );
}

export default function ClaimCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-offwhite/40">Loading...</p></div>}>
      <ClaimCallbackContent />
    </Suspense>
  );
}
