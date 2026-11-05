'use client';
import React, { useState, useEffect } from 'react';
import { deliveryAgents, orders as defaultOrders, partners, DeliveryAgent, Partner } from '@/lib/casmikData';
import type { Order, OrderStatus } from '@/lib/casmikData';
import { Search, MapPin, Phone, Star, Package, FileText, CheckCircle, XCircle, Shield, Clock, AlertTriangle, X, Truck, Check, Plus, Edit2, Key, Percent, DollarSign, Building, Bike, Eye, EyeOff } from 'lucide-react';
import { triggerNotification } from '@/lib/notifications';

const docLabels = [
  { key: 'aadhar', label: 'Aadhaar Card', icon: '🪪' },
  { key: 'pan', label: 'PAN Card', icon: '📋' },
  { key: 'drivingLicense', label: 'Driving License', icon: '🚗' },
  { key: 'vehicleRC', label: 'Vehicle RC', icon: '📄' },
  { key: 'insurance', label: 'Vehicle Insurance', icon: '🛡️' },
];

const isMockOrder = (o: any) => {
  if (!o) return false;
  const num = String(o.orderNumber || '');
  const id = String(o.id || '');
  if (id.startsWith('ord-100') || id.startsWith('ord-101') || id.startsWith('ord-102')) return true;
  if (num.startsWith('CSM-2024-00') || num.startsWith('CSM-2024-01') || num.startsWith('CSM-2024-02') || num.startsWith('CSM-2024-03')) return true;
  if (o.customerName === 'Rahul Sharma' || o.customerName === 'Ananya Deshmukh' || o.customerName === 'Vikramaditya Rathore') return true;
  return false;
};

const getStoredPartners = (): Partner[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_partners_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((p: any) => !p.id?.startsWith('partner-00'));
      }
    } catch {}
  }
  return [];
};

const getInitialAgents = (): DeliveryAgent[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_delivery_agents_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((a: any) => !a.id?.startsWith('agent-10') && !a.id?.startsWith('delivery-00'));
          if (clean.length !== parsed.length) {
            localStorage.setItem('casmik_delivery_agents_v1', JSON.stringify(clean));
          }
          return clean;
        }
      }
    } catch {}
  }
  return [];
};

const getStoredOrders = (): Order[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_orders_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter(o => !isMockOrder(o));
      }
    } catch {}
  }
  return [];
};

export default function AdminDelivery() {
  const [agents, setAgents] = useState<DeliveryAgent[]>(getInitialAgents);
  const [partnerList, setPartnerList] = useState<Partner[]>(getStoredPartners);
  const [ordersList, setOrdersList] = useState<Order[]>(getStoredOrders);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFleet, setFilterFleet] = useState<'all' | 'admin' | 'partner'>('all');
  const [docModal, setDocModal] = useState<DeliveryAgent | null>(null);
  const [assignModal, setAssignModal] = useState<DeliveryAgent | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [scheduledSlot, setScheduledSlot] = useState('10:00 AM - 1:00 PM');
  const [scheduledDate, setScheduledDate] = useState('');
  const [callModal, setCallModal] = useState<DeliveryAgent | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  // Add / Edit Rider Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<DeliveryAgent | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formCity, setFormCity] = useState('Delhi NCR');
  const [formPinCodes, setFormPinCodes] = useState('110001, 110016');
  const [formVehicle, setFormVehicle] = useState('Bike (Hero Splendor)');
  const [formVehicleNumber, setFormVehicleNumber] = useState('DL01AB1234');
  const [formCommission, setFormCommission] = useState('150');
  const [formCommissionType, setFormCommissionType] = useState<'fixed' | 'percentage'>('fixed');
  const [formPartnerId, setFormPartnerId] = useState<string>(''); // empty means Admin Fleet
  const [formApprovalStatus, setFormApprovalStatus] = useState<'approved' | 'pending' | 'rejected'>('approved');

  // Documents
  const [formAadhar, setFormAadhar] = useState(true);
  const [formAadharNo, setFormAadharNo] = useState('');
  const [formPan, setFormPan] = useState(true);
  const [formPanNo, setFormPanNo] = useState('');
  const [formDl, setFormDl] = useState(true);
  const [formDlNo, setFormDlNo] = useState('');
  const [formRc, setFormRc] = useState(true);
  const [formInsurance, setFormInsurance] = useState(true);

  useEffect(() => {
    fetch('/api/delivery-agents')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.agents)) {
          setAgents(data.agents);
        }
      })
      .catch(() => {});

    const handleSync = () => {
      setOrdersList(getStoredOrders());
      setPartnerList(getStoredPartners());
    };
    window.addEventListener('casmik_orders_updated', handleSync);
    window.addEventListener('casmik_partners_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('casmik_orders_updated', handleSync);
      window.removeEventListener('casmik_partners_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const saveAgentsToStorage = (updated: DeliveryAgent[]) => {
    setAgents(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('casmik_delivery_agents_v1', JSON.stringify(updated));
      window.dispatchEvent(new Event('casmik_delivery_agents_updated'));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const filtered = agents.filter(a => {
    const matchesQuery = (a?.name?.toLowerCase()?.includes(query?.toLowerCase()) || a?.city?.toLowerCase()?.includes(query?.toLowerCase()) || a?.vehicleNumber?.toLowerCase()?.includes(query?.toLowerCase()));
    const matchesStatus = (filterStatus === 'all' || a?.status === filterStatus);
    const matchesTab = (activeTab === 'all' || (activeTab === 'pending' && a.approvalStatus === 'pending'));
    const matchesFleet = (filterFleet === 'all' || (filterFleet === 'admin' && !a.partnerId) || (filterFleet === 'partner' && Boolean(a.partnerId)));
    return matchesQuery && matchesStatus && matchesTab && matchesFleet;
  });

  const statusColors = { online: 'bg-green-100 text-green-700', offline: 'bg-gray-100 text-gray-600', on_trip: 'bg-blue-100 text-blue-700' };
  const statusDots = { online: 'bg-green-500', offline: 'bg-gray-400', on_trip: 'bg-blue-500' };

  const handleApprove = (id: string) => {
    const updated = agents.map(a => a.id === id ? { ...a, approvalStatus: 'approved' as const } : a);
    saveAgentsToStorage(updated);
    fetch('/api/delivery-agents', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approvalStatus: 'approved' }),
    }).catch(() => {});
  };

  const handleReject = (id: string) => {
    const updated = agents.map(a => a.id === id ? { ...a, approvalStatus: 'rejected' as const } : a);
    saveAgentsToStorage(updated);
    fetch('/api/delivery-agents', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approvalStatus: 'rejected' }),
    }).catch(() => {});
  };

  const openAddModal = () => {
    setEditingAgent(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormPassword(`Rider@${Math.floor(1000 + Math.random() * 9000)}`);
    setFormCity('Delhi NCR');
    setFormPinCodes('110001, 110016, 110070');
    setFormVehicle('Bike (Hero Splendor)');
    setFormVehicleNumber('DL01AB' + Math.floor(1000 + Math.random() * 9000));
    setFormCommission('150');
    setFormCommissionType('fixed');
    setFormPartnerId(''); // Admin Fleet
    setFormApprovalStatus('approved');
    setFormAadhar(true);
    setFormAadharNo('XXXX-XXXX-9912');
    setFormPan(true);
    setFormPanNo('DLKP7712E');
    setFormDl(true);
    setFormDlNo('DL-042021008899');
    setFormRc(true);
    setFormInsurance(true);
    setShowPassword(false);
    setIsFormOpen(true);
  };

  const openEditModal = (agent: DeliveryAgent) => {
    setEditingAgent(agent);
    setFormName(agent.name);
    setFormPhone(agent.phone);
    setFormEmail(agent.email);
    setFormPassword(agent.password || 'Rider@2024');
    setFormCity(agent.city);
    setFormPinCodes(agent.pinCodes?.join(', ') || '');
    setFormVehicle(agent.vehicle);
    setFormVehicleNumber(agent.vehicleNumber);
    setFormCommission(agent.commission?.toString() || '150');
    setFormCommissionType(agent.commissionType || 'fixed');
    setFormPartnerId(agent.partnerId || '');
    setFormApprovalStatus(agent.approvalStatus || 'approved');
    setFormAadhar(agent.documents?.aadhar ?? true);
    setFormAadharNo(agent.documents?.aadharNumber || '');
    setFormPan(agent.documents?.pan ?? true);
    setFormPanNo(agent.documents?.panNumber || '');
    setFormDl(agent.documents?.drivingLicense ?? true);
    setFormDlNo(agent.documents?.dlNumber || '');
    setFormRc(agent.documents?.vehicleRC ?? true);
    setFormInsurance(agent.documents?.insurance ?? true);
    setShowPassword(false);
    setIsFormOpen(true);
  };

  const handleSaveAgent = (e: React.FormEvent) => {
    e.preventDefault();
    const pinArray = formPinCodes.split(',').map(s => s.trim()).filter(Boolean);
    const commVal = parseFloat(formCommission) || 150;
    const selectedPartner = partnerList.find(p => p.id === formPartnerId);

    const docPayload = {
      aadhar: formAadhar,
      aadharNumber: formAadharNo,
      pan: formPan,
      panNumber: formPanNo,
      drivingLicense: formDl,
      dlNumber: formDlNo,
      vehicleRC: formRc,
      insurance: formInsurance,
      verified: formAadhar && formDl && formRc,
    };

    if (editingAgent) {
      const updated = agents.map(a => {
        if (a.id === editingAgent.id) {
          return {
            ...a,
            name: formName,
            phone: formPhone,
            email: formEmail,
            password: formPassword,
            city: formCity,
            pinCodes: pinArray.length > 0 ? pinArray : a.pinCodes,
            vehicle: formVehicle,
            vehicleNumber: formVehicleNumber,
            commission: commVal,
            commissionType: formCommissionType,
            partnerId: formPartnerId || null,
            partnerName: selectedPartner ? selectedPartner.storeName : null,
            approvalStatus: formApprovalStatus,
            documents: docPayload,
          };
        }
        return a;
      });
      saveAgentsToStorage(updated);

      fetch('/api/delivery-agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAgent.id,
          name: formName,
          phone: formPhone,
          email: formEmail,
          password: formPassword,
          city: formCity,
          pinCodes: pinArray.length > 0 ? pinArray : editingAgent.pinCodes,
          vehicle: formVehicle,
          vehicleNumber: formVehicleNumber,
          commission: commVal,
          commissionType: formCommissionType,
          partnerId: formPartnerId || 'admin',
          partnerName: selectedPartner ? selectedPartner.storeName : 'Admin Direct Fleet',
          approvalStatus: formApprovalStatus,
          documents: docPayload,
        }),
      }).catch(err => console.warn('Sync admin rider update warning:', err));
    } else {
      const targetPartner = formPartnerId || 'admin';
      const newAgent: DeliveryAgent = {
        id: `delivery-${Date.now()}`,
        name: formName,
        phone: formPhone,
        email: formEmail,
        password: formPassword,
        city: formCity,
        pinCodes: pinArray.length > 0 ? pinArray : ['110001'],
        status: 'online',
        rating: 5.0,
        todayPickups: 0,
        todayDeliveries: 0,
        totalDeliveries: 0,
        earnings: 0,
        vehicle: formVehicle,
        vehicleNumber: formVehicleNumber,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
        joinedAt: new Date().toISOString().split('T')[0],
        commission: commVal,
        commissionType: formCommissionType,
        partnerId: formPartnerId || null,
        partnerName: selectedPartner ? selectedPartner.storeName : null,
        approvalStatus: formApprovalStatus,
        documents: docPayload,
      };
      saveAgentsToStorage([newAgent, ...agents]);

      fetch('/api/delivery-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          email: formEmail,
          password: formPassword,
          city: formCity,
          pinCodes: pinArray.length > 0 ? pinArray : ['110001'],
          vehicle: formVehicle,
          vehicleNumber: formVehicleNumber,
          commission: commVal,
          commissionType: formCommissionType,
          partnerId: targetPartner,
          partnerName: selectedPartner ? selectedPartner.storeName : 'Admin Direct Fleet',
          createdBy: 'admin',
          approvalStatus: formApprovalStatus,
          documents: docPayload,
        }),
      }).catch(err => console.warn('Sync admin rider insert warning:', err));
    }

    setIsFormOpen(false);
  };

  const pendingCount = agents.filter(a => a.approvalStatus === 'pending').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">Delivery & Rider Fleet Management</h2>
          <p className="text-sm text-gray-500">
            {agents?.length} riders · {agents?.filter(a => a?.status === 'online')?.length} online · {agents?.filter(a => !a.partnerId)?.length} Admin Fleet · {agents?.filter(a => a.partnerId)?.length} Partner Assigned
          </p>
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
            <span>Add Delivery Rider</span>
          </button>
        </div>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Online Riders', value: agents?.filter(a => a?.status === 'online')?.length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Admin Fleet', value: agents?.filter(a => !a.partnerId)?.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Partner Fleet', value: agents?.filter(a => a.partnerId)?.length, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Pending Approval', value: pendingCount, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ]?.map(s => (
          <div key={s?.label} className={`${s?.bg} rounded-2xl p-4 border border-white`}>
            <p className={`text-2xl font-black ${s?.color}`}>{s?.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{s?.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs & Fleet Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {[
            { key: 'all', label: 'All Agents' },
            { key: 'pending', label: `Pending Approval (${pendingCount})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 text-xs font-bold">
          <button
            onClick={() => setFilterFleet('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filterFleet === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            All Fleets
          </button>
          <button
            onClick={() => setFilterFleet('admin')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filterFleet === 'admin' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}
          >
            Admin Fleet Only
          </button>
          <button
            onClick={() => setFilterFleet('partner')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filterFleet === 'partner' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'}`}
          >
            Partner Riders
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={e => setQuery(e?.target?.value)} placeholder="Search riders by name, vehicle, phone..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e?.target?.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white">
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="on_trip">On Trip</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered?.map((agent) => {
          const docs = agent.documents || { aadhar: true, pan: true, drivingLicense: true, vehicleRC: true, insurance: true };
          const docsSubmitted = [docs.aadhar, docs.pan, docs.drivingLicense, docs.vehicleRC, docs.insurance].filter(Boolean).length;
          const commPayout = agent.commissionType === 'percentage' ? `${agent.commission}% / task` : `₹${agent.commission || 150} / task`;

          return (
            <div key={agent?.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow relative">
              <div className="flex items-start gap-3 mb-3">
                <div className="relative">
                  <img src={agent?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80'} alt={agent?.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${statusDots?.[agent?.status as keyof typeof statusDots] || 'bg-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{agent?.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} />{agent?.city}</p>
                  <p className="text-xs text-gray-400 truncate">{agent?.vehicle} · {agent?.vehicleNumber}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors?.[agent?.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>
                    {agent?.status?.replace('_', ' ')}
                  </span>
                  {agent.approvalStatus === 'pending' && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Pending</span>
                  )}
                </div>
              </div>

              {/* Fleet & Commission Badge */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <Bike size={13} className="text-primary" />
                  <span className="text-[11px] font-bold text-gray-600">
                    {agent.partnerId ? (
                      <span className="text-purple-700 font-extrabold truncate">Store: {agent.partnerName || 'Partner'}</span>
                    ) : (
                      <span className="text-blue-700 font-extrabold">Admin Central Fleet</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    {commPayout}
                  </span>
                </div>
              </div>

              {/* Rider App Login Credentials Strip */}
              <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200/80 rounded-xl px-3 py-1.5 mb-3 text-xs">
                <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                  <Key size={12} className="text-amber-700" />
                  <span className="text-[11px] font-bold">App Login:</span>
                  <span className="font-mono text-[11px] font-semibold text-gray-700">{agent.phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-950">
                    {agent.password || '••••••••'}
                  </span>
                </div>
              </div>

              {/* Documents status */}
              <div className="bg-gray-50 rounded-xl p-2 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-600">KYC & Vehicle Docs</span>
                  <span className={`text-xs font-bold ${docsSubmitted === docLabels.length ? 'text-green-600' : 'text-yellow-600'}`}>{docsSubmitted}/{docLabels.length}</span>
                </div>
                <div className="flex gap-1">
                  {docLabels.map(d => {
                    const isOk = docs[d.key as keyof typeof docs];
                    return (
                      <div key={d.key} title={d.label}
                        className={`w-5 h-5 rounded text-xs flex items-center justify-center ${isOk ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-400'}`}>
                        {isOk ? '✓' : '✗'}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-gray-50 rounded-xl p-2 text-center">
                  <p className="text-sm font-black text-gray-900">{agent?.todayPickups || 0}</p>
                  <p className="text-xs text-gray-500">Pickups</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 text-center">
                  <p className="text-sm font-black text-gray-900">{agent?.todayDeliveries || 0}</p>
                  <p className="text-xs text-gray-500">Deliveries</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 text-center">
                  <p className="text-sm font-black text-gray-900">{agent?.totalDeliveries || 0}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 text-center">
                  <p className="text-sm font-black text-yellow-600 flex items-center justify-center gap-0.5"><Star size={10} />{agent?.rating || 5.0}</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Today: ₹{agent?.earnings?.toLocaleString('en-IN') || 0}</span>
                <span>PINs: {agent?.pinCodes?.slice(0, 2)?.join(', ')}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setCallModal(agent)}
                  className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-green-300 hover:text-green-700 transition-colors">
                  <Phone size={12} /> Call
                </button>
                <button onClick={() => openEditModal(agent)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl border border-primary/30 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10">
                  <Edit2 size={12} /> Edit & Commission
                </button>
                <button onClick={() => setDocModal(agent)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                  <FileText size={12} />
                </button>
                {agent.approvalStatus === 'pending' ? (
                  <button onClick={() => handleApprove(agent.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold hover:bg-green-600 mt-1">
                    <Shield size={12} /> Approve Rider
                  </button>
                ) : (
                  (agent.createdBy === 'admin' || agent.partnerId === 'admin' || !agent.partnerId) ? (
                    <button onClick={() => setAssignModal(agent)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 mt-1 cursor-pointer">
                      <Package size={12} /> Assign Task
                    </button>
                  ) : (
                    <div className="w-full text-center py-2 px-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold mt-1 select-none">
                      🔒 Partner Rider ({agent.partnerName || 'Dedicated'}) · Cannot Assign
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Rider Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 z-10 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {editingAgent ? 'Edit Rider & Set Commission' : 'Add New Delivery Rider & Credentials'}
                </h3>
                <p className="text-xs text-gray-500">Configure rider details, fleet assignment, delivery payout, and KYC documents</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleSaveAgent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rider Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Vikas Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="rider@camsik.com"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fleet Scope / Assignment *</label>
                  <select
                    value={formPartnerId}
                    onChange={e => setFormPartnerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white font-semibold focus:outline-none"
                  >
                    <option value="">Admin Central Fleet (Global)</option>
                    {partnerList.map(p => (
                      <option key={p.id} value={p.id}>
                        Partner: {p.storeName} ({p.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Login Password */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key size={15} className="text-primary" />
                    <span className="text-xs font-bold text-gray-800">Rider App Login Password</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormPassword(`Rider@${Math.floor(1000 + Math.random() * 9000)}`)}
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
                    placeholder="Set rider app login password"
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
                <p className="text-[11px] text-gray-500">Riders use their phone or email and this password to sign in on Camsik Rider App.</p>
              </div>

              {/* Set Commission Payout */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={15} className="text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-900">Set Delivery Rider Payout / Commission</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700">Earnings per delivery</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Commission Type</label>
                    <select
                      value={formCommissionType}
                      onChange={e => setFormCommissionType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-sm bg-white font-semibold focus:outline-none"
                    >
                      <option value="fixed">Fixed ₹ Payout per Pickup/Delivery</option>
                      <option value="percentage">Percentage (%) of Delivery Fee</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      {formCommissionType === 'fixed' ? 'Fixed Payout (₹ per task)' : 'Commission Share (%)'}
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      value={formCommission}
                      onChange={e => setFormCommission(e.target.value)}
                      placeholder={formCommissionType === 'fixed' ? '150' : '10'}
                      className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-sm bg-white font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle & Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    value={formVehicle}
                    onChange={e => setFormVehicle(e.target.value)}
                    placeholder="e.g. Bike (Hero Splendor)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Reg Number</label>
                  <input
                    type="text"
                    value={formVehicleNumber}
                    onChange={e => setFormVehicleNumber(e.target.value)}
                    placeholder="e.g. DL01AB4432"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={e => setFormCity(e.target.value)}
                    placeholder="Delhi NCR"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Approval Status</label>
                  <select
                    value={formApprovalStatus}
                    onChange={e => setFormApprovalStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none font-semibold"
                  >
                    <option value="approved">Approved & Active</option>
                    <option value="pending">Pending Review</option>
                    <option value="rejected">Rejected / Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Assigned PIN Codes (Comma separated)</label>
                <input
                  type="text"
                  value={formPinCodes}
                  onChange={e => setFormPinCodes(e.target.value)}
                  placeholder="110001, 110016, 110020"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
                />
              </div>

              {/* KYC & Vehicle Documents */}
              <div className="border border-gray-200 rounded-2xl p-3.5 space-y-3">
                <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-primary" />
                  <span>Rider KYC & License Verification</span>
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
                      <span className="font-bold text-gray-800">🚗 Driving License (DL)</span>
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-green-700 cursor-pointer">
                        <input type="checkbox" checked={formDl} onChange={e => setFormDl(e.target.checked)} /> Verified
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formDlNo}
                      onChange={e => setFormDlNo(e.target.value)}
                      placeholder="DL Number"
                      className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white uppercase"
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
                      <span className="font-bold text-gray-800">📄 Vehicle RC & Insurance</span>
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-green-700 cursor-pointer">
                        <input type="checkbox" checked={formRc} onChange={e => setFormRc(e.target.checked)} /> Verified
                      </label>
                    </div>
                    <span className="text-[10px] text-gray-500">RC & Insurance Checked</span>
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
                  <span>{editingAgent ? 'Update Rider Profile' : 'Create Rider & Credentials'}</span>
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
            <h3 className="text-lg font-black text-gray-900 mb-1">Call Rider</h3>
            <p className="text-gray-500 text-sm mb-4">{callModal.name}</p>
            <a href={`tel:${callModal.phone}`}
              className="block w-full py-3 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 mb-3">
              📞 {callModal.phone}
            </a>
            <button onClick={() => setCallModal(null)} className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {assignSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-gray-700 animate-in fade-in">
          <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
          <span>{assignSuccess}</span>
        </div>
      )}

      {/* Assign Task Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAssignModal(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-7 z-10 border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1">
                  <Truck size={13} /> Dispatch Executive Task
                </span>
                <h3 className="text-lg font-black text-gray-900">Assign Order Pickup</h3>
              </div>
              <button onClick={() => setAssignModal(null)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl mb-4">
              <img src={assignModal.avatar} alt={assignModal.name} className="w-11 h-11 rounded-2xl object-cover border border-blue-200" />
              <div>
                <p className="font-bold text-gray-900 text-sm">{assignModal.name}</p>
                <p className="text-xs text-gray-600">{assignModal.city} · {assignModal.vehicle} ({assignModal.vehicleNumber}) · 📞 {assignModal.phone}</p>
              </div>
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[assignModal.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>{assignModal.status.replace('_', ' ')}</span>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Select Live Order to Assign:</label>
                <select
                  value={selectedOrderId}
                  onChange={e => setSelectedOrderId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  <option value="">-- Choose an order from store ({ordersList.length} total) --</option>
                  {ordersList.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} — {o.deviceName} ({o.customerName}, {o.city} · ₹{o.quotedPrice.toLocaleString('en-IN')}) [{o.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Scheduled Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Pickup Window</label>
                  <select
                    value={scheduledSlot}
                    onChange={e => setScheduledSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    <option value="10:00 AM - 1:00 PM">10:00 AM - 1:00 PM</option>
                    <option value="1:00 PM - 4:00 PM">1:00 PM - 4:00 PM</option>
                    <option value="4:00 PM - 7:00 PM">4:00 PM - 7:00 PM</option>
                    <option value="7:00 PM - 9:00 PM">7:00 PM - 9:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setAssignModal(null)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!selectedOrderId || !assignModal) return;
                  if (!(assignModal.createdBy === 'admin' || assignModal.partnerId === 'admin' || !assignModal.partnerId)) {
                    alert('Admin can only assign riders created by Admin.');
                    return;
                  }
                  const targetOrder = ordersList.find(o => o.id === selectedOrderId || o.orderNumber === selectedOrderId);
                  if (!targetOrder) return;

                  const updatedOrder: Order = {
                    ...targetOrder,
                    deliveryAgentId: assignModal.id,
                    deliveryAgentName: assignModal.name,
                    deliveryAgentPhone: assignModal.phone,
                    status: 'pickup_scheduled',
                    pickupDate: scheduledDate || targetOrder.pickupDate || 'Today',
                    pickupSlot: scheduledSlot || targetOrder.pickupSlot || '10:00 AM - 1:00 PM',
                    updatedAt: new Date().toISOString(),
                  };

                  const updated = ordersList.map(o => o.id === targetOrder.id ? updatedOrder : o);
                  setOrdersList(updated);

                  if (typeof window !== 'undefined') {
                    localStorage.setItem('casmik_orders_v1', JSON.stringify(updated));
                    try {
                      const pOrders = localStorage.getItem('casmik_partner_orders_v1');
                      if (pOrders) {
                        const list = JSON.parse(pOrders);
                        if (Array.isArray(list)) {
                          const upP = list.map((o: Order) => o.id === targetOrder.id ? updatedOrder : o);
                          localStorage.setItem('casmik_partner_orders_v1', JSON.stringify(upP));
                        }
                      }
                    } catch {}
                    window.dispatchEvent(new Event('casmik_orders_updated'));
                    window.dispatchEvent(new Event('casmik_partner_orders_updated'));
                  }

                  try {
                    await fetch('/api/orders', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        orderId: targetOrder.id,
                        deliveryAgentId: assignModal.id,
                        deliveryAgentName: assignModal.name,
                        deliveryAgentPhone: assignModal.phone,
                        status: 'pickup_scheduled',
                        pickupDate: updatedOrder.pickupDate,
                        pickupSlot: updatedOrder.pickupSlot,
                      }),
                    });
                  } catch {}

                  triggerNotification({
                    type: 'status_update',
                    targetRole: 'all',
                    title: `Order #${targetOrder.orderNumber} Assigned to ${assignModal.name}`,
                    shortDetails: `Admin assigned Order #${targetOrder.orderNumber} (${targetOrder.deviceName}) to rider ${assignModal.name} (${assignModal.phone}). Payout: ₹${assignModal.commission || 150}.`,
                    orderNumber: targetOrder.orderNumber,
                    deviceName: targetOrder.deviceName,
                    customerName: targetOrder.customerName,
                    price: targetOrder.quotedPrice,
                    status: 'pickup_scheduled',
                  });

                  setAssignSuccess(`Order #${targetOrder.orderNumber} assigned to ${assignModal.name}!`);
                  setTimeout(() => setAssignSuccess(null), 4000);
                  setAssignModal(null);
                  setSelectedOrderId('');
                }}
                disabled={!selectedOrderId}
                className="flex-1 py-3 rounded-2xl bg-primary text-white text-xs font-black hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
              >
                <Truck size={14} /> Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Verification Modal */}
      {docModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDocModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900">Rider Document Verification</h3>
                <p className="text-sm text-gray-500">{docModal.name} · {docModal.city} ({docModal.vehicle})</p>
              </div>
              <button onClick={() => setDocModal(null)} className="p-2 rounded-xl hover:bg-gray-100"><X size={18} /></button>
            </div>

            <div className="space-y-3 mb-5">
              {docLabels.map(doc => {
                const docs = docModal.documents || { aadhar: true, pan: true, drivingLicense: true, vehicleRC: true, insurance: true };
                const submitted = docs[doc.key as keyof typeof docs];
                return (
                  <div key={doc.key} className={`flex items-center justify-between p-3 rounded-xl border ${submitted ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{doc.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{doc.label}</p>
                        <p className="text-xs text-gray-500">{submitted ? 'Document verified and on file' : 'Not submitted yet'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {submitted ? (
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg flex items-center gap-1"><CheckCircle size={11} /> Verified</span>
                      ) : (
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-lg flex items-center gap-1"><Clock size={11} /> Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 rounded-xl p-3 mb-5 border border-blue-100">
              <p className="text-xs font-bold text-blue-800 mb-1">ℹ️ Rider Commission & Fleet Info</p>
              <p className="text-xs text-blue-700">
                Commission payout: <span className="font-bold text-gray-900">{docModal.commissionType === 'percentage' ? `${docModal.commission}%` : `₹${docModal.commission || 150}`}</span> per task. Fleet affiliation: <span className="font-bold text-gray-900">{docModal.partnerName || 'Admin Central Fleet'}</span>.
              </p>
            </div>

            <div className="flex gap-3">
              {docModal.approvalStatus === 'pending' && (
                <>
                  <button onClick={() => { handleReject(docModal.id); setDocModal(null); }}
                    className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 flex items-center justify-center gap-2">
                    <XCircle size={14} /> Reject
                  </button>
                  <button onClick={() => { handleApprove(docModal.id); setDocModal(null); }}
                    className="flex-1 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 flex items-center justify-center gap-2">
                    <Shield size={14} /> Verify & Approve
                  </button>
                </>
              )}
              {docModal.approvalStatus !== 'pending' && (
                <button onClick={() => setDocModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
