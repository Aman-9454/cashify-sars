'use client';
import React from 'react';
import { IndianRupee, Smartphone, MapPin, Star, ShieldCheck, Award, Laptop, Camera, RefreshCw } from 'lucide-react';

const stats = [
  {
    id: 'stat-cash',
    icon: IndianRupee,
    value: '₹18,400+ Cr',
    label: 'Total Cash Disbursed',
    subtext: 'Direct instant bank & UPI payouts to sellers',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'stat-devices',
    icon: Smartphone,
    value: '3,40,000+',
    label: 'Devices Handled',
    subtext: 'Smartphones, MacBooks, DSLRs, iPads & lenses',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'stat-cities',
    icon: MapPin,
    value: '200+',
    label: 'Cities Across India',
    subtext: 'Free doorstep pickup, delivery & trade swap',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 'stat-rating',
    icon: Star,
    value: '4.9 / 5.0',
    label: 'Customer Trust Rating',
    subtext: 'Based on 68,000+ verified customer reviews',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
];

export default function CamsikTrustScore() {
  return (
    <section className="py-10 lg:py-14 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
      {/* Background glow accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 border border-slate-700">
              <ShieldCheck size={14} />
              India&apos;s #1 ReCommerce Platform for Tech &amp; Cameras
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Trusted by 2.5+ Lakh Creators, Professionals &amp; Tech Enthusiasts
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Transparent AI valuation, instant bank payment, 45-point testing &amp; certified DoD data security
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
              <Award size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Official ISO 9001:2015 Certified</p>
              <p className="text-sm font-bold text-white">45-Point Hardware Inspection</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={22} />
                </div>
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1">
                  {item.value}
                </p>
                <p className="text-sm font-bold text-slate-200 mb-1">
                  {item.label}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.subtext}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
