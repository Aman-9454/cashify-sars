'use client';

import React, { useState } from 'react';
import { 
  Tag, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  SlidersHorizontal,
  ArrowRight,
  TrendingDown,
  Gift
} from 'lucide-react';

interface UserBuyExchangeViewProps {
  onOrderBooked: (orderData: any) => void;
}

export default function UserBuyExchangeView({ onOrderBooked }: UserBuyExchangeViewProps) {
  const [activeMode, setActiveMode] = useState<'buy' | 'exchange'>('buy');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  // Exchange calculator states
  const [exchangeOldDevice, setExchangeOldDevice] = useState('iPhone 12 (128 GB)');
  const [exchangeOldCondition, setExchangeOldCondition] = useState('Good');
  const [exchangeTargetDevice, setExchangeTargetDevice] = useState('iPhone 15 (128 GB)');
  const [exchangeSuccess, setExchangeSuccess] = useState(false);

  const refurbishedProducts = [
    {
      id: 'ref-1',
      name: 'Apple iPhone 15 (128 GB) - Blue',
      category: 'Smartphones',
      condition: 'Pristine',
      price: 52999,
      originalPrice: 79900,
      discount: '34% OFF',
      image: 'https://ik.imagekit.io/avdarinn/casmik/phones/iphone-15.png',
      warranty: '1 Year Brand Warranty',
      batteryHealth: '98%',
      features: ['A16 Bionic', 'Dynamic Island', '48MP Camera']
    },
    {
      id: 'ref-2',
      name: 'Sony Alpha A7 IV Mirrorless Camera Body',
      category: 'DSLR & Mirrorless',
      condition: 'Superb',
      price: 154900,
      originalPrice: 242990,
      discount: '36% OFF',
      image: 'https://ik.imagekit.io/avdarinn/casmik/cameras/sony-a7iv.png',
      warranty: '1 Year Casmik Warranty',
      shutterCount: '4,210 / 200,000',
      features: ['33MP Sensor', '4K 60p 10-bit', 'Real-time Eye AF']
    },
    {
      id: 'ref-3',
      name: 'MacBook Pro 14" M3 (16GB/512GB) Space Grey',
      category: 'Laptops',
      condition: 'Flawless',
      price: 124900,
      originalPrice: 169900,
      discount: '26% OFF',
      image: 'https://ik.imagekit.io/avdarinn/casmik/laptops/macbook-pro-14.png',
      warranty: '1 Year Brand Warranty',
      batteryHealth: '100%',
      features: ['Liquid Retina XDR', 'M3 Pro Chip', 'ProMotion 120Hz']
    },
    {
      id: 'ref-4',
      name: 'Samsung Galaxy S23 Ultra 5G (256 GB)',
      category: 'Smartphones',
      condition: 'Superb',
      price: 64999,
      originalPrice: 124999,
      discount: '48% OFF',
      image: 'https://ik.imagekit.io/avdarinn/casmik/phones/s23-ultra.png',
      warranty: '1 Year Casmik Warranty',
      batteryHealth: '95%',
      features: ['200MP Quad Camera', 'Snapdragon 8 Gen 2', 'S-Pen Included']
    }
  ];

  // Exchange calculations
  const oldDeviceValues: Record<string, number> = {
    'iPhone 11 (64 GB)': 16500,
    'iPhone 12 (128 GB)': 23500,
    'iPhone 13 (128 GB)': 34000,
    'Samsung S21 FE': 14500,
    'Canon EOS 200D': 21000
  };

  const targetDevicePrices: Record<string, number> = {
    'iPhone 15 (128 GB)': 52999,
    'iPhone 15 Pro Max': 105000,
    'Sony Alpha A7 IV': 154900,
    'MacBook Air M2': 69900
  };

  const oldVal = oldDeviceValues[exchangeOldDevice] || 20000;
  const targetVal = targetDevicePrices[exchangeTargetDevice] || 52999;
  const exchangeBonus = 3000; // Festive exchange bonus
  const netPayable = targetVal - (oldVal + exchangeBonus);

  const handleBookExchange = () => {
    const exchangeOrder = {
      id: `EXC-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'exchange',
      oldDevice: exchangeOldDevice,
      tradeInValue: oldVal + exchangeBonus,
      newDevice: exchangeTargetDevice,
      targetPrice: targetVal,
      netPayable: Math.max(netPayable, 0),
      cashbackDue: netPayable < 0 ? Math.abs(netPayable) : 0,
      customerName: 'Adarsh Sachan',
      phone: '+91 98765 43210',
      address: 'Flat 402, Green Glen Heights, Bengaluru',
      status: 'pending_pickup',
      createdAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('casmik_customer_orders_v1') || '[]');
        localStorage.setItem('casmik_customer_orders_v1', JSON.stringify([exchangeOrder, ...existing]));

        const existingAll = JSON.parse(localStorage.getItem('casmik_orders_v1') || '[]');
        localStorage.setItem('casmik_orders_v1', JSON.stringify([exchangeOrder, ...existingAll]));
      } catch (err) {
        console.error(err);
      }
    }

    // Persist to MongoDB live via /api/orders
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...exchangeOrder,
        orderNumber: exchangeOrder.id,
        amount: Math.max(netPayable, 0),
        deviceName: `${exchangeOldDevice} ➔ ${exchangeTargetDevice}`,
      }),
    }).catch(err => console.error('Failed to sync exchange order to database:', err));

    setExchangeSuccess(true);
    onOrderBooked(exchangeOrder);
  };

  return (
    <div className="space-y-4 px-3.5 py-3 text-slate-100 animate-in fade-in duration-300">
      {/* Mode Switcher Pills: Buy Refurbished vs Doorstep Exchange */}
      <div className="bg-slate-800/90 p-1 rounded-2xl border border-slate-700/80 flex">
        <button
          onClick={() => setActiveMode('buy')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'buy'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Buy Refurbished</span>
        </button>

        <button
          onClick={() => setActiveMode('exchange')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'exchange'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Doorstep Exchange</span>
        </button>
      </div>

      {/* MODE 1: BUY CERTIFIED REFURBISHED */}
      {activeMode === 'buy' && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['All', 'Smartphones', 'Laptops', 'DSLR & Mirrorless'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Guarantee Pill */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-2.5 flex items-center justify-between text-[11px] text-blue-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>1-Year Warranty & 7 Days Free Replacement</span>
            </div>
            <span className="font-bold text-white">45-Pt QA Pass</span>
          </div>

          {/* Product Cards List */}
          <div className="space-y-3">
            {refurbishedProducts
              .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
              .map((prod) => (
                <div
                  key={prod.id}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-3.5 space-y-3 shadow-lg hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center p-2 relative flex-shrink-0">
                      <span className="text-3xl">📱</span>
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[8px] font-black">
                        {prod.condition}
                      </span>
                    </div>

                    <div className="flex-1 space-y-1">
                      <h3 className="text-xs font-bold text-white leading-snug">{prod.name}</h3>
                      <p className="text-[10px] text-slate-400">{prod.warranty}</p>

                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-base font-black text-white">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500 line-through">
                          ₹{prod.originalPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400">
                          {prod.discount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {prod.features.map((feat, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[9px] text-slate-300 font-medium">
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1 border-t border-slate-700/60">
                    <button
                      onClick={() => {
                        alert(`Proceeding to checkout for ${prod.name}. Cash on Delivery & Zero EMI available!`);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                    >
                      Buy Refurbished
                    </button>
                    <button
                      onClick={() => {
                        setExchangeTargetDevice(prod.name);
                        setActiveMode('exchange');
                      }}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 font-bold text-xs border border-purple-500/30 flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Exchange</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODE 2: 1-STEP DOORSTEP EXCHANGE CALCULATOR */}
      {activeMode === 'exchange' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {exchangeSuccess ? (
            <div className="p-4 space-y-3 text-center animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-purple-500/20 border-2 border-purple-500 text-purple-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white">Doorstep Exchange Booked!</h3>
              <p className="text-xs text-slate-400">
                Our executive will arrive with your new <span className="text-white font-bold">{exchangeTargetDevice}</span>, inspect your <span className="text-white font-bold">{exchangeOldDevice}</span>, and swap devices in a single visit!
              </p>
              <button
                onClick={() => setExchangeSuccess(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700"
              >
                Back to Exchange
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="bg-gradient-to-br from-purple-900/40 via-slate-900 to-slate-900 border border-purple-500/40 rounded-3xl p-4 space-y-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">1-Visit Doorstep Exchange</h3>
                    <p className="text-[10px] text-slate-400">Upgrade old device without any downtime</p>
                  </div>
                </div>

                {/* Old Device */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                    1. Your Old Device to Give
                  </label>
                  <select
                    value={exchangeOldDevice}
                    onChange={(e) => setExchangeOldDevice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="iPhone 11 (64 GB)">iPhone 11 (64 GB) - Value: ₹16,500</option>
                    <option value="iPhone 12 (128 GB)">iPhone 12 (128 GB) - Value: ₹23,500</option>
                    <option value="iPhone 13 (128 GB)">iPhone 13 (128 GB) - Value: ₹34,000</option>
                    <option value="Samsung S21 FE">Samsung S21 FE - Value: ₹14,500</option>
                    <option value="Canon EOS 200D">Canon EOS 200D - Value: ₹21,000</option>
                  </select>
                </div>

                {/* Target Device */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                    2. New Refurbished Device You Want
                  </label>
                  <select
                    value={exchangeTargetDevice}
                    onChange={(e) => setExchangeTargetDevice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="iPhone 15 (128 GB)">iPhone 15 (128 GB) - Price: ₹52,999</option>
                    <option value="iPhone 15 Pro Max">iPhone 15 Pro Max - Price: ₹1,05,000</option>
                    <option value="Sony Alpha A7 IV">Sony Alpha A7 IV - Price: ₹1,54,900</option>
                    <option value="MacBook Air M2">MacBook Air M2 - Price: ₹69,900</option>
                  </select>
                </div>

                {/* Valuation Calculation Card */}
                <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>New Device Price:</span>
                    <span className="text-white font-bold">₹{targetVal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Old Device Trade-In:</span>
                    <span className="text-emerald-400 font-bold">- ₹{oldVal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Festive Exchange Bonus:</span>
                    <span className="text-purple-400 font-bold">- ₹{exchangeBonus.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="font-bold text-white">Net Spot Payable:</span>
                    <span className="text-base font-black text-purple-400">
                      ₹{Math.max(netPayable, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBookExchange}
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Book Doorstep Exchange</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
