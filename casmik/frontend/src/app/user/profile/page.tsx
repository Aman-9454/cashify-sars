'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  MapPin, 
  CreditCard, 
  Package, 
  ShieldCheck, 
  Phone, 
  Mail, 
  ChevronRight, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Edit3, 
  LogOut, 
  ExternalLink 
} from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';
import { getCurrentUser, logoutUser, CustomerUser, getCustomerOrders, CustomerOrderRecord } from '@/lib/auth';

export default function UserProfilePage() {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [orders, setOrders] = useState<CustomerOrderRecord[]>([]);
  const [upiId, setUpiId] = useState('');
  const [savedUpi, setSavedUpi] = useState('adarsh@okhdfcbank');
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [addresses, setAddresses] = useState([
    { id: 1, title: 'Home', address: 'Flat 402, Sunshine Heights, Andheri West', city: 'Mumbai', pincode: '400053', isDefault: true },
    { id: 2, title: 'Office / Studio', address: 'Plot 12, Sector 18, Udyog Vihar', city: 'Gurgaon', pincode: '122015', isDefault: false }
  ]);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    const ords = getCustomerOrders(u?.phone);
    setOrders(ords);

    try {
      const storedUpi = localStorage.getItem('casmik_user_upi');
      if (storedUpi) setSavedUpi(storedUpi);
    } catch {}
  }, []);

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId) return;
    setSavedUpi(upiId);
    try {
      localStorage.setItem('casmik_user_upi', upiId);
    } catch {}
    setIsEditingUpi(false);
    setUpiId('');
  };

  const handleLogout = () => {
    logoutUser();
    window.location.href = '/user';
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <CustomerHeader />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white py-10 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
            <Link href="/user" className="hover:text-white transition-colors">
              User Home
            </Link>
            <ChevronRight size={13} />
            <span className="text-emerald-400 font-bold">My Account</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl font-black">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name || 'Valued Customer'}</h1>
                <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 mt-1">
                  <span>{user?.phone ? `+91 ${user.phone}` : '+91 98765 43210'}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <ShieldCheck size={14} /> KYC Verified
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* Profile Details Grid */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Payout UPI & Bank Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="text-emerald-600 w-5 h-5" /> Instant Payout UPI
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                When selling or exchanging devices, your funds are credited to this UPI ID on doorstep handover.
              </p>

              {isEditingUpi ? (
                <form onSubmit={handleSaveUpi} className="space-y-3 pt-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. yourname@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                    >
                      Save UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingUpi(false)}
                      className="py-2 px-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Linked UPI ID</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{savedUpi}</p>
                  </div>
                  <button
                    onClick={() => setIsEditingUpi(true)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-white"
                  >
                    <Edit3 size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* ReCommerce Activity Summary */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h2 className="text-base font-black text-slate-900">Activity Summary</h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Devices Sold:</span>
                  <span className="font-bold text-slate-900">{orders.filter(o => o.type === 'sell').length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Refurbished Bought:</span>
                  <span className="font-bold text-slate-900">{orders.filter(o => o.type === 'buy').length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Exchanges Completed:</span>
                  <span className="font-bold text-slate-900">{orders.filter(o => o.type === 'exchange').length}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Total Casmik Cash Earned:</span>
                  <span className="font-bold text-emerald-600">₹{orders.reduce((acc, o) => acc + (o.netPayable || o.tradeInCredit || 0), 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Saved Pickup Addresses & Recent Orders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Addresses */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="text-emerald-600 w-5 h-5" /> Saved Pickup &amp; Delivery Addresses
                </h2>
                <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  <Plus size={14} /> Add New
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-2xl border text-xs relative ${
                      addr.isDefault ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-white'
                    }`}
                  >
                    {addr.isDefault && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Default
                      </span>
                    )}
                    <p className="font-bold text-slate-900 mb-1">{addr.title}</p>
                    <p className="text-slate-600 leading-relaxed mb-2">{addr.address}</p>
                    <p className="text-slate-400 font-semibold">{addr.city} — {addr.pincode}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Link to Orders */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-base font-black text-white">Track Orders &amp; Invoices</h3>
                <p className="text-xs text-slate-400">View real-time status of your doorstep pickups, deliveries, and instant payment receipts.</p>
              </div>
              <Link
                href="/user/my-orders"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 whitespace-nowrap"
              >
                <Package size={15} /> My Orders ({orders.length})
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </main>
  );
}
