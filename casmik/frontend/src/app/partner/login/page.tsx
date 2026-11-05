'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Phone, Mail, User, MapPin, Store, FileText, ChevronRight, ArrowLeft, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';
import { partners, Partner } from '@/lib/casmikData';

type AuthMode = 'signin' | 'signup';
type SignupStep = 1 | 2 | 3;

function getPartnersList(): Partner[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_partners_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return partners;
}

export default function PartnerAuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign In fields
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');

  // Sign Up fields
  const [suName, setSuName] = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suStoreName, setSuStoreName] = useState('');
  const [suCity, setSuCity] = useState('');
  const [suPinCode, setSuPinCode] = useState('');
  const [suAddress, setSuAddress] = useState('');
  const [suGST, setSuGST] = useState('');
  const [suPAN, setSuPAN] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const query = siEmail.trim().toLowerCase();
    const cleanPhone = query.replace(/[^0-9]/g, '');
    const allPartners = getPartnersList();

    const partner = allPartners.find(
      p => p.email.toLowerCase() === query || (cleanPhone.length >= 10 && p.phone.replace(/[^0-9]/g, '') === cleanPhone)
    );

    if (!partner) {
      if (
        query === 'partner@casmik.com' ||
        query === 'partner@camsik.com' ||
        query === 'rajesh@camera.com' ||
        query === '9876543210' ||
        query === 'contact@camerahub.in' ||
        query === '9845012399'
      ) {
        const demo = allPartners[0] || partners[0];
        localStorage.setItem('casmik_partner_session', JSON.stringify(demo));
        window.location.href = '/partner';
        return;
      }
      if (query === 'newpartner@store.com' || query === 'pending@partner.com') {
        const pendingDemo: Partner = {
          id: 'partner-pending-01',
          name: 'Vikram Mehta',
          storeName: 'Mehta Electronics & Gadgets',
          phone: '9876599999',
          email: 'newpartner@store.com',
          city: 'Pune',
          state: 'Maharashtra',
          pinCodes: ['411001'],
          categories: ['Smartphones', 'Cameras'],
          status: 'pending',
          rating: 5.0,
          totalOrders: 0,
          completedOrders: 0,
          totalEarnings: 0,
          pendingPayout: 0,
          availableBalance: 0,
          joinedAt: new Date().toISOString().split('T')[0],
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
          commission: 5.0,
        };
        localStorage.setItem('casmik_partner_session', JSON.stringify(pendingDemo));
        window.location.href = '/partner';
        return;
      }
      setError('No partner account found with these credentials. Please check your details or register as a new partner.');
      return;
    }

    if (partner.status === 'pending') {
      setError('Your partner application is currently PENDING approval from the Super Admin. You will be able to access the portal once approved.');
      return;
    }

    if (partner.status === 'suspended') {
      setError('Your partner account has been suspended or rejected by the Super Admin. Please contact support@camsik.com.');
      return;
    }

    localStorage.setItem('casmik_partner_session', JSON.stringify(partner));
    window.location.href = '/partner';
  };

  const handleSignupNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (signupStep < 3) {
      setSignupStep((s) => (s + 1) as SignupStep);
    } else {
      const newPartner: Partner = {
        id: `partner-${Date.now().toString().slice(-4)}`,
        name: suName.trim(),
        storeName: suStoreName.trim() || `${suName.trim()}'s Electronics Store`,
        phone: suPhone.trim(),
        email: suEmail.trim(),
        password: suPassword.trim(),
        city: suCity.trim() || 'Bengaluru',
        state: 'Karnataka',
        address: suAddress.trim(),
        pinCodes: suPinCode.trim() ? [suPinCode.trim()] : ['560001'],
        categories: ['Smartphones', 'Laptops', 'Cameras'],
        status: 'pending', // Requires Super Admin approval!
        rating: 5.0,
        totalOrders: 0,
        completedOrders: 0,
        totalEarnings: 0,
        pendingPayout: 0,
        availableBalance: 0,
        joinedAt: new Date().toISOString().split('T')[0],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80',
        commission: 6,
        documents: {
          pan: !!suPAN,
          panNumber: suPAN.trim(),
          gst: !!suGST,
          gstNumber: suGST.trim(),
          verified: false,
        },
      };

      const current = getPartnersList();
      const updated = [newPartner, ...current];
      if (typeof window !== 'undefined') {
        localStorage.setItem('casmik_partners_v1', JSON.stringify(updated));
      }

      // Also register via API
      fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPartner),
      }).catch((err) => console.warn('Could not post partner registration to API:', err));

      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your partner application has been received. Our team will review your documents and verify your account within <strong>24–48 hours</strong>. You'll receive an SMS and email once approved.
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 text-left mb-6 space-y-2">
            <p className="text-xs font-bold text-gray-700">What happens next?</p>
            {['Document verification by our team', 'Background check (1–2 business days)', 'Account activation via SMS/Email', 'Access to Partner Portal'].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
                <span className="text-xs text-gray-600">{step}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setSubmitted(false); setMode('signin'); setSignupStep(1); }}
            className="w-full py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors">
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <span className="font-black text-2xl text-gray-900">CAMSIK</span>
          </Link>
          <p className="text-gray-500 text-sm">Partner Portal</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button onClick={() => { setMode('signin'); setSignupStep(1); }}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'signin' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}>
              Sign In
            </button>
            <button onClick={() => { setMode('signup'); setSignupStep(1); }}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'signup' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}>
              Register as Partner
            </button>
          </div>

          <div className="p-6">
            {mode === 'signin' ? (
              <>
                <h2 className="text-xl font-black text-gray-900 mb-1">Welcome back</h2>
                <p className="text-gray-500 text-sm mb-4">Sign in to your partner account</p>

                {error && (
                  <div className="p-3.5 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-fade-in">
                    <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="font-medium leading-relaxed">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email or Phone</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={siEmail} onChange={e => { setSiEmail(e.target.value); setError(null); }} required
                        placeholder="partner@email.com or 9876543210"
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={siPassword} onChange={e => { setSiPassword(e.target.value); setError(null); }} required
                        placeholder="Enter your password"
                        className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
                      <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" className="text-xs text-primary font-semibold hover:underline">Forgot password?</button>
                  </div>
                  <button type="submit"
                    className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20">
                    Sign In to Partner Portal <ChevronRight size={16} />
                  </button>
                </form>

                {/* Quick Demo Logins Helper */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 mb-2 tracking-wide uppercase">Quick Demo Fill</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSiEmail('contact@camerahub.in');
                        setSiPassword('Partner@123');
                        setError(null);
                      }}
                      className="text-left p-2.5 rounded-xl bg-gray-50 hover:bg-primary/5 hover:border-primary/40 border border-gray-200 text-[11px] transition-all cursor-pointer"
                    >
                      <p className="font-bold text-gray-800 flex items-center gap-1">
                        <KeyRound size={12} className="text-primary" /> Active Partner
                      </p>
                      <p className="text-gray-400 truncate">contact@camerahub.in</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSiEmail('newpartner@store.com');
                        setSiPassword('Partner@123');
                        setError(null);
                      }}
                      className="text-left p-2.5 rounded-xl bg-yellow-50/70 hover:bg-yellow-100/70 hover:border-yellow-300 border border-yellow-200 text-[11px] transition-all cursor-pointer"
                    >
                      <p className="font-bold text-amber-800 flex items-center gap-1">
                        <AlertTriangle size={12} className="text-amber-600" /> Test Pending
                      </p>
                      <p className="text-amber-600/80 truncate">newpartner@store.com</p>
                    </button>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                  Not a partner yet?{' '}
                  <button onClick={() => { setMode('signup'); setError(null); }} className="text-primary font-bold hover:underline cursor-pointer">Register now</button>
                </p>
              </>
            ) : (
              <>
                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-5">
                  {signupStep > 1 && (
                    <button onClick={() => setSignupStep(s => (s - 1) as SignupStep)} className="p-1 rounded-lg hover:bg-gray-100 mr-1">
                      <ArrowLeft size={16} className="text-gray-500" />
                    </button>
                  )}
                  <div className="flex-1">
                    <div className="flex gap-1.5 mb-1">
                      {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= signupStep ? 'bg-primary' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">Step {signupStep} of 3 — {signupStep === 1 ? 'Personal Info' : signupStep === 2 ? 'Store Details' : 'Documents'}</p>
                  </div>
                </div>

                <form onSubmit={handleSignupNext} className="space-y-4">
                  {signupStep === 1 && (
                    <>
                      <h2 className="text-lg font-black text-gray-900 mb-1">Personal Information</h2>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Full Name</label>
                        <div className="relative">
                          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={suName} onChange={e => setSuName(e.target.value)} required placeholder="Your full name"
                            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Phone Number</label>
                        <div className="relative">
                          <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="tel" value={suPhone} onChange={e => setSuPhone(e.target.value)} required placeholder="10-digit mobile number"
                            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email Address</label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="email" value={suEmail} onChange={e => setSuEmail(e.target.value)} required placeholder="your@email.com"
                            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password</label>
                        <div className="relative">
                          <input type={showPassword ? 'text' : 'password'} value={suPassword} onChange={e => setSuPassword(e.target.value)} required placeholder="Create a strong password"
                            className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
                          <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Confirm Password</label>
                        <div className="relative">
                          <input type={showConfirm ? 'text' : 'password'} value={suConfirm} onChange={e => setSuConfirm(e.target.value)} required placeholder="Re-enter password"
                            className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
                          <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {signupStep === 2 && (
                    <>
                      <h2 className="text-lg font-black text-gray-900 mb-1">Store Details</h2>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Store / Business Name</label>
                        <div className="relative">
                          <Store size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={suStoreName} onChange={e => setSuStoreName(e.target.value)} required placeholder="Your store name"
                            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">City</label>
                        <div className="relative">
                          <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={suCity} onChange={e => setSuCity(e.target.value)} required placeholder="City"
                            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PIN Code</label>
                        <input type="text" value={suPinCode} onChange={e => setSuPinCode(e.target.value)} required placeholder="6-digit PIN code" maxLength={6}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Full Address</label>
                        <textarea value={suAddress} onChange={e => setSuAddress(e.target.value)} required placeholder="Shop no., street, area..." rows={2}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary resize-none" />
                      </div>
                    </>
                  )}

                  {signupStep === 3 && (
                    <>
                      <h2 className="text-lg font-black text-gray-900 mb-1">Business Documents</h2>
                      <p className="text-xs text-gray-400 mb-4">Required for verification. All documents are securely stored.</p>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">GST Number (optional)</label>
                        <div className="relative">
                          <FileText size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={suGST} onChange={e => setSuGST(e.target.value)} placeholder="22AAAAA0000A1Z5"
                            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PAN Number</label>
                        <div className="relative">
                          <FileText size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={suPAN} onChange={e => setSuPAN(e.target.value)} required placeholder="ABCDE1234F"
                            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
                        </div>
                      </div>
                      {[
                        { label: 'Aadhaar Card (Front & Back)', accept: 'image/*,.pdf' },
                        { label: 'Shop License / Trade Certificate', accept: 'image/*,.pdf' },
                        { label: 'Bank Passbook / Cancelled Cheque', accept: 'image/*,.pdf' },
                      ].map((doc) => (
                        <div key={doc.label}>
                          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{doc.label}</label>
                          <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-3 cursor-pointer hover:border-primary/50 transition-colors">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText size={15} className="text-primary" />
                            </div>
                            <span className="text-xs text-gray-500">Click to upload (JPG, PNG, PDF)</span>
                            <input type="file" accept={doc.accept} className="hidden" />
                          </label>
                        </div>
                      ))}
                      <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                        <input type="checkbox" required id="terms" className="mt-0.5 accent-primary" />
                        <label htmlFor="terms" className="text-xs text-gray-600">
                          I agree to Camsik's <span className="text-primary font-semibold">Partner Terms & Conditions</span> and confirm all submitted information is accurate.
                        </label>
                      </div>
                    </>
                  )}

                  <button type="submit"
                    className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    {signupStep < 3 ? 'Continue' : 'Submit Application'} <ChevronRight size={16} />
                  </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-5">
                  Already a partner?{' '}
                  <button onClick={() => setMode('signin')} className="text-primary font-bold hover:underline">Sign in</button>
                </p>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-primary">← Back to Camsik Home</Link>
        </p>
      </div>
    </div>
  );
}
