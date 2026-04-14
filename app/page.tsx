import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1C2B35]">
      {/* Nav */}
      <nav className="px-6 py-5 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md border-2 border-[#D4A96A] flex items-center justify-center text-[#D4A96A] font-bold text-sm -rotate-3">CT</div>
          <span className="font-display text-xl tracking-wider text-[#F7F3ED]">CAGETRACK</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm text-[#F7F3ED]/50 hover:text-[#D4A96A] transition-colors">Log In</Link>
          <Link href="/auth/signup" className="px-5 py-2 bg-[#D4A96A] text-[#1C2B35] font-display text-sm tracking-wider rounded-lg hover:bg-[#D4A96A]/90 transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-6xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[#D4A96A]/10 border border-[#D4A96A]/20 text-[#D4A96A] text-xs font-medium tracking-wider uppercase mb-8">Player Development Tracking for Baseball &amp; Softball</div>
        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl leading-[0.9] text-[#F7F3ED] mb-6 max-w-4xl mx-auto">
          ONE PLAYER PROFILE.<br />
          <span className="text-[#D4A96A]">EVERY COACH CONNECTED.</span>
        </h1>
        <p className="text-lg sm:text-xl text-[#F7F3ED]/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop losing development notes in group chats and binders. CageTrack gives every player a unified profile where coaches log observations, assign drills, and create custom development plans — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup" className="px-8 py-4 bg-[#D4A96A] text-[#1C2B35] font-display text-lg tracking-wider rounded-xl hover:bg-[#D4A96A]/90 transition-all hover:scale-[1.02]">Start Free Trial</Link>
          <Link href="/auth/signup" className="px-8 py-4 bg-[#F7F3ED]/5 border border-[#F7F3ED]/10 text-[#F7F3ED] font-display text-lg tracking-wider rounded-xl hover:border-[#D4A96A]/30 transition-all">I&apos;m a Coach — It&apos;s Free</Link>
        </div>
        <p className="text-xs text-[#F7F3ED]/25 mt-4">14-day free trial. No commitment. Cancel anytime.</p>
      </section>

      {/* Problem / Solution */}
      <section className="px-6 py-20 bg-[#243540]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl text-[#F7F3ED] mb-4">THE PROBLEM WITH PLAYER DEVELOPMENT</h2>
            <p className="text-[#F7F3ED]/40 max-w-2xl mx-auto">Your kid works with a hitting coach on Tuesdays, a pitching coach on Thursdays, and plays for a travel team on weekends. Nobody talks to each other. Development notes live in texts, notebooks, and memory.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#D4A96A]/10 flex items-center justify-center mx-auto mb-4 text-3xl">📱</div>
              <h3 className="font-display text-xl text-[#D4A96A] mb-2">ONE PROFILE</h3>
              <p className="text-sm text-[#F7F3ED]/40 leading-relaxed">Every coach contributes to the same player profile. No more scattered notes across apps, texts, and paper.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#D4A96A]/10 flex items-center justify-center mx-auto mb-4 text-3xl">🧠</div>
              <h3 className="font-display text-xl text-[#D4A96A] mb-2">CUSTOM DEVELOPMENT PLANS</h3>
              <p className="text-sm text-[#F7F3ED]/40 leading-relaxed">Coaches describe what they see. CageTrack AI creates targeted drill plans with progressions, coaching cues, and weekly timelines.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#D4A96A]/10 flex items-center justify-center mx-auto mb-4 text-3xl">🤝</div>
              <h3 className="font-display text-xl text-[#D4A96A] mb-2">CONNECTED ECOSYSTEM</h3>
              <p className="text-sm text-[#F7F3ED]/40 leading-relaxed">Head coach, private instructor, parent — everyone sees the same development picture. One player, one story.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl text-[#F7F3ED] mb-4">HOW IT WORKS</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl bg-[#243540] border border-[#D4A96A]/10 p-6">
            <div className="font-display text-4xl text-[#D4A96A]/20 mb-3">01</div>
            <h3 className="font-display text-lg text-[#D4A96A] mb-2">CREATE A PROFILE</h3>
            <p className="text-sm text-[#F7F3ED]/40">Sign up as a player or parent. Create your player&apos;s development profile with age group, positions, and sport.</p>
          </div>
          <div className="rounded-2xl bg-[#243540] border border-[#D4A96A]/10 p-6">
            <div className="font-display text-4xl text-[#D4A96A]/20 mb-3">02</div>
            <h3 className="font-display text-lg text-[#D4A96A] mb-2">CONNECT COACHES</h3>
            <p className="text-sm text-[#F7F3ED]/40">Find coaches in your area or invite them with a code. Connect as many coaches as you need — hitting, pitching, fielding.</p>
          </div>
          <div className="rounded-2xl bg-[#243540] border border-[#D4A96A]/10 p-6">
            <div className="font-display text-4xl text-[#D4A96A]/20 mb-3">03</div>
            <h3 className="font-display text-lg text-[#D4A96A] mb-2">TRACK DEVELOPMENT</h3>
            <p className="text-sm text-[#F7F3ED]/40">Coaches log observations, assign drills from a 100+ drill library, and CageTrack can generate custom development plans.</p>
          </div>
          <div className="rounded-2xl bg-[#243540] border border-[#D4A96A]/10 p-6">
            <div className="font-display text-4xl text-[#D4A96A]/20 mb-3">04</div>
            <h3 className="font-display text-lg text-[#D4A96A] mb-2">SEE THE BIG PICTURE</h3>
            <p className="text-sm text-[#F7F3ED]/40">Every observation, drill, and plan in one place. Parents see everything. Players own their development story.</p>
          </div>
        </div>
      </section>

      {/* For Coaches */}
      <section className="px-6 py-20 bg-[#243540]">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-[#D4A96A]/10 border border-[#D4A96A]/20 text-[#D4A96A] text-xs font-medium tracking-wider uppercase mb-6">For Coaches</div>
              <h2 className="font-display text-4xl sm:text-5xl text-[#F7F3ED] mb-6">ALWAYS FREE.<br />ZERO CATCH.</h2>
              <p className="text-[#F7F3ED]/50 mb-6 leading-relaxed">CageTrack is free for coaches — forever. Build your coaching profile, get discovered in our directory, track your players&apos; development, and look like a pro. Your players&apos; families subscribe. You never pay.</p>
              <Link href="/auth/signup" className="inline-block px-6 py-3 bg-[#D4A96A] text-[#1C2B35] font-display text-sm tracking-wider rounded-xl hover:bg-[#D4A96A]/90 transition-all">Sign Up as a Coach</Link>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl bg-[#1C2B35] border border-[#D4A96A]/8 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">📋</span>
                  <span className="font-display text-lg text-[#D4A96A]">COACHING PROFILE</span>
                </div>
                <p className="text-sm text-[#F7F3ED]/40">Specialties, bio, location, video intro. Get found by local families searching for coaches.</p>
              </div>
              <div className="rounded-xl bg-[#1C2B35] border border-[#D4A96A]/8 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">👁️</span>
                  <span className="font-display text-lg text-[#D4A96A]">LOG OBSERVATIONS</span>
                </div>
                <p className="text-sm text-[#F7F3ED]/40">Track what you see in every session. Build a development history for each player.</p>
              </div>
              <div className="rounded-xl bg-[#1C2B35] border border-[#D4A96A]/8 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">🧠</span>
                  <span className="font-display text-lg text-[#D4A96A]">CUSTOM PLANS</span>
                </div>
                <p className="text-sm text-[#F7F3ED]/40">Describe what you&apos;re seeing. AI generates targeted drill plans with progressions and coaching cues.</p>
              </div>
              <div className="rounded-xl bg-[#1C2B35] border border-[#D4A96A]/8 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">🔗</span>
                  <span className="font-display text-lg text-[#D4A96A]">SHAREABLE PROFILE</span>
                </div>
                <p className="text-sm text-[#F7F3ED]/40">Get a public profile link to share on social media, your website, or in messages to prospective families.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl sm:text-5xl text-[#F7F3ED] mb-4">SIMPLE PRICING</h2>
          <p className="text-[#F7F3ED]/40">14-day free trial on every plan. Coaches are always free.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="rounded-2xl bg-[#243540] border border-[#D4A96A]/10 p-8 text-center">
            <div className="font-display text-lg text-[#F7F3ED]/40 mb-4">COACH</div>
            <div className="font-display text-5xl text-[#D4A96A] mb-2">FREE</div>
            <div className="text-sm text-[#F7F3ED]/30 mb-6">Forever</div>
            <div className="space-y-2 text-sm text-[#F7F3ED]/50 text-left mb-8">
              <p>✓ Coaching profile &amp; directory listing</p>
              <p>✓ Log observations</p>
              <p>✓ Assign drills</p>
              <p>✓ CageTrack custom plans</p>
              <p>✓ Messaging</p>
              <p>✓ Shareable profile link</p>
            </div>
            <Link href="/auth/signup" className="block w-full py-3 bg-[#D4A96A]/10 border border-[#D4A96A]/20 text-[#D4A96A] font-display text-sm tracking-wider rounded-xl hover:bg-[#D4A96A]/20 transition-colors">Sign Up Free</Link>
          </div>
          <div className="rounded-2xl bg-[#243540] border-2 border-[#D4A96A] p-8 text-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#D4A96A] text-[#1C2B35] text-[10px] font-bold tracking-wider rounded-full">MOST POPULAR</div>
            <div className="font-display text-lg text-[#F7F3ED]/40 mb-4">MONTHLY</div>
            <div className="font-display text-5xl text-[#D4A96A] mb-2">$10</div>
            <div className="text-sm text-[#F7F3ED]/30 mb-6">per month</div>
            <div className="space-y-2 text-sm text-[#F7F3ED]/50 text-left mb-8">
              <p>✓ Everything coaches get, plus:</p>
              <p>✓ Connect with unlimited coaches</p>
              <p>✓ Full development tracking</p>
              <p>✓ CageTrack custom plans</p>
              <p>✓ Drill library access</p>
              <p>✓ 14-day free trial</p>
            </div>
            <Link href="/auth/signup" className="block w-full py-3 bg-[#D4A96A] text-[#1C2B35] font-display text-sm tracking-wider rounded-xl hover:bg-[#D4A96A]/90 transition-colors">Start Free Trial</Link>
          </div>
          <div className="rounded-2xl bg-[#243540] border border-[#D4A96A]/10 p-8 text-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-[10px] font-bold tracking-wider rounded-full">SAVE $20</div>
            <div className="font-display text-lg text-[#F7F3ED]/40 mb-4">ANNUAL</div>
            <div className="font-display text-5xl text-[#D4A96A] mb-2">$100</div>
            <div className="text-sm text-[#F7F3ED]/30 mb-6">per year</div>
            <div className="space-y-2 text-sm text-[#F7F3ED]/50 text-left mb-8">
              <p>✓ Everything in Monthly</p>
              <p>✓ Save $20 per year</p>
              <p>✓ Lock in your rate</p>
              <p>✓ Best value</p>
              <p>✓ 14-day free trial</p>
              <p>&nbsp;</p>
            </div>
            <Link href="/auth/signup" className="block w-full py-3 bg-[#D4A96A]/10 border border-[#D4A96A]/20 text-[#D4A96A] font-display text-sm tracking-wider rounded-xl hover:bg-[#D4A96A]/20 transition-colors">Start Free Trial</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 bg-[#243540]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl sm:text-5xl text-[#F7F3ED] text-center mb-12">QUESTIONS</h2>
          <div className="space-y-4">
            <FAQItem q="What ages is CageTrack for?" a="CageTrack is designed for baseball and softball players ages 8U through 18U." />
            <FAQItem q="Why is it free for coaches?" a="Coaches are the backbone of player development. By keeping CageTrack free for coaches, we make it easy for them to adopt the platform and bring their players along. Coaches bring families. Families subscribe." />
            <FAQItem q="Can my player have multiple coaches?" a="Yes. That's the whole point. Your hitting coach, pitching coach, head coach, and private instructor all contribute to the same player profile. Everyone sees the full picture." />
            <FAQItem q="What happens after the free trial?" a="After 14 days, your subscription starts at $10/month or $100/year. You can cancel anytime from your Settings page. Your coaches keep their accounts regardless." />
            <FAQItem q="Is my kid's data safe?" a="Yes. We use industry-standard encryption, row-level database security, and never sell data to third parties. Only connected coaches and family members can see a player's profile." />
            <FAQItem q="Can I use CageTrack on my phone?" a="Yes. CageTrack is available as a mobile app for iOS and Android. Download it from the App Store or Google Play." />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center">
        <h2 className="font-display text-4xl sm:text-6xl text-[#F7F3ED] mb-6">TRACK DEVELOPMENT.<br /><span className="text-[#D4A96A]">NOT JUST STATS.</span></h2>
        <p className="text-lg text-[#F7F3ED]/40 mb-10 max-w-xl mx-auto">Join the platform built for the way player development actually works — multiple coaches, one unified profile, CageTrack custom plans.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup" className="px-8 py-4 bg-[#D4A96A] text-[#1C2B35] font-display text-lg tracking-wider rounded-xl hover:bg-[#D4A96A]/90 transition-all hover:scale-[1.02]">Start Your Free Trial</Link>
          <Link href="/auth/signup" className="px-8 py-4 bg-[#F7F3ED]/5 border border-[#F7F3ED]/10 text-[#F7F3ED] font-display text-lg tracking-wider rounded-xl hover:border-[#D4A96A]/30 transition-all">Sign Up as a Coach — Free</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-[#F7F3ED]/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md border-2 border-[#D4A96A] flex items-center justify-center text-[#D4A96A] font-bold text-[10px] -rotate-3">CT</div>
            <span className="font-display text-sm tracking-wider text-[#F7F3ED]/40">CAGETRACK</span>
          </div>
          <div className="flex gap-6 text-xs text-[#F7F3ED]/30">
            <Link href="/terms" className="hover:text-[#D4A96A] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#D4A96A] transition-colors">Privacy</Link>
            <Link href="/help" className="hover:text-[#D4A96A] transition-colors">Help</Link>
            <Link href="/blog" className="hover:text-[#D4A96A] transition-colors">Blog</Link>
            <a href="mailto:cagetrack@gmail.com" className="hover:text-[#D4A96A] transition-colors">Contact</a>
          </div>
          <div className="text-xs text-[#F7F3ED]/20">© 2026 CageTrack LLC</div>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="rounded-xl bg-[#1C2B35] border border-[#D4A96A]/8 group">
      <summary className="p-5 cursor-pointer flex items-center justify-between text-sm font-medium text-[#F7F3ED] hover:text-[#D4A96A] transition-colors list-none">
        {q}
        <span className="text-[#F7F3ED]/20 group-open:rotate-90 transition-transform ml-3 flex-shrink-0">→</span>
      </summary>
      <div className="px-5 pb-5 text-sm text-[#F7F3ED]/40 leading-relaxed">{a}</div>
    </details>
  );
}
