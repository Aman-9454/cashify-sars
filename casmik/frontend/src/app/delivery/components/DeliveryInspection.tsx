'use client';
import React, { useState, useEffect, useRef } from 'react';
import { orders as defaultOrders, getOrderStatusColor } from '@/lib/casmikData';
import type { Order, DeliveryAgent } from '@/lib/casmikData';
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  Upload, 
  ClipboardCheck, 
  ArrowLeft, 
  SlidersHorizontal,
  Eye, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  X, 
  Package, 
  Lock, 
  KeyRound,
  Truck,
  Phone,
  MapPin,
  Calendar,
  Clock
} from 'lucide-react';
import { triggerNotification } from '@/lib/notifications';

interface InspectionCheckItem {
  id: string;
  label: string;
  subtext: string;
  deductionPct: number;
}

const inspectionItems: InspectionCheckItem[] = [
  { id: 'display', label: 'Display & Touchscreen', subtext: 'Cracks, dead pixels, lines, touch responsiveness', deductionPct: 25 },
  { id: 'body', label: 'Body & Frame Condition', subtext: 'Dents, heavy scratches, bent frame, discoloration', deductionPct: 12 },
  { id: 'camera', label: 'Camera & Optics', subtext: 'Front & rear camera focus, lens glass, sensor dust', deductionPct: 15 },
  { id: 'battery', label: 'Battery Health & Endurance', subtext: 'Battery health degradation, rapid discharge, swelling', deductionPct: 10 },
  { id: 'faceid', label: 'Biometrics (Face ID / Fingerprint)', subtext: 'Face ID, Touch ID, or fingerprint sensor failure', deductionPct: 12 },
  { id: 'charging', label: 'Charging & USB Port', subtext: 'Loose port, slow charging, or no PC data sync', deductionPct: 8 },
  { id: 'speaker', label: 'Speakers & Microphones', subtext: 'Cracking sound, low earpiece volume, mic distortion', deductionPct: 6 },
  { id: 'wifi', label: 'Wireless (Wi-Fi, Bluetooth, NFC)', subtext: 'Wi-Fi drop, Bluetooth pairing failure, GPS glitch', deductionPct: 6 },
  { id: 'network', label: 'Cellular SIM & Antennas', subtext: 'No service, baseband issue, damaged SIM slot', deductionPct: 10 },
  { id: 'buttons', label: 'Physical Buttons & Haptics', subtext: 'Stuck volume rocker, power key, faulty vibration', deductionPct: 5 },
  { id: 'water', label: 'Liquid Damage Check (LDI)', subtext: 'Internal moisture indicator triggered or corrosion', deductionPct: 20 },
  { id: 'accessories', label: 'Original Box & Accessories', subtext: 'Missing original box, authentic cable, or adapter', deductionPct: 5 },
];

const photoAngles = [
  { id: 'front', label: 'Front Display (Screen On)', desc: 'Display with white background' },
  { id: 'back', label: 'Back Panel & Housing', desc: 'Back glass or aluminum body' },
  { id: 'left', label: 'Left Side & Frame', desc: 'Left edge & volume buttons' },
  { id: 'right', label: 'Right Side & Frame', desc: 'Right edge & power button' },
  { id: 'ports', label: 'Top / Bottom Ports', desc: 'Charging port & speaker grilles' },
  { id: 'camera_lens', label: 'Camera Lens & Optics', desc: 'Close-up of camera cluster' },
  { id: 'imei_label', label: 'IMEI / Serial Screen', desc: 'Settings > About screen' },
  { id: 'defect', label: 'Scratch / Defect Close-up', desc: 'Any cosmetic blemish' },
];
const DELIVERY_AGENT_ID = 'delivery-001';

const getStoredOrders = (): Order[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_orders_v1') || localStorage.getItem('casmik_partner_orders_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((o: Order) => Boolean(o.deliveryAgentId) && (o.deliveryAgentId === 'agent-101' || o.deliveryAgentId === DELIVERY_AGENT_ID));
        }
      }
    } catch {}
  }
  return defaultOrders.filter((o: Order) => Boolean(o.deliveryAgentId) && (o.deliveryAgentId === 'agent-101' || o.deliveryAgentId === DELIVERY_AGENT_ID));
};

interface DeliveryInspectionProps {
  initialOrderId?: string | null;
  onBackToTasks?: () => void;
}

export default function DeliveryInspection({ initialOrderId, onBackToTasks }: DeliveryInspectionProps) {
  const [ordersList, setOrdersList] = useState<Order[]>(getStoredOrders);
  const [currentAgent, setCurrentAgent] = useState<DeliveryAgent | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('casmik_delivery_session');
        if (raw) setCurrentAgent(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(() => {
    const list = getStoredOrders();
    const targetId = initialOrderId || (typeof window !== 'undefined' ? localStorage.getItem('casmik_delivery_active_inspection_id') : null);
    if (targetId) {
      const match = list.find(o => (o.id === targetId || o.orderNumber === targetId) && o.status !== 'completed' && !o.deviceCollected);
      if (match) return match;
    }
    const readyOrder = list.find(o => ['pickup_scheduled', 'assigned', 'accepted', 'in_transit', 'inspection'].includes(o.status) && o.status !== 'completed' && !o.deviceCollected);
    return readyOrder || null;
  });

  const [inspectionResults, setInspectionResults] = useState<Record<string, 'pass' | 'fail' | 'na'>>({});
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [activePhotoModal, setActivePhotoModal] = useState<{ label: string; url: string } | null>(null);
  const [customPriceOverride, setCustomPriceOverride] = useState<string>('');
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [imei, setImei] = useState('');
  const [notes, setNotes] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [finalCollectedOrder, setFinalCollectedOrder] = useState<Order | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const multiFileInputRef = useRef<HTMLInputElement | null>(null);

  const reloadOrders = () => {
    const list = getStoredOrders();
    setOrdersList(list);
    const activeOrders = list.filter(o => o.status !== 'completed' && o.status !== 'cancelled' && !o.deviceCollected && ['pickup_scheduled', 'assigned', 'accepted', 'in_transit', 'inspection'].includes(o.status));
    const targetId = initialOrderId || (typeof window !== 'undefined' ? localStorage.getItem('casmik_delivery_active_inspection_id') : null);
    
    setSelectedOrder(prev => {
      if (prev) {
        const fresh = list.find(o => o.id === prev.id);
        if (fresh && fresh.status !== 'completed' && !fresh.deviceCollected && fresh.status !== 'cancelled') {
          if (fresh.deviceImei) setImei(fresh.deviceImei);
          return fresh;
        }
      }
      if (targetId) {
        const match = activeOrders.find(o => o.id === targetId || o.orderNumber === targetId);
        if (match) {
          if (match.deviceImei) setImei(match.deviceImei);
          return match;
        }
      }
      return activeOrders[0] || null;
    });
  };

  useEffect(() => {
    reloadOrders();
    const handleSync = () => reloadOrders();
    window.addEventListener('casmik_orders_updated', handleSync);
    window.addEventListener('casmik_partner_orders_updated', handleSync);
    return () => {
      window.removeEventListener('casmik_orders_updated', handleSync);
      window.removeEventListener('casmik_partner_orders_updated', handleSync);
    };
  }, [initialOrderId]);

  // Handle single photo capture
  const handlePhotoCapture = (angleId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotos(prev => ({
          ...prev,
          [angleId]: event.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle multi photo upload
  const handleMultiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, idx) => {
      const unassignedAngle = photoAngles.find(a => !photos[a.id]) || photoAngles[idx % photoAngles.length];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(prev => ({
            ...prev,
            [unassignedAngle.id]: event.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (angleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos(prev => {
      const copy = { ...prev };
      delete copy[angleId];
      return copy;
    });
  };

  const handleResult = (itemId: string, result: 'pass' | 'fail' | 'na') => {
    setInspectionResults(prev => ({ ...prev, [itemId]: result }));
  };

  // Scoring and dynamic price calculations
  const total = inspectionItems.length;
  const passedCount = Object.values(inspectionResults).filter(v => v === 'pass').length;
  const failedCount = Object.values(inspectionResults).filter(v => v === 'fail').length;
  const scorePercent = total > 0 ? Math.round((passedCount / total) * 100) : 100;

  const quotedPrice = selectedOrder?.quotedPrice || 0;

  // Calculate deductions based on failed checklist items
  const failedItems = inspectionItems.filter(item => inspectionResults[item.id] === 'fail');
  const totalDeductionPct = Math.min(
    failedItems.reduce((acc, item) => acc + item.deductionPct, 0),
    75 // Cap max deduction at 75% so scrap floor is 25%
  );

  const totalDeductionAmount = Math.round(quotedPrice * (totalDeductionPct / 100));
  const calculatedExactPayout = Math.max(
    Math.round(quotedPrice - totalDeductionAmount),
    Math.round(quotedPrice * 0.25)
  );

  const finalPayoutToUser = isCustomPrice && customPriceOverride
    ? parseInt(customPriceOverride, 10) || calculatedExactPayout
    : calculatedExactPayout;

  // Filter orders assigned to rider or available for doorstep pickup that still require inspection
  const eligibleOrders = ordersList.filter(o => 
    o.status !== 'completed' && 
    o.status !== 'cancelled' &&
    !o.deviceCollected &&
    ['pickup_scheduled', 'assigned', 'accepted', 'in_transit', 'inspection'].includes(o.status)
  );

  const handleVerifyOtpAndCollect = async () => {
    if (!selectedOrder) return;
    if (otpInput !== '1234' && otpInput.length < 4) {
      alert('Please enter a valid 4-digit customer pickup OTP (or demo 1234)');
      return;
    }

    setIsSubmitting(true);
    setOtpVerified(true);

    const handoverTime = new Date().toISOString();
    const updatedOrder: Order = {
      ...selectedOrder,
      status: 'picked_up',
      deviceCollected: true,
      collectedAt: handoverTime,
      finalPrice: finalPayoutToUser,
      inspectionScore: scorePercent,
      deviceImei: imei.trim() || selectedOrder.deviceImei || null,
      notes: `${notes ? notes + ' | ' : ''}Doorstep Inspected & Collected by ${currentAgent?.name || selectedOrder.deliveryAgentName || 'Delivery Rider'} [Handover Score: ${scorePercent}%, Final Price: ₹${finalPayoutToUser.toLocaleString('en-IN')}]`,
      updatedAt: handoverTime,
      deliveryAgentId: selectedOrder.deliveryAgentId || currentAgent?.id || 'agent-101',
      deliveryAgentName: selectedOrder.deliveryAgentName || currentAgent?.name || 'Raghu Sharma',
      deliveryAgentPhone: selectedOrder.deliveryAgentPhone || currentAgent?.phone || '+91 98112 34567',
    };

    // 1. Dual-key LocalStorage Sync
    if (typeof window !== 'undefined') {
      try {
        const updateStorageList = (key: string) => {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list: Order[] = JSON.parse(raw);
            const next = list.map(o => o.id === selectedOrder.id ? updatedOrder : o);
            localStorage.setItem(key, JSON.stringify(next));
          } else {
            localStorage.setItem(key, JSON.stringify([updatedOrder]));
          }
        };
        updateStorageList('casmik_orders_v1');
        updateStorageList('casmik_partner_orders_v1');
      } catch (err) {
        console.error('Storage sync error:', err);
      }
    }

    // 2. Sync to Backend API
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOrder.id,
          orderNumber: selectedOrder.orderNumber,
          status: 'picked_up',
          deviceCollected: true,
          collectedAt: handoverTime,
          finalPrice: finalPayoutToUser,
          inspectionScore: scorePercent,
          deviceImei: imei.trim() || null,
          deliveryAgentId: updatedOrder.deliveryAgentId,
          deliveryAgentName: updatedOrder.deliveryAgentName,
          deliveryAgentPhone: updatedOrder.deliveryAgentPhone,
          notes: updatedOrder.notes
        })
      });
    } catch (err) {
      console.warn('API PATCH failed, local state preserved:', err);
    }

    // 3. Dispatch Cross-Portal Events for Admin and Partner real-time sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('casmik_orders_updated'));
      window.dispatchEvent(new Event('casmik_partner_orders_updated'));
    }

    // 4. Trigger Cross-Role Notification
    triggerNotification({
      type: 'status_update',
      targetRole: 'all',
      title: '📦 Device Inspected & Collected at Doorstep',
      shortDetails: `${selectedOrder.deviceName} (${selectedOrder.orderNumber}) inspected (Score: ${scorePercent}%) and collected by ${updatedOrder.deliveryAgentName}. Payout locked at ₹${finalPayoutToUser.toLocaleString('en-IN')}.`,
      orderId: selectedOrder.id,
      orderNumber: selectedOrder.orderNumber,
      deviceName: selectedOrder.deviceName,
      customerName: selectedOrder.customerName,
      status: 'picked_up'
    });

    if (typeof window !== 'undefined') {
      localStorage.removeItem('casmik_delivery_active_inspection_id');
    }

    setFinalCollectedOrder(updatedOrder);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (submitted && finalCollectedOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl font-sans animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-inner">
          <CheckCircle size={44} />
        </div>
        <span className="text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 bg-emerald-100 text-emerald-800 border border-emerald-300">
          ✓ Doorstep Inspection & Handover Complete
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
          Device Successfully Collected!
        </h2>
        <p className="text-slate-600 text-sm mb-6 max-w-md">
          <strong>{finalCollectedOrder.deviceName}</strong> ({finalCollectedOrder.orderNumber}) is now secured in your transit bag and updated in Admin & Partner consoles.
        </p>

        {/* Payout & Handover Card */}
        <div className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 mb-6 text-left shadow-lg">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-emerald-200 uppercase font-black tracking-wider">
              Doorstep Locked Payout
            </span>
            <span className="text-xs font-bold bg-white/20 px-3 py-0.5 rounded-full">
              Inspection Score: {scorePercent}%
            </span>
          </div>
          <p className="text-3xl sm:text-4xl font-black">₹{finalPayoutToUser.toLocaleString('en-IN')}</p>
          <div className="mt-4 pt-3 border-t border-white/20 text-xs flex justify-between text-emerald-100 font-medium">
            <span>Quoted: ₹{quotedPrice.toLocaleString('en-IN')}</span>
            <span>Deductions: -₹{totalDeductionAmount.toLocaleString('en-IN')} ({totalDeductionPct}%)</span>
          </div>
        </div>

        {/* Handover Specifications */}
        <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2.5 text-xs text-slate-600 mb-6">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-400 font-semibold">Customer:</span>
            <span className="font-bold text-slate-900">{finalCollectedOrder.customerName} ({finalCollectedOrder.customerPhone})</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-400 font-semibold">Handover Timestamp:</span>
            <span className="font-bold text-slate-900">{new Date(finalCollectedOrder.collectedAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          {imei && (
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-semibold">Recorded IMEI:</span>
              <span className="font-mono font-bold text-primary">{imei}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold">Status Across System:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Picked Up & In Transit (Live Synced to Admin & Partner)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full">
          {onBackToTasks && (
            <button
              onClick={onBackToTasks}
              className="flex-1 py-3.5 bg-primary text-white rounded-2xl font-black text-sm hover:opacity-95 shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Package size={16} /> Return to Task Queue
            </button>
          )}
          <button
            onClick={() => {
              setSubmitted(false);
              setOtpVerified(false);
              setOtpInput('');
              setInspectionResults({});
              setPhotos({});
              setIsCustomPrice(false);
              setCustomPriceOverride('');
              setImei('');
              setNotes('');
              reloadOrders();
            }}
            className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Inspect Another Device
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto font-sans">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Doorstep 12-Point Inspection Studio
            </h1>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Truck size={12} /> Doorstep Handover
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Perform diagnostics at customer doorstep, capture photos, record IMEI, verify OTP, and collect device.
          </p>
        </div>

        {onBackToTasks && (
          <button
            onClick={onBackToTasks}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Tasks
          </button>
        )}
      </div>

      {/* Device Picker Carousel */}
      {eligibleOrders.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Select Assigned Pickup to Inspect ({eligibleOrders.length} Available):
          </label>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {eligibleOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <button
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setInspectionResults({});
                    setPhotos({});
                    setIsCustomPrice(false);
                    setCustomPriceOverride('');
                    setImei(order.deviceImei || '');
                  }}
                  className={`p-3.5 rounded-2xl text-left border flex-shrink-0 transition-all min-w-[240px] cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono font-bold text-slate-500">{order.orderNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${getOrderStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 truncate">{order.deviceName}</p>
                  <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                    <span>{order.customerName}</span>
                    <span className="font-bold text-emerald-700">₹{order.quotedPrice?.toLocaleString('en-IN')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (Diagnostics Checklist & Customer Info) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Device Info & Doorstep Condition Score Bar */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{selectedOrder.orderNumber}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {selectedOrder.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedOrder.deviceName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span>Customer: <strong>{selectedOrder.customerName}</strong></span>
                    <span>&bull;</span>
                    <a href={`tel:${selectedOrder.customerPhone}`} className="text-primary hover:underline flex items-center gap-0.5">
                      <Phone size={11} /> {selectedOrder.customerPhone}
                    </a>
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Doorstep Condition Score</p>
                  <p className={`text-3xl font-black ${
                    scorePercent >= 80 ? 'text-emerald-600' : scorePercent >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {scorePercent}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    scorePercent >= 80 ? 'bg-emerald-500' : scorePercent >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>

              {/* Address Reminder */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-start gap-2 text-xs text-slate-600">
                <MapPin size={14} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {selectedOrder.customerAddress ? `${selectedOrder.customerAddress}, ${selectedOrder.city} - ${selectedOrder.pinCode}` : 'Customer residential address'}
                </p>
              </div>
            </div>

            {/* IMEI Verification Input */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Physical IMEI / Device Serial Number *
                </label>
                <span className="text-[11px] font-bold text-slate-400">Dial *#06# on customer phone</span>
              </div>
              <input
                value={imei}
                onChange={e => setImei(e.target.value)}
                placeholder="e.g. 352948102938472 (check Settings > About or dial *#06#)"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-slate-900 bg-slate-50/50"
              />
            </div>

            {/* Diagnostic 12-Point Checklist Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">12-Point Hardware Diagnostics</h3>
                  <p className="text-[11px] text-slate-500">Tap Pass, Fail, or N/A. Failed checks apply standardized valuation deductions.</p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                  {passedCount} Passed &bull; {failedCount} Failed
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {inspectionItems.map((item) => {
                  const result = inspectionResults[item.id];
                  const isFailed = result === 'fail';
                  const deductionAmt = Math.round(quotedPrice * (item.deductionPct / 100));

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 sm:p-5 transition-colors ${
                        isFailed ? 'bg-red-50/50' : result === 'pass' ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <div className="pr-3 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-900">{item.label}</p>
                          {isFailed && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              -{item.deductionPct}% (-₹{deductionAmt.toLocaleString('en-IN')})
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtext}</p>
                      </div>

                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleResult(item.id, 'pass')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            result === 'pass'
                              ? 'bg-emerald-600 text-white shadow-sm scale-105'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'
                          }`}
                        >
                          <CheckCircle size={13} /> Pass
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResult(item.id, 'fail')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            result === 'fail'
                              ? 'bg-red-600 text-white shadow-sm scale-105'
                              : 'bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700'
                          }`}
                        >
                          <XCircle size={13} /> Fail
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResult(item.id, 'na')}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            result === 'na'
                              ? 'bg-slate-700 text-white'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Doorstep Inspection Notes */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                Doorstep Executive Notes
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Mention screen scratches, battery health %, or customer conversation details..."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-primary resize-none bg-slate-50/50"
              />
            </div>
          </div>

          {/* Right Column (Dynamic Payout, Photos, Customer OTP & Handover) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* EXACT LIVE PAYOUT CARD */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-[#0a101f] text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> Doorstep Handover Valuation
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold">
                  {failedCount === 0 ? 'Pristine 100%' : `${failedCount} Deductions`}
                </span>
              </div>

              {/* Exact Handover Amount */}
              <div className="my-4 relative z-10">
                <p className="text-xs text-slate-400 font-semibold">Exact Payout to Customer:</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl sm:text-4xl font-black text-white">
                    ₹{finalPayoutToUser.toLocaleString('en-IN')}
                  </p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Calculated
                  </span>
                </div>
              </div>

              {/* Deduction Breakdown */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs relative z-10">
                <div className="flex justify-between text-slate-300">
                  <span>Initial Estimated Quote:</span>
                  <span className="font-bold text-white">₹{quotedPrice.toLocaleString('en-IN')}</span>
                </div>

                {failedItems.length > 0 ? (
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <p className="text-[11px] font-bold text-red-400 uppercase">Condition Deductions ({totalDeductionPct}%):</p>
                    {failedItems.map(item => (
                      <div key={item.id} className="flex justify-between text-[11px] text-slate-400">
                        <span>&bull; {item.label}:</span>
                        <span className="text-red-400 font-bold">
                          -₹{Math.round(quotedPrice * (item.deductionPct / 100)).toLocaleString('en-IN')} ({item.deductionPct}%)
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-bold text-red-300 pt-1 border-t border-white/10">
                      <span>Total Deduction Amount:</span>
                      <span>-₹{totalDeductionAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-400 font-bold pt-1">
                    ✓ All tests passed! Customer receives full 100% quoted payout.
                  </p>
                )}
              </div>

              {/* Custom Override Option */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs relative z-10">
                <button
                  type="button"
                  onClick={() => setIsCustomPrice(!isCustomPrice)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mb-2 cursor-pointer"
                >
                  <SlidersHorizontal size={12} />
                  {isCustomPrice ? 'Use Algorithm Calculated Price' : 'Override with Customer Agreed Payout'}
                </button>

                {isCustomPrice && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-slate-400">₹</span>
                    <input
                      type="number"
                      value={customPriceOverride}
                      onChange={(e) => setCustomPriceOverride(e.target.value)}
                      placeholder={calculatedExactPayout.toString()}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Mandatory Doorstep Photo Angles */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Doorstep Device Photos</h3>
                  <p className="text-[11px] text-slate-500">Tap to capture live camera shot or upload image</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {Object.keys(photos).length} / {photoAngles.length} Photos
                </span>
              </div>

              {/* Hidden file input for multi-upload */}
              <input
                type="file"
                ref={multiFileInputRef}
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleMultiUpload}
              />

              {/* Photos Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {photoAngles.map((angle) => {
                  const hasPhoto = !!photos[angle.id];

                  return (
                    <div
                      key={angle.id}
                      onClick={() => {
                        if (!hasPhoto) {
                          fileInputRefs.current[angle.id]?.click();
                        } else {
                          setActivePhotoModal({ label: angle.label, url: photos[angle.id] });
                        }
                      }}
                      className={`relative aspect-square rounded-2xl border-2 transition-all cursor-pointer overflow-hidden group flex flex-col items-center justify-center p-2 text-center ${
                        hasPhoto
                          ? 'border-emerald-500 bg-black/5 shadow-sm'
                          : 'border-dashed border-slate-200 hover:border-primary hover:bg-primary/5'
                      }`}
                      title={hasPhoto ? 'Click to inspect photo' : `Click to take or upload ${angle.label}`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        ref={el => { fileInputRefs.current[angle.id] = el; }}
                        onChange={(e) => handlePhotoCapture(angle.id, e)}
                      />

                      {hasPhoto ? (
                        <>
                          <img
                            src={photos[angle.id]}
                            alt={angle.label}
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePhotoModal({ label: angle.label, url: photos[angle.id] });
                              }}
                              className="w-8 h-8 rounded-lg bg-white/90 text-slate-900 flex items-center justify-center hover:scale-110 shadow-sm transition-transform"
                              title="Zoom Preview"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRefs.current[angle.id]?.click();
                              }}
                              className="w-8 h-8 rounded-lg bg-white/90 text-primary flex items-center justify-center hover:scale-110 shadow-sm transition-transform"
                              title="Retake Photo"
                            >
                              <RefreshCw size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleRemovePhoto(angle.id, e)}
                              className="w-8 h-8 rounded-lg bg-white/90 text-red-600 flex items-center justify-center hover:scale-110 shadow-sm transition-transform"
                              title="Remove Photo"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <span className="absolute top-2 right-2 text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow">
                            <CheckCircle2 size={10} /> Captured
                          </span>
                          <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded truncate">
                            {angle.label}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary text-slate-400 flex items-center justify-center transition-colors mb-1">
                            <Camera size={20} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-primary transition-colors leading-tight">
                            {angle.label}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5">Tap to Capture</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Multi-Photo Upload Button */}
              <button
                type="button"
                onClick={() => multiFileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shadow-sm cursor-pointer"
              >
                <Upload size={14} /> Upload Multiple Photos at Once
              </button>
            </div>

            {/* Customer Handover OTP & Collection Authorization */}
            <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/60 rounded-3xl border border-blue-200/80 p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-primary" />
                <h3 className="font-black text-slate-900 text-sm">Customer Pickup OTP Verification</h3>
              </div>
              <p className="text-xs text-slate-600">
                Ask <strong>{selectedOrder.customerName}</strong> for the 4-digit pickup code received via SMS/WhatsApp.
              </p>

              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-full py-3 px-4 text-center font-mono text-2xl font-black tracking-[0.8em] bg-white border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-primary text-slate-900 shadow-inner"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5">
                  <span>Demo OTP: <strong className="text-primary font-mono">1234</strong></span>
                  <span>Physical device handover</span>
                </div>
              </div>

              <div className="bg-white/80 rounded-2xl p-3 border border-blue-100 space-y-1 text-xs text-blue-900">
                <p className="font-bold flex items-center gap-1 text-blue-800">
                  <ShieldCheck size={14} className="text-emerald-600" /> Doorstep Collection Checklist:
                </p>
                <p className="text-slate-600">✓ Customer cloud accounts (iCloud / Google) logged out</p>
                <p className="text-slate-600">✓ Device placed in Camsik anti-static tamper-proof bag</p>
                <p className="text-slate-600">✓ Real-time status syncs to Partner and Admin dashboards</p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleVerifyOtpAndCollect}
                disabled={isSubmitting || otpInput.length < 4}
                className="w-full py-4 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-2xl font-black text-sm hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Synchronizing Handover...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Collect Device &amp; Finalize Pickup (₹{finalPayoutToUser.toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-lg font-black text-slate-900">All Assigned Pickups Inspected!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            There are no pending doorstep inspections in your queue. All assigned devices have been evaluated and collected.
          </p>
          {onBackToTasks && (
            <button
              onClick={onBackToTasks}
              className="px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black hover:opacity-95 shadow-md shadow-primary/20 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Package size={15} /> Return to Task Queue
            </button>
          )}
        </div>
      )}

      {/* Lightbox Photo Preview */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col border border-slate-100">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="font-bold text-sm text-slate-900">{activePhotoModal.label}</h4>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={activePhotoModal.url}
                alt={activePhotoModal.label}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>
            <div className="p-4 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActivePhotoModal(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black"
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
