'use client';
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Copy, CheckCircle, Tag, Calendar, Users } from 'lucide-react';

type DiscountType = 'percentage' | 'fixed';
type CouponStatus = 'active' | 'inactive' | 'expired';
type ApplicableTo = 'all' | 'sell' | 'buy' | 'repair' | 'exchange';

interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  applicableTo: ApplicableTo;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  status: CouponStatus;
  userType: 'all' | 'new' | 'existing';
  color: string;
}

const initialCoupons: Coupon[] = [
  /* Static mock coupons commented out for live data:
  { id: 'cpn-001', code: 'CASMIK100', title: 'Flat ₹100 Off', description: 'Get flat ₹100 off on your first sell order. Valid for all devices.', discountType: 'fixed', discountValue: 100, minOrderValue: 2000, maxDiscount: 100, applicableTo: 'sell', usageLimit: 500, usedCount: 127, validFrom: '2024-12-01', validUntil: '2025-01-31', status: 'active', userType: 'new', color: 'from-green-500 to-emerald-600' },
  { id: 'cpn-002', code: 'SELL10', title: '10% Extra on Sell', description: 'Get 10% extra on your device sell price. Maximum discount ₹500.', discountType: 'percentage', discountValue: 10, minOrderValue: 5000, maxDiscount: 500, applicableTo: 'sell', usageLimit: 1000, usedCount: 342, validFrom: '2024-12-01', validUntil: '2025-02-28', status: 'active', userType: 'all', color: 'from-blue-500 to-indigo-600' },
  { id: 'cpn-003', code: 'REPAIR200', title: '₹200 Off on Repair', description: 'Save ₹200 on any repair service. Valid on screen, battery and camera repairs.', discountType: 'fixed', discountValue: 200, minOrderValue: 1000, maxDiscount: 200, applicableTo: 'repair', usageLimit: 300, usedCount: 89, validFrom: '2024-12-15', validUntil: '2025-01-15', status: 'active', userType: 'all', color: 'from-orange-500 to-red-500' },
  { id: 'cpn-004', code: 'BUYBACK15', title: '15% Off on Buy', description: 'Get 15% off on certified refurbished device purchase. Max discount ₹2000.', discountType: 'percentage', discountValue: 15, minOrderValue: 10000, maxDiscount: 2000, applicableTo: 'buy', usageLimit: 200, usedCount: 56, validFrom: '2024-12-01', validUntil: '2024-12-31', status: 'expired', userType: 'all', color: 'from-purple-500 to-pink-500' },
  { id: 'cpn-005', code: 'EXCHANGE500', title: '₹500 Off on Exchange', description: 'Get ₹500 extra value on device exchange. Valid on all exchange orders.', discountType: 'fixed', discountValue: 500, minOrderValue: 8000, maxDiscount: 500, applicableTo: 'exchange', usageLimit: 150, usedCount: 23, validFrom: '2025-01-01', validUntil: '2025-03-31', status: 'inactive', userType: 'all', color: 'from-teal-500 to-cyan-600' },
  */
];

const statusColors: Record<CouponStatus, string> = { active: 'bg-green-50 text-green-700', inactive: 'bg-gray-100 text-gray-500', expired: 'bg-red-50 text-red-600' };
const typeColors: Record<ApplicableTo, string> = { all: 'bg-gray-100 text-gray-700', sell: 'bg-green-50 text-green-700', buy: 'bg-blue-50 text-blue-700', repair: 'bg-orange-50 text-orange-700', exchange: 'bg-purple-50 text-purple-700' };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', title: '', description: '', discountType: 'fixed' as DiscountType, discountValue: '', minOrderValue: '', maxDiscount: '', applicableTo: 'all' as ApplicableTo, usageLimit: '', validFrom: '', validUntil: '', userType: 'all\' as \'all\' | \'new\' | \'existing', color: 'from-green-500 to-emerald-600' });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openAdd = () => { setEditCoupon(null); setForm({ code: '', title: '', description: '', discountType: 'fixed', discountValue: '', minOrderValue: '', maxDiscount: '', applicableTo: 'all', usageLimit: '', validFrom: '', validUntil: '', userType: 'all', color: 'from-green-500 to-emerald-600' }); setShowModal(true); };
  const openEdit = (c: Coupon) => { setEditCoupon(c); setForm({ code: c.code, title: c.title, description: c.description, discountType: c.discountType, discountValue: String(c.discountValue), minOrderValue: String(c.minOrderValue), maxDiscount: String(c.maxDiscount), applicableTo: c.applicableTo, usageLimit: String(c.usageLimit), validFrom: c.validFrom, validUntil: c.validUntil, userType: c.userType, color: c.color }); setShowModal(true); };

  const handleSave = () => {
    if (editCoupon) {
      setCoupons(prev => prev.map(c => c.id === editCoupon.id ? { 
        ...c, 
        ...form, 
        discountType: form.discountType as any,
        applicableTo: form.applicableTo as any,
        userType: form.userType as 'all' | 'new' | 'existing',
        discountValue: Number(form.discountValue), 
        minOrderValue: Number(form.minOrderValue), 
        maxDiscount: Number(form.maxDiscount), 
        usageLimit: Number(form.usageLimit) 
      } : c));
    } else {
      const newCoupon: Coupon = { 
        id: `cpn-${Date.now()}`, 
        ...form, 
        discountType: form.discountType as any,
        applicableTo: form.applicableTo as any,
        userType: form.userType as 'all' | 'new' | 'existing',
        discountValue: Number(form.discountValue), 
        minOrderValue: Number(form.minOrderValue), 
        maxDiscount: Number(form.maxDiscount), 
        usageLimit: Number(form.usageLimit), 
        usedCount: 0, 
        status: 'active' 
      };
      setCoupons(prev => [...prev, newCoupon]);
    }
    setShowModal(false);
  };

  const toggleStatus = (id: string) => setCoupons(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c));
  const deleteCoupon = (id: string) => setCoupons(prev => prev.filter(c => c.id !== id));

  const activeCoupons = coupons.filter(c => c.status === 'active');
  const totalUsage = coupons.reduce((s, c) => s + c.usedCount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">Coupons & Offers</h2>
          <p className="text-sm text-gray-500">Manage discount coupons and promotional offers</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Coupons', value: coupons.length, icon: Tag, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active', value: activeCoupons.length, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
          { label: 'Total Usage', value: totalUsage, icon: Users, color: 'bg-purple-50 text-purple-600' },
          { label: 'Expiring Soon', value: coupons.filter(c => c.status === 'active' && new Date(c.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length, icon: Calendar, color: 'bg-orange-50 text-orange-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(coupon => (
          <div key={coupon.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Coupon Banner */}
            <div className={`bg-gradient-to-r ${coupon.color} p-4 text-white relative`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium opacity-80">{coupon.title}</p>
                  <p className="text-2xl font-black mt-0.5">
                    {coupon.discountType === 'fixed' ? `₹${coupon.discountValue}` : `${coupon.discountValue}%`} OFF
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm`}>{coupon.status}</span>
              </div>
              {/* Dashed divider */}
              <div className="flex items-center gap-1 mt-3">
                <div className="flex-1 border-t-2 border-dashed border-white/40" />
                <div className="w-4 h-4 rounded-full bg-white/20" />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-widest">{coupon.code}</span>
                </div>
                <button onClick={() => copyCode(coupon.code)}
                  className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-colors">
                  {copiedCode === coupon.code ? <CheckCircle size={12} /> : <Copy size={12} />}
                  {copiedCode === coupon.code ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="p-4">
              <p className="text-xs text-gray-600 mb-3">{coupon.description}</p>
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-gray-400">Min Order</p>
                  <p className="font-bold text-gray-900">₹{coupon.minOrderValue.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-gray-400">Max Discount</p>
                  <p className="font-bold text-gray-900">₹{coupon.maxDiscount.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-gray-400">Usage</p>
                  <p className="font-bold text-gray-900">{coupon.usedCount}/{coupon.usageLimit}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-gray-400">Valid Until</p>
                  <p className="font-bold text-gray-900">{new Date(coupon.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${typeColors[coupon.applicableTo]}`}>
                  {coupon.applicableTo === 'all' ? 'All Services' : coupon.applicableTo}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">
                  {coupon.userType === 'all' ? 'All Users' : coupon.userType + ' users'}
                </span>
              </div>
              {/* Usage bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Usage</span>
                  <span>{Math.round(coupon.usedCount / coupon.usageLimit * 100)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, coupon.usedCount / coupon.usageLimit * 100)}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button onClick={() => toggleStatus(coupon.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${coupon.status === 'active' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {coupon.status === 'active' ? '✓ Active' : 'Activate'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(coupon)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => deleteCoupon(coupon.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-gray-900 mb-4">{editCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Coupon Code</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="SAVE100" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Title</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Flat ₹100 Off" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Discount Type</label>
                  <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value as DiscountType }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="fixed">Fixed (₹)</option><option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Discount Value</label>
                  <input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder={form.discountType === 'fixed' ? '100' : '10'} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Min Order (₹)</label>
                  <input type="number" value={form.minOrderValue} onChange={e => setForm(f => ({ ...f, minOrderValue: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Max Discount (₹)</label>
                  <input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Applicable To</label>
                  <select value={form.applicableTo} onChange={e => setForm(f => ({ ...f, applicableTo: e.target.value as ApplicableTo }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="all">All Services</option><option value="sell">Sell</option><option value="buy">Buy</option><option value="repair">Repair</option><option value="exchange">Exchange</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Valid From</label>
                  <input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Valid Until</label>
                  <input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90">
                {editCoupon ? 'Save Changes' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
