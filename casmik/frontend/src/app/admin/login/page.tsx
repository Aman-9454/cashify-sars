'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Shield, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

const VALID_ADMIN_EMAILS = [
  'casmikadmin9967@gmail.com',
  'admin@casmik.com',
  'admin@camsik.com',
];
const ADMIN_PASSWORD = 'Casmik@9967';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect straight to admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('casmik_admin_auth');
      if (auth === 'true') {
        router.replace('/admin');
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const normalizedEmail = email.trim().toLowerCase();
    const isEmailValid = VALID_ADMIN_EMAILS.includes(normalizedEmail);
    const isPasswordValid = password === ADMIN_PASSWORD;

    if (isEmailValid && isPasswordValid) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('casmik_admin_auth', 'true');
        localStorage.setItem('casmik_admin_email', normalizedEmail);
        localStorage.setItem('casmik_admin_logged_at', new Date().toISOString());
      }
      router.replace('/admin');
    } else {
      setError('Invalid admin credentials. Please enter the correct email and password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-2xl shadow-primary/40 mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">CAMSIK Admin</h1>
          <p className="text-white/50 text-sm mt-1">Super Admin Control Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-white/50 text-sm mb-6">Sign in to access the admin panel</p>

          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-5">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/60 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@casmik.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/60 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all shadow-lg shadow-primary/30 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In to Admin Panel'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-white/40 font-semibold mb-2">Demo Credentials</p>
            <p className="text-xs text-white/60">Email: <span className="text-white/80 font-mono">casmikadmin9967@gmail.com</span></p>
            <p className="text-xs text-white/60 mt-1">Password: <span className="text-white/80 font-mono">Casmik@9967</span></p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
              <ArrowLeft size={13} />
              <span>Back to Customer Site</span>
            </Link>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2024 CAMSIK. All rights reserved. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
