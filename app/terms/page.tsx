import Link from 'next/link';

export default function TermsPage() {
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
        <h1 className="font-display text-4xl mb-2">Terms of Service</h1>
        <p className="text-offwhite/40 text-sm mb-8">Last updated: April 2026</p>

        <div className="space-y-6 text-sm text-offwhite/60 leading-relaxed">
          <section>
            <h2 className="font-display text-xl text-wheat mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using CageTrack (&quot;the Service&quot;), operated by CageTrack LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. If you are under 18, a parent or legal guardian must agree to these terms on your behalf.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">2. Description of Service</h2>
            <p>CageTrack is a player development tracking platform for baseball and softball players ages 8U through 18U. The Service allows players, parents/guardians, and coaches to track development progress, log observations, assign drills, generate AI-powered development plans, and communicate within the platform.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">3. Account Registration</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. For users under 14, a parent or guardian must create and manage the account. Users 14 and older may create their own account with parental awareness.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">4. User Roles</h2>
            <p>The Service supports three user roles: Player, Parent/Family, and Coach. Coach accounts are free. Player and Family accounts require a paid subscription to access all features including coach connections. Each role has specific permissions and responsibilities within the platform.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">5. Subscriptions and Payments</h2>
            <p>Paid subscriptions are billed monthly or annually through Stripe. A 14-day free trial is available for new subscribers. You may cancel your subscription at any time through the Manage Subscription option in Settings. Cancellations take effect at the end of the current billing period. Refunds are handled on a case-by-case basis.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">6. User Content</h2>
            <p>You retain ownership of all content you create on the platform including observations, drill notes, messages, and profile information. By using the Service, you grant CageTrack a non-exclusive license to store, display, and transmit your content as necessary to operate the Service. You are responsible for ensuring your content does not violate any laws or third-party rights.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">7. AI-Generated Content</h2>
            <p>The Service includes AI-powered development plans generated using third-party AI technology. These plans are provided as suggestions only and should not replace professional coaching judgment, medical advice, or injury rehabilitation protocols. CageTrack is not liable for outcomes resulting from following AI-generated recommendations.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">8. Coach Responsibilities</h2>
            <p>Coaches using the platform are responsible for the accuracy and appropriateness of their observations, drill assignments, and communications. CageTrack does not verify coaching credentials or certifications. Parents and players should independently verify coach qualifications.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">9. Minors and Parental Consent</h2>
            <p>CageTrack is designed for use by minors with parental involvement. Parents and guardians are responsible for overseeing their child&apos;s use of the platform. By creating a player profile for a minor, you confirm that you are the parent or legal guardian of that player. We comply with the Children&apos;s Online Privacy Protection Act (COPPA) for users under 13.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">10. Prohibited Conduct</h2>
            <p>You agree not to: use the Service for any unlawful purpose; harass, abuse, or harm other users; impersonate another person or coach; upload malicious content; attempt to gain unauthorized access to the Service; use the Service to recruit minors for purposes unrelated to baseball/softball development; or interfere with the proper functioning of the Service.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">11. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time for violations of these Terms. You may delete your account at any time by contacting us. Upon termination, your data will be deleted in accordance with our Privacy Policy.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">12. Limitation of Liability</h2>
            <p>CageTrack is provided &quot;as is&quot; without warranties of any kind. We are not liable for any injuries, damages, or losses resulting from the use of drills, training plans, or coaching advice provided through the platform. Use all training recommendations at your own risk and consult appropriate professionals for medical or injury-related concerns.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">13. Changes to Terms</h2>
            <p>We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms. We will notify users of material changes via email or in-app notification.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-wheat mb-2">14. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:cagetrack@gmail.com" className="text-wheat hover:underline">cagetrack@gmail.com</a></p>
          </section>
        </div>
      </main>
    </div>
  );
}
