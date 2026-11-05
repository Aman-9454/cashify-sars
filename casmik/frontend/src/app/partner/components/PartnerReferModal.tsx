'use client';
import React, { useState } from 'react';
import { X, Copy, Check, Share2, Gift, Users, Award, ExternalLink } from 'lucide-react';
import { Partner } from '@/lib/casmikData';

interface Props {
  partner: Partner;
  isOpen: boolean;
  onClose: () => void;
}

export default function PartnerReferModal({ partner, isOpen, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const partnerCode = `CAMSIK-PTR-${(partner?.id || '001').toUpperCase().replace('PARTNER-', '')}`;
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/partner/register?ref=${partnerCode}`
    : `https://casmik-one.vercel.app/partner/register?ref=${partnerCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = `Join the CAMSIK Tech & Camera Partner Network! Get daily device repair and doorstep inspection orders with high commissions. Use my referral code *${partnerCode}* to register: ${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X size={18} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <Gift size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-black">Refer & Earn Extra Commission</h3>
          <p className="text-emerald-100 text-xs mt-1">
            Invite fellow tech & camera stores to become Camsik Certified Partners and earn cash rewards.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Reward highlights */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 text-center">
              <p className="text-2xl font-black text-emerald-700">₹2,000</p>
              <p className="text-xs font-semibold text-emerald-800 mt-0.5">Direct Referral Bonus</p>
              <p className="text-[10px] text-emerald-600">Per partner after 5 completed orders</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 text-center">
              <p className="text-2xl font-black text-blue-700">2.5%</p>
              <p className="text-xs font-semibold text-blue-800 mt-0.5">Lifetime Override</p>
              <p className="text-[10px] text-blue-600">On all inspection commissions</p>
            </div>
          </div>

          {/* Referral Code Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Your Partner Code</label>
            <div className="flex items-center justify-between p-3.5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
              <span className="font-mono text-base font-black text-gray-900 tracking-wider">{partnerCode}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Referral Link Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Your Referral Link</label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={referralLink}
                className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 select-all font-mono truncate"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <Share2 size={16} />
              Share on WhatsApp
            </button>
          </div>

          {/* Stats Bar */}
          <div className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-gray-400" />
              <span>Partners Referred: <strong className="text-gray-900">0</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award size={14} className="text-emerald-500" />
              <span>Earned to Date: <strong className="text-emerald-600">₹0</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
