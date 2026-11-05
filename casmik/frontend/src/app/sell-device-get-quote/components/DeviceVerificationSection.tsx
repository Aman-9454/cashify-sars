'use client';
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  CheckCircle, 
  Lock, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle 
} from 'lucide-react';
import { DeviceVerificationReport } from '@/lib/deviceVerification/types';
import DeviceVerificationModal from './DeviceVerificationModal';
import FullVerificationReportModal from './FullVerificationReportModal';

interface Props {
  selectedBrand: string;
  selectedModel: string;
  selectedVariant?: string;
  verificationReport: DeviceVerificationReport | null;
  onVerified: (report: DeviceVerificationReport) => void;
  onRecheck: () => void;
}

export default function DeviceVerificationSection({
  selectedBrand,
  selectedModel,
  selectedVariant,
  verificationReport,
  onVerified,
  onRecheck,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const isVerified = verificationReport?.status === 'verified';
  const isMismatch = verificationReport?.status === 'mismatch';

  return (
    <div className="my-6">
      {/* 1. STATE: VERIFIED CONFIRMATION CARD (Section 14) */}
      {isVerified && verificationReport ? (
        <div className="bg-white rounded-2xl border-2 border-emerald-500/80 shadow-sm p-5 fade-in bg-gradient-to-br from-white via-emerald-50/20 to-white">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">
                  Device Verified
                </span>
                <p className="font-extrabold text-foreground text-base">
                  {verificationReport.device.brand} {verificationReport.device.model}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block uppercase font-bold">Storage / Variant</span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold inline-block">
                {verificationReport.device.storage || selectedVariant || 'Standard'}
              </span>
            </div>
          </div>

          <div className="py-3 space-y-2 border-b border-border/70 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">IMEI Number</span>
              <span className="font-mono font-bold text-foreground bg-slate-100 px-2 py-0.5 rounded">
                {verificationReport.identifiers.maskedImei}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle size={13} />
                <span>Brand matched</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle size={13} />
                <span>Model matched</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle size={13} />
                <span>Variant matched</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle size={13} />
                <span>IMEI format valid</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold col-span-2">
                <CheckCircle size={13} />
                <span>Device specifications verified</span>
              </div>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-muted-foreground block uppercase font-bold">Verification ID</span>
              <span className="font-mono font-bold text-xs text-primary">
                {verificationReport.verificationId}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReportModalOpen(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
              >
                <span>View Full Verification</span>
                <ExternalLink size={12} />
              </button>
              <button
                onClick={onRecheck}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-lg text-xs"
                title="Recheck Device"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>
        </div>
      ) : isMismatch && verificationReport ? (
        /* 2. STATE: MISMATCH WARNING CARD (Section 7) */
        <div className="bg-amber-50 rounded-2xl border border-amber-300 p-5 fade-in text-xs">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm">⚠ DEVICE INFORMATION MISMATCH</p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                The detected device ({verificationReport.device.brand} {verificationReport.device.model}) does not match the device selected for this quote ({selectedBrand} {selectedModel}).
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5"
            >
              <RefreshCw size={13} /> Recheck Device
            </button>
            <button
              onClick={onRecheck}
              className="py-2 px-3 border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-xl font-semibold"
            >
              Change Selected Model
            </button>
          </div>
        </div>
      ) : (
        /* 3. STATE: UNVERIFIED INITIAL PROMINENT CARD (Section 3) */
        <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary-50/40 via-white to-primary-50/20 p-5 shadow-sm fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Lock size={15} />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Verify Your Device
            </span>
          </div>

          <p className="text-xs text-foreground font-semibold mb-1">
            Before getting your final quote, verify that the device you&apos;re selling matches the selected device.
          </p>
          <p className="text-[11px] text-muted-foreground mb-3">
            We&apos;ll securely verify:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-4 text-xs font-medium text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span> Device brand
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span> Device model
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span> Variant & storage
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span> IMEI number
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <span className="text-emerald-600 font-bold">✓</span> Device specification match
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs shadow-green hover:bg-primary/90 btn-press flex items-center justify-center gap-2"
          >
            <Smartphone size={16} />
            <span>📱 Verify Your Device</span>
          </button>
        </div>
      )}

      {/* Verification Modal */}
      {modalOpen && (
        <DeviceVerificationModal
          selectedBrand={selectedBrand}
          selectedModel={selectedModel}
          selectedVariant={selectedVariant}
          onSuccess={(report) => {
            onVerified(report);
            setModalOpen(false);
          }}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Full Report Modal */}
      {reportModalOpen && (
        <FullVerificationReportModal
          report={verificationReport}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </div>
  );
}
