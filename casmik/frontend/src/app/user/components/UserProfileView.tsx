'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  HelpCircle, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Volume2
} from 'lucide-react';

export default function UserProfileView() {
  const [userName, setUserName] = useState('Adarsh Sachan');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('adarsh@casmik.com');
  const [upiId, setUpiId] = useState('adarsh@oksbi');
  const [audioChime, setAudioChime] = useState(true);

  return (
    <div className="space-y-4 px-3.5 py-3 text-slate-100 animate-in fade-in duration-300">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-4 flex items-center gap-3.5 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/10">
          AS
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-white">{userName}</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
              Verified User
            </span>
          </div>
          <p className="text-[11px] text-slate-400">{phone}</p>
          <p className="text-[11px] text-slate-400">{email}</p>
        </div>
      </div>

      {/* Payout Bank & UPI Details */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/70">
          <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Instant Payout UPI / Bank
          </h3>
          <span className="text-[10px] text-emerald-400 font-bold">Active</span>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 block font-medium">Default UPI ID for Selling Payouts</label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
          />
          <p className="text-[10px] text-slate-500">Device buyback cash is sent directly here upon doorstep pickup.</p>
        </div>
      </div>

      {/* Settings & Preferences */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 space-y-3 shadow-md">
        <h3 className="text-xs font-black text-white uppercase tracking-wider">
          Preferences & Alerts
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Audio Chime Alerts</span>
            </div>
            <input
              type="checkbox"
              checked={audioChime}
              onChange={(e) => setAudioChime(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <Link 
            href="/privacy" 
            className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-300">Data Protection &amp; Privacy Policy</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </Link>

          <Link 
            href="/contact-us" 
            className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-300">Help &amp; 24/7 WhatsApp Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </Link>
        </div>
      </div>

      {/* Switch to Other Casmik Portals */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-3.5 space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Quick Access to Other Panels
        </span>
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/partner"
            className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center hover:bg-blue-500/20 transition-all group"
          >
            <span className="text-xs font-bold text-blue-300 block group-hover:text-white">Partner</span>
            <span className="text-[9px] text-blue-400/80">Merchant</span>
          </Link>
          <Link
            href="/delivery"
            className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center hover:bg-amber-500/20 transition-all group"
          >
            <span className="text-xs font-bold text-amber-300 block group-hover:text-white">Delivery</span>
            <span className="text-[9px] text-amber-400/80">Executive</span>
          </Link>
          <Link
            href="/admin"
            className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center hover:bg-purple-500/20 transition-all group"
          >
            <span className="text-xs font-bold text-purple-300 block group-hover:text-white">Admin</span>
            <span className="text-[9px] text-purple-400/80">Super Ops</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
