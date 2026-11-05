'use client';
import React from 'react';
import { ShieldCheck, Lock, FileCheck2, Cpu, CheckCircle2, Award, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const safetyPillars = [
  {
    icon: Cpu,
    title: 'Automated 45-Point Diagnostics',
    description: 'We test touchscreens, OLED displays, battery cycle health, motherboard sensors, optics, and shutter mechanisms right in front of you using calibrated diagnostic software.',
  },
  {
    icon: Zap,
    title: 'Payment Handover Guarantee',
    description: 'Our technician initiates an instant IMPS or UPI transfer directly to your chosen bank account and waits for your SMS/app confirmation before taking the device.',
  },
  {
    icon: Lock,
    title: 'DoD 5220.22-M Certified Data Wipe',
    description: 'Smartphones, MacBooks, laptops, SSDs, and camera internal buffers are sanitized to strict military-grade standards, guaranteeing 100% privacy protection.',
  },
  {
    icon: FileCheck2,
    title: 'Legal Bill of Sale & Liability Indemnity',
    description: 'You receive an instant digitally signed GST purchase invoice and legal indemnity certificate confirming the formal transfer of serial numbers to Camsik India.',
  },
];

export default function SafeAndReliableSection() {
  return (
    <section className="py-10 lg:py-16 bg-slate-50 border-y border-slate-200/80 relative overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: 3D-styled Shield Card & Visual Guarantee */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl p-7 sm:p-9 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl overflow-hidden border border-slate-800">
              {/* Decorative radial gradients */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 mb-6">
                  <ShieldCheck size={32} />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 border border-slate-700">
                  <Award size={13} />
                  Safe &amp; Reliable Guarantee
                </div>

                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3 leading-snug">
                  Trading, Buying &amp; Selling Tech Shouldn&apos;t Be Risky
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  Unlike unregulated open marketplaces where meeting strangers carries fraud or safety risks, Camsik provides an enterprise-grade, insured, and verified trade-in ecosystem.
                </p>

                <div className="space-y-3 pt-4 border-t border-slate-800 text-xs sm:text-sm font-semibold text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Zero store visits — 100% free doorstep convenience</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Verified, background-checked device specialists</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Full transit insurance covered by Camsik</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/sell-device-get-quote"
                    className="inline-flex items-center justify-center w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/30 hover:shadow-lg transition-all"
                  >
                    <span>Trade Your Devices with Full Protection</span>
                    <ArrowRight size={15} className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Security & Reliability Pillars */}
          <div className="lg:col-span-7">
            <div className="mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
                Uncompromising Trust
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                The 4 Pillars of Camsik Protection
              </h2>
              <p className="text-slate-600 mt-2 text-sm sm:text-base">
                How we protect your money, your privacy, and your time at every step of buying, selling, or exchanging gadgets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {safetyPillars.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                        <Icon size={22} />
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 mb-2">
                        {pillar.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
