'use client';

import React from 'react';
import { MapPin, BellRing, ArrowRight, X } from 'lucide-react';

interface UnserviceableAreaModalProps {
  isOpen: boolean;
  pincode: string;
  onClose: () => void;
  onGoHome?: () => void;
}

export default function UnserviceableAreaModal({
  isOpen,
  pincode,
  onClose,
  onGoHome,
}: UnserviceableAreaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Pulsing Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 relative">
          <MapPin size={32} className="animate-bounce" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        {/* Title */}
        <span className="inline-block text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full mb-2">
          Area Notice · PIN {pincode || 'Entered'}
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
          Coverage Expansion Notice
        </h3>

        {/* Specified User Message */}
        <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80 mb-5 text-left">
          <p className="text-sm sm:text-base font-extrabold text-amber-950 leading-relaxed text-center">
            &ldquo;Thanks for your request, we will soon come and start servicing in your area.&rdquo;
          </p>
        </div>

        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Your request for PIN <strong className="text-slate-800 font-mono">{pincode}</strong> has been logged in our expansion queue. You will receive an SMS alert as soon as our executive fleet starts operations here.
        </p>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
          >
            Understood, Thank You
          </button>
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              Return to Homepage
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
