'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Star,
  ShieldCheck,
  Truck,
  CheckCircle,
  Package,
  ArrowRight,
  ArrowLeft,
  Camera,
  Sparkles,
  CreditCard,
  ClipboardCheck,
  Check,
  BatteryCharging,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  X,
  ThumbsUp,
  Tag,
  ChevronRight,
  Info,
} from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';
import {
  RefurbishedProduct,
  ProductCategory,
  ProductCondition,
  getRefurbishedProducts,
  DEFAULT_REFURBISHED_PRODUCTS,
  getModelKey,
} from '@/lib/refurbishedCatalog';
import { getCurrentUser } from '@/lib/auth';
import CustomerAuthModal from '@/components/CustomerAuthModal';
import UnserviceableAreaModal from '@/components/UnserviceableAreaModal';

export default function BuyRefurbishedPage() {
  const [products, setProducts] = useState<RefurbishedProduct[]>(DEFAULT_REFURBISHED_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeCondition, setActiveCondition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUnserviceableModal, setShowUnserviceableModal] = useState(false);

  // Navigation / views: 'list' | 'details' | 'checkout' | 'confirmed'
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'checkout' | 'confirmed'>('list');
  const [selectedProduct, setSelectedProduct] = useState<RefurbishedProduct | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeDetailCondition, setActiveDetailCondition] = useState<ProductCondition>('Superb');

  // Checkout form state
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD'>('COD');
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  // Load products & listen to admin updates
  useEffect(() => {
    // 1. Initial fast local render
    const loaded = getRefurbishedProducts();
    setProducts(loaded);
    setSelectedProduct((prev) => {
      if (!prev) return null;
      return loaded.find((p) => p.id === prev.id) || prev;
    });

    // 2. Live fetch from MongoDB /api/refurbished
    const fetchLiveProducts = async () => {
      try {
        const res = await fetch('/api/refurbished');
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          setSelectedProduct((prev) => {
            if (!prev) return null;
            return data.products.find((p: any) => p.id === prev.id) || prev;
          });
        }
      } catch (err) {
        console.warn('Error fetching live refurbished from API:', err);
      }
    };
    fetchLiveProducts();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<RefurbishedProduct[]>;
      const nextProducts = customEvent.detail || getRefurbishedProducts();
      setProducts(nextProducts);
      setSelectedProduct((prev) => {
        if (!prev) return null;
        return nextProducts.find((p) => p.id === prev.id) || prev;
      });
    };

    window.addEventListener('casmik_refurbished_updated', handleUpdate);
    return () => window.removeEventListener('casmik_refurbished_updated', handleUpdate);
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchCond = activeCondition === 'all' || p.condition.toLowerCase() === activeCondition.toLowerCase();
    const matchSearch =
      searchQuery.trim() === '' ||
      p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specs.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchCond && matchSearch;
  });

  const handleSelectProduct = (product: RefurbishedProduct) => {
    const fresh = products.find((p) => p.id === product.id) || product;
    setSelectedProduct(fresh);
    setActiveDetailCondition(fresh.condition);
    setActiveImageIndex(0);
    setCurrentView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectConditionTab = (cond: ProductCondition) => {
    setActiveDetailCondition(cond);
    if (!selectedProduct) return;
    const currentModelKey = getModelKey(selectedProduct);
    const matchingConditionUnits = products.filter(
      (p) => getModelKey(p) === currentModelKey && p.condition === cond && p.status !== 'sold'
    );
    if (matchingConditionUnits.length > 0) {
      // Auto-switch to the first unit of that condition if current unit is in a different condition
      if (selectedProduct.condition !== cond) {
        setSelectedProduct(matchingConditionUnits[0]);
        setActiveImageIndex(0);
      }
    }
  };

  const handleSwitchUnit = (unit: RefurbishedProduct) => {
    const fresh = products.find((p) => p.id === unit.id) || unit;
    setSelectedProduct(fresh);
    setActiveDetailCondition(fresh.condition);
    setActiveImageIndex(0);
  };

  const handleStartCheckout = () => {
    if (!getCurrentUser()) {
      setShowAuthModal(true);
      return;
    }
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getCurrentUser()) {
      setShowAuthModal(true);
      return;
    }

    const randomId = 'CAM-ORD-' + Math.floor(100000 + Math.random() * 900000);

    // Verify PIN code serviceability
    try {
      const pinRes = await fetch(`/api/pincodes?pincode=${encodeURIComponent(pincode.trim())}`);
      const pinData = await pinRes.json();
      if (pinData.success && pinData.serviceable === false) {
        // Record as unserviceable order
        const unserviceableOrder = {
          id: randomId,
          orderNumber: randomId,
          type: 'buy',
          status: 'unserviceable',
          customerName: fullName || 'Valued Customer',
          customerPhone: phone || '',
          customerAddress: address,
          pinCode: pincode.trim(),
          city: 'Customer Location',
          deviceName: selectedProduct ? `${selectedProduct.brand} ${selectedProduct.model}` : 'Refurbished Device',
          quotedPrice: selectedProduct?.sellingPrice || 0,
          finalPrice: selectedProduct?.sellingPrice || 0,
          paymentStatus: 'pending',
          notes: `Unserviceable Area Buy Order. PIN: ${pincode}. Coverage requested.`,
          createdAt: new Date().toISOString(),
        };

        if (typeof window !== 'undefined') {
          try {
            const list = JSON.parse(localStorage.getItem('casmik_orders_v1') || '[]');
            localStorage.setItem('casmik_orders_v1', JSON.stringify([unserviceableOrder, ...list]));
            window.dispatchEvent(new Event('casmik_orders_updated'));
          } catch {}
        }
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(unserviceableOrder),
        }).catch(() => {});

        setShowUnserviceableModal(true);
        return;
      }
    } catch (err) {
      console.warn('Pincode check error:', err);
    }

    setConfirmedOrderId(randomId);
    setCurrentView('confirmed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const conditionBadgeColor = (condition: ProductCondition) => {
    switch (condition) {
      case 'Superb':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Good':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Fair':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const conditionInfo: Record<
    ProductCondition,
    {
      title: string;
      subtitle: string;
      batteryGuide: string;
      icon: typeof Sparkles;
      activeBorder: string;
      activeBadge: string;
    }
  > = {
    Superb: {
      title: 'Superb',
      subtitle: 'Pristine • Like New',
      batteryGuide: '95%+ Battery',
      icon: Sparkles,
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30',
      activeBadge: 'bg-emerald-500 text-white',
    },
    Good: {
      title: 'Good',
      subtitle: 'Lightly Used • Best Value',
      batteryGuide: '88-94% Battery',
      icon: ThumbsUp,
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30',
      activeBadge: 'bg-blue-500 text-white',
    },
    Fair: {
      title: 'Fair',
      subtitle: 'Budget Deal • Fully Tested',
      batteryGuide: '80-87% Battery',
      icon: Tag,
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30',
      activeBadge: 'bg-amber-500 text-white',
    },
  };

  const currentModelKey = selectedProduct ? getModelKey(selectedProduct) : '';
  const siblingVariants = selectedProduct
    ? products.filter((p) => getModelKey(p) === currentModelKey && p.status !== 'sold')
    : [];

  const conditionGroups: Record<ProductCondition, RefurbishedProduct[]> = {
    Superb: siblingVariants.filter((p) => p.condition === 'Superb'),
    Good: siblingVariants.filter((p) => p.condition === 'Good'),
    Fair: siblingVariants.filter((p) => p.condition === 'Fair'),
  };

  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col w-full max-w-full overflow-x-hidden">
      <CustomerHeader />

      {/* ─────────────────────────────────────────────────────────────
          VIEW 1: ORDER CONFIRMED CELEBRATION
      ────────────────────────────────────────────────────────────── */}
      {currentView === 'confirmed' && selectedProduct && (
        <div className="flex-1 max-w-2xl mx-auto px-4 py-12 sm:py-16 w-full">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle size={44} />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
              Order Placed Successfully
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Congratulations! Order #{confirmedOrderId}
            </h1>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Your certified refurbished <span className="font-bold text-slate-800">{selectedProduct.model}</span> is confirmed and booked for insured delivery within {selectedProduct.deliveryDays} business days.
            </p>

            {/* Order Details Card */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-left text-xs space-y-2.5 mb-6">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                <span className="font-bold text-slate-500">Item</span>
                <span className="font-extrabold text-slate-900 text-right">{selectedProduct.model} ({selectedProduct.storage})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Condition Grade</span>
                <span className="font-bold text-emerald-600">{selectedProduct.condition} · {selectedProduct.conditionNote}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Warranty Coverage</span>
                <span className="font-bold text-slate-800">{selectedProduct.warranty} Official Certified Warranty</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Mode</span>
                <span className="font-bold text-slate-800">{paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Deliver To</span>
                <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">{address || 'Registered Customer Address'}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 text-sm font-black">
                <span className="text-slate-900">Total Paid</span>
                <span className="text-emerald-600">₹{selectedProduct.sellingPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null);
                  setCurrentView('list');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all"
              >
                Browse More Refurbished Devices
              </button>
              <Link
                href="/track-order"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all text-center"
              >
                Track Your Order
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 2: ORDER CHECKOUT (SCREENSHOT 4)
      ────────────────────────────────────────────────────────────── */}
      {currentView === 'checkout' && selectedProduct && (
        <div className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full">
          <button
            type="button"
            onClick={() => setCurrentView('details')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Product Details</span>
          </button>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6">
              Complete Your Order
            </h2>

            {/* Selected Device Summary Header (matches Screenshot 4) */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6">
              <div className="w-16 h-16 rounded-xl bg-white p-2 border border-slate-200 flex items-center justify-center shrink-0">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.model}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/assets/images/categories/dslr.png';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  {selectedProduct.brand} {selectedProduct.model}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedProduct.storage} · {selectedProduct.color}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${conditionBadgeColor(selectedProduct.condition)}`}>
                    {selectedProduct.condition}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base sm:text-lg font-black text-slate-900">
                  ₹{selectedProduct.sellingPrice.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-slate-400 line-through">
                  ₹{selectedProduct.originalPrice.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Delivery Address
                </label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full delivery address (House/Flat, Street, Area, Landmark)..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* PIN Code & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    PIN Code
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="6-digit PIN"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Receiver's full name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Payment Method Selector (COD Only as requested) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                      COD
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Cash on Delivery (Pay on Doorstep Handover)</p>
                      <p className="text-xs text-slate-500">Pay cash or scan QR at doorstep after device inspection</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-200/80 px-2.5 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Device Price</span>
                  <span className="font-bold text-slate-900">₹{selectedProduct.sellingPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-black text-slate-900">
                  <span>Total</span>
                  <span className="text-emerald-600">₹{selectedProduct.sellingPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Place Order — ₹{selectedProduct.sellingPrice.toLocaleString('en-IN')}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 3: PRODUCT DETAILS (SCREENSHOT 3)
      ────────────────────────────────────────────────────────────── */}
      {currentView === 'details' && selectedProduct && (
        <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => setCurrentView('list')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Devices</span>
          </button>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Column: Image Gallery (matches Screenshot 3) */}
              <div className="lg:col-span-6 flex flex-col items-center">
                {/* Main Active Image Showcase */}
                <div className="relative w-full aspect-square max-w-[420px] rounded-2xl bg-slate-50 border border-slate-200/80 p-6 flex items-center justify-center mb-4 overflow-hidden">
                  <img
                    key={`${selectedProduct.id}-${activeImageIndex}`}
                    src={selectedProduct.gallery && selectedProduct.gallery[activeImageIndex] ? selectedProduct.gallery[activeImageIndex] : selectedProduct.image}
                    alt={`${selectedProduct.brand} ${selectedProduct.model} - ${selectedProduct.color}`}
                    className="max-w-full max-h-full object-contain filter drop-shadow-md transition-all duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/images/categories/dslr.png';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${conditionBadgeColor(selectedProduct.condition)}`}>
                      {selectedProduct.condition}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-500 text-white">
                      {selectedProduct.discount}% OFF
                    </span>
                  </div>
                  {/* Selected Color & Storage Badge on Image */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200/80 text-[11px] font-bold text-slate-700 shadow-xs flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{selectedProduct.color} · {selectedProduct.storage}</span>
                  </div>
                </div>

                {/* Clickable Thumbnails Underneath */}
                <div className="flex items-center gap-3 w-full max-w-[420px] justify-center overflow-x-auto py-1">
                  {(selectedProduct.gallery && selectedProduct.gallery.length > 0 ? selectedProduct.gallery : [selectedProduct.image]).map((img, idx) => {
                    const isSelected = activeImageIndex === idx;
                    return (
                      <button
                        key={`${selectedProduct.id}-thumb-${idx}`}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-20 h-20 rounded-xl bg-slate-50 p-2 border transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white/50'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Angle ${idx + 1}`}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/assets/images/categories/dslr.png';
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Product Info & Metrics (matches Screenshot 3) */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                <div>
                  {/* Condition Pill & Note */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200 mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{selectedProduct.condition}</span>
                    <span className="text-emerald-600/70">·</span>
                    <span className="font-medium text-emerald-800">{selectedProduct.conditionNote}</span>
                  </div>

                  {/* Title & Storage/Color */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                    {selectedProduct.brand} {selectedProduct.model}
                  </h1>
                  <p className="text-sm font-semibold text-slate-500 mt-1">
                    {selectedProduct.storage} · {selectedProduct.color}
                  </p>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-3 mt-4">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      ₹{selectedProduct.sellingPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-base text-slate-400 line-through">
                      ₹{selectedProduct.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      {selectedProduct.discount}% OFF
                    </span>
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      STEP 1: CHOOSE CONDITION GRADE (Superb / Good / Fair)
                  ────────────────────────────────────────────────────────────── */}
                  <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center shadow-xs">
                          1
                        </span>
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                          Select Condition Grade
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                        {siblingVariants.length} certified {siblingVariants.length === 1 ? 'unit' : 'units'} listed
                      </span>
                    </div>

                    {/* 3 Condition Option Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {(['Superb', 'Good', 'Fair'] as ProductCondition[]).map((cond) => {
                        const isSelected = activeDetailCondition === cond;
                        const count = conditionGroups[cond].length;
                        const prices = conditionGroups[cond].map((p) => p.sellingPrice);
                        const minPrice = prices.length > 0 ? Math.min(...prices) : null;
                        const info = conditionInfo[cond];
                        const Icon = info.icon;

                        return (
                          <button
                            key={cond}
                            type="button"
                            onClick={() => handleSelectConditionTab(cond)}
                            className={`relative p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                              isSelected
                                ? `${info.activeBorder} shadow-sm`
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            {/* Active Checkmark Pill on Top-Right */}
                            {isSelected && (
                              <span className="absolute -top-2 -right-1 bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                                <Check size={11} strokeWidth={3} /> Selected
                              </span>
                            )}

                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={`p-1 rounded-lg ${isSelected ? info.activeBadge : 'bg-slate-100 text-slate-600'}`}>
                                    <Icon size={13} />
                                  </span>
                                  <span className={`text-sm font-black ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                                    {cond}
                                  </span>
                                </div>
                                <span
                                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                    count > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                  }`}
                                >
                                  {count > 0 ? `${count} available` : 'Out of stock'}
                                </span>
                              </div>

                              <p className="text-[11px] font-medium text-slate-500 leading-tight">
                                {info.subtitle}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                {info.batteryGuide}
                              </p>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400">Starting</span>
                              <span className="text-xs font-black text-slate-900">
                                {minPrice ? `₹${minPrice.toLocaleString('en-IN')}` : '—'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* ─────────────────────────────────────────────────────────────
                        STEP 2: AVAILABLE UNITS UNDER THE SELECTED CONDITION
                    ────────────────────────────────────────────────────────────── */}
                    <div className="mt-4 pt-4 border-t border-slate-200/70">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center shadow-xs">
                            2
                          </span>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <span>Available Units in</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${conditionBadgeColor(activeDetailCondition)}`}>
                              {activeDetailCondition} Condition
                            </span>
                          </h4>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                          Tap any unit to switch details & price
                        </span>
                      </div>

                      {/* If units exist for this condition */}
                      {conditionGroups[activeDetailCondition].length > 0 ? (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {conditionGroups[activeDetailCondition].map((unit) => {
                            const isCurrentUnit = selectedProduct.id === unit.id;
                            return (
                              <button
                                key={unit.id}
                                type="button"
                                onClick={() => handleSwitchUnit(unit)}
                                className={`w-full p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer ${
                                  isCurrentUnit
                                    ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-md'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                                }`}
                              >
                                {/* Left: Thumbnail & Main Specs */}
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0">
                                    <img
                                      src={unit.gallery && unit.gallery[0] ? unit.gallery[0] : unit.image}
                                      alt={unit.model}
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-black text-slate-900">
                                        {unit.storage}
                                      </span>
                                      <span className="text-slate-300">·</span>
                                      <span className="text-xs font-semibold text-slate-600 truncate">
                                        {unit.color}
                                      </span>
                                      {isCurrentUnit && (
                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                                          Currently Selected
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-slate-500 flex-wrap">
                                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                        <BatteryCharging size={12} className="text-emerald-600" />
                                        {typeof unit.batteryHealth === 'number' ? `${unit.batteryHealth}% Battery` : unit.batteryHealth}
                                      </span>
                                      <span className="text-slate-300">·</span>
                                      <span className="inline-flex items-center gap-1 text-slate-600">
                                        <ShieldCheck size={12} className="text-blue-600" />
                                        {unit.warranty}
                                      </span>
                                      <span className="text-slate-300">·</span>
                                      <span className="text-slate-500 truncate max-w-[140px] sm:max-w-none">
                                        {unit.conditionNote}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Price & Selection Status */}
                                <div className="text-right shrink-0">
                                  <div className="flex items-baseline justify-end gap-1.5">
                                    <span className="text-sm sm:text-base font-black text-slate-900">
                                      ₹{unit.sellingPrice.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-[10px] text-slate-400 line-through hidden sm:inline">
                                      ₹{unit.originalPrice.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                      {unit.discount}% OFF
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {unit.stock > 1 ? `Stock: ${unit.stock}` : 'Only 1 left!'}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        /* Empty State when no units for this condition */
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
                          <p className="text-xs font-bold text-slate-700">
                            No units currently listed in <span className="font-extrabold text-slate-900">{activeDetailCondition}</span> condition for {selectedProduct.model}.
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Explore available certified units in other conditions:
                          </p>
                          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                            {(['Superb', 'Good', 'Fair'] as ProductCondition[])
                              .filter((c) => c !== activeDetailCondition && conditionGroups[c].length > 0)
                              .map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => handleSelectConditionTab(c)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                                >
                                  View {c} ({conditionGroups[c].length} available)
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4 Feature Metric Cards in 2x2 Grid (matches Screenshot 3) */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {/* Card 1: Battery Health or Shutter Count */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <BatteryCharging size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-500">
                          {typeof selectedProduct.batteryHealth === 'number' ? 'Battery Health' : 'Diagnostics'}
                        </p>
                        <p className="text-sm font-black text-slate-900">
                          {typeof selectedProduct.batteryHealth === 'number' ? `${selectedProduct.batteryHealth}%` : selectedProduct.batteryHealth}
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Warranty */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-500">Warranty</p>
                        <p className="text-sm font-black text-slate-900">{selectedProduct.warranty}</p>
                      </div>
                    </div>

                    {/* Card 3: Rating */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Star size={20} className="fill-amber-500 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-500">Rating</p>
                        <p className="text-sm font-black text-slate-900">
                          {selectedProduct.rating} / 5 <span className="text-xs font-normal text-slate-400">({selectedProduct.reviews})</span>
                        </p>
                      </div>
                    </div>

                    {/* Card 4: Delivery */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <Truck size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-500">Delivery</p>
                        <p className="text-sm font-black text-slate-900">{selectedProduct.deliveryDays} business days</p>
                      </div>
                    </div>
                  </div>

                  {/* Certified Inspection Report Card (matches Screenshot 3) */}
                  <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <ClipboardCheck size={16} className="text-emerald-600" />
                      <span>Certified 45-Point Inspection Report</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      {[
                        { label: 'Display & Touch', status: selectedProduct.inspectionReport.display },
                        { label: 'Battery Capacity', status: selectedProduct.inspectionReport.battery },
                        { label: 'Camera & Optics', status: selectedProduct.inspectionReport.camera },
                        { label: 'Speakers & Mic', status: selectedProduct.inspectionReport.speakers },
                        { label: 'Charging & Ports', status: selectedProduct.inspectionReport.chargingPort },
                        { label: 'Sensors / Biometrics', status: selectedProduct.inspectionReport.sensor },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                            <Check size={13} strokeWidth={3} className="text-emerald-600" />
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Specs Brief */}
                  <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                    <span className="font-bold text-slate-700">Key Specifications: </span>
                    {selectedProduct.specs}
                  </p>
                </div>

                {/* Primary Buy Now CTA Button (matches Screenshot 3) */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleStartCheckout}
                    className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 btn-press"
                  >
                    <span>Buy Now — ₹{selectedProduct.sellingPrice.toLocaleString('en-IN')}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 4: MAIN PRODUCTS LISTING PAGE (SCREENSHOTS 1 & 2)
      ────────────────────────────────────────────────────────────── */}
      {currentView === 'list' && (
        <>
          {/* Hero Section (matches Screenshot 1) */}
          <section className="bg-white border-b border-slate-200 py-8 sm:py-12">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
              <div className="max-w-3xl mb-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold uppercase tracking-wider mb-3 border border-blue-200/60">
                  <Sparkles size={13} className="text-blue-600" />
                  CERTIFIED REFURBISHED DEVICES
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2">
                  Buy Refurbished Devices
                </h1>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                  Certified devices with warranty, inspection report and battery health guarantee. Save up to 60% vs new.
                </p>
              </div>

              {/* Global Search Bar (matches Screenshot 1) */}
              <div className="relative max-w-xl mb-8">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search iPhone, Samsung, MacBook, Sony A7..."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* 5-Step Process Bar (matches Screenshot 1) */}
              <div className="hidden lg:grid grid-cols-5 gap-3 pt-6 border-t border-slate-100">
                {[
                  {
                    step: '1',
                    icon: Search,
                    title: 'Choose Device',
                    desc: 'Browse certified refurbished devices by category, brand or model.',
                  },
                  {
                    step: '2',
                    icon: Star,
                    title: 'Select Condition',
                    desc: 'Pick Fair, Good or Superb condition based on your budget.',
                  },
                  {
                    step: '3',
                    icon: ClipboardCheck,
                    title: 'Check Details',
                    desc: 'Review inspection report, battery health, warranty and accessories.',
                  },
                  {
                    step: '4',
                    icon: CreditCard,
                    title: 'Place Order',
                    desc: 'Checkout securely via UPI, card or EMI with instant confirmation.',
                  },
                  {
                    step: '5',
                    icon: Package,
                    title: 'Get Delivery',
                    desc: 'Receive your device at home within 2-3 business days.',
                  },
                ].map((st, i) => {
                  const Icon = st.icon;
                  return (
                    <div key={st.step} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{st.title}</p>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{st.desc}</p>
                      </div>
                      {i < 4 && <span className="text-slate-300 font-bold self-center">›</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Filters & Grid Section */}
          <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 w-full">
            {/* Filter Bar (matches Screenshot 1) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                <span className="text-xs font-extrabold text-slate-400 mr-2 flex items-center gap-1 shrink-0">
                  Filter:
                </span>
                {[
                  { id: 'all', label: 'All Categories' },
                  { id: 'smartphones', label: 'Smartphones' },
                  { id: 'cameras', label: 'Cameras & Optics' },
                  { id: 'laptops', label: 'Laptops' },
                  { id: 'tablets', label: 'Tablets' },
                  { id: 'smartwatches', label: 'Smartwatches' },
                ].map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Condition Pills */}
              <div className="flex items-center gap-1.5 self-start lg:self-center overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'All Conditions' },
                  { id: 'superb', label: 'Superb' },
                  { id: 'good', label: 'Good' },
                  { id: 'fair', label: 'Fair' },
                ].map((cond) => {
                  const isActive = activeCondition === cond.id;
                  return (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setActiveCondition(cond.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cond.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-500">
                {filteredProducts.length} devices found
              </p>
            </div>

            {/* Product Cards Grid (matches Screenshot 2) */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
                <Search size={36} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">No matching devices found</h3>
                <p className="text-xs text-slate-500 mb-4">Try adjusting your category or condition filter, or clear your search term.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('all');
                    setActiveCondition('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
                    >
                      <div className="p-5">
                        {/* Top Badges & Image Showcase (matches Screenshot 2) */}
                        <div className="relative aspect-[4/3] rounded-2xl bg-slate-50/70 border border-slate-100 p-4 mb-4 flex items-center justify-center overflow-hidden">
                          {/* Condition Badge on Top Left */}
                          <div className="absolute top-3 left-3 z-10">
                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border ${conditionBadgeColor(product.condition)}`}>
                              {product.condition}
                            </span>
                          </div>

                          {/* Discount on Top Right */}
                          <div className="absolute top-3 right-3 z-10">
                            <span className="text-[11px] font-black text-emerald-600 tracking-tight">
                              {product.discount}% OFF
                            </span>
                          </div>

                          {/* Clean Cutout Product Image */}
                          <img
                            src={product.image}
                            alt={product.model}
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/assets/images/categories/dslr.png';
                            }}
                          />
                        </div>

                        {/* Brand Name */}
                        <p className="text-xs font-bold text-slate-400 mb-0.5">
                          {product.brand}
                        </p>

                        {/* Model Title */}
                        <h3 className="text-base font-extrabold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                          {product.model}
                        </h3>

                        {/* Variant / Storage Specs */}
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {product.storage} · {product.color}
                        </p>

                        {/* Battery & Warranty Line (matches Screenshot 2) */}
                        <div className="flex items-center gap-3 mt-3 text-xs text-slate-600 font-medium">
                          <span className="inline-flex items-center gap-1">
                            <BatteryCharging size={13} className="text-emerald-600" />
                            <span>
                              {typeof product.batteryHealth === 'number'
                                ? `Battery: ${product.batteryHealth}%`
                                : product.batteryHealth}
                            </span>
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center gap-1">
                            <ShieldCheck size={13} className="text-blue-600" />
                            <span>{product.warranty}</span>
                          </span>
                        </div>

                        {/* Price Row */}
                        <div className="flex items-baseline gap-2 mt-4 pt-3 border-t border-slate-100">
                          <span className="text-xl font-black text-slate-900">
                            ₹{product.sellingPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* View Details CTA Button (matches Screenshot 2) */}
                      <div className="p-5 pt-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProduct(product);
                          }}
                          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      <CustomerAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setFullName(user.name);
          setPhone(user.phone);
          setShowAuthModal(false);
          setCurrentView('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        title="Login Required to Buy Device"
        subtitle="Please verify your mobile number to complete your refurbished camera order."
      />

      <UnserviceableAreaModal
        isOpen={showUnserviceableModal}
        pincode={pincode}
        onClose={() => setShowUnserviceableModal(false)}
        onGoHome={() => {
          setShowUnserviceableModal(false);
          setCurrentView('list');
        }}
      />

      <CustomerFooter />
    </main>
  );
}