import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  // For now, redirect to signup. Later this becomes the landing page.
  redirect('/auth/signup');
}
