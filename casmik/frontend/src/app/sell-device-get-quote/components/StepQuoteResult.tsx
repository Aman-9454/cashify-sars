'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, Shield, Truck, Zap, Ban, TrendingUp, Clock, MapPin, Calendar, User, Phone, ArrowRight, BellRing, ShieldCheck, ExternalLink } from 'lucide-react';
import type { SellState } from './SellDeviceWorkflow';
import { triggerNotification } from '@/lib/notifications';
import { createClient } from '@/lib/supabase/client';
import FullVerificationReportModal from './FullVerificationReportModal';
import DeviceVerificationModal from './DeviceVerificationModal';
import { getCurrentUser } from '@/lib/auth';
import CustomerAuthModal from '@/components/CustomerAuthModal';
import UnserviceableAreaModal from '@/components/UnserviceableAreaModal';

interface Props {
  sellState: SellState;
  onSchedulePickup: () => void;
  onBack: () => void;
  onUpdateState?: (updates: Partial<SellState>) => void;
}

const sellBenefits = [
  { id: 'benefit-price', icon: TrendingUp, title: 'Highest Prices', desc: 'Get up to 20% more than others', color: 'bg-primary/10 text-primary' },
  { id: 'benefit-payment', icon: Zap, title: 'Instant Payment', desc: 'Receive payment within 30 minutes', color: 'bg-warning/10 text-warning' },
  { id: 'benefit-pickup', icon: Truck, title: 'Free Pickup', desc: 'We pickup your device from your location', color: 'bg-info/10 text-info' },
  { id: 'benefit-secure', icon: Shield, title: '100% Safe & Secure', desc: 'Your data is secure with us', color: 'bg-purple-100 text-purple-600' },
  { id: 'benefit-hidden', icon: Ban, title: 'No Hidden Deductions', desc: 'Transparent pricing you can trust', color: 'bg-danger/10 text-danger' },
];

const timeSlots = ['9:00 AM - 11:00 AM', '11:00 AM - 1:00 PM', '1:00 PM - 3:00 PM', '3:00 PM - 5:00 PM', '5:00 PM - 7:00 PM'];

type QuoteView = 'quote' | 'schedule' | 'confirmed';

export default function StepQuoteResult({ sellState, onSchedulePickup, onBack, onUpdateState }: Props) {
  const [view, setView] = useState<QuoteView>('quote');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showImeiModal, setShowImeiModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUnserviceableModal, setShowUnserviceableModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [bookedOrderNumber, setBookedOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
    }
  }, []);

  const price = sellState.currentPrice;

  const isPhone = (sellState.category || '').toLowerCase().includes('phone') ||
                  (sellState.categoryName || '').toLowerCase().includes('phone') ||
                  (sellState.category || '').toLowerCase().includes('mobile') ||
                  (sellState.categoryName || '').toLowerCase().includes('mobile') ||
                  (sellState.modelName || '').toLowerCase().includes('iphone') ||
                  (sellState.modelName || '').toLowerCase().includes('galaxy') ||
                  (sellState.modelName || '').toLowerCase().includes('pixel');

  const handleProceedToSchedule = () => {
    const user = getCurrentUser();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (isPhone && !sellState.deviceVerification) {
      setShowImeiModal(true);
      return;
    }
    setView('schedule');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmBooking = async () => {
    const user = getCurrentUser();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!name || !phone || !address || !pinCode || !selectedDate || !selectedSlot || isSubmitting) return;
    setIsSubmitting(true);

    const generatedNumber = `CSM-2024-${Math.floor(120 + Math.random() * 870)}`;
    const newOrderId = `ord-${Date.now()}`;
    const deviceFullName = `${sellState.brandName} ${sellState.modelName}`;

    const newOrder = {
      id: newOrderId,
      orderNumber: generatedNumber,
      type: 'sell',
      status: 'assigned',
      customerId: `cust-${Date.now()}`,
      customerName: name,
      customerPhone: phone,
      customerEmail: '',
      customerAddress: address,
      pinCode: pinCode,
      city: 'Delhi NCR',
      deviceName: deviceFullName,
      deviceBrand: sellState.brandName,
      deviceModel: sellState.modelName,
      deviceStorage: sellState.storage || '128GB',
      deviceColor: 'Standard',
      quotedPrice: price,
      finalPrice: price,
      partnerId: null,
      partnerName: null,
      deliveryAgentId: null,
      deliveryAgentName: null,
      pickupDate: selectedDate,
      pickupSlot: selectedSlot,
      paymentStatus: 'pending',
      inspectionScore: null,
      deviceImei: sellState.deviceVerification?.identifiers.imei1 || null,
      deviceVerificationId: sellState.deviceVerification?.verificationId || null,
      deviceVerificationStatus: sellState.deviceVerification?.status || 'verified',
      imeiMasked: sellState.deviceVerification?.identifiers.maskedImei || null,
      brandVerified: sellState.deviceVerification?.matching.brandMatched ?? true,
      modelVerified: sellState.deviceVerification?.matching.modelMatched ?? true,
      variantVerified: sellState.deviceVerification?.matching.variantMatched ?? true,
      blacklistStatus: sellState.deviceVerification?.security.blacklistStatus || 'clean',
      verificationProvider: sellState.deviceVerification?.providerName || 'Camsik Local Engine',
      verificationTimestamp: sellState.deviceVerification?.timestamp || new Date().toISOString(),
      notes: `Customer booking placed. Preferred payout via ${paymentMethod}. Slot: ${selectedDate} (${selectedSlot})`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Check pincode serviceability against Admin serviceable list
    try {
      const pinCheckRes = await fetch(`/api/pincodes?pincode=${encodeURIComponent(pinCode.trim())}`);
      const pinData = await pinCheckRes.json();
      if (pinData.success && pinData.serviceable === false) {
        const unserviceableOrder = {
          ...newOrder,
          status: 'unserviceable',
          notes: `Unserviceable Area Booking. PIN: ${pinCode}. Awaiting area service expansion.`,
        };
        if (typeof window !== 'undefined') {
          try {
            const existingGlobal = JSON.parse(localStorage.getItem('casmik_orders_v1') || '[]');
            localStorage.setItem('casmik_orders_v1', JSON.stringify([unserviceableOrder, ...existingGlobal]));
            window.dispatchEvent(new Event('casmik_orders_updated'));
          } catch {}
        }
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(unserviceableOrder),
        }).catch(() => {});

        setIsSubmitting(false);
        setShowUnserviceableModal(true);
        return;
      }
    } catch (e) {
      console.warn('Pincode service check error:', e);
    }

    // 1. Save to local storage for Admin management (not assigned to partner/delivery yet)
    if (typeof window !== 'undefined') {
      try {
        const existingGlobal = JSON.parse(localStorage.getItem('casmik_orders_v1') || '[]');
        localStorage.setItem('casmik_orders_v1', JSON.stringify([newOrder, ...existingGlobal]));
        window.dispatchEvent(new Event('casmik_orders_updated'));
      } catch (err) {
        console.error('Failed storing local order:', err);
      }
    }

    // Also persist to backend API
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch (e) {
      console.warn('Orders API post error:', e);
    }

    // 2. Try remote Supabase insert if available
    try {
      const supabase = createClient();
      await supabase.from('orders').insert({
        id: newOrderId,
        order_number: generatedNumber,
        order_type: 'sell',
        status: 'created',
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        pin_code: pinCode,
        city: 'Delhi NCR',
        device_name: deviceFullName,
        device_brand: sellState.brandName,
        device_model: sellState.modelName,
        quoted_price: price,
        final_price: price,
        partner_id: null,
        partner_name: null,
        pickup_date: selectedDate,
        pickup_slot: selectedSlot,
        payment_status: 'pending',
        notes: newOrder.notes,
      });
    } catch (err) {
      console.log('Remote order sync info:', err);
    }

    // 3. Trigger Real-Time Notification across Admin with Sound Chime
    triggerNotification({
      type: 'new_booking',
      targetRole: 'admin',
      title: `🎉 New Order Received: #${generatedNumber}`,
      shortDetails: `${name} booked pickup for ${deviceFullName} (₹${price.toLocaleString('en-IN')}) · Slot: ${selectedDate} (${selectedSlot})`,
      orderNumber: generatedNumber,
      deviceName: deviceFullName,
      customerName: name,
      price: price,
      status: 'assigned',
    });

    setBookedOrderNumber(generatedNumber);
    setIsSubmitting(false);
    setView('confirmed');
  };

  if (view === 'confirmed') {
    return (
      <div className="space-y-5 fade-in">
        <div className="bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="gradient-green p-8 text-white text-center relative overflow-hidden">
            <div className="text-5xl mb-3 animate-bounce">🎉</div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider mb-2">
              Booking Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mb-1">Free Pickup Scheduled!</h2>
            <p className="text-white/90 text-sm max-w-md mx-auto">
              Your order <span className="font-mono font-bold underline">#{bookedOrderNumber || 'CSM-2024-LIVE'}</span> has been confirmed. Our executive will arrive at your scheduled slot.
            </p>
          </div>
          <div className="p-6 space-y-3 bg-slate-50/50">
            <div className="flex justify-between items-center text-sm py-2 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Order Number</span>
              <span className="font-mono font-bold text-primary">{bookedOrderNumber || 'CSM-2024-LIVE'}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Device</span>
              <span className="font-semibold text-slate-800">{sellState.brandName} {sellState.modelName}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Guaranteed Quoted Value</span>
              <span className="font-black text-lg text-emerald-600">₹{price.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Device Evaluation</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                <ShieldCheck size={15} /> Instant Guaranteed Quote
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Customer</span>
              <span className="font-semibold text-slate-800">{name} ({phone})</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Pickup Schedule</span>
              <span className="font-semibold text-indigo-700">{selectedDate} · {selectedSlot}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2">
              <span className="text-muted-foreground font-medium">Payment Mode</span>
              <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-border">{paymentMethod} Instant Transfer</span>
            </div>
          </div>
          <div className="p-5 bg-white border-t border-border flex flex-col sm:flex-row gap-3">
            <Link
              href={`/track-order?orderId=${bookedOrderNumber}`}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold text-sm text-center shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              <span>Track Live Order</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/my-orders"
              className="py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm text-center hover:bg-slate-200 transition-all"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'schedule') {
    return (
      <div className="space-y-5 fade-in">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <button onClick={() => setView('quote')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
            ← Back to Quote
          </button>
          <h2 className="text-xl font-bold text-foreground mb-1">Schedule Free Pickup</h2>
          <p className="text-sm text-muted-foreground mb-5">Fill in your details to schedule a free doorstep pickup</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Your Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Pickup Address</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-3 text-muted-foreground" />
                <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address with landmark..." rows={2}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">PIN Code</label>
              <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit PIN code" maxLength={6}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Pickup Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Time Slot</label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map(slot => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${selectedSlot === slot ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'}`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Payment Method</label>
              <div className="p-3.5 rounded-xl border-2 border-primary bg-primary-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                    COD
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Cash / Spot Payout on Handover</p>
                    <p className="text-[11px] text-slate-500">Receive cash or spot IMPS/UPI at doorstep right upon verification</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                  Guaranteed
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-4">
          <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Device</span><span className="font-semibold">{sellState.brandName} {sellState.modelName}</span></div>
          <div className="flex justify-between text-sm font-bold"><span>Quoted Price</span><span className="text-primary">₹{price.toLocaleString('en-IN')}</span></div>
        </div>

        <button
          onClick={handleConfirmBooking}
          disabled={!name || !phone || !address || !pinCode || !selectedDate || !selectedSlot || isSubmitting}
          className="w-full py-4 gradient-green text-white rounded-xl font-bold shadow-green btn-press disabled:opacity-50 flex items-center justify-center gap-2">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Scheduling & Alerting Partner...
            </span>
          ) : (
            <>
              <CheckCircle size={18} /> Confirm Pickup Booking
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Quote hero card */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="gradient-green p-6 text-white">
          <div className="text-3xl mb-2">🎉</div>
          <h2 className="text-2xl font-extrabold mb-1">Amazing! Here&apos;s your best price</h2>
          <p className="text-white/80 text-sm">We&apos;ve evaluated your device and here&apos;s what you can get.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Your Best Price</p>
              <div className="text-5xl font-extrabold text-foreground font-tabular mb-3">
                ₹{price.toLocaleString('en-IN')}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={14} className="text-warning" />
                <span>Price locked for next <strong className="text-foreground">24 hours</strong></span>
              </div>
            </div>
            <div className="bg-surface rounded-xl p-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=64&h=64&fit=crop" alt={`${sellState.modelName} device photo`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{sellState.brandName} {sellState.modelName}</p>
                  {sellState.storage && <span className="inline-block mt-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">{sellState.storage}</span>}
                  {sellState.color && <p className="text-xs text-muted-foreground mt-1">🎨 {sellState.color}</p>}
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-primary font-semibold">
                    <CheckCircle size={12} /> 100% Original Device
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camsik Best Price & Safe Handover Assurance */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-primary/5 to-emerald-500/10 rounded-2xl border border-emerald-500/20 p-5 fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                Guaranteed Assessment
              </span>
              <h4 className="font-extrabold text-foreground text-sm">
                Instant Best Price Valuation Confirmed
              </h4>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 shadow-sm">
            ✓ 100% Guaranteed
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-white/70 border border-emerald-200/50">
            <span className="text-muted-foreground block text-[11px]">Free Pickup</span>
            <span className="font-bold text-foreground">Zero Doorstep Charges</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/70 border border-emerald-200/50">
            <span className="text-muted-foreground block text-[11px]">Payment Mode</span>
            <span className="font-bold text-emerald-600">Instant UPI / Bank</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/70 border border-emerald-200/50">
            <span className="text-muted-foreground block text-[11px]">Deductions</span>
            <span className="font-bold text-emerald-600">Zero Hidden Cuts</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/70 border border-emerald-200/50">
            <span className="text-muted-foreground block text-[11px]">Data Security</span>
            <span className="font-bold text-foreground">100% Certified Data Wipe</span>
          </div>
        </div>
      </div>

      {/* Why sell to Camsik */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <h3 className="font-bold text-foreground mb-4">Why sell to Camsik?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {sellBenefits.map(b => (
            <div key={b.id} className="flex flex-col items-center text-center p-3 rounded-xl bg-surface">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${b.color}`}>
                <b.icon size={18} />
              </div>
              <p className="text-xs font-bold text-foreground leading-tight">{b.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleProceedToSchedule}
          className={`${
            isPhone && !sellState.deviceVerification
              ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
              : 'gradient-green hover:opacity-95 shadow-green'
          } text-white rounded-2xl p-5 flex items-center gap-4 btn-press text-left transition-all`}
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            {isPhone && !sellState.deviceVerification ? (
              <ShieldCheck size={22} className="text-white" />
            ) : (
              <Truck size={22} className="text-white" />
            )}
          </div>
          <div>
            <p className="font-bold text-base">
              {isPhone && !sellState.deviceVerification
                ? 'Verify Phone IMEI to Schedule Pickup'
                : 'Schedule Free Pickup'}
            </p>
            <p className="text-white/80 text-sm mt-0.5">
              {isPhone && !sellState.deviceVerification
                ? 'IMEI verification is required (*#06#) before pickup'
                : "We'll pickup your device from your location"}
            </p>
          </div>
        </button>
        <div className="bg-white border border-border rounded-2xl p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Shield size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground mb-1">Your data is always safe with us</p>
            <p className="text-xs text-muted-foreground leading-relaxed">We follow industry standard data erasure process before reselling any device.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-white rounded-xl border border-border p-3">
        <Shield size={14} className="text-primary flex-shrink-0" />
        This quote is valid for <strong className="text-foreground">24 hours from now.</strong>
      </div>

      {showImeiModal && (
        <DeviceVerificationModal
          selectedBrand={sellState.brandName || 'Device'}
          selectedModel={sellState.modelName || 'Smartphone'}
          selectedVariant={sellState.storage || 'Standard'}
          onClose={() => setShowImeiModal(false)}
          onSuccess={(report) => {
            onUpdateState?.({ deviceVerification: report });
            setShowImeiModal(false);
            setView('schedule');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {showReportModal && (
        <FullVerificationReportModal
          report={sellState.deviceVerification}
          onClose={() => setShowReportModal(false)}
        />
      )}

      <CustomerAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(loggedUser) => {
          setName(loggedUser.name);
          setPhone(loggedUser.phone);
          setShowAuthModal(false);
          setView('schedule');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        title="Login Required to Schedule Pickup"
        subtitle="Please verify your mobile number to lock this price quote and schedule your doorstep device pickup."
      />

      <UnserviceableAreaModal
        isOpen={showUnserviceableModal}
        pincode={pinCode}
        onClose={() => setShowUnserviceableModal(false)}
        onGoHome={() => {
          setShowUnserviceableModal(false);
          window.location.href = '/';
        }}
      />
    </div>
  );
}