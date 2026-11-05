'use client';
import React from 'react';
import { 
  TrendingUp, 
  Zap, 
  Truck, 
  ShieldCheck, 
  FileCheck2, 
  EyeOff, 
  Smartphone, 
  Sparkles, 
  Scale, 
  Clock,
  RefreshCw,
  Award
} from 'lucide-react';

const reasons = [
  {
    id: 'why-price',
    icon: TrendingUp,
    title: 'Objective AI Valuation',
    desc: 'Our dynamic pricing engine factors in current cosmetic grade, battery cycles, hardware health, and market liquidity to give you up to 25% higher value than offline shops.',
    badge: 'Best Market Price',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    id: 'why-payment',
    icon: Zap,
    title: 'Instant Bank Payout',
    desc: 'Receive funds directly into your bank account or UPI within 2 minutes of doorstep verification — strictly before handing over your device.',
    badge: 'Instant UPI/IMPS',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    id: 'why-pickup',
    icon: Truck,
    title: 'Free Doorstep Service in 200+ Cities',
    desc: 'Trained technicians visit your home, office, or studio across 200+ cities in India. Free doorstep pickup, refurbished delivery, and trade-in swaps.',
    badge: '200+ Cities',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    id: 'why-inspection',
    icon: Smartphone,
    title: 'Automated 45-Point Diagnostics',
    desc: 'Transparent digital hardware checks for OLED screens, camera sensors, battery health, and mechanical parts right in front of you without subjective bias.',
    badge: 'Zero Deduction Bias',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
  {
    id: 'why-data',
    icon: EyeOff,
    title: 'Certified DoD 5220.22-M Data Wipe',
    desc: 'Military-grade data purging on smartphones, MacBooks, laptops, and cameras ensuring 100% privacy protection of photos, personal accounts, and documents.',
    badge: '100% Privacy Secure',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
  },
  {
    id: 'why-invoice',
    icon: FileCheck2,
    title: 'Legal Bill of Sale & Liability Indemnity',
    desc: 'Receive a legally binding purchase invoice and indemnity certificate relieving you of all future ownership liability once the device is handed over.',
    badge: 'Full Legal Indemnity',
    color: 'bg-teal-50 text-teal-600 border-teal-200',
  },
  {
    id: 'why-exchange',
    icon: RefreshCw,
    title: '1-Step Doorstep Exchange',
    desc: 'Trade any old phone, laptop, or camera for a modern flagship at your doorstep. Get an extra trade bonus up to ₹5,000 and pay only the difference.',
    badge: 'Extra ₹5,000 Bonus',
    color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200',
  },
  {
    id: 'why-warranty',
    icon: Award,
    title: '6 to 12 Months Refurbished Warranty',
    desc: 'Every pre-owned certified device sold through Camsik comes with comprehensive warranty coverage, genuine parts verification, and 7-day easy replacement.',
    badge: 'Certified Warranty',
    color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  },
  {
    id: 'why-transparent',
    icon: Scale,
    title: '7-Day Price Lock & Zero Haggling',
    desc: 'Lock in your device valuation online for up to 7 days. Skip the spam calls, time-wasters, and stressful negotiations of open classifieds.',
    badge: '7-Day Price Lock',
    color: 'bg-rose-50 text-rose-600 border-rose-200',
  },
];

export default function WhyCamsik() {
  return (
    <section id="why-us" className="py-10 lg:py-16 bg-white relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles size={13} className="text-purple-600" />
            The Camsik Advantage
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why Over 2.5 Lakh Customers Trust <span className="text-primary">Camsik</span>
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
            Experience the safest, fastest, and most transparent platform to buy, sell, and exchange smartphones, laptops, MacBooks, tablets, and DSLR cameras with zero hassle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.id}
                className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${reason.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-slate-600">
                      {reason.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-2 group-hover:text-primary transition-colors">
                    {reason.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {reason.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more about our standards &rarr;
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
