'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Phone, Mail, User, MapPin, Truck, FileText, ChevronRight, ArrowLeft, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';
import { deliveryAgents, DeliveryAgent } from '@/lib/casmikData';

type AuthMode = 'signin' | 'signup';
type SignupStep = 1 | 2 | 3;

interface ExtendedAgent extends DeliveryAgent {
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  password?: string;
}

const defaultExtendedAgents: ExtendedAgent[] = [
  ...deliveryAgents.map(a => ({ ...a, approvalStatus: 'approved' as const })),
  {
    id: 'delivery-006',
    name: 'Priya Sharma',
    phone: '9876501234',
    email: 'priya.d@casmik.com',
    city: 'Delhi',
    pinCodes: ['110070', '110001'],
    status: 'offline',
    rating: 0,
    todayPickups: 0,
    todayDeliveries: 0,
    totalDeliveries: 0,
    earnings: 0,
    vehicle: 'Bike',
    vehicleNumber: 'DL01AA0001',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
    joinedAt: '2024-12-20',
    approvalStatus: 'pending',
  },
];

function getDeliveryAgentsList(): ExtendedAgent[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_delivery_agents_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return defaultExtendedAgents;
}

export default function DeliveryAuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredAgentId, setRegisteredAgentId] = useState<string>('');

  // Sign In
  const [siPhone, setSiPhone] = useState('');
  const [siPassword, setSiPassword] = useState('');

  // Sign Up
  const [suName, setSuName] = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suCity, setSuCity] = useState('');
  const [suPinCode, setSuPinCode] = useState('');
  const [suAddress, setSuAddress] = useState('');
  const [suVehicle, setSuVehicle] = useState('Bike');
  const [suVehicleNo, setSuVehicleNo] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const identifier = siPhone.trim();
    const password = siPassword.trim();

    if (!identifier) {
      setError('Please enter your registered phone number or email.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
          role: 'delivery',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Login failed. Please verify credentials.');
        setLoading(false);
        return;
      }

      if (data.agent) {
        localStorage.setItem('casmik_delivery_session', JSON.stringify(data.agent));
      }
      window.location.href = '/delivery';
    } catch (err: any) {
      setError(err?.message || 'Network error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleSignupNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (signupStep < 3) {
      if (signupStep === 1 && suPassword !== suConfirm) {
        setError('Passwords do not match. Please try again.');
        return;
      }
      setSignupStep((s) => (s + 1) as SignupStep);
    } else {
      const allAgents = getDeliveryAgentsList();
      const generatedId = `delivery-${Date.now().toString().slice(-4)}`;
      const newAgent: ExtendedAgent = {
        id: generatedId,
        name: suName.trim(),
        phone: suPhone.trim(),
        email: suEmail.trim(),
        password: suPassword.trim(),
        city: suCity.trim() || 'Mumbai',
        pinCodes: suPinCode.trim() ? [suPinCode.trim()] : ['400001'],
        status: 'offline',
        rating: 5.0,
        todayPickups: 0,
        todayDeliveries: 0,
        totalDeliveries: 0,
        earnings: 0,
        vehicle: suVehicle || 'Bike',
        vehicleNumber: suVehicleNo.trim().toUpperCase() || 'MH01AB1234',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80',
        joinedAt: new Date().toISOString().split('T')[0],
        approvalStatus: 'pending', // Requires Super Admin approval!
      };

      const updated = [newAgent, ...allAgents];
      if (typeof window !== 'undefined') {
        localStorage.setItem('casmik_delivery_agents_v1', JSON.stringify(updated));
        // Save session in pending state so when they visit /delivery they see pending status
        localStorage.setItem('casmik_delivery_session', JSON.stringify(newAgent));
      }

      setRegisteredAgentId(generatedId);
      setSubmitted(true);
    }
  };


  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary/5 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-3">
            Pending Super Admin Approval
          </span>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your delivery agent registration (ID: <strong>{registeredAgentId}</strong>) has been submitted to the Super Admin team for verification.
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 text-left mb-6 space-y-2">
            <p className="text-xs font-bold text-gray-700">Next Steps</p>
            {['Super Admin approves application in Admin Panel', 'Document & vehicle verification check', 'Instant portal access unlocked upon approval', 'Accept pickups & start earning'].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
                <span className="text-xs text-gray-600">{step}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Link
              href="/delivery"
              className="w-full py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors block text-center shadow-lg shadow-primary/20"
            >
              Check Application Status
            </Link>
            <button
              onClick={() => { setSubmitted(false); setMode('signin'); setSignupStep(1); }}
              className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-xs hover:bg-gray-200 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <span className="font-black text-2xl text-gray-900 tracking-tight">CAMSIK</span>
          </Link>
          <p className="text-gray-500 text-xs font-medium">Delivery Agent & Executive Portal</p>
        </div>


        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-red-700 text-xs">
            <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button onClick={() => { setMode('signin'); setSignupStep(1); setError(null); }}
              className={`flex-1 py-3.5 text-xs font-bold transition-colors ${mode === 'signin' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-400 hover:text-gray-600'}`}>
              Sign In
            </button>
            <button onClick={() => { setMode('signup'); setSignupStep(1); setError(null); }}
              className={`flex-1 py-3.5 text-xs font-bold transition-colors ${mode === 'signup' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-400 hover:text-gray-600'}`}>
              Join as Agent
            </button>
          </div>

          <div className="p-6">
            {mode === 'signin' ? (
              <>
                <h2 className="text-xl font-black text-gray-900 mb-1">Welcome back</h2>
                <p className="text-gray-500 text-xs mb-5">Sign in to your delivery agent account</p>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Phone Number or Email</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={siPhone} onChange={e => setSiPhone(e.target.value)} required
                        placeholder="10-digit mobile number or email"
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={siPassword} onChange={e => setSiPassword(e.target.value)} required
                        placeholder="Enter your password"
                        className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary" />
                      <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" className="text-xs text-primary font-semibold hover:underline">Forgot password?</button>
                  </div>
                  <button type="submit"
                    className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                    Sign In <ChevronRight size={16} />
                  </button>
                </form>

                {/* Earnings Highlight */}
                <div className="mt-5 bg-green-50 rounded-2xl p-3.5 flex items-center gap-3 border border-green-100">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Truck size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-green-800">Earn ₹800–₹1,500/day</p>
                    <p className="text-[11px] text-green-600">Flexible hours · Weekly payouts · Fuel allowance</p>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-5">
                  New agent?{' '}
                  <button onClick={() => { setMode('signup'); setError(null); }} className="text-primary font-bold hover:underline">Register here</button>
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
                    <p className="text-xs text-gray-400">Step {signupStep} of 3 — {signupStep === 1 ? 'Personal Info' : signupStep === 2 ? 'Location & Vehicle' : 'Documents'}</p>
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
                      <h2 className="text-lg font-black text-gray-900 mb-1">Location & Vehicle</h2>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">City</label>
                        <div className="relative">
                          <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={suCity} onChange={e => setSuCity(e.target.value)} required placeholder="Your city"
                            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PIN Code</label>
                        <input type="text" value={suPinCode} onChange={e => setSuPinCode(e.target.value)} required placeholder="6-digit PIN code" maxLength={6}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Home Address</label>
                        <textarea value={suAddress} onChange={e => setSuAddress(e.target.value)} required placeholder="Street, area, landmark..." rows={2}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary resize-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Vehicle Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Bike', 'Scooter', 'Car'].map(v => (
                            <button key={v} type="button" onClick={() => setSuVehicle(v)}
                              className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${suVehicle === v ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                              {v === 'Bike' ? '🏍️' : v === 'Scooter' ? '🛵' : '🚗'} {v}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Vehicle Registration Number</label>
                        <div className="relative">
                          <Truck size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={suVehicleNo} onChange={e => setSuVehicleNo(e.target.value)} required placeholder="e.g. HR26-AB-1234"
                            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary uppercase" />
                        </div>
                      </div>
                    </>
                  )}

                  {signupStep === 3 && (
                    <>
                      <h2 className="text-lg font-black text-gray-900 mb-1">Upload Documents</h2>
                      <p className="text-xs text-gray-400 mb-4">All documents are encrypted and stored securely.</p>
                      {[
                        { label: 'Aadhaar Card (Front & Back)', required: true },
                        { label: 'PAN Card', required: true },
                        { label: "Driver's License", required: true },
                        { label: 'Vehicle RC (Registration Certificate)', required: true },
                        { label: 'Bank Passbook / Cancelled Cheque', required: true },
                      ].map((doc) => (
                        <div key={doc.label}>
                          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                            {doc.label} {doc.required && <span className="text-red-400">*</span>}
                          </label>
                          <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-3 cursor-pointer hover:border-primary/50 transition-colors">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText size={15} className="text-primary" />
                            </div>
                            <span className="text-xs text-gray-500">Click to upload (JPG, PNG, PDF)</span>
                            <input type="file" accept="image/*,.pdf" className="hidden" />
                          </label>
                        </div>
                      ))}
                      <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                        <input type="checkbox" required id="terms" className="mt-0.5 accent-primary" />
                        <label htmlFor="terms" className="text-xs text-gray-600">
                          I agree to Camsik's <span className="text-primary font-semibold">Delivery Agent Terms</span> and confirm all submitted information is accurate.
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
                  Already registered?{' '}
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
