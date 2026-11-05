'use client';
import React, { useState, useEffect } from 'react';
import { partners, Partner } from '@/lib/casmikData';
import { Search, Eye, CheckCircle, XCircle, Star, FileText, Shield, Clock, AlertTriangle, Plus, Edit2, Key, Percent, DollarSign, Building, Phone, Mail, MapPin, Check, EyeOff, Copy, Layers, CreditCard } from 'lucide-react';

const docLabels = [
  { key: 'aadhar', label: 'Aadhaar Card', icon: '🪪' },
  { key: 'pan', label: 'PAN Card', icon: '📋' },
  { key: 'gst', label: 'GST Certificate', icon: '📄' },
  { key: 'shopLicense', label: 'Shop License', icon: '🏪' },
  { key: 'bankProof', label: 'Bank Proof', icon: '🏦' },
];

const getInitialPartners = (): Partner[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_partners_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((p: any) => !p.id?.startsWith('partner-00'));
          if (clean.length !== parsed.length) {
            localStorage.setItem('casmik_partners_v1', JSON.stringify(clean));
          }
          return clean;
        }
      }
    } catch {}
  }
  return [];
};

export default function AdminPartners() {
  const [partnerList, setPartnerList] = useState<Partner[]>(getInitialPartners);

  useEffect(() => {
    fetch('/api/partners')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.partners)) {
          setPartnerList(data.partners);
        }
      })
      .catch(() => {});
  }, []);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<Partner | null>(null);
  const [docModal, setDocModal] = useState<Partner | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'unapproved'>('all');
  const [showSelectedPassword, setShowSelectedPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Add / Edit Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [formStoreName, setFormStoreName] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formPinCodes, setFormPinCodes] = useState('');
  const [formCommission, setFormCommission] = useState('5.0');
  const [formCommissionType, setFormCommissionType] = useState<'percentage' | 'fixed'>('percentage');
  const [formStatus, setFormStatus] = useState<'active' | 'pending' | 'suspended'>('active');

  // Document Fields
  const [formAadhar, setFormAadhar] = useState(true);
  const [formAadharNo, setFormAadharNo] = useState('');
  const [formPan, setFormPan] = useState(true);
  const [formPanNo, setFormPanNo] = useState('');
  const [formGst, setFormGst] = useState(true);
  const [formGstNo, setFormGstNo] = useState('');
  const [formShopLicense, setFormShopLicense] = useState(true);
  const [formBankProof, setFormBankProof] = useState(true);
  const [formAccountNo, setFormAccountNo] = useState('');
  const [formIfsc, setFormIfsc] = useState('');

  const filtered = partnerList.filter(p =>
    (p.storeName.toLowerCase().includes(query.toLowerCase()) || p.city.toLowerCase().includes(query.toLowerCase()) || p.name.toLowerCase().includes(query.toLowerCase())) &&
    (filterStatus === 'all' || p.status === filterStatus) &&
    (activeTab === 'all' || (activeTab === 'pending' && p.status === 'pending') || (activeTab === 'unapproved' && (p.status === 'pending' || p.status === 'suspended')))
  );

  const savePartnersToStorage = (updated: Partner[]) => {
    setPartnerList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('casmik_partners_v1', JSON.stringify(updated));
      window.dispatchEvent(new Event('casmik_partners_updated'));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleApprove = async (id: string) => {
    const updated = partnerList.map(p => p.id === id ? { ...p, status: 'active' as const } : p);
    savePartnersToStorage(updated);
    if (selected && selected.id === id) {
      setSelected({ ...selected, status: 'active' });
    }
    if (docModal && docModal.id === id) {
      setDocModal({ ...docModal, status: 'active' });
    }
    try {
      await fetch('/api/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'active' }),
      });
    } catch (err) {
      console.warn('Could not sync approval to API:', err);
    }
  };

  const handleSuspend = async (id: string) => {
    const updated = partnerList.map(p => p.id === id ? { ...p, status: 'suspended' as const } : p);
    savePartnersToStorage(updated);
    if (selected && selected.id === id) {
      setSelected({ ...selected, status: 'suspended' });
    }
    if (docModal && docModal.id === id) {
      setDocModal({ ...docModal, status: 'suspended' });
    }
    try {
      await fetch('/api/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'suspended' }),
      });
    } catch (err) {
      console.warn('Could not sync suspend to API:', err);
    }
  };

  const handleReject = async (id: string) => {
    const updated = partnerList.map(p => p.id === id ? { ...p, status: 'suspended' as const } : p);
    savePartnersToStorage(updated);
    if (selected && selected.id === id) {
      setSelected({ ...selected, status: 'suspended' });
    }
    if (docModal && docModal.id === id) {
      setDocModal({ ...docModal, status: 'suspended' });
    }
    try {
      await fetch('/api/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'suspended' }),
      });
    } catch (err) {
      console.warn('Could not sync reject to API:', err);
    }
  };

  const openAddModal = () => {
    setEditingPartner(null);
    setFormStoreName('');
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormPassword(`Partner@${Math.floor(1000 + Math.random() * 9000)}`);
    setFormCity('Delhi NCR');
    setFormState('Delhi');
    setFormPinCodes('110001, 110016, 110070');
    setFormCommission('5.0');
    setFormCommissionType('percentage');
    setFormStatus('active');
    setFormAadhar(true);
    setFormAadharNo('XXXX-XXXX-4812');
    setFormPan(true);
    setFormPanNo('ABCDE1234F');
    setFormGst(true);
    setFormGstNo('07AAAAA0000A1Z5');
    setFormShopLicense(true);
    setFormBankProof(true);
    setFormAccountNo('987654321098');
    setFormIfsc('HDFC0001234');
    setShowPassword(false);
    setIsFormOpen(true);
  };

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setFormStoreName(partner.storeName);
    setFormName(partner.name);
    setFormPhone(partner.phone);
    setFormEmail(partner.email);
    setFormPassword(partner.password || 'Partner@2024');
    setFormCity(partner.city);
    setFormState(partner.state);
    setFormPinCodes(partner.pinCodes?.join(', ') || '');
    setFormCommission(partner.commission?.toString() || '5.0');
    setFormCommissionType(partner.commissionType || 'percentage');
    setFormStatus(partner.status as any);
    setFormAadhar(partner.documents?.aadhar ?? true);
    setFormAadharNo(partner.documents?.aadharNumber || '');
    setFormPan(partner.documents?.pan ?? true);
    setFormPanNo(partner.documents?.panNumber || '');
    setFormGst(partner.documents?.gst ?? true);
    setFormGstNo(partner.documents?.gstNumber || '');
    setFormShopLicense(partner.documents?.shopLicense ?? true);
    setFormBankProof(partner.documents?.bankProof ?? true);
    setFormAccountNo(partner.documents?.accountNumber || '');
    setFormIfsc(partner.documents?.ifscCode || '');
    setShowPassword(false);
    setIsFormOpen(true);
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    const pinArray = formPinCodes.split(',').map(s => s.trim()).filter(Boolean);
    const commVal = parseFloat(formCommission) || 5.0;

    const docPayload = {
      aadhar: formAadhar,
      aadharNumber: formAadharNo,
      pan: formPan,
      panNumber: formPanNo,
      gst: formGst,
      gstNumber: formGstNo,
      shopLicense: formShopLicense,
      bankProof: formBankProof,
      accountNumber: formAccountNo,
      ifscCode: formIfsc,
      verified: formAadhar && formPan && formGst,
    };

    if (editingPartner) {
      // Update existing
      const updated = partnerList.map(p => {
        if (p.id === editingPartner.id) {
          return {
            ...p,
            storeName: formStoreName,
            name: formName,
            phone: formPhone,
            email: formEmail,
            password: formPassword,
            city: formCity,
            state: formState,
            pinCodes: pinArray.length > 0 ? pinArray : p.pinCodes,
            commission: commVal,
            commissionType: formCommissionType,
            status: formStatus,
            documents: docPayload,
          };
        }
        return p;
      });
      savePartnersToStorage(updated);
      try {
        fetch('/api/partners', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPartner.id, ...updated.find(p => p.id === editingPartner.id) }),
        }).catch(() => {});
      } catch {}
    } else {
      // Create new partner
      const newPartner: Partner = {
        id: `partner-${Date.now()}`,
        name: formName,
        storeName: formStoreName,
        phone: formPhone,
        email: formEmail,
        password: formPassword,
        city: formCity,
        state: formState,
        pinCodes: pinArray.length > 0 ? pinArray : ['110001'],
        categories: ['cat-dslr', 'cat-lens', 'cat-mirrorless'],
        status: formStatus,
        rating: 5.0,
        totalOrders: 0,
        completedOrders: 0,
        totalEarnings: 0,
        pendingPayout: 0,
        availableBalance: 10000,
        joinedAt: new Date().toISOString().split('T')[0],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
        commission: commVal,
        commissionType: formCommissionType,
        documents: docPayload,
      };
      savePartnersToStorage([newPartner, ...partnerList]);
      try {
        fetch('/api/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPartner),
        }).catch(() => {});
      } catch {}
    }

    setIsFormOpen(false);
  };

  const pendingCount = partnerList.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">Partner Management</h2>
          <p className="text-sm text-gray-500">{partnerList.length} partners · {partnerList.filter(p => p.status === 'active').length} active</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
              <AlertTriangle size={15} className="text-yellow-600" />
              <span className="text-xs font-bold text-yellow-700">{pendingCount} pending</span>
            </div>
          )}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 transition-all"
          >
            <Plus size={16} />
            <span>Add New Partner</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Partners', value: partnerList.filter(p => p.status === 'active').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending Approval', value: partnerList.filter(p => p.status === 'pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Total Orders', value: partnerList.reduce((s, p) => s + (p.totalOrders || 0), 0), color: 'text-blue-600', bg: 'bg-blue-50' },
          { 
            label: 'Total Payouts', 
            value: (() => {
              const val = partnerList.reduce((s, p) => s + (p.totalEarnings || 0), 0);
              return val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : `₹${val.toLocaleString('en-IN')}`;
            })(), 
            color: 'text-purple-600', 
            bg: 'bg-purple-50' 
          },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: 'all', label: 'All Partners' },
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'unapproved', label: 'Unapproved' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search partners by name, store, city..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Partner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((partner) => {
          const docs = partner.documents || { aadhar: true, pan: true, gst: true, shopLicense: true, bankProof: true };
          const docsSubmitted = [docs.aadhar, docs.pan, docs.gst, docs.shopLicense, docs.bankProof].filter(Boolean).length;
          const totalDocs = docLabels.length;
          const commissionLabel = partner.commissionType === 'fixed' ? `₹${partner.commission}/order` : `${partner.commission}%`;

          return (
            <div key={partner.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow relative">
              <div className="flex items-start gap-3 mb-3">
                <img src={partner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'} alt={partner.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{partner.storeName}</p>
                  <p className="text-xs text-gray-500">{partner.name} · {partner.phone}</p>
                  <p className="text-xs text-gray-400">{partner.city}, {partner.state}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  partner.status === 'active' ? 'bg-green-100 text-green-700' :
                  partner.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  partner.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                }`}>{partner.status}</span>
              </div>

              {/* Commission Badge & Login Info */}
              <div className="flex items-center justify-between bg-primary/5 border border-primary/15 rounded-xl px-3 py-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <Percent size={13} className="text-primary" />
                  <span className="text-xs font-bold text-gray-700">Commission:</span>
                  <span className="text-xs font-extrabold text-primary">{commissionLabel}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Key size={11} className="text-gray-400" />
                  <span className="font-mono text-gray-600">{partner.password ? '••••••••' : 'Set'}</span>
                </div>
              </div>

              {/* Document Status */}
              <div className="bg-gray-50 rounded-xl p-2.5 mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-600">KYC Documents</span>
                  <span className={`text-xs font-bold ${docsSubmitted === totalDocs ? 'text-green-600' : 'text-yellow-600'}`}>{docsSubmitted}/{totalDocs}</span>
                </div>
                <div className="flex gap-1">
                  {docLabels.map(d => {
                    const isOk = docs[d.key as keyof typeof docs];
                    return (
                      <div key={d.key} title={d.label}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${isOk ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-400'}`}>
                        {isOk ? '✓' : '✗'}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-50 rounded-xl p-2 text-center">
                  <p className="text-sm font-black text-gray-900">{partner.totalOrders || 0}</p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 text-center">
                  <p className="text-sm font-black text-green-700">₹{((partner.totalEarnings || 0) / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500">Earnings</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 text-center">
                  <p className="text-sm font-black text-yellow-600 flex items-center justify-center gap-0.5"><Star size={11} />{partner.rating || 5.0}</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelected(partner)} className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                  <Eye size={12} /> View
                </button>
                <button onClick={() => openEditModal(partner)} className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl border border-primary/30 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10">
                  <Edit2 size={12} /> Edit & Commission
                </button>
                <button onClick={() => setDocModal(partner)} className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                  <FileText size={12} /> Docs
                </button>
                {partner.status === 'pending' && (
                  <div className="w-full flex gap-1.5 mt-1">
                    <button onClick={() => handleApprove(partner.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold hover:bg-green-600">
                      <CheckCircle size={12} /> Approve Partner
                    </button>
                    <button onClick={() => handleSuspend(partner.id)} className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100">
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                )}
                {partner.status === 'active' && (
                  <button onClick={() => handleSuspend(partner.id)} className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors mt-1">
                    <XCircle size={13} /> Suspend Partner
                  </button>
                )}
                {partner.status === 'suspended' && (
                  <button onClick={() => handleApprove(partner.id)} className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors mt-1">
                    <CheckCircle size={13} /> Re-activate Partner
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Partner Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 z-10 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {editingPartner ? 'Edit Partner & Set Commission' : 'Add New Partner & Login Credentials'}
                </h3>
                <p className="text-xs text-gray-500">Configure partner store, commission split, login credentials, and documents</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-4">
              {/* Basic Store & Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Store / Hub Name *</label>
                  <input
                    type="text"
                    required
                    value={formStoreName}
                    onChange={e => setFormStoreName(e.target.value)}
                    placeholder="e.g. Camsik Certified Hub Connaught Place"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Owner / Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="partner@store.com"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Login Credentials & Security */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key size={15} className="text-primary" />
                    <span className="text-xs font-bold text-gray-800">Partner Login Password</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormPassword(`Camsik@${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Generate Random
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder="Set partner portal password"
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-gray-300 text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">The partner can use their email and this password to sign in at <span className="font-semibold text-primary">/partner/login</span></p>
              </div>

              {/* Commission Setting */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent size={15} className="text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-900">Set Admin Commission Split</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700">Commission model</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Commission Type</label>
                    <select
                      value={formCommissionType}
                      onChange={e => setFormCommissionType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-sm bg-white font-semibold focus:outline-none"
                    >
                      <option value="percentage">Percentage (%) per Order</option>
                      <option value="fixed">Fixed Amount (₹) per Order</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      {formCommissionType === 'percentage' ? 'Commission Rate (%)' : 'Commission Amount (₹)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formCommission}
                      onChange={e => setFormCommission(e.target.value)}
                      placeholder={formCommissionType === 'percentage' ? '5.0' : '250'}
                      className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-sm bg-white font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-emerald-800">
                  {formCommissionType === 'percentage'
                    ? `Partner retains calculated order amount minus ${formCommission}% admin platform fee.`
                    : `Admin charges a flat ₹${formCommission} platform service fee per completed order.`}
                </p>
              </div>

              {/* Location & Service Areas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={e => setFormCity(e.target.value)}
                    placeholder="Delhi NCR"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formState}
                    onChange={e => setFormState(e.target.value)}
                    placeholder="Delhi"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Account Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none font-semibold"
                  >
                    <option value="active">Active (Verified)</option>
                    <option value="pending">Pending Approval</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Service PIN Codes (Comma separated)</label>
                <input
                  type="text"
                  value={formPinCodes}
                  onChange={e => setFormPinCodes(e.target.value)}
                  placeholder="110001, 110016, 110020"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                />
              </div>

              {/* KYC Documents Profile */}
              <div className="border border-gray-200 rounded-2xl p-3.5 space-y-3">
                <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-primary" />
                  <span>Partner KYC Documents & Verification Profile</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">🪪 Aadhaar Card</span>
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-green-700 cursor-pointer">
                        <input type="checkbox" checked={formAadhar} onChange={e => setFormAadhar(e.target.checked)} /> Verified
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formAadharNo}
                      onChange={e => setFormAadharNo(e.target.value)}
                      placeholder="12-digit Aadhaar No."
                      className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">📋 PAN Card</span>
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-green-700 cursor-pointer">
                        <input type="checkbox" checked={formPan} onChange={e => setFormPan(e.target.checked)} /> Verified
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formPanNo}
                      onChange={e => setFormPanNo(e.target.value)}
                      placeholder="PAN Number"
                      className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white uppercase"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">📄 GST Certificate</span>
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-green-700 cursor-pointer">
                        <input type="checkbox" checked={formGst} onChange={e => setFormGst(e.target.checked)} /> Verified
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formGstNo}
                      onChange={e => setFormGstNo(e.target.value)}
                      placeholder="GSTIN Number"
                      className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white uppercase"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">🏪 Shop License / Reg</span>
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-green-700 cursor-pointer">
                        <input type="checkbox" checked={formShopLicense} onChange={e => setFormShopLicense(e.target.checked)} /> Verified
                      </label>
                    </div>
                    <span className="text-[10px] text-gray-400">Trade License Verified</span>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">🏦 Bank Account No.</label>
                    <input
                      type="text"
                      value={formAccountNo}
                      onChange={e => setFormAccountNo(e.target.value)}
                      placeholder="e.g. 50100412345678"
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={formIfsc}
                      onChange={e => setFormIfsc(e.target.value)}
                      placeholder="e.g. HDFC0001234"
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl bg-white uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  <span>{editingPartner ? 'Update Partner Profile' : 'Create Partner & Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partner Comprehensive Detail View Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 z-10 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-4">
                <img src={selected.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'} alt={selected.name} className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-gray-900">{selected.storeName}</h3>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      selected.status === 'active' ? 'bg-green-100 text-green-700 border border-green-200' :
                      selected.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse' :
                      'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {selected.status === 'pending' ? '⏳ Pending Approval' : selected.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 mt-0.5">{selected.name} · <span className="font-mono text-xs text-gray-400">ID: {selected.id}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">Partner since: {selected.joinedAt || 'Recently'}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-4">
              {/* 1. Contact & Location Information */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Building size={14} className="text-primary" />
                  <span>Store Contact & Physical Address</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200/70 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">Primary Mobile Phone</p>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">{selected.phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selected.phone, 'phone')}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                      title="Copy Phone"
                    >
                      {copiedKey === 'phone' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-gray-200/70 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-[11px] text-gray-400 font-medium">Email Address</p>
                      <p className="font-bold text-gray-900 text-sm mt-0.5 truncate">{selected.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selected.email, 'email')}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors flex-shrink-0"
                      title="Copy Email"
                    >
                      {copiedKey === 'email' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-gray-200/70 text-xs">
                  <p className="text-[11px] text-gray-400 font-medium">Store Physical Address</p>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {selected.address || 'Address not entered'}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    City: <span className="font-bold text-gray-800">{selected.city || 'N/A'}</span> · State: <span className="font-bold text-gray-800">{selected.state || 'N/A'}</span>
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-gray-500 mb-1.5">Service PIN Codes Handled</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.pinCodes && selected.pinCodes.length > 0 ? (
                      selected.pinCodes.map(pin => (
                        <span key={pin} className="text-xs font-bold px-2.5 py-0.5 bg-primary/10 text-primary rounded-lg border border-primary/20">
                          📍 {pin}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">None specified</span>
                    )}
                  </div>
                </div>

                {selected.categories && selected.categories.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 mb-1.5">Allowed Equipment Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.categories.map(cat => (
                        <span key={cat} className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-700 rounded-lg">
                          🏷️ {cat.replace('cat-', '').toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. KYC & Business Tax Identifiers */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={14} className="text-primary" />
                  <span>Business Tax & Identification (KYC)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* PAN Card */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200/70">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-gray-500">📋 Business PAN Number</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        selected.documents?.panNumber ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {selected.documents?.panNumber ? 'Provided' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-gray-900 tracking-wider">
                        {selected.documents?.panNumber || 'NOT SUBMITTED'}
                      </span>
                      {selected.documents?.panNumber && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selected.documents?.panNumber || '', 'pan')}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                          title="Copy PAN"
                        >
                          {copiedKey === 'pan' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* GSTIN */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200/70">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-gray-500">📄 GST Number (GSTIN)</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        selected.documents?.gstNumber ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {selected.documents?.gstNumber ? 'Provided' : 'Optional'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-gray-900 tracking-wider truncate">
                        {selected.documents?.gstNumber || 'NOT REGISTERED'}
                      </span>
                      {selected.documents?.gstNumber && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selected.documents?.gstNumber || '', 'gst')}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex-shrink-0"
                          title="Copy GST"
                        >
                          {copiedKey === 'gst' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Settlement Bank Account Details */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard size={14} className="text-primary" />
                  <span>Settlement Bank Account (For Wallet Payouts)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-gray-200/70">
                    <p className="text-[11px] text-gray-400 font-medium">Bank Account Number</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono font-black text-sm text-gray-900 tracking-wider">
                        {selected.documents?.accountNumber || 'NOT PROVIDED'}
                      </span>
                      {selected.documents?.accountNumber && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selected.documents?.accountNumber || '', 'acc')}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                          title="Copy Account No"
                        >
                          {copiedKey === 'acc' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200/70">
                    <p className="text-[11px] text-gray-400 font-medium">Bank IFSC Code</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono font-black text-sm text-gray-900 tracking-wider">
                        {selected.documents?.ifscCode || 'NOT PROVIDED'}
                      </span>
                      {selected.documents?.ifscCode && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selected.documents?.ifscCode || '', 'ifsc')}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                          title="Copy IFSC Code"
                        >
                          {copiedKey === 'ifsc' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Login Credentials for Partner Access */}
              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Key size={14} className="text-primary" />
                    <span>Partner App & Web Login Credentials</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowSelectedPassword(!showSelectedPassword)}
                    className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    {showSelectedPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showSelectedPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-primary/20">
                    <p className="text-[11px] text-gray-500 font-semibold">Login Identifier</p>
                    <p className="font-mono font-bold text-gray-900 mt-0.5">{selected.phone || selected.email}</p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-primary/20 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-gray-500 font-semibold">Account Password</p>
                      <p className="font-mono font-bold text-gray-900 mt-0.5">
                        {selected.password ? (showSelectedPassword ? selected.password : '••••••••') : 'No password set'}
                      </p>
                    </div>
                    {selected.password && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selected.password || '', 'pwd')}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-primary cursor-pointer"
                        title="Copy Password"
                      >
                        {copiedKey === 'pwd' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. Orders & Financial Performance */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { label: 'Total Orders', value: selected.totalOrders || 0 },
                  { label: 'Completed Orders', value: selected.completedOrders || 0 },
                  { label: 'Total Earnings', value: `₹${((selected.totalEarnings || 0) / 1000).toFixed(0)}K` },
                  { label: 'Pending Payout', value: `₹${((selected.pendingPayout || 0) / 1000).toFixed(1)}K` },
                  { label: 'Available Balance', value: `₹${((selected.availableBalance || 0) / 1000).toFixed(0)}K` },
                  { label: 'Admin Commission', value: selected.commissionType === 'fixed' ? `₹${selected.commission}` : `${selected.commission}%` },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                    <p className="text-[11px] text-gray-400 font-medium">{item.label}</p>
                    <p className="text-sm font-black text-gray-900 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-5 mt-5 border-t border-gray-100">
              {selected.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selected.id);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-green-500 text-white text-sm font-bold shadow-md hover:bg-green-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle size={16} /> Approve Partner
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selected.id);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </>
              )}

              {selected.status === 'active' && (
                <button
                  onClick={() => {
                    handleSuspend(selected.id);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <XCircle size={15} /> Suspend Partner
                </button>
              )}

              {selected.status === 'suspended' && (
                <button
                  onClick={() => {
                    handleApprove(selected.id);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={15} /> Re-activate Partner
                </button>
              )}

              <button
                onClick={() => {
                  openEditModal(selected);
                  setSelected(null);
                }}
                className="py-2.5 px-4 rounded-xl border border-primary/30 bg-primary/5 text-primary text-sm font-bold hover:bg-primary/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit2 size={14} /> Edit & Commission
              </button>

              <button
                onClick={() => setSelected(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Verification Modal */}
      {docModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDocModal(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900">Document Verification</h3>
                <p className="text-sm text-gray-500">{docModal.storeName} · {docModal.name}</p>
              </div>
              <button onClick={() => setDocModal(null)} className="p-2 rounded-xl hover:bg-gray-100 cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 mb-5">
              {docLabels.map(doc => {
                const docs = docModal.documents || { aadhar: true, pan: true, gst: true, shopLicense: true, bankProof: true };
                const submitted = docs[doc.key as keyof typeof docs];

                let detailValue = '';
                if (doc.key === 'pan') {
                  detailValue = docs.panNumber ? `PAN: ${docs.panNumber}` : '';
                } else if (doc.key === 'gst') {
                  detailValue = docs.gstNumber ? `GSTIN: ${docs.gstNumber}` : '';
                } else if (doc.key === 'bankProof') {
                  detailValue = docs.accountNumber ? `A/C: ${docs.accountNumber} · IFSC: ${docs.ifscCode || 'N/A'}` : '';
                } else if (doc.key === 'aadhar') {
                  detailValue = docs.aadharNumber ? `Aadhaar: ${docs.aadharNumber}` : '';
                }

                return (
                  <div key={doc.key} className={`flex items-center justify-between p-3.5 rounded-2xl border ${submitted ? 'border-green-100 bg-green-50/60' : 'border-red-100 bg-red-50/60'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{doc.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{doc.label}</p>
                        {detailValue ? (
                          <p className="text-xs font-mono font-bold text-primary">{detailValue}</p>
                        ) : (
                          <p className="text-xs text-gray-500">{submitted ? 'Document verified & on file' : 'Not submitted yet'}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {submitted ? (
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-xl flex items-center gap-1 border border-green-200">
                          <CheckCircle size={12} /> Verified
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-xl flex items-center gap-1 border border-red-200">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-yellow-50 rounded-2xl p-3.5 mb-5 border border-yellow-100">
              <p className="text-xs font-bold text-yellow-800 mb-1">⚠️ Verification & Commission Status</p>
              <p className="text-xs text-yellow-700">
                Partner commission is configured at <span className="font-bold text-gray-900">{docModal.commissionType === 'fixed' ? `₹${docModal.commission}` : `${docModal.commission}%`}</span>. Partner password and profile can be inspected in the Detail View.
              </p>
            </div>

            <div className="flex gap-3">
              {docModal.status === 'pending' && (
                <>
                  <button onClick={() => { handleReject(docModal.id); setDocModal(null); }}
                    className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 flex items-center justify-center gap-2 cursor-pointer">
                    <XCircle size={14} /> Reject
                  </button>
                  <button onClick={() => { handleApprove(docModal.id); setDocModal(null); }}
                    className="flex-1 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 flex items-center justify-center gap-2 cursor-pointer shadow-md">
                    <Shield size={14} /> Verify & Approve
                  </button>
                </>
              )}
              {docModal.status !== 'pending' && (
                <button onClick={() => setDocModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-50">Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
