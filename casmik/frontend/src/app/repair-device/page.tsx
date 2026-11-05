'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';

export default function RepairRedirectPage() {
  const router = useRouter();

  // Redirect automatically after 3 seconds, or let the user click
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/sell-device-get-quote');
    }, 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-background flex flex-col justify-between">
      <CustomerHeader />

      <section className="flex-1 flex items-center justify-center py-10 sm:py-14 px-4">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-border/80 p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="w-20 h-20 rounded-3xl gradient-green flex items-center justify-center text-white mx-auto mb-6 shadow-green">
            <Camera size={38} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={13} />
            Camera Trade-In & Resale
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
            Camsik is Now Exclusively for Cameras &amp; Optics
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed">
            Repair services have been retired to focus 100% on providing India&apos;s highest instant payouts and doorstep trade-ins for DSLR cameras, mirrorless bodies, cinema gear, lenses, and gimbals.
          </p>

          <div className="p-4 rounded-2xl bg-surface border border-border/60 mb-8 text-xs text-muted-foreground flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-primary" />
            <span>Redirecting to Camera Valuation in 3 seconds...</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sell-device-get-quote"
              className="px-6 py-3.5 rounded-xl gradient-green text-white font-bold text-sm shadow-green hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-press"
            >
              Sell Your Camera Now <ArrowRight size={16} />
            </Link>
            <Link
              href="/"
              className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-foreground font-bold text-sm transition-all"
            >
              Explore Homepage
            </Link>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </main>
  );
}
