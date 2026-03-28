'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardClientProps {
  profile: any;
  ownedPlayers: any[];
  coachProfile: any;
  connectedPlayers: any[];
}

export default function DashboardClient({
  profile,
  ownedPlayers,
  coachProfile,
  connectedPlayers,
}: DashboardClientProps) {
  const supabase = createClient();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const isCoach = profile?.role === 'coach' || coachProfile;
  const isPlayer = profile?.role === 'player';
  const isFamily = profile?.role === 'family';
  const hasPlayers = ownedPlayers.length > 0 || connectedPlayers.length > 0;

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

          <div className="flex items-center gap-4">
            <span className="text-xs text-offwhite/40 hidden sm:block">
              {profile?.name}
            </span>
            <button
              onClick={handleSignOut}
              className="text-xs text-offwhite/40 hover:text-wheat transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 max-w-5xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl">
            {profile?.name ? `Hey, ${profile.name.split(' ')[0]}` : 'Welcome'}
          </h1>
          <p className="text-offwhite/40 mt-1">
            {isCoach && 'Your connected players'}
            {isPlayer && 'Your development dashboard'}
            {isFamily && "Your player's development"}
          </p>
        </div>

        {/* No players yet — onboarding */}
        {!hasPlayers && !isCoach && (
          <div className="rounded-xl bg-navy-light border border-wheat/10 p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-wheat/10 flex items-center justify-center mx-auto mb-4 text-2xl">
              ⚾
            </div>
            <h2 className="font-display text-2xl mb-2">
              {isPlayer ? 'Set Up Your Profile' : 'Add Your Player'}
            </h2>
            <p className="text-offwhite/40 mb-6 max-w-sm mx-auto">
              {isPlayer
                ? 'Fill in your details to get started with your development tracking.'
                : "Create your player's profile to start tracking their development."}
            </p>
            <button className="px-6 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors">
              {isPlayer ? 'Complete Profile' : 'Add Player'}
            </button>
          </div>
        )}

        {/* Player Cards */}
        {ownedPlayers.length > 0 && (
          <div className="space-y-4">
            {ownedPlayers.map((player) => (
              <div
                key={player.id}
                className="rounded-xl bg-navy-light border border-wheat/8 p-6 hover:border-wheat/20 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl tracking-wide">
                      {player.first_name} {player.last_name}
                    </h3>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-wheat bg-wheat/10 px-2 py-0.5 rounded">
                        {player.age_group}
                      </span>
                      {player.current_team && (
                        <span className="text-xs text-offwhite/40">
                          {player.current_team}
                        </span>
                      )}
                    </div>
                    {player.positions && player.positions.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {player.positions.map((pos: string) => (
                          <span
                            key={pos}
                            className="text-xs text-offwhite/30 bg-offwhite/5 px-2 py-0.5 rounded"
                          >
                            {pos}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-offwhite/20 text-xl">→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coach View — Connected Players */}
        {isCoach && connectedPlayers.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl text-offwhite/60 mb-2">Your Players</h2>
            {connectedPlayers.map((connection) => (
              <div
                key={connection.id}
                className="rounded-xl bg-navy-light border border-wheat/8 p-6 hover:border-wheat/20 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl tracking-wide">
                      {connection.players.first_name} {connection.players.last_name}
                    </h3>
                    <span className="text-xs text-wheat bg-wheat/10 px-2 py-0.5 rounded">
                      {connection.players.age_group}
                    </span>
                  </div>
                  <span className="text-offwhite/20 text-xl">→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {isCoach && connectedPlayers.length === 0 && (
          <div className="rounded-xl bg-navy-light border border-wheat/10 p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-wheat/10 flex items-center justify-center mx-auto mb-4 text-2xl">
              🧢
            </div>
            <h2 className="font-display text-2xl mb-2">No Players Connected Yet</h2>
            <p className="text-offwhite/40 mb-6 max-w-sm mx-auto">
              Ask a player or parent to share their invite code with you, or enter a code below.
            </p>
            <button className="px-6 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors">
              Enter Invite Code
            </button>
          </div>
        )}

        {/* Quick Actions */}
        {hasPlayers && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <QuickAction icon="📋" label="Drills" href="/drills" />
            <QuickAction icon="👁️" label="Observations" href="/dashboard" />
            <QuickAction icon="🧠" label="AI Plans" href="/dashboard" />
            <QuickAction icon="⚙️" label="Settings" href="/settings" />
          </div>
        )}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 w-full z-50 bg-navy/95 backdrop-blur-xl border-t border-wheat/8 sm:hidden">
        <div className="flex justify-around py-2">
          <BottomNavItem icon="🏠" label="Home" href="/dashboard" active />
          <BottomNavItem icon="📋" label="Drills" href="/drills" />
          <BottomNavItem icon="🧠" label="AI" href="/dashboard" />
          <BottomNavItem icon="⚙️" label="Settings" href="/settings" />
        </div>
      </nav>
    </div>
  );
}

function QuickAction({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl bg-navy-light border border-wheat/6 p-4 text-center hover:border-wheat/15 transition-all"
    >
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-xs text-offwhite/50 font-medium">{label}</div>
    </Link>
  );
}

function BottomNavItem({ icon, label, href, active }: { icon: string; label: string; href: string; active?: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 px-3 py-1">
      <span className="text-lg">{icon}</span>
      <span className={`text-[10px] ${active ? 'text-wheat' : 'text-offwhite/30'}`}>{label}</span>
    </Link>
  );
}
