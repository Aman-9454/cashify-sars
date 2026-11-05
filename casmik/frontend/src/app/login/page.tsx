'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Phone, Mail, Lock, User, ArrowLeft, CheckCircle, Smartphone, ShieldCheck, Sparkles } from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';
import { registerUser, authenticateUser, setCurrentUser } from '@/lib/auth';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password: password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }
      registerUser({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password: password,
      });
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = '/my-orders';
      }, 500);
    } catch (err: any) {
      // Local fallback with credential validation
      try {
        registerUser({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password: password,
        });
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = '/my-orders';
        }, 500);
      } catch (e: any) {
        setError(e?.message || 'Registration failed. Please try again.');
        setLoading(false);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const identifier = (email || phone).trim();
    if (!identifier) {
      setError('Please enter your mobile number or email address');
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
        body: JSON.stringify({
          identifier: identifier,
          password: password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }
      // Success from database
      if (data.user) {
        setCurrentUser({
          id: data.user.id,
          name: data.user.name,
          phone: data.user.phone,
          email: data.user.email,
          createdAt: data.user.createdAt,
        });
      }
      setSuccess('Logged in successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = '/my-orders';
      }, 500);
    } catch (err: any) {
      // Offline fallback with strict local check
      try {
        authenticateUser(identifier, password);
        setSuccess('Logged in successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = '/my-orders';
        }, 500);
      } catch (localErr: any) {
        setError(localErr?.message || 'Invalid credentials. Please enter your correct password.');
        setLoading(false);
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <CustomerHeader />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-md">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-7 text-white text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-1">
                {mode === 'register' ? 'Create Camsik Account' : 'Welcome Back'}
              </h1>
              <p className="text-emerald-100 text-xs font-medium max-w-xs mx-auto">
                {mode === 'register'
                  ? 'Join 10 Lakh+ customers selling, buying & exchanging tech'
                  : 'Sign in to access your orders, sell quotes & payouts'}
              </p>
            </div>

            <div className="p-7">
              {/* Tab switcher */}
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                    mode === 'login'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                    mode === 'register'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle size={15} />
                  <span>{success}</span>
                </div>
              )}

              {mode === 'register' ? (
                /* ── REGISTER FORM ── */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <Smartphone size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 border-r border-slate-200 pr-1.5">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        required
                        className="w-full pl-20 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-600/20 disabled:opacity-60 flex items-center justify-center gap-2 mt-2 transition-all"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>Create Account &amp; Proceed</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* ── LOGIN FORM ── */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number or Email</label>
                    <div className="relative">
                      <Smartphone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={email || phone}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d+$/.test(val)) {
                            setPhone(val);
                            setEmail('');
                          } else {
                            setEmail(val);
                            setPhone('');
                          }
                        }}
                        placeholder="Enter phone or email address"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => alert('For password reset assistance, contact Camsik support at support@camsik.in or +91 8976000010.')}
                        className="text-[11px] font-bold text-emerald-600 hover:underline"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your account password"
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-600/20 disabled:opacity-60 flex items-center justify-center gap-2 mt-2 transition-all"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={15} />
                        <span>Sign In to Camsik</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-500 mt-4">
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setError('');
                      }}
                      className="text-emerald-700 font-extrabold hover:underline"
                    >
                      Create Account
                    </button>
                  </p>
                </form>
              )}

              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  By signing in or registering, you agree to Camsik&apos;s{' '}
                  <Link href="/why-camsik" className="text-emerald-700 font-bold hover:underline">
                    Terms &amp; DoD Data Security Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomerFooter />
    </main>
  );
}
