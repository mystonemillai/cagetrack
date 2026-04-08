import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 px-4 py-3 bg-navy/90 backdrop-blur-xl border-b border-wheat/8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-xs -rotate-3">CT</div>
            <span className="font-display text-lg tracking-wider">CAGETRACK</span>
          </Link>
          <Link href="/dashboard" className="text-xs text-offwhite/40 hover:text-wheat transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <main className="pt-20 pb-24 px-4 max-w-3xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl mb-2">Help Center</h1>
        <p className="text-offwhite/40 mb-8">Everything you need to know about using CageTrack.</p>

        <div className="space-y-6">

          <Section title="Getting Started">
            <FAQ q="What is CageTrack?" a="CageTrack is a player development tracking platform for baseball and softball players ages 8U-18U. It connects players, parents, and coaches in one place to track progress, log observations, assign drills, and create AI-powered development plans." />
            <FAQ q="How do I sign up?" a="Go to cagetrack.com and click Sign Up. Choose your role — Player (if you're the athlete), Parent (if you're managing your child's profile), or Coach (if you're a coach working with players). Create your account with your email and password." />
            <FAQ q="Is CageTrack free?" a="Coaches always use CageTrack for free. Players and parents get a 14-day free trial. After the trial, a subscription is required to access all features including coach connections. Plans start at $10/month or $100/year." />
            <FAQ q="How do I add CageTrack to my phone's home screen?" a="On iPhone: Open Safari, go to cagetrack.com, tap the Share button (square with arrow), then tap 'Add to Home Screen.' On Android: Open Chrome, tap the three-dot menu, then tap 'Add to Home Screen.' CageTrack will appear as an app on your phone." />
          </Section>

          <Section title="For Players">
            <FAQ q="How do I create my player profile?" a="After signing up, you'll see a 'Get Started' section on your dashboard. Click 'Add a New Player' and fill out your info — name, age group, sport (baseball or softball), positions, team, and location." />
            <FAQ q="How do I connect with my coach?" a="Go to Settings and click 'Generate Coach Invite Code.' This creates a CT- code. Share that code with your coach — they'll enter it on their dashboard to connect with you. You can also enter a code your coach gives you in the 'Enter a Coach Code' section." />
            <FAQ q="How do I invite my parent?" a="Go to Settings and click 'Generate Code' under 'Invite a Parent.' Share the PL- code with your parent. They'll enter it after signing up to link to your profile and follow your development." />
            <FAQ q="Can I see what my coaches write about me?" a="Yes! Click on your player card on the dashboard to see your Overview, Observations, Drills, Custom Plans, and Messages. Everything your coaches log is visible to you." />
          </Section>

          <Section title="For Parents">
            <FAQ q="How do I set up my child's profile?" a="Sign up as a Parent, then click 'Add a New Player' on your dashboard. Fill out your child's information. You'll manage their profile and can see everything coaches add." />
            <FAQ q="How do I link to my child's existing account?" a="If your child already has a CageTrack account, they can generate a PL- code from their Settings page. Go to your Settings, enter that code in 'Link to Existing Player,' and you'll be connected." />
            <FAQ q="How do I find and connect with a coach?" a="Click 'Find Coaches' on your dashboard. Search by location, sport, and specialty. Click on a coach to see their profile, then click 'Request to Connect.' The coach will approve your request, and they'll be connected to your player." />
            <FAQ q="Can I have multiple coaches for my child?" a="Yes! Your child can be connected to as many coaches as needed — head coach, hitting instructor, pitching coach, private trainer. Each coach sees the same player profile and can add their own observations and drill assignments." />
            <FAQ q="Can other family members see my child's profile?" a="Yes. Generate a PL- code from Settings and share it with any family member. They sign up as a Parent, enter the code, and they can view your child's development." />
          </Section>

          <Section title="For Coaches">
            <FAQ q="Is CageTrack really free for coaches?" a="Yes. Coaches never pay. Your players and their families subscribe. You get a free platform to track player development, build your coaching profile, and be discovered in the coach directory." />
            <FAQ q="How do I set up my coach profile?" a="After signing up as a Coach, click 'Set Up Profile' on your dashboard. Add your display name, specialties, sports you coach, bio, location, and optionally a video introduction. This information appears in the coach directory." />
            <FAQ q="How do I connect with a player?" a="There are three ways: 1) A player or parent shares a CT- code with you — enter it on your dashboard. 2) You generate a code in Settings under 'Invite a Player' and share it with the family. 3) A family finds you in the coach directory and sends a connection request that you approve." />
            <FAQ q="How do I log observations?" a="Click on a player from your dashboard, then go to the Observations tab. Write what you're seeing — be specific about mechanics, approach, and areas for improvement. You can also attach a video link." />
            <FAQ q="How do I assign drills?" a="Click on a player, go to the Drills tab. You can browse the Master Library by category or search by name. You can also assign drills from your personal 'My Drills' library. Click '+ Assign' on any drill to assign it to the player." />
            <FAQ q="How do I create custom drills?" a="Go to 'My Drills' from your dashboard. Click '+ New Drill' and fill out the drill name, category, description, coaching points, sets/reps, and optionally a video link. Your custom drills are available to assign to any player you coach." />
            <FAQ q="What are Custom Plans?" a="Custom Plans are AI-powered development plans. Go to a player's profile, click the Custom Plans tab, describe what you're observing, and CageTrack AI generates a targeted drill plan with progressions, coaching cues, and a weekly timeline." />
            <FAQ q="How do I share my profile?" a="Click 'Share' next to your profile on the dashboard. This copies your public profile link. Share it on social media, your website, or in messages to prospective families. Anyone who clicks it can see your profile and sign up to connect." />
          </Section>

          <Section title="Connection Codes">
            <FAQ q="What is a PL- code?" a="A PL- code (Parent Link) connects a parent or family member to a player's profile. The player or parent generates it in Settings, and the other family member enters it after signing up." />
            <FAQ q="What is a CT- code?" a="A CT- code (CageTrack) connects a coach to a player. Either side can generate one — a player/parent generates it for a coach, or a coach generates it for a player/parent. The other person enters it to connect." />
            <FAQ q="My code isn't working. What do I do?" a="Codes are one-time use. Make sure you're entering the code exactly as shown (they're not case-sensitive). If a code has been used or expired, generate a new one from Settings. Also make sure you have an active subscription if you're connecting with a coach." />
          </Section>

          <Section title="Subscription & Billing">
            <FAQ q="What does the subscription include?" a="A subscription unlocks all features: connecting with coaches, viewing observations and drill assignments, receiving Custom Plans, messaging, and full access to the drill library." />
            <FAQ q="How do I manage my subscription?" a="Go to Settings, scroll to the Subscription section, and click 'Manage Subscription.' This opens Stripe's portal where you can update your payment method, switch plans, or cancel." />
            <FAQ q="Can I cancel anytime?" a="Yes. Cancel through the Manage Subscription link in Settings. Your access continues until the end of your current billing period." />
            <FAQ q="Is there a free trial?" a="Yes — new subscribers get a 14-day free trial. Your card is collected at signup but not charged until the trial ends." />
          </Section>

          <Section title="Need More Help?">
            <div className="rounded-xl bg-navy-light border border-wheat/8 p-6 text-center">
              <p className="text-sm text-offwhite/50 mb-3">Can&apos;t find what you&apos;re looking for?</p>
              <a href="mailto:cagetrack@gmail.com" className="inline-block px-6 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors">Email Us at cagetrack@gmail.com</a>
            </div>
          </Section>

        </div>
      </main>

      <nav className="fixed bottom-0 w-full z-50 bg-navy/95 backdrop-blur-xl border-t border-wheat/8 sm:hidden">
        <div className="flex justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">🏠</span><span className="text-[10px] text-offwhite/30">Home</span></Link>
          <Link href="/drills" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">📋</span><span className="text-[10px] text-offwhite/30">Drills</span></Link>
          <Link href="/coaches" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">🧢</span><span className="text-[10px] text-offwhite/30">Coaches</span></Link>
          <Link href="/settings" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">⚙️</span><span className="text-[10px] text-offwhite/30">Settings</span></Link>
        </div>
      </nav>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-wheat mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="rounded-xl bg-navy-light border border-wheat/8 group">
      <summary className="p-4 cursor-pointer flex items-center justify-between text-sm font-medium hover:text-wheat transition-colors list-none">
        {q}
        <span className="text-offwhite/20 group-open:rotate-90 transition-transform ml-3 flex-shrink-0">→</span>
      </summary>
      <div className="px-4 pb-4 text-sm text-offwhite/50 leading-relaxed">{a}</div>
    </details>
  );
}
