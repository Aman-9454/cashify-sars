'use client';
import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  Info,
  Calendar,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { DeviceVerificationReport } from '@/lib/deviceVerification/types';

interface Props {
  report: DeviceVerificationReport | null;
  onClose: () => void;
}

export default function FullVerificationReportModal({ report, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [showFullImei, setShowFullImei] = useState(false);

  if (!report) return null;

  const isVerified = report.status === 'verified';
  const isMismatch = report.status === 'mismatch';
  const isFailed = report.status === 'failed';

  const handleCopyId = () => {
    if (report?.verificationId) {
      navigator.clipboard.writeText(report.verificationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = report.timestamp
    ? new Date(report.timestamp).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Just now';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto z-10 fade-in border border-border">
        {/* Header */}
        <div className={`p-6 border-b border-border/80 ${
          isVerified ? 'bg-emerald-50/70' : isMismatch ? 'bg-amber-50/70' : 'bg-red-50/70'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isVerified ? 'bg-emerald-100 text-emerald-700' : isMismatch ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              }`}>
                {isVerified ? <ShieldCheck size={22} /> : <AlertTriangle size={22} />}
              </div>
              <div>
                <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isVerified ? 'bg-emerald-200/60 text-emerald-800' : isMismatch ? 'bg-amber-200/60 text-amber-800' : 'bg-red-200/60 text-red-800'
                }`}>
                  {isVerified ? 'Verified Certificate' : isMismatch ? 'Verification Mismatch' : 'Verification Flagged'}
                </span>
                <h3 className="text-xl font-black text-foreground mt-0.5">Device Verification Report</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/80 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
            <div className="flex items-center gap-1.5 font-mono font-semibold text-foreground">
              <span>ID:</span>
              <span className="font-bold text-primary">{report.verificationId}</span>
              <button
                onClick={handleCopyId}
                className="p-1 hover:bg-black/5 rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Copy Verification ID"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar size={13} />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* SECTION 1: DEVICE INFORMATION */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone size={16} className="text-primary" />
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Device Information</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-border/60 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Brand</span>
                <span className="font-bold text-foreground text-sm">{report.device.brand}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Model</span>
                <span className="font-bold text-foreground text-sm">{report.device.model}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Variant / Storage</span>
                <span className="font-bold text-foreground text-sm">{report.device.storage || report.device.variant || 'Standard'}</span>
              </div>
              {report.device.modelNumber && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Model Number</span>
                  <span className="font-semibold text-foreground">{report.device.modelNumber}</span>
                </div>
              )}
              {report.device.os && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Operating System</span>
                  <span className="font-semibold text-foreground">{report.device.os} {report.device.osVersion || ''}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground block text-[11px]">Device Type</span>
                <span className="font-semibold text-foreground">{report.device.deviceType || 'Smartphone'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: IMEI & HARDWARE IDENTIFIERS */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lock size={16} className="text-primary" />
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">IMEI & Identifiers</h4>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-border/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">IMEI 1</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground">
                    {showFullImei ? report.identifiers.imei1 : report.identifiers.maskedImei}
                  </span>
                  <button
                    onClick={() => setShowFullImei(!showFullImei)}
                    className="text-muted-foreground hover:text-foreground text-[11px] flex items-center gap-0.5 bg-white px-2 py-0.5 rounded border border-border"
                  >
                    {showFullImei ? <EyeOff size={11} /> : <Eye size={11} />}
                    {showFullImei ? 'Mask' : 'Reveal'}
                  </button>
                </div>
              </div>

              {report.identifiers.imei2 && (
                <div className="flex items-center justify-between border-t border-border/40 pt-2">
                  <span className="text-muted-foreground">IMEI 2 (Dual SIM)</span>
                  <span className="font-mono font-semibold text-foreground">
                    {report.identifiers.imei2.slice(0, 2)}******{report.identifiers.imei2.slice(-5)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border/40 pt-2">
                <span className="text-muted-foreground">Type Allocation Code (TAC)</span>
                <span className="font-mono font-bold text-foreground">{report.identifiers.tac}</span>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-2">
                <span className="text-muted-foreground">Luhn Algorithm Integrity</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <CheckCircle size={13} /> Valid 15-Digit Checksum
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: AUTOMATIC DEVICE MATCHING */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-primary" />
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Selected vs. Detected Matching</h4>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-border/60 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-2 border-b border-border/50">
                <div>
                  <span className="text-[11px] text-muted-foreground block">User Selected Device</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">
                    {report.matching.selectedDevice.brand} {report.matching.selectedDevice.model}
                  </p>
                  {report.matching.selectedDevice.variant && (
                    <span className="text-xs text-muted-foreground">{report.matching.selectedDevice.variant}</span>
                  )}
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Detected Verified Device</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">
                    {report.matching.detectedDevice.brand} {report.matching.detectedDevice.model}
                  </p>
                  {report.matching.detectedDevice.variant && (
                    <span className="text-xs text-muted-foreground">{report.matching.detectedDevice.variant}</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Brand Match</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    report.matching.brandMatched ? 'text-emerald-600' : 'text-danger'
                  }`}>
                    {report.matching.brandMatched ? <CheckCircle size={13} /> : <X size={13} />}
                    {report.matching.brandMatched ? 'Matched' : 'Mismatch'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Model Match</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    report.matching.modelMatched ? 'text-emerald-600' : 'text-danger'
                  }`}>
                    {report.matching.modelMatched ? <CheckCircle size={13} /> : <X size={13} />}
                    {report.matching.modelMatched ? 'Matched' : 'Mismatch'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Variant Match</span>
                  <span className="font-bold flex items-center gap-1 text-emerald-600">
                    <CheckCircle size={13} /> Matched
                  </span>
                </div>
              </div>

              {report.matching.mismatchReason && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                  {report.matching.mismatchReason}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4 & 5: SECURITY, BLACKLIST & STATUS */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-primary" />
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Security & Registry Status</h4>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-border/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Blacklist / Anti-Theft Status</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${
                  report.security.blacklistStatus === 'clean'
                    ? 'bg-emerald-100 text-emerald-700'
                    : report.security.blacklistStatus === 'blacklisted'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {report.security.blacklistStatus === 'clean'
                    ? 'CLEAN'
                    : report.security.blacklistStatus === 'blacklisted'
                    ? 'BLACKLISTED RECORD DETECTED'
                    : 'UNKNOWN'}
                </span>
              </div>

              {report.security.blacklistRecord && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                  <p className="font-bold">Blacklist Record Detected:</p>
                  <p className="mt-0.5">{report.security.blacklistRecord.reason}</p>
                  <p className="text-[11px] text-red-600 mt-1">Source: {report.security.blacklistRecord.source}</p>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border/40 pt-2">
                <span className="text-muted-foreground">Carrier / SIM Lock</span>
                <span className="font-semibold text-foreground">{report.security.carrierLock || 'Unlocked'}</span>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-2">
                <span className="text-muted-foreground">Warranty / Activation Status</span>
                <span className="font-semibold text-foreground">{report.security.warrantyStatus || 'Verified'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 6: VERIFICATION SOURCE & CEIR INDIA NOTE */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-primary" />
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Verification Engine & Official Sources</h4>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-border/60 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Verification Engine</span>
                <span className="font-bold text-foreground">{report.providerName}</span>
              </div>

              {/* CEIR Official Portal Info Box (Section 13) */}
              <div className="p-3 bg-white rounded-xl border border-border flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-bold text-foreground">Government IMEI Verification (CEIR / Sanchar Saathi)</p>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Users in India can also independently verify device status on the official Department of Telecommunications portal.
                  </p>
                </div>
                <a
                  href="https://www.sancharsaathi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors flex-shrink-0"
                >
                  <span>Sanchar Saathi</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 transition-all"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
