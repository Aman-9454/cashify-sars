'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneCall, PhoneOff, X, Copy, Check, ShieldCheck, User, Truck, Store, Volume2 } from 'lucide-react';
import { playNotificationBeep } from '@/lib/notifications';

interface OrderCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  contactPhone: string;
  contactRole: string;
  orderNumber?: string;
}

export default function OrderCallModal({
  isOpen,
  onClose,
  contactName,
  contactPhone,
  contactRole,
  orderNumber,
}: OrderCallModalProps) {
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCallState('idle');
      setCallDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  if (!isOpen) return null;

  const handleStartInAppCall = () => {
    setCallState('calling');
    playNotificationBeep();

    // Simulate answer after 2.5 seconds
    setTimeout(() => {
      setCallState('connected');
      playNotificationBeep();
    }, 2500);
  };

  const handleEndCall = () => {
    setCallState('ended');
    setTimeout(() => {
      setCallState('idle');
      onClose();
    }, 1200);
  };

  const handleCopyPhone = () => {
    if (typeof navigator !== 'undefined' && contactPhone) {
      navigator.clipboard.writeText(contactPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const cleanPhone = contactPhone.replace(/\s+/g, '');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center text-white relative overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Ambient Ringing Glow */}
        {callState === 'calling' && (
          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none animate-pulse" />
        )}

        {/* Contact Avatar */}
        <div className="relative mx-auto mb-4 w-20 h-20">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-black shadow-lg transition-all duration-300 ${
              callState === 'connected'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white ring-4 ring-emerald-500/30'
                : callState === 'calling'
                ? 'bg-emerald-600 text-white animate-bounce'
                : 'bg-slate-800 border border-slate-700 text-emerald-400'
            }`}
          >
            {contactName ? contactName.charAt(0).toUpperCase() : 'C'}
          </div>
          {callState === 'connected' && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px]">
              ✓
            </span>
          )}
        </div>

        {/* Contact Info */}
        <h3 className="text-lg font-black text-white tracking-tight">{contactName}</h3>
        <div className="flex items-center justify-center gap-1.5 mt-1 mb-2">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
            {contactRole}
          </span>
          {orderNumber && (
            <span className="text-[11px] font-semibold text-slate-400">Order #{orderNumber}</span>
          )}
        </div>

        {/* Phone number & quick copy */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-mono text-slate-200 mb-6">
          <Phone size={13} className="text-emerald-400" />
          <span>{contactPhone}</span>
          <button
            type="button"
            onClick={handleCopyPhone}
            className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Copy Number"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
        </div>

        {/* Call Status / Timer */}
        <div className="mb-6">
          {callState === 'calling' ? (
            <div className="space-y-1">
              <p className="text-sm font-bold text-emerald-400 animate-pulse">Ringing handset...</p>
              <p className="text-xs text-slate-400">Waiting for receiver to connect</p>
            </div>
          ) : callState === 'connected' ? (
            <div className="space-y-1">
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Call Connected</p>
              <p className="text-2xl font-black font-mono text-white">{formatTimer(callDuration)}</p>
            </div>
          ) : callState === 'ended' ? (
            <p className="text-sm font-bold text-rose-400">Call Ended</p>
          ) : (
            <p className="text-xs text-slate-400">
              Dial directly on your mobile device or connect via in-app VoIP simulation.
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5">
          {callState === 'idle' ? (
            <>
              {/* Direct Phone App Call */}
              <a
                href={`tel:${cleanPhone}`}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <PhoneCall size={16} />
                <span>Dial Now (+91 {cleanPhone.slice(-10)})</span>
              </a>

              {/* In-app call simulation */}
              <button
                type="button"
                onClick={handleStartInAppCall}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
              >
                <Volume2 size={15} className="text-emerald-400" />
                <span>Connect In-App Audio Call</span>
              </button>
            </>
          ) : (
            /* Active Call End Button */
            <button
              type="button"
              onClick={handleEndCall}
              className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
            >
              <PhoneOff size={16} />
              <span>End Call</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
