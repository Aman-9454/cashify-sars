'use client';
import React, { useState, useRef } from 'react';
import { deliveryAgents } from '@/lib/casmikData';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Truck, 
  Star, 
  Edit3, 
  Camera, 
  CheckCircle, 
  Shield, 
  FileText, 
  LogOut, 
  Upload, 
  Eye, 
  X, 
  CheckCircle2,
  Building2,
  CreditCard,
  PhoneCall,
  AlertTriangle,
  Award,
  Calendar,
  Lock
} from 'lucide-react';

const agent = deliveryAgents?.[0];

interface DocFile {
  name: string;
  url: string;
}

interface DocState {
  status: 'verified' | 'pending' | 'uploaded';
  file?: DocFile;
  issueDate?: string;
  docNumber?: string;
}

export default function DeliveryProfile() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(agent?.name || 'Raghu Sharma');
  const [phone, setPhone] = useState(agent?.phone || '9876543210');
  const [email, setEmail] = useState('raghu.sharma@casmikfleet.in');
  const [address, setAddress] = useState('Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98450 11223 (Brother)');
  
  const [previewDoc, setPreviewDoc] = useState<{ label: string; url: string } | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [docs, setDocs] = useState<Record<string, DocState>>({
    'Aadhaar Card (UIDAI)': { status: 'verified', docNumber: '•••• •••• 8912', issueDate: '2021' },
    'PAN Card (Income Tax)': { status: 'verified', docNumber: 'ABCPS••••M', issueDate: '2019' },
    "Commercial Driver's License": { status: 'verified', docNumber: 'KA-01-2021-00984', issueDate: 'Valid till 2038' },
    'Vehicle RC Book': { status: 'verified', docNumber: 'KA-01-AB-5566', issueDate: 'Valid till 2035' },
  });

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = (label: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDocs(prev => ({
      ...prev,
      [label]: { ...prev[label], status: 'uploaded', file: { name: file.name, url } },
    }));
    setUploadSuccess(label);
    setTimeout(() => setUploadSuccess(null), 3500);
  };

  const handleSaveProfile = () => {
    setEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('casmik_delivery_session');
      window.location.href = '/delivery/login';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ─── TOP HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Executive Identity & Fleet Profile</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal credentials, assigned delivery vehicle, bank accounts, and compliance vault.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2 rounded-2xl animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600" />
            Profile details updated successfully!
          </div>
        )}
      </div>

      {/* ─── 12-COLUMN PROFILE LAYOUT ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── LEFT COLUMN (4 cols): Executive Badge & Shift Status ──────── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Executive ID Badge Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 text-white shadow-xl shadow-slate-900/15">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative mb-4">
                <img
                  src={agent?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'}
                  alt={name}
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-white/20 shadow-xl"
                />
                <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors">
                  <Camera size={14} />
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>

              <h3 className="text-xl font-black text-white">{name}</h3>
              <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">AGENT ID: DLV-001 (Koramangala Hub)</p>

              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Shield size={12} /> Verified Fleet Pro
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Star size={12} className="fill-amber-400" /> {agent?.rating || '4.9'}
                </span>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-3 gap-2 w-full mt-6 pt-6 border-t border-white/10">
                <div className="bg-white/5 rounded-2xl p-2.5">
                  <p className="text-lg font-black text-white">{agent?.totalDeliveries || 840}</p>
                  <p className="text-[10px] text-slate-400">Total Trips</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-2.5">
                  <p className="text-lg font-black text-emerald-400">98%</p>
                  <p className="text-[10px] text-slate-400">On-Time SLA</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-2.5">
                  <p className="text-lg font-black text-amber-400">2 yrs</p>
                  <p className="text-[10px] text-slate-400">Tenure</p>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Shift & Territory */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="font-black text-slate-900 text-sm flex items-center justify-between">
              <span>Operational Territory</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-slate-600">
                <MapPin size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Cluster 4: Bengaluru South-East</p>
                  <p className="text-slate-400 mt-0.5">Koramangala, HSR, Indiranagar, Bellandur (560034, 560102, 560103)</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-600 pt-2 border-t border-slate-100">
                <Calendar size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Working Shift</p>
                  <p className="text-slate-400 mt-0.5">Day Shift · 09:30 AM – 07:30 PM (6 Days)</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-600 pt-2 border-t border-slate-100">
                <Building2 size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Base Processing Hub</p>
                  <p className="text-slate-400 mt-0.5">Camsik Hub #12, 100ft Road, 4th Block Koramangala</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency SOS & Fleet Manager Hotline */}
          <div className="bg-amber-50/70 rounded-3xl p-6 border border-amber-200/80 space-y-3">
            <div className="flex items-center gap-2 text-amber-900">
              <PhoneCall size={18} className="text-amber-600" />
              <h4 className="font-black text-sm">24/7 Fleet Dispatch Desk</h4>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Encountering a route issue, bike breakdown, or customer unavailable at doorstep?
            </p>
            <a
              href="tel:+918000928123"
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Phone size={14} /> Call Fleet Control (+91 80009 28123)
            </a>
          </div>

          {/* Sign Out Card */}
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={15} /> Sign Out of Delivery Fleet
          </button>
        </div>

        {/* ─── RIGHT COLUMN (8 cols): Personal Info, Vehicle, Bank, KYC ──── */}
        <div className="lg:col-span-8 space-y-6">
          {/* KYC Status Banner */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-emerald-900">100% KYC Verified Delivery Agent</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Aadhaar, Driving License, Background Check, and Vehicle RC verified by Camsik Security.
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-black rounded-xl shadow-sm">
              Active Pro
            </span>
          </div>

          {/* Personal Contact Details */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base">Personal & Contact Information</h3>
                <p className="text-xs text-slate-500">Your profile details registered with the operations team</p>
              </div>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <Edit3 size={13} /> Edit Details
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-95 transition-opacity"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6">
              {editing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Full Legal Name</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Registered Mobile Number</label>
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Official Email</label>
                    <input
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Emergency Contact</label>
                    <input
                      value={emergencyPhone}
                      onChange={e => setEmergencyPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Current Residential Address</label>
                    <textarea
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      rows={2}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-sm">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Full Name</p>
                      <p className="text-xs font-bold text-slate-900">{name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-sm">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Phone</p>
                      <p className="text-xs font-bold text-slate-900">{phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-sm">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Email</p>
                      <p className="text-xs font-bold text-slate-900">{email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-sm">
                      <PhoneCall size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Emergency SOS Contact</p>
                      <p className="text-xs font-bold text-slate-900">{emergencyPhone}</p>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-sm flex-shrink-0 mt-0.5">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Residential Address</p>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-relaxed">{address}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Fleet Vehicle & Bank Account Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Vehicle Information */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Truck size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Assigned Vehicle</h4>
                    <p className="text-[11px] text-slate-400">Two-Wheeler Fleet</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Insured
                </span>
              </div>

              <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle Type:</span>
                  <span className="font-bold text-slate-900">Motorcycle (Honda Shine)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registration Plate:</span>
                  <span className="font-mono font-bold text-slate-900">KA 01 AB 5566</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pollution / PUC:</span>
                  <span className="font-bold text-emerald-700">Valid till Dec 2026</span>
                </div>
              </div>
            </div>

            {/* Bank Payout Account */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Direct Deposit Bank</h4>
                    <p className="text-[11px] text-slate-400">Daily NEFT & IMPS</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="font-bold text-slate-900">HDFC Bank Ltd</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Number:</span>
                  <span className="font-mono font-bold text-slate-900">•••• •••• 4029</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IFSC & UPI:</span>
                  <span className="font-mono font-bold text-slate-900">HDFC0001092 / raghu@upi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Government KYC Document Vault */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base">KYC Compliance & Document Vault</h3>
                <p className="text-xs text-slate-500">Government issued identity proofs and vehicle permits</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                All 4 Approved
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {uploadSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-xs font-bold text-emerald-800 animate-in fade-in">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>{uploadSuccess} uploaded successfully and dispatched for super admin verification.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(docs).map(([label, state]) => (
                  <div key={label} className="border border-slate-200/80 rounded-2xl p-4 space-y-3 bg-slate-50/50 hover:border-primary/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-900 text-xs truncate">{label}</h5>
                          <p className="text-[10px] text-slate-400">{state.docNumber} · {state.issueDate}</p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex-shrink-0">
                        <CheckCircle2 size={10} className="text-emerald-600" /> Verified
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        ref={el => { fileInputRefs.current[label] = el; }}
                        onChange={e => handleFileChange(label, e)}
                      />
                      <button
                        onClick={() => fileInputRefs.current[label]?.click()}
                        className="flex-1 py-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload size={12} /> Replace Doc
                      </button>

                      {state.file && (
                        <button
                          onClick={() => setPreviewDoc({ label, url: state.file!.url })}
                          className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 transition-colors cursor-pointer"
                          title="Preview Document"
                        >
                          <Eye size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── DOCUMENT PREVIEW MODAL ─────────────────────────────────────── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-sm">{previewDoc.label}</h4>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-center min-h-64">
              <img src={previewDoc.url} alt={previewDoc.label} className="max-h-72 rounded-xl object-contain shadow-md" />
            </div>
            <div className="p-4 bg-white border-t border-slate-100">
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
