import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 px-4 py-3 bg-navy/90 backdrop-blur-xl border-b border-wheat/8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-xs -rotate-3">CT</div>
            <span className="font-display text-lg tracking-wider">CAGETRACK</span>
          </Link>
        </div>
      </nav>

      <main className="pt-20 pb-24 px-4 max-w-3xl mx-auto">
        <h1 className="font-display text-4xl mb-2">Privacy Policy</h1>
        <p className="text-offwhite/40 text-sm mb-8">Last updated: April 2026</p>

        <div className="space-y-6 text-sm text-offwhite/60 leading-relaxed">
          <section>
            <h2 className="font-display text-xl text-wheat mb-2">1. Introduction</h2>
            <p>CageTrack LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting the privacy of all users, including minors. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use CageTrack (&quot;the Service&quot;).</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">2. Information We Collect</h2>
            <p className="mb-2">We collect the following types of information:</p>
            <p><strong className="text-offwhite/80">Account Information:</strong> Name, email address, password (encrypted), role (player/parent/coach), profile photo.</p>
            <p><strong className="text-offwhite/80">Player Information:</strong> Player name, age group, sport, positions, team name, city, state, zip code.</p>
            <p><strong className="text-offwhite/80">Coach Information:</strong> Display name, specialties, coach type, bio, location, service radius, video introduction URL.</p>
            <p><strong className="text-offwhite/80">Development Data:</strong> Coaching observations, drill assignments, AI-generated development plans, messages between connected users.</p>
            <p><strong className="text-offwhite/80">Payment Information:</strong> Processed securely by Stripe. We do not store credit card numbers. We receive transaction confirmations and subscription status from Stripe.</p>
            <p><strong className="text-offwhite/80">Usage Data:</strong> Last login timestamp for notification purposes.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">3. How We Use Your Information</h2>
            <p>We use your information to: operate and maintain the Service; connect players with coaches and family members; display development progress and coaching feedback; generate AI-powered development plans; process payments; send notifications about new activity; display coach profiles in the public directory; and improve the Service.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">4. Information Sharing</h2>
            <p className="mb-2">We share your information only in these limited circumstances:</p>
            <p><strong className="text-offwhite/80">Connected Users:</strong> When you connect with a coach, player, or parent through the platform, relevant profile and development information is shared between connected users as necessary for the Service to function.</p>
            <p><strong className="text-offwhite/80">Coach Directory:</strong> Coaches who opt into the directory have their display name, specialties, location, bio, and profile photo visible to other logged-in users.</p>
            <p><strong className="text-offwhite/80">Public Coach Profiles:</strong> Coaches who enable their public profile have their information visible at a shareable URL accessible without login.</p>
            <p><strong className="text-offwhite/80">Service Providers:</strong> We use Supabase (database/authentication), Vercel (hosting), Stripe (payments), and Anthropic (AI). These providers process data as necessary to operate the Service under their own privacy policies.</p>
            <p>We do not sell your personal information to third parties. We do not share your data with advertisers.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">5. Children&apos;s Privacy (COPPA Compliance)</h2>
            <p>CageTrack is designed for youth athletes with parental involvement. For users under 13, we require a parent or guardian to create and manage the account. We do not knowingly collect personal information directly from children under 13 without parental consent. Parents may review, update, or delete their child&apos;s information by contacting us. If we learn that we have collected information from a child under 13 without parental consent, we will delete that information promptly.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">6. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data including: encrypted data transmission (HTTPS/TLS), encrypted password storage, row-level security on our database ensuring users can only access data they are authorized to see, and secure payment processing through Stripe. No system is 100% secure, but we take reasonable measures to protect your information.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">7. Data Retention</h2>
            <p>We retain your data for as long as your account is active. If you delete your account, we will delete your personal information within 30 days, except where retention is required by law or necessary for legitimate business purposes (such as resolving disputes or enforcing agreements).</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">8. Your Rights</h2>
            <p>You have the right to: access and download your personal data; update or correct your information through the Edit Profile page; delete your account and associated data; opt out of the coach directory; and withdraw consent for data processing. To exercise any of these rights, contact us at cagetrack@gmail.com.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">9. Cookies and Tracking</h2>
            <p>We use essential cookies for authentication and session management. We do not use advertising cookies or third-party tracking cookies. We use localStorage for user preferences such as notification dismissal state.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">10. Third-Party Links</h2>
            <p>The Service may contain links to third-party websites (such as YouTube videos, Substack blog posts, or coach websites). We are not responsible for the privacy practices of these external sites.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">12. Contact Us</h2>
            <p>For questions about this Privacy Policy or to exercise your privacy rights, contact us at <a href="mailto:cagetrack@gmail.com" className="text-wheat hover:underline">cagetrack@gmail.com</a></p>
          </section>
        </div>
      </main>
    </div>
  );
}
