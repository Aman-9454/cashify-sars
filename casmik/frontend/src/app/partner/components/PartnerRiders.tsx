'use client';
import React, { useState, useEffect } from 'react';
import { Partner, DeliveryAgent, deliveryAgents } from '@/lib/casmikData';
import { Bike, Plus, Search, Phone, Star, Shield, CheckCircle, XCircle, Key, Eye, EyeOff, Edit2, FileText, Check, AlertCircle, MapPin } from 'lucide-react';

interface Props {
  partner?: Partner | null;
}

export default function PartnerRiders({ partner }: Props) {
  const getPartner = (): Partner | null => {
    if (partner) return partner;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('casmik_partner_session');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  };

  const currentPartner = getPartner();
  const currentPartnerId = currentPartner?.id || 'partner-001';

  const [riders, setRiders] = useState<DeliveryAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState<DeliveryAgent | null>(null);
  const [callModal, setCallModal] = useState<DeliveryAgent | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicle, setVehicle] = useState('Bike (Hero Splendor)');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [pinCodes, setPinCodes] = useState('');
  const [aadharNo, setAadharNo] = useState('');
  const [dlNo, setDlNo] = useState('');

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/delivery-agents?partnerId=${encodeURIComponent(currentPartnerId)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.agents)) {
          setRiders(data.agents);
          return;
        }
      }
      // Fallback to local storage if API call fails
      const saved = localStorage.getItem('casmik_delivery_agents_v1');
      if (saved) {
        const list: DeliveryAgent[] = JSON.parse(saved);
        if (Array.isArray(list)) {
          setRiders(list.filter(a => a.partnerId === currentPartnerId));
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to load riders from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();

    const handleSync = () => {
      fetchRiders();
    };
    window.addEventListener('casmik_delivery_agents_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('casmik_delivery_agents_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [currentPartnerId]);

  const openAddModal = () => {
    setEditingRider(null);
    setName('');
    setPhone('');
    setEmail('');
    setPassword(`Rider@${Math.floor(1000 + Math.random() * 9000)}`);
    setVehicle('Bike');
    setVehicleNumber('');
    setPinCodes(currentPartner?.pinCodes?.join(', ') || '');
    setAadharNo('');
    setDlNo('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (rider: DeliveryAgent) => {
    setEditingRider(rider);
    setName(rider.name);
    setPhone(rider.phone);
    setEmail(rider.email);
    setPassword(rider.password || 'Rider@2024');
    setVehicle(rider.vehicle);
    setVehicleNumber(rider.vehicleNumber);
    setPinCodes(rider.pinCodes?.join(', ') || '');
    setAadharNo(rider.documents?.aadharNumber || '');
    setDlNo(rider.documents?.dlNumber || '');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSaveRider = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinArray = pinCodes.split(',').map(s => s.trim()).filter(Boolean);

    const docPayload = {
      aadhar: !!aadharNo,
      aadharNumber: aadharNo,
      pan: true,
      drivingLicense: !!dlNo,
      dlNumber: dlNo,
      vehicleRC: true,
      insurance: true,
      verified: true,
    };

    setIsSubmitting(true);
    try {
      if (editingRider) {
        const updatePayload = {
          id: editingRider.id,
          name,
          phone,
          email,
          password,
          vehicle,
          vehicleNumber,
          pinCodes: pinArray.length > 0 ? pinArray : editingRider.pinCodes,
          documents: docPayload,
        };

        const res = await fetch('/api/delivery-agents', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.agent) {
            setRiders(prev => prev.map(r => r.id === editingRider.id ? { ...r, ...json.agent } : r));
          }
        }
      } else {
        const newPayload = {
          name,
          phone,
          email: email || `${phone}@camsik.in`,
          password,
          city: currentPartner?.city || 'Delhi NCR',
          pinCodes: pinArray.length > 0 ? pinArray : (currentPartner?.pinCodes || ['110001']),
          vehicle,
          vehicleNumber,
          partnerId: currentPartnerId,
          partnerName: currentPartner?.storeName || 'Partner Store',
          documents: docPayload,
          status: 'online',
          createdBy: 'partner',
        };

        const res = await fetch('/api/delivery-agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPayload),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.agent) {
            setRiders(prev => [json.agent, ...prev]);
          }
        }
      }

      window.dispatchEvent(new Event('casmik_delivery_agents_updated'));
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving rider:', err);
    } finally {
      setIsSubmitting(false);
      fetchRiders();
    }
  };

  const toggleRiderStatus = async (id: string) => {
    const rider = riders.find(r => r.id === id);
    if (!rider) return;
    const nextStatus: 'online' | 'offline' = rider.status === 'online' ? 'offline' : 'online';

    // Optimistic update
    setRiders(prev => prev.map(r => r.id === id ? { ...r, status: nextStatus } : r));

    try {
      await fetch('/api/delivery-agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      window.dispatchEvent(new Event('casmik_delivery_agents_updated'));
    } catch (e) {
      console.warn('Failed to toggle rider status on API:', e);
    }
  };

  const filteredRiders = riders.filter(r => {
    const matchQuery = (r.name || '').toLowerCase().includes(query.toLowerCase()) || 
                       (r.phone || '').includes(query) || 
                       (r.vehicleNumber || '').toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900">My Dedicated Delivery Riders</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
              Store Fleet Exclusive
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Create and manage delivery riders that work exclusively for <span className="font-semibold text-gray-800">{currentPartner?.storeName || 'your store'}</span>. Admin fleet riders are never displayed here.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Rider</span>
        </button>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-2xl flex items-start gap-3">
        <Bike size={20} className="text-primary flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900">
          <p className="font-bold">Store Dedicated Fleet Privacy & Isolation</p>
          <p className="text-blue-700 mt-0.5">
            Riders you create here will only receive pickups and orders assigned by your store. They log in to the Rider App using the login credentials you set below.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Store Riders', value: riders.length, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Active Online', value: riders.filter(r => r.status === 'online').length, color: 'text-green-600', bg: 'bg-green-50/60' },
          { label: 'Today Pickups', value: riders.reduce((s, r) => s + (r.todayPickups || 0), 0), color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Total Completed', value: riders.reduce((s, r) => s + (r.totalDeliveries || 0), 0), color: 'text-purple-600', bg: 'bg-purple-50/60' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100 shadow-sm`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search riders by name, phone, vehicle plate..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white font-semibold focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="on_trip">On Trip</option>
        </select>
      </div>

      {/* Riders List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">Loading store delivery fleet from MongoDB...</p>
        </div>
      ) : filteredRiders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto">
            <Bike size={32} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">No Store Riders Found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              You haven&apos;t added any delivery riders for your store yet. Click below to add your first rider with login credentials so they can handle pickups.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Store Rider</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRiders.map(rider => (
            <div key={rider.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow relative space-y-3">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img src={rider.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80'} alt={rider.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    rider.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{rider.name}</p>
                  <p className="text-xs text-gray-500">📞 {rider.phone}</p>
                  <p className="text-xs text-gray-400 truncate">{rider.vehicle} · {rider.vehicleNumber}</p>
                </div>
                <button
                  onClick={() => toggleRiderStatus(rider.id)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                    rider.status === 'online' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {rider.status}
                </button>
              </div>

              {/* Login Credentials & Scope */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1"><Key size={12} className="text-primary" /> Login Email:</span>
                  <span className="font-bold text-gray-800">{rider.email}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Password:</span>
                  <span className="font-mono text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">{rider.password || '••••••••'}</span>
                </div>
              </div>

              {/* Performance stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-sm font-black text-gray-900">{rider.todayPickups || 0}</p>
                  <p className="text-[10px] text-gray-500">Today</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-sm font-black text-gray-900">{rider.totalDeliveries || 0}</p>
                  <p className="text-[10px] text-gray-500">Total Completed</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-sm font-black text-yellow-600 flex items-center justify-center gap-0.5"><Star size={11} />{rider.rating || 5.0}</p>
                  <p className="text-[10px] text-gray-500">Rating</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1 border-t border-gray-100">
                <button
                  onClick={() => setCallModal(rider)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-green-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone size={13} />
                  <span>Call</span>
                </button>
                <button
                  onClick={() => openEditModal(rider)}
                  className="flex-1 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 size={13} />
                  <span>Edit / Credentials</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Rider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 z-10 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {editingRider ? 'Edit Store Rider & Credentials' : 'Create New Dedicated Store Rider'}
                </h3>
                <p className="text-xs text-gray-500">This rider will only serve pickups for {currentPartner?.storeName || 'your store'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">✕</button>
            </div>

            <form onSubmit={handleSaveRider} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rider Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email (Login Username) *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rider@mystore.com"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Password Credentials */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Key size={14} className="text-primary" /> Rider App Login Password
                  </span>
                  <button
                    type="button"
                    onClick={() => setPassword(`Rider@${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Generate Random
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter login password"
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
                <p className="text-[11px] text-gray-500">Provide this email & password to your rider to log into the delivery application.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Type</label>
                  <input
                    type="text"
                    value={vehicle}
                    onChange={e => setVehicle(e.target.value)}
                    placeholder="Bike (Hero Splendor)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Reg No.</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value)}
                    placeholder="DL01AB1234"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Service PIN Codes (Comma separated)</label>
                <input
                  type="text"
                  value={pinCodes}
                  onChange={e => setPinCodes(e.target.value)}
                  placeholder="110001, 110016"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                />
              </div>

              {/* KYC Document Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">🪪 Aadhaar Number</label>
                  <input
                    type="text"
                    value={aadharNo}
                    onChange={e => setAadharNo(e.target.value)}
                    placeholder="XXXX-XXXX-1234"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">🚗 Driving License (DL)</label>
                  <input
                    type="text"
                    value={dlNo}
                    onChange={e => setDlNo(e.target.value)}
                    placeholder="DL-042022001122"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={16} />
                      <span>{editingRider ? 'Update Rider' : 'Create Rider'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {callModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCallModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Phone size={28} className="text-green-600" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">Call Store Rider</h3>
            <p className="text-gray-500 text-sm mb-4">{callModal.name}</p>
            <a href={`tel:${callModal.phone}`}
              className="block w-full py-3 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 mb-3">
              📞 {callModal.phone}
            </a>
            <button onClick={() => setCallModal(null)} className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
