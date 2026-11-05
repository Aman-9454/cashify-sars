'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Smartphone, 
  QrCode, 
  Keyboard, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { DeviceVerificationReport, DeviceVerificationSession } from '@/lib/deviceVerification/types';
import { generateQRCodeSVG } from '@/lib/deviceVerification/qrHelper';
import { isValidLuhn } from '@/lib/deviceVerification/luhn';

interface Props {
  selectedBrand: string;
  selectedModel: string;
  selectedVariant?: string;
  onSuccess: (report: DeviceVerificationReport) => void;
  onClose: () => void;
}

const DIAGNOSTIC_STEPS = [
  'Device connection established',
  'Manufacturer & brand detected',
  'Device model identified',
  'Storage & variant inspected',
  'IMEI number captured',
  '15-digit Luhn format verified',
  'Device specifications matched with quote',
  'Anti-theft & blacklist registry verified',
  'Verification certificate generated',
];

export default function DeviceVerificationModal({
  selectedBrand,
  selectedModel,
  selectedVariant,
  onSuccess,
  onClose,
}: Props) {
  const [session, setSession] = useState<DeviceVerificationSession | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [qrSvg, setQrSvg] = useState<string>('');
  const [pollingActive, setPollingActive] = useState(false);

  // Manual IMEI inputs
  const [imeiInput, setImeiInput] = useState('');
  const [imei2Input, setImei2Input] = useState('');
  const [imeiError, setImeiError] = useState<string | null>(null);
  const [isValidatingManual, setIsValidatingManual] = useState(false);

  // Diagnostics view
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [currentDiagnosticStep, setCurrentDiagnosticStep] = useState(0);

  // Result / Error display
  const [errorReport, setErrorReport] = useState<DeviceVerificationReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Polling ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize verification session on mount
  useEffect(() => {
    initSession();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedBrand, selectedModel, selectedVariant]);

  const initSession = async () => {
    try {
      setIsCreatingSession(true);
      setErrorMessage(null);
      const res = await fetch('/api/device-verification/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedDevice: {
            brand: selectedBrand,
            model: selectedModel,
            variant: selectedVariant || 'Standard',
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        const svg = generateQRCodeSVG(data.session.webVerificationUrl || data.session.appDeepLink, 170);
        setQrSvg(svg);
        startPolling(data.session.sessionId);
      }
    } catch (err: any) {
      console.error('Failed to create verification session:', err);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const startPolling = (sessionId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setPollingActive(true);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/device-verification/session/${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && data.session) {
          if (data.session.status === 'completed' && data.session.verificationReport) {
            clearInterval(pollingRef.current!);
            setPollingActive(false);
            runDiagnosticsAnimation(data.session.verificationReport);
          } else if (data.session.status === 'failed' || data.session.status === 'expired') {
            clearInterval(pollingRef.current!);
            setPollingActive(false);
            if (data.session.verificationReport) {
              setErrorReport(data.session.verificationReport);
            } else {
              setErrorMessage('Verification session expired or could not be completed.');
            }
          }
        }
      } catch (err) {
        console.warn('Session polling error:', err);
      }
    }, 2500);
  };

  // Run animated step-by-step diagnostic sequence
  const runDiagnosticsAnimation = (report: DeviceVerificationReport) => {
    setIsDiagnosing(true);
    setCurrentDiagnosticStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentDiagnosticStep(step);
      if (step >= DIAGNOSTIC_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDiagnosing(false);
          if (report.status === 'verified') {
            onSuccess(report);
          } else {
            setErrorReport(report);
          }
        }, 600);
      }
    }, 250);
  };

  // Manual IMEI submission
  const handleVerifyManual = async () => {
    const cleanImei = imeiInput.replace(/\D/g, '');
    if (cleanImei.length !== 15) {
      setImeiError('Please enter a complete 15-digit IMEI number.');
      return;
    }

    if (!isValidLuhn(cleanImei)) {
      setImeiError('IMEI failed Luhn checksum check. Please check for typos or dial *#06# to verify.');
      return;
    }

    setImeiError(null);
    setIsValidatingManual(true);
    setErrorMessage(null);
    setErrorReport(null);

    try {
      const res = await fetch('/api/device-verification/validate-imei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imei: cleanImei,
          imei2: imei2Input.replace(/\D/g, '') || undefined,
          selectedBrand,
          selectedModel,
          selectedVariant: selectedVariant || 'Standard',
          source: 'website-manual',
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        runDiagnosticsAnimation(data.report);
      } else {
        setErrorMessage(data.message || 'Verification could not be processed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed connecting to verification service.');
    } finally {
      setIsValidatingManual(false);
    }
  };

  // Demo simulator for App Scan & Diagnostics (lets user test the QR/App flow directly)
  const handleSimulateAppScan = async () => {
    if (!session) return;
    setIsValidatingManual(true);
    setErrorMessage(null);
    setErrorReport(null);

    // Pre-built valid sample TAC matching selected device
    const sampleImei = selectedBrand.toLowerCase().includes('apple')
      ? '353046101234561'
      : selectedBrand.toLowerCase().includes('samsung')
      ? '356984111234568'
      : '357123091234566';

    try {
      const res = await fetch(`/api/device-verification/session/${session.sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imei: sampleImei,
          deviceDetails: {
            brand: selectedBrand,
            model: selectedModel,
            variant: selectedVariant || 'Standard',
            os: selectedBrand.toLowerCase().includes('apple') ? 'iOS 18.2' : 'Android 15',
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        runDiagnosticsAnimation(data.report);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Simulation failed');
    } finally {
      setIsValidatingManual(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto z-10 fade-in border border-border">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">Verify Your Device</h3>
                <p className="text-xs text-muted-foreground">
                  Let&apos;s securely verify the device you&apos;re selling before generating your final quote.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Target device pill */}
          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-border/80 text-xs">
            <span className="text-muted-foreground font-medium">Selected Device:</span>
            <span className="font-bold text-foreground">
              {selectedBrand} {selectedModel}
            </span>
            {selectedVariant && (
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold text-[11px]">
                {selectedVariant}
              </span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* DIAGNOSTIC MODE (Section 26) */}
          {isDiagnosing ? (
            <div className="space-y-5 text-center py-4 fade-in">
              <div className="w-16 h-16 rounded-3xl gradient-green flex items-center justify-center text-white mx-auto shadow-green animate-pulse">
                <Sparkles size={28} />
              </div>
              <div>
                <h4 className="text-lg font-black text-foreground">Device Diagnostics</h4>
                <p className="text-xs text-muted-foreground">Checking your device specifications and security status...</p>
              </div>

              {/* Step list */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-border text-left space-y-2.5 max-w-md mx-auto">
                {DIAGNOSTIC_STEPS.map((stepLabel, idx) => {
                  const isDone = idx < currentDiagnosticStep;
                  const isCurrent = idx === currentDiagnosticStep;
                  return (
                    <div key={idx} className="flex items-center gap-2.5 text-xs">
                      {isDone ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-[10px]">
                          •
                        </div>
                      )}
                      <span className={`font-medium ${isDone ? 'text-slate-800' : isCurrent ? 'text-primary font-bold' : 'text-slate-400'}`}>
                        {stepLabel}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden max-w-md mx-auto">
                <div
                  className="gradient-green h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, (currentDiagnosticStep / DIAGNOSTIC_STEPS.length) * 100)}%` }}
                />
              </div>
            </div>
          ) : errorReport ? (
            /* ERROR / MISMATCH SCREEN (Section 7, Section 23) */
            <div className="space-y-4 fade-in">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-amber-900">
                      {errorReport.status === 'mismatch' ? 'Device Information Mismatch' : 'Device Verification Flagged'}
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      {errorReport.matching.mismatchReason ||
                        (errorReport.security.blacklistStatus === 'blacklisted'
                          ? 'The verification source returned an anti-theft or blacklist record.'
                          : 'The verified device does not match the device selected for this quote.')}
                    </p>
                  </div>
                </div>

                {/* Comparison Box */}
                <div className="mt-3 grid grid-cols-2 gap-2 bg-white/80 p-3 rounded-xl border border-amber-200/80 text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Selected:</span>
                    <span className="font-bold text-foreground">
                      {errorReport.matching.selectedDevice.brand} {errorReport.matching.selectedDevice.model}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Detected:</span>
                    <span className="font-bold text-danger">
                      {errorReport.matching.detectedDevice.brand} {errorReport.matching.detectedDevice.model}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setErrorReport(null);
                    setErrorMessage(null);
                    initSession();
                  }}
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={14} /> Recheck Device
                </button>
                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="py-3 px-4 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Change Selected Model
                </button>
              </div>
            </div>
          ) : (
            /* MANUAL IMEI VERIFICATION ONLY */
            <div className="space-y-4 fade-in">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center gap-2.5">
                <Keyboard size={18} className="text-emerald-700 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">Manual IMEI Verification</p>
                  <p className="text-[11px] text-emerald-800">Enter your device&apos;s 15-digit IMEI number below to verify against national registries and unlock your quote.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  IMEI Number 1 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={imeiInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 15);
                    setImeiInput(val);
                    if (imeiError) setImeiError(null);
                  }}
                  placeholder="e.g. 353046101234567"
                  maxLength={15}
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                  <span>15 digits required ({imeiInput.length}/15)</span>
                  {imeiInput.length === 15 && isValidLuhn(imeiInput) && (
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      ✓ Format Valid
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  IMEI Number 2 <span className="text-muted-foreground font-normal">(Optional for Dual SIM)</span>
                </label>
                <input
                  type="text"
                  value={imei2Input}
                  onChange={(e) => setImei2Input(e.target.value.replace(/\D/g, '').slice(0, 15))}
                  placeholder="e.g. 353046101234568"
                  maxLength={15}
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {imeiError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-danger text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  <span>{imeiError}</span>
                </div>
              )}

              {/* Help tip: Dial *#06# */}
              <div className="p-3 rounded-xl bg-slate-50 border border-border/80 flex items-start gap-2.5 text-xs text-muted-foreground">
                <HelpCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">How to find your IMEI number:</p>
                  <p className="mt-0.5 leading-relaxed">
                    Open your phone keypad and dial <strong className="font-mono text-primary font-bold">*#06#</strong>, or go to <strong>Settings → About Phone / General</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerifyManual}
                disabled={imeiInput.length !== 15 || isValidatingManual}
                className="w-full py-3.5 gradient-green text-white rounded-xl font-bold text-xs shadow-green hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isValidatingManual ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Validating Device & Specifications...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={15} />
                    <span>Verify IMEI & Unlock Quote</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
