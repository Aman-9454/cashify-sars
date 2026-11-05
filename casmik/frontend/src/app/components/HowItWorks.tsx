'use client';
import React, { useState } from 'react';
import {
  Smartphone,
  ClipboardCheck,
  Banknote,
  Calendar,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Laptop,
  Camera,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const tabs = [
  { id: 'tab-sell', label: 'Sell Tech & Gear', icon: Zap },
  { id: 'tab-buy', label: 'Buy Certified Refurbished', icon: ShoppingBag },
  { id: 'tab-exchange', label: 'Exchange & Upgrade', icon: RefreshCw },
];

const flows: Record<
  string,
  {
    icon: React.ElementType;
    stepNumber: string;
    title: string;
    desc: string;
    highlight: string;
  }[]
> = {
  'tab-sell': [
    {
      icon: Smartphone,
      stepNumber: '01',
      title: 'Select Device & Get AI Quote',
      desc: 'Pick your Smartphone, MacBook, Windows Laptop, Tablet, DSLR, Mirrorless camera, or Lens model and answer quick condition questions.',
      highlight: 'Instant AI Quote in 60s',
    },
    {
      icon: Calendar,
      stepNumber: '02',
      title: 'Schedule Free Doorstep Pickup',
      desc: 'Choose your preferred date and time slot. Our certified technical evaluation specialist arrives at your home, office, or studio.',
      highlight: 'Available in 200+ Cities',
    },
    {
      icon: Banknote,
      stepNumber: '03',
      title: 'Get Instant Bank Payment',
      desc: 'Quick 15-minute diagnostic test and certified DoD data wipe. Payout transferred directly to your bank account or UPI on the spot before handover.',
      highlight: 'Zero Commission or Hidden Fees',
    },
  ],
  'tab-buy': [
    {
      icon: Laptop,
      stepNumber: '01',
      title: 'Browse 45-Point Certified Tech',
      desc: 'Explore pre-owned iPhones, Samsung Galaxy, MacBooks, iPads, DSLRs, and pro lenses tested through rigorous hardware and optical inspections.',
      highlight: '100% Genuine Certified',
    },
    {
      icon: ShieldCheck,
      stepNumber: '02',
      title: 'Select Condition Grade & Warranty',
      desc: 'Choose between Superb, Good, and Fair grades with transparent inspection reports, verified battery health, and 6 to 12 months warranty.',
      highlight: 'Up to 12-Month Warranty',
    },
    {
      icon: Banknote,
      stepNumber: '03',
      title: 'Insured Delivery & 7-Day Trial',
      desc: 'Enjoy secure checkout with zero-cost EMI options. Receive fast, insured doorstep delivery backed by our 7-day hassle-free replacement policy.',
      highlight: '100% Transit Insured',
    },
  ],
  'tab-exchange': [
    {
      icon: Smartphone,
      stepNumber: '01',
      title: 'Evaluate Existing Gadget',
      desc: 'Provide details of your old phone, laptop, or camera to calculate guaranteed trade-in credit plus our exclusive exchange bonus.',
      highlight: 'Extra ₹5,000 Exchange Bonus',
    },
    {
      icon: ClipboardCheck,
      stepNumber: '02',
      title: 'Pick Your Upgraded Model',
      desc: 'Browse our flagship smartphones, M-series MacBooks, iPads, or mirrorless bodies to replace your aging tech with zero stress.',
      highlight: 'Wide Selection in Stock',
    },
    {
      icon: RefreshCw,
      stepNumber: '03',
      title: '1-Step Doorstep Swap',
      desc: 'Our technician brings your upgraded device, verifies your old gear at your doorstep, and you pay only the remaining balance (or get cash back!).',
      highlight: 'Same-Day Swap Experience',
    },
  ],
};

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState('tab-sell');
  const steps = flows[activeTab] || flows['tab-sell'];

  return (
    <section id="how-it-works" className="py-10 lg:py-16 bg-gradient-to-b from-white via-slate-50 to-white relative">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles size={13} className="text-emerald-600" />
            Simple 3-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How <span className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Camsik</span> Works
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
            Sell old tech for instant liquid cash, buy certified refurbished flagships, or upgrade via 1-step doorstep exchange.
          </p>
        </div>

        {/* Tab Buttons (Sell / Buy / Exchange) */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10 flex-wrap">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 sm:px-7 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? tab.id === 'tab-sell'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-600/20'
                      : tab.id === 'tab-buy'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-600/20'
                      : 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-600/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={`${activeTab}-${step.stepNumber}`}
                className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between group hover:border-slate-300 hover:-translate-y-1"
              >
                {/* Step indicator watermark */}
                <div className="absolute top-6 right-6 text-4xl font-black text-slate-100 group-hover:text-slate-200 transition-colors pointer-events-none select-none">
                  {step.stepNumber}
                </div>

                <div>
                  {/* Icon Circle */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-md text-white group-hover:scale-110 transition-transform duration-300 ${
                      activeTab === 'tab-sell'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
                        : activeTab === 'tab-buy'
                        ? 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-500/20'
                        : 'bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-purple-500/20'
                    }`}
                  >
                    <Icon size={26} />
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-3 ${
                      activeTab === 'tab-sell'
                        ? 'text-emerald-700 bg-emerald-50'
                        : activeTab === 'tab-buy'
                        ? 'text-indigo-700 bg-indigo-50'
                        : 'text-purple-700 bg-purple-50'
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    {step.highlight}
                  </span>

                  <h3 className="font-black text-lg sm:text-xl text-slate-900 mb-2.5 group-hover:text-slate-800 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                  <span>Step {step.stepNumber} of 03</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Action Button for Active Tab */}
        <div className="mt-9 text-center">
          {activeTab === 'tab-sell' && (
            <Link
              href="/sell-device-get-quote"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-md shadow-emerald-600/25 hover:scale-105 transition-all duration-200"
            >
              <Smartphone size={18} />
              Check Your Device&apos;s Resale Value Now &rarr;
            </Link>
          )}
          {activeTab === 'tab-buy' && (
            <Link
              href="/buy-refurbished"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-md shadow-indigo-600/25 hover:scale-105 transition-all duration-200"
            >
              <ShoppingBag size={18} />
              Browse Certified Refurbished Store &rarr;
            </Link>
          )}
          {activeTab === 'tab-exchange' && (
            <Link
              href="/exchange-device"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm sm:text-base shadow-md shadow-purple-600/25 hover:scale-105 transition-all duration-200"
            >
              <RefreshCw size={18} />
              Calculate Your Trade-In &amp; Exchange Value &rarr;
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}