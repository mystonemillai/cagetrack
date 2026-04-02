'use client';

import Link from 'next/link';

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-xl border-2 border-wheat flex items-center justify-center mx-auto mb-6 text-wheat font-display text-xl -rotate-3">
          CT
        </div>
        <h1 className="font-display text-4xl mb-4 text-wheat">You&apos;re All Set!</h1>
        <p className="text-offwhite/60 mb-2">Your subscription is now active.</p>
        <p className="text-offwhite/40 text-sm mb-8">All features are unlocked. Time to track some development.</p>
        <Link href="/dashboard" className="inline-block px-8 py-3 bg-wheat text-navy font-display text-sm tracking-wider rounded-lg hover:bg-wheat/90 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
