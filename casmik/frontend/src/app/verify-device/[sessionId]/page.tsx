'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ShieldCheck, 
  Smartphone, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  HelpCircle,
  Lock,
  ArrowRight
} from 'lucide-react';
import { isValidLuhn } from '@/lib/deviceVerification/luhn';

export default function MobileVerificationSessionPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form input
  const [imei, setImei] = useState('');
  const [imeiError, setImeiError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [report, setReport] = useState<any>(null);

  // Diagnostic steps
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/device-verification/session/${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSession(data.session);
          if (data.session.status === 'completed') {
            setCompleted(true);
            setReport(data.session.verificationReport);
          }
        } else {
          setError(data.message || 'Verification session not found.');
        }
      })
      .catch(err => {
        setError('Failed to connect to verification server.');
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleVerify = async () => {
    const cleanImei = imei.replace(/\D/g, '');
    if (cleanImei.length !== 15) {
      setImeiError('Please enter the full 15-digit IMEI.');
      return;
    }
    if (!isValidLuhn(cleanImei)) {
      setImeiError('IMEI failed Luhn checksum validation. Dial *#06# to verify.');
      return;
    }

    setImeiError(null);
    setIsVerifying(true);

    // Simulate animated diagnostics
    for (let i = 1; i <= 8; i++) {
      await new Promise(r => setTimeout(r, 200));
      setCurrentStep(i);
    }

    try {
      const res = await fetch(`/api/device-verification/session/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imei: cleanImei,
          deviceDetails: {
            brand: session?.selectedDevice?.brand || 'Smartphone',
            model: session?.selectedDevice?.model || 'Device',
            variant: session?.selectedDevice?.variant || 'Standard',
            os: typeof navigator !== 'undefined' ? navigator.platform : 'Mobile',
            osVersion: 'Standard',
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
        setCompleted(true);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (e: any) {
      setError(e.message || 'Verification connection failed');
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-foreground">Loading Camsik Device Diagnostics...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-xl border border-border">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-danger flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-foreground">Verification Session Expired</h2>
          <p className="text-xs text-muted-foreground">{error || 'This QR session has expired or is invalid.'}</p>
          <a
            href="/sell-device-get-quote"
            className="inline-block py-2.5 px-5 bg-primary text-white text-xs font-bold rounded-xl shadow-green"
          >
            Start New Quote
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-border w-full max-w-md overflow-hidden fade-in">
        {/* Header */}
        <div className="gradient-green p-6 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-2 text-white">
            <ShieldCheck size={26} />
          </div>
          <h1 className="text-xl font-black">Camsik Device Diagnostics</h1>
          <p className="text-white/80 text-xs mt-0.5">Secure Sell-Flow Device Verification</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Target device info */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-border/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Selected for Quote:</span>
              <p className="font-extrabold text-foreground text-sm">
                {session.selectedDevice.brand} {session.selectedDevice.model}
              </p>
            </div>
            {session.selectedDevice.variant && (
              <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-bold text-xs">
                {session.selectedDevice.variant}
              </span>
            )}
          </div>

          {completed ? (
            <div className="space-y-4 text-center py-2 fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Device Verified!</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your device matches the quote specifications. You can now view your quote on your desktop screen.
                </p>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IMEI:</span>
                  <span className="font-mono font-bold text-foreground">
                    {report?.identifiers?.maskedImei || '35******12345'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verification ID:</span>
                  <span className="font-mono font-bold text-primary">{report?.verificationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-bold text-emerald-700">✓ Verified Clean</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Enter Device IMEI <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={imei}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 15);
                    setImei(val);
                    if (imeiError) setImeiError(null);
                  }}
                  placeholder="e.g. 353046101234567"
                  maxLength={15}
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                  <span>15 digits required ({imei.length}/15)</span>
                  {imei.length === 15 && isValidLuhn(imei) && (
                    <span className="text-emerald-600 font-bold">✓ Valid Luhn</span>
                  )}
                </div>
              </div>

              {imeiError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-danger text-xs">
                  {imeiError}
                </div>
              )}

              {/* Dialer instruction tip */}
              <div className="p-3 rounded-xl bg-slate-50 border border-border/80 flex items-start gap-2.5 text-xs text-muted-foreground">
                <HelpCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <p>
                  To view your IMEI on this phone, open phone keypad and dial <strong className="font-mono text-primary font-bold">*#06#</strong>.
                </p>
              </div>

              <button
                onClick={handleVerify}
                disabled={imei.length !== 15 || isVerifying}
                className="w-full py-4 gradient-green text-white rounded-xl font-bold text-sm shadow-green hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Running Diagnostic Checks...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Verify & Match Device</span>
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
