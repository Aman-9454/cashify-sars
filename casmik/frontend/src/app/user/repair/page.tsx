'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Smartphone, 
  Laptop, 
  Camera, 
  ChevronRight, 
  Zap, 
  Phone, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';

const REPAIR_ISSUES = [
  { id: 'screen', title: 'Cracked / Broken Display', icon: '📱', estPrice: '₹1,999 - ₹8,499', duration: '45 mins' },
  { id: 'battery', title: 'Battery Degradation / Fast Drain', icon: '🔋', estPrice: '₹1,299 - ₹3,499', duration: '30 mins' },
  { id: 'port', title: 'Charging Port / Audio Jack', icon: '⚡', estPrice: '₹899 - ₹1,899', duration: '30 mins' },
  { id: 'camera', title: 'Camera Lens / Sensor Blurriness', icon: '📷', estPrice: '₹1,499 - ₹4,999', duration: '60 mins' },
  { id: 'speaker', title: 'Earpiece / Loudspeaker Muffled', icon: '🔊', estPrice: '₹799 - ₹1,499', duration: '30 mins' },
  { id: 'motherboard', title: 'Water Damage / Dead Phone', icon: '🔬', estPrice: '₹2,499 - ₹9,999', duration: '24-48 hrs' },
];

export default function UserRepairPage() {
  const [selectedIssue, setSelectedIssue] = useState<string>('screen');
  const [deviceModel, setDeviceModel] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [booked, setBooked] = useState(false);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceModel || !contactPhone) return;
    setBooked(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <CustomerHeader />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
            <Link href="/user" className="hover:text-white transition-colors">
              User Home
            </Link>
            <ChevronRight size={13} />
            <span className="text-emerald-400 font-bold">Device Repair</span>
          </nav>

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Wrench size={13} /> DOORSTEP CERTIFIED REPAIR
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Doorstep Smartphone &amp; Tech Repair
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Genuine OEM parts, 6-month warranty on replaced components, and certified technicians repairing your gadget right in front of your eyes at your doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* Main Repair Booking Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Issue Selector */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-2">1. Select Your Device Issue</h2>
              <p className="text-xs text-slate-500">Pick the primary malfunction to get an upfront transparent price estimate.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {REPAIR_ISSUES.map((issue) => {
                const active = selectedIssue === issue.id;
                return (
                  <button
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue.id)}
                    className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      active
                        ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{issue.icon}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {issue.duration}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">{issue.title}</h3>
                      <p className="text-xs font-semibold text-emerald-700">{issue.estPrice}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Why Doorstep Repair */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider">Casmik Repair Guarantees</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-emerald-600 w-5 h-5 flex-shrink-0" />
                  <span>6 Months Warranty on Parts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-blue-600 w-5 h-5 flex-shrink-0" />
                  <span>Repaired in 45 Mins at Doorstep</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-purple-600 w-5 h-5 flex-shrink-0" />
                  <span>100% Data Confidentiality</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-fit space-y-5">
            <h3 className="text-lg font-black text-slate-900">2. Book Doorstep Technician</h3>
            
            {booked ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-bold text-emerald-900">Repair Appointment Scheduled!</h4>
                <p className="text-xs text-emerald-700">
                  Our certified technician will call you within 15 minutes to confirm the exact time slot and address for your {deviceModel}.
                </p>
                <button
                  onClick={() => setBooked(false)}
                  className="mt-2 text-xs font-bold text-emerald-800 underline"
                >
                  Book another repair
                </button>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Device Brand &amp; Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 13 / OnePlus 11 / MacBook Air M1"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Mobile Number (for OTP &amp; Call)</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Doorstep Visit Charge:</span>
                    <span className="font-bold text-emerald-600">FREE (₹0)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Repair Time:</span>
                    <span className="font-bold text-slate-700">30 - 45 mins</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all"
                >
                  Confirm Doorstep Visit
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  Prefer selling your damaged phone?{' '}
                  <Link href="/user/sell-device" className="text-emerald-600 font-bold hover:underline">
                    Get Instant Cash Value
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <CustomerFooter />
    </main>
  );
}
