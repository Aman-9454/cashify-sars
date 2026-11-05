'use client';
import React, { useState, useEffect } from 'react';
import { Smartphone, Laptop, Camera, Tablet, Star, QrCode, ShieldCheck, Zap, Truck, CheckCircle2, ChevronRight, Activity, Cpu } from 'lucide-react';

interface DeviceDiagnosticPreview {
  id: 'phone' | 'laptop' | 'camera' | 'tablet';
  label: string;
  icon: React.ElementType;
  deviceTitle: string;
  deviceSubtitle: string;
  metric1Label: string;
  metric1Value: string;
  metric1Sub: string;
  metric2Label: string;
  metric2Value: string;
  valuation: string;
  badge: string;
  scheduleText: string;
}

const previewDevices: DeviceDiagnosticPreview[] = [
  {
    id: 'phone',
    label: 'Smartphone',
    icon: Smartphone,
    deviceTitle: 'iPhone 15 Pro Max',
    deviceSubtitle: '256GB Natural Titanium (A17 Pro)',
    metric1Label: 'Battery Health',
    metric1Value: '98%',
    metric1Sub: 'Peak Performance (142 Cycles)',
    metric2Label: '45-Pt Hardware Test',
    metric2Value: 'Grade A+ Pristine (100%)',
    valuation: '₹84,500',
    badge: 'Instant UPI Payout',
    scheduleText: 'Free Doorstep Verification Today • 3:00 PM',
  },
  {
    id: 'laptop',
    label: 'MacBook / Laptop',
    icon: Laptop,
    deviceTitle: 'Apple MacBook Air M2',
    deviceSubtitle: '16GB RAM · 512GB SSD · Space Grey',
    metric1Label: 'Battery & Cycle',
    metric1Value: '96%',
    metric1Sub: 'Normal Condition (88 Cycles)',
    metric2Label: 'Data Sanitization',
    metric2Value: 'DoD 5220.22-M Wipe Ready',
    valuation: '₹68,000',
    badge: 'Direct Bank Transfer',
    scheduleText: 'Certified Technician Assigned • Bandra West',
  },
  {
    id: 'camera',
    label: 'DSLR & Mirrorless',
    icon: Camera,
    deviceTitle: 'Sony Alpha 7 IV (ILCE-7M4)',
    deviceSubtitle: '33MP Full-Frame Exmor R CMOS Body',
    metric1Label: 'Live Shutter Count',
    metric1Value: '12,410 / 200k',
    metric1Sub: 'Sensor Grade A (94% Pristine)',
    metric2Label: 'Sensor & IBIS Check',
    metric2Value: 'Laser Auto-Calibrated',
    valuation: '₹1,48,500',
    badge: 'Price Guarantee Locked',
    scheduleText: 'Studio Pickup Scheduled Today • 4:30 PM',
  },
  {
    id: 'tablet',
    label: 'iPad & Tablet',
    icon: Tablet,
    deviceTitle: 'Apple iPad Pro 11" M2',
    deviceSubtitle: '256GB Wi-Fi + Cellular · Space Grey',
    metric1Label: 'Liquid Retina Display',
    metric1Value: '100%',
    metric1Sub: 'TrueDepth & Pencil OK',
    metric2Label: 'Diagnostic Result',
    metric2Value: 'Grade A Flawless Condition',
    valuation: '₹54,000',
    badge: 'Exchange / Buyback',
    scheduleText: 'Free Doorstep Pickup Scheduled • In 45 Mins',
  },
];

export default function AppDownloadCTA() {
  const [activeTab, setActiveTab] = useState<'phone' | 'laptop' | 'camera' | 'tablet'>('phone');
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate preview every 4.5s if not paused by user
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveTab((current) => {
        const order: Array<'phone' | 'laptop' | 'camera' | 'tablet'> = ['phone', 'laptop', 'camera', 'tablet'];
        const nextIndex = (order.indexOf(current) + 1) % order.length;
        return order[nextIndex];
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeDevice = previewDevices.find((d) => d.id === activeTab) || previewDevices[0];

  return (
    <section className="bg-slate-50 pt-8 pb-16 sm:pb-20 w-full overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Floating App Showcase Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-[#0a101f] to-slate-900 border border-slate-800/90 shadow-2xl p-6 sm:p-10 lg:p-12 overflow-hidden text-white">
          
          {/* Dynamic ambient background glows inside the card */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -left-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
            
            {/* Left Column: Heading, Value Props & Download Badges */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 text-xs font-bold text-primary mb-5 border border-primary/30 shadow-sm backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                OFFICIAL CAMSIK RECOMMERCE APP • IOS &amp; ANDROID
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                Trade, Buy &amp; Sell Tech Smarter with the{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-primary bg-clip-text text-transparent">
                  Camsik App
                </span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed max-w-2xl font-medium">
                Run automated 45-point AI hardware diagnostics for Smartphones, MacBooks, Laptops, Tablets, DSLRs &amp; Creator Gear. Check real-time battery health, shutter counts, sensor grades, get instant guaranteed quotes, and track your doorstep technician in real time.
              </p>

              {/* Ratings & Social Proof */}
              <div className="flex flex-wrap items-center gap-4 mb-8 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl w-fit">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={`app-star-${s}`} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  <strong className="text-white font-black">4.9/5 Rating</strong> (35,000+ Reviews) &bull; <span className="text-emerald-400 font-bold">2,50,000+ Users &amp; Creators Trust Us</span>
                </span>
              </div>

              {/* App Store Buttons and QR Code */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 px-5 py-3.5 bg-slate-900 border border-slate-700/80 rounded-2xl hover:border-primary hover:bg-slate-800 transition-all hover:scale-105 shadow-lg group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                    GP
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">GET IT ON</p>
                    <p className="text-sm font-black text-white group-hover:text-primary transition-colors">Google Play</p>
                  </div>
                </a>

                <a
                  href="https://apple.com/app-store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 px-5 py-3.5 bg-slate-900 border border-slate-700/80 rounded-2xl hover:border-primary hover:bg-slate-800 transition-all hover:scale-105 shadow-lg group"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-xs">
                    iOS
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">DOWNLOAD ON</p>
                    <p className="text-sm font-black text-white group-hover:text-primary transition-colors">Apple App Store</p>
                  </div>
                </a>

                <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-800">
                  <div className="w-12 h-12 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-md">
                    <QrCode size={36} className="text-slate-950" />
                  </div>
                  <div className="text-xs text-slate-300">
                    <p className="font-bold text-white">Scan to install app</p>
                    <p className="text-slate-400 text-[11px]">Instant device quote &amp; pickup</p>
                  </div>
                </div>
              </div>

              {/* App Capabilities (Distinct from Footer Badges) */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-400 font-medium pt-2">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Free Automated 45-Pt Hardware Diagnostics
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Real-time Technician GPS Tracking
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Zero Obligations &bull; Guaranteed Payout Lock
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Multi-Device Diagnostic Simulator */}
            <div 
              className="lg:col-span-5 flex flex-col items-center justify-center"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Device Selector Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl w-full max-w-md">
                {previewDevices.map((dev) => {
                  const IconComponent = dev.icon;
                  const isActive = activeTab === dev.id;
                  return (
                    <button
                      key={dev.id}
                      onClick={() => setActiveTab(dev.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-md shadow-primary/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <IconComponent size={14} />
                      <span>{dev.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mockup Display Card */}
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary/30 via-emerald-500/20 to-purple-600/30 blur-2xl animate-pulse" />
                
                <div className="relative z-10 w-full rounded-3xl border-2 border-slate-700/80 bg-slate-900/95 p-5 sm:p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xl transition-all">
                  
                  {/* Header status */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white block">Camsik AI Smart Diagnostic</span>
                        <span className="text-[10px] text-slate-400">Automated 45-Pt Verification</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      Live Connected
                    </span>
                  </div>

                  {/* Device Info & Specs */}
                  <div className="space-y-3 my-4">
                    <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Detected Device</p>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          100% Genuine
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-black text-white mt-0.5">{activeDevice.deviceTitle}</p>
                      <p className="text-xs text-slate-400">{activeDevice.deviceSubtitle}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/70">
                        <p className="text-[10px] text-slate-400 font-semibold">{activeDevice.metric1Label}</p>
                        <p className="text-sm sm:text-base font-black text-emerald-400 mt-0.5">{activeDevice.metric1Value}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{activeDevice.metric1Sub}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/70">
                        <p className="text-[10px] text-slate-400 font-semibold">{activeDevice.metric2Label}</p>
                        <p className="text-sm sm:text-base font-black text-white mt-0.5">{activeDevice.metric2Value}</p>
                        <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Verified Passed</p>
                      </div>
                    </div>

                    {/* Guaranteed Valuation */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-primary/20 border border-emerald-500/40 flex justify-between items-center shadow-inner">
                      <div>
                        <p className="text-[10px] text-emerald-400 uppercase font-extrabold tracking-wider">Instant Valuation</p>
                        <p className="text-2xl sm:text-3xl font-black text-white">{activeDevice.valuation}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black bg-primary px-3 py-1.5 rounded-xl text-white shadow-md block">
                          Price Locked
                        </span>
                        <span className="text-[10px] text-emerald-300 font-semibold block mt-1">
                          {activeDevice.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Technician Dispatch Footer */}
                  <div className="pt-3 border-t border-slate-800/90 text-center flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium truncate">
                      <Truck size={13} className="text-primary flex-shrink-0" />
                      {activeDevice.scheduleText}
                    </span>
                    <span className="text-[10px] text-primary font-bold hover:underline cursor-pointer flex-shrink-0">
                      Track Live →
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-2.5 text-center">
                Tap any category above to simulate AI diagnostic tests on the Camsik App
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}