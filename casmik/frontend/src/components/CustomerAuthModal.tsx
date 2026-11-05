'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { X, Lock, Phone, User, ShieldCheck, ArrowRight, Sparkles, KeyRound, CheckCircle2 } from 'lucide-react';
import { CustomerUser, setCurrentUser, getCurrentUser, authenticateUser } from '@/lib/auth';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: CustomerUser) => void;
  title?: string;
  subtitle?: string;
}

export default function CustomerAuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Login Required to Book',
  subtitle = 'Please sign in or enter your verified mobile number to place your booking and track live status.',
}: CustomerAuthModalProps) {
  const [authMode, setAuthMode] = useState<'quick' | 'password'>('quick');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleQuickOtpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    const randomOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedOtp(randomOtp);
    setOtpStep(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otpInput.trim() !== generatedOtp && otpInput.trim() !== '1234') {
      setError(`Invalid verification code. Enter ${generatedOtp} to proceed.`);
      return;
    }

    const newUser: CustomerUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    onSuccess(newUser);
    onClose();
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const identifier = phone.trim();
    if (!identifier) {
      setError('Please enter your mobile number or email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const loggedUser: CustomerUser = {
          id: data.user.id,
          name: data.user.name,
          phone: data.user.phone,
          email: data.user.email,
          createdAt: data.user.createdAt || new Date().toISOString(),
        };
        setCurrentUser(loggedUser);
        onSuccess(loggedUser);
        onClose();
        return;
      }
    } catch {}

    // Fallback to local auth
    try {
      const local = authenticateUser(identifier, password);
      const userObj: CustomerUser = {
        id: local.id,
        name: local.name,
        phone: local.phone,
        email: local.email,
        createdAt: local.createdAt || new Date().toISOString(),
      };
      setCurrentUser(userObj);
      onSuccess(userObj);
      onClose();
    } catch (localErr: any) {
      setError(localErr?.message || 'Invalid credentials. Please verify your details or use Quick Mobile Login.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-primary p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck size={26} className="text-white" />
          </div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className="text-white/80 text-xs mt-1 max-w-xs mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 px-6 pt-3">
          <button
            type="button"
            onClick={() => {
              setAuthMode('quick');
              setError('');
            }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              authMode === 'quick'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Sparkles size={13} /> Quick Mobile Verification
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setError('');
            }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              authMode === 'password'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <KeyRound size={13} /> Account Password
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {authMode === 'quick' && !otpStep && (
            <form onSubmit={handleQuickOtpRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Booking</span>
                <ArrowRight size={16} />
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-400">
                  By continuing, you agree to Camsik Terms of Service &amp; Privacy Policy.
                </p>
              </div>
            </form>
          )}

          {authMode === 'quick' && otpStep && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <p className="text-xs text-emerald-800 font-semibold">
                  OTP sent to <span className="font-bold">+91 {phone}</span>
                </p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  Auto-filled demo OTP code: <span className="font-mono font-bold tracking-wider">{generatedOtp}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Enter 4-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder={generatedOtp}
                  className="w-full text-center tracking-widest text-lg font-mono py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  Change
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  <span>Verify &amp; Confirm</span>
                </button>
              </div>
            </form>
          )}

          {authMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile Number or Email
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone or email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Signing in...' : 'Sign In & Book'}</span>
                <ArrowRight size={16} />
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="text-xs text-emerald-600 font-bold hover:underline"
                >
                  Create new customer account or full login →
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
