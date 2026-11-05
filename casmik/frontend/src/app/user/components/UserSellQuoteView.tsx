'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Smartphone, 
  Laptop, 
  Camera, 
  HelpCircle, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { categories, Category } from '@/lib/casmikData';
import { getCurrentUser } from '@/lib/auth';
import CustomerAuthModal from '@/components/CustomerAuthModal';

interface UserSellQuoteViewProps {
  onOrderBooked: (orderData: any) => void;
}

export default function UserSellQuoteView({ onOrderBooked }: UserSellQuoteViewProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Category & Model, 2: Condition, 3: Valuation, 4: Pickup & Bank
  const [selectedCategory, setSelectedCategory] = useState('Smartphones');
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [selectedModel, setSelectedModel] = useState('iPhone 14 Pro (128 GB)');
  const [screenCondition, setScreenCondition] = useState<'flawless' | 'minor' | 'cracked'>('flawless');
  const [bodyCondition, setBodyCondition] = useState<'flawless' | 'minor' | 'heavy'>('flawless');
  const [accessories, setAccessories] = useState<string[]>(['box', 'original_charger']);
  
  // Doorstep pickup form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('2026-09-22');
  const [pickupSlot, setPickupSlot] = useState('10:00 AM - 01:00 PM');
  const [upiId, setUpiId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  React.useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, []);

  // Dynamic calculated valuation
  const basePrices: Record<string, number> = {
    'iPhone 14 Pro (128 GB)': 58000,
    'iPhone 15 Pro Max (256 GB)': 82000,
    'Samsung Galaxy S24 Ultra': 74000,
    'MacBook Air M2': 64000,
    'Sony Alpha A7 III': 78000,
    'Canon EOS R6 Mark II': 92000
  };

  const calculateQuote = () => {
    let price = basePrices[selectedModel] || 45000;
    if (screenCondition === 'minor') price -= 4000;
    if (screenCondition === 'cracked') price -= 12000;
    if (bodyCondition === 'minor') price -= 2500;
    if (bodyCondition === 'heavy') price -= 6000;
    if (!accessories.includes('original_charger')) price -= 1500;
    if (!accessories.includes('box')) price -= 1000;
    return Math.max(price, 5000);
  };

  const quotePrice = calculateQuote();

  const handleBookPickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!getCurrentUser()) {
      setShowAuthModal(true);
      return;
    }
    const newOrderId = `CSK-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: newOrderId,
      type: 'sell',
      category: selectedCategory,
      device: `${selectedBrand} ${selectedModel}`,
      customerName: customerName || 'Adarsh Sachan',
      phone: customerPhone || '+91 98765 43210',
      address: customerAddress || 'Flat 402, Green Glen Heights, Bengaluru',
      city: 'Bengaluru',
      date: pickupDate,
      timeSlot: pickupSlot,
      status: 'pending_pickup',
      price: quotePrice,
      offeredPrice: quotePrice,
      upiId: upiId || 'customer@oksbi',
      createdAt: new Date().toISOString()
    };

    // Save to shared localStorage for instant synchronization across Partner, Delivery, Admin
    if (typeof window !== 'undefined') {
      try {
        const existingOrders = JSON.parse(localStorage.getItem('casmik_customer_orders_v1') || '[]');
        localStorage.setItem('casmik_customer_orders_v1', JSON.stringify([newOrder, ...existingOrders]));

        const existingAllOrders = JSON.parse(localStorage.getItem('casmik_orders_v1') || '[]');
        localStorage.setItem('casmik_orders_v1', JSON.stringify([newOrder, ...existingAllOrders]));

        // Trigger notification event with chime
        localStorage.setItem('casmik_latest_alert', JSON.stringify({
          title: `New Sell Order Booked: ${newOrder.device}`,
          amount: newOrder.price,
          time: new Date().toLocaleTimeString()
        }));
      } catch (err) {
        console.error('Error saving order:', err);
      }
    }

    setIsSubmitted(true);
    onOrderBooked(newOrder);
  };

  if (isSubmitted) {
    return (
      <div className="p-4 space-y-4 text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8 animate-bounce" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-black text-white">Doorstep Pickup Scheduled!</h2>
          <p className="text-xs text-slate-400">Order ID: <span className="font-mono text-emerald-400 font-bold">CSK-849201</span></p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 text-left space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Device:</span>
            <span className="font-bold text-white">{selectedBrand} {selectedModel}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Assured Value:</span>
            <span className="font-black text-emerald-400 text-sm">₹{quotePrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Scheduled Slot:</span>
            <span className="font-medium text-slate-300">{pickupDate}, {pickupSlot}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Instant Payout To:</span>
            <span className="font-mono text-cyan-400 font-semibold">{upiId || 'customer@oksbi'}</span>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-2.5 text-left text-[11px] text-emerald-300">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>A Casmik delivery executive will arrive at your doorstep, verify the device, and disburse instant cash.</span>
        </div>

        <button
          onClick={() => {
            setIsSubmitted(false);
            setStep(1);
          }}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all active:scale-95"
        >
          Evaluate Another Device
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-3.5 py-3 text-slate-100 animate-in fade-in duration-300">
      {/* Step Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold text-slate-400">
          <span>Step {step} of 4</span>
          <span className="text-emerald-400 font-semibold">
            {step === 1 && 'Select Device'}
            {step === 2 && 'Assess Condition'}
            {step === 3 && 'Instant Valuation'}
            {step === 4 && 'Doorstep Schedule'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: CATEGORY & MODEL */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-sm font-black text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              Choose Your Device Category
            </h2>
            <p className="text-[11px] text-slate-400">Select what you are selling today</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Smartphones', icon: '📱', desc: 'iPhone, Galaxy, Pixel' },
              { label: 'Laptops', icon: '💻', desc: 'MacBook, Dell, HP' },
              { label: 'DSLR & Mirrorless', icon: '📷', desc: 'Sony, Canon, Nikon' },
              { label: 'Camera Lenses', icon: '🔍', desc: 'G Master, EF, RF' }
            ].map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 active:scale-95 ${
                  selectedCategory === cat.label
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <span className="text-xs font-bold block text-white">{cat.label}</span>
                <span className="text-[10px] text-slate-400">{cat.desc}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Select Brand</label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['Apple', 'Samsung', 'Sony', 'Canon', 'Dell', 'OnePlus'].map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedBrand === brand
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Select Model & Storage</label>
            <div className="space-y-2">
              {[
                'iPhone 14 Pro (128 GB)',
                'iPhone 15 Pro Max (256 GB)',
                'Samsung Galaxy S24 Ultra',
                'MacBook Air M2',
                'Sony Alpha A7 III'
              ].map((model) => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedModel === model
                      ? 'bg-emerald-500/15 border-emerald-500 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold">{model}</span>
                  {selectedModel === model && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all mt-2"
          >
            <span>Proceed to Diagnostics</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: CONDITION ASSESSMENT */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-sm font-black text-white">Physical & Screen Condition</h2>
            <p className="text-[11px] text-slate-400">Tell us about the condition of your {selectedModel}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Screen Condition</label>
            <div className="space-y-1.5">
              {[
                { id: 'flawless', label: 'Flawless', desc: 'No scratches, touch works 100%' },
                { id: 'minor', label: 'Minor Scratches', desc: 'Slight hairline scratches, no cracks' },
                { id: 'cracked', label: 'Cracked Glass / Lines', desc: 'Visible crack or display discoloration' }
              ].map((cond) => (
                <button
                  key={cond.id}
                  onClick={() => setScreenCondition(cond.id as any)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    screenCondition === cond.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{cond.label}</span>
                    <span className="text-[10px] text-slate-400">{cond.desc}</span>
                  </div>
                  {screenCondition === cond.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Body / Frame Condition</label>
            <div className="space-y-1.5">
              {[
                { id: 'flawless', label: 'Like New (No Dents)', desc: 'Zero dents, no visible peeling' },
                { id: 'minor', label: 'Minor Dents / Normal Wear', desc: '1-2 small edge marks' },
                { id: 'heavy', label: 'Heavy Scratches / Dents', desc: 'Major bends or deep drops' }
              ].map((cond) => (
                <button
                  key={cond.id}
                  onClick={() => setBodyCondition(cond.id as any)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    bodyCondition === cond.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{cond.label}</span>
                    <span className="text-[10px] text-slate-400">{cond.desc}</span>
                  </div>
                  {bodyCondition === cond.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="w-2/3 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <span>Get Valuation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: INSTANT VALUATION */}
      {step === 3 && (
        <div className="space-y-4 animate-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950 border border-emerald-500/40 rounded-3xl p-5 text-center space-y-3 shadow-2xl relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              Calculated Best Market Quote
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400">Total Cash Payout for {selectedModel}</span>
              <div className="text-3xl font-black text-emerald-400 tracking-tight">
                ₹{quotePrice.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-400 block">+ ₹2,500 Festival bonus already included</span>
            </div>

            <div className="pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-[10px] text-left">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Screen Grade</span>
                <span className="font-bold text-white uppercase">{screenCondition}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Body Grade</span>
                <span className="font-bold text-white uppercase">{bodyCondition}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Doorstep physical inspection in 10 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant Bank or UPI payout before rider leaves</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero cancellation fee if you change your mind</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="w-1/3 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700"
            >
              Re-evaluate
            </button>
            <button
              onClick={() => setStep(4)}
              className="w-2/3 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <span>Schedule Free Pickup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DOORSTEP SCHEDULE & UPI */}
      {step === 4 && (
        <form onSubmit={handleBookPickup} className="space-y-3 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-sm font-black text-white">Doorstep Pickup Details</h2>
            <p className="text-[11px] text-slate-400">Our executive will reach you with payment ready</p>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Adarsh Sachan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Mobile Number (For OTP Verification)</label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98765 43210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Pickup Address</label>
              <textarea
                required
                rows={2}
                placeholder="House/Flat No, Street, Landmark, Pin Code"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Pickup Date</label>
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Preferred Time</label>
                <select
                  value={pickupSlot}
                  onChange={(e) => setPickupSlot(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="10:00 AM - 01:00 PM">10:00 AM - 01:00 PM</option>
                  <option value="01:00 PM - 04:00 PM">01:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 07:00 PM">04:00 PM - 07:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">UPI ID for Instant Money (Optional now)</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. yourname@oksbi / @paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-1/3 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-2/3 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Booking</span>
            </button>
          </div>
        </form>
      )}

      <CustomerAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setCustomerName(user.name);
          setCustomerPhone(user.phone);
          setShowAuthModal(false);
        }}
        title="Login Required to Book Pickup"
        subtitle="Please verify your mobile number to confirm your device pickup."
      />
    </div>
  );
}
