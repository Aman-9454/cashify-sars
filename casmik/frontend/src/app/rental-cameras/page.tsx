'use client';
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Camera,
  Video,
  Film,
  Star,
  ShieldCheck,
  Truck,
  CheckCircle,
  Package,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CreditCard,
  Check,
  X,
  ChevronRight,
  Calendar,
  Layers,
  Clock,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  MapPin,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';
import {
  RentalCamera,
  RentalBrand,
  RentalCategory,
  getRentalCameras,
  calculateRentalPrice,
} from '@/lib/rentalCatalog';
import { saveRentalOrder } from '@/lib/rentalOrders';
import { getCurrentUser } from '@/lib/auth';
import CustomerAuthModal from '@/components/CustomerAuthModal';
import UnserviceableAreaModal from '@/components/UnserviceableAreaModal';

function RentalCamerasContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const [cameras, setCameras] = useState<RentalCamera[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeBrand, setActiveBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'rating'>('recommended');

  // Views: 'list' | 'details' | 'checkout' | 'confirmed'
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'checkout' | 'confirmed'>('list');
  const [selectedCamera, setSelectedCamera] = useState<RentalCamera | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  // Rental Duration & Dates State
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState(tomorrowStr);
  const [rentalDays, setRentalDays] = useState(3);

  // Checkout Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('');
  const [shootType, setShootType] = useState('Wedding / Event');
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'doorstep' | 'store_pickup'>('doorstep');
  const [paymentMethod, setPaymentMethod] = useState<'COD'>('COD');
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUnserviceableModal, setShowUnserviceableModal] = useState(false);

  // Load catalog & pre-fill logged in user
  useEffect(() => {
    const loaded = getRentalCameras();
    setCameras(loaded);

    // If URL has ?id=..., open that camera details view directly
    if (initialId) {
      const match = loaded.find((c) => c.id === initialId || c.modelId === initialId);
      if (match) {
        setSelectedCamera(match);
        setCurrentView('details');
      }
    }

    const usr = getCurrentUser();
    if (usr) {
      if (usr.name) setFullName(usr.name);
      if (usr.phone) setPhone(usr.phone);
      if (usr.email) setEmail(usr.email);
    }

    const handleCatalogUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<RentalCamera[]>;
      const fresh = customEvent.detail || getRentalCameras();
      setCameras(fresh);
      setSelectedCamera((prev) => {
        if (!prev) return null;
        return fresh.find((c) => c.id === prev.id) || prev;
      });
    };

    window.addEventListener('casmik_rental_catalog_updated', handleCatalogUpdate);
    return () => window.removeEventListener('casmik_rental_catalog_updated', handleCatalogUpdate);
  }, [initialId]);

  // Calculate End Date from Start Date + rentalDays
  const calculatedEndDate = useMemo(() => {
    if (!startDate) return '';
    try {
      const s = new Date(startDate);
      s.setDate(s.getDate() + rentalDays);
      return s.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }, [startDate, rentalDays]);

  // Price Calculation breakdown
  const priceMath = useMemo(() => {
    if (!selectedCamera) {
      return calculateRentalPrice(0, rentalDays, 0);
    }
    return calculateRentalPrice(selectedCamera.dailyPrice, rentalDays, selectedCamera.securityDeposit);
  }, [selectedCamera, rentalDays]);

  // Filter & Sort Cameras
  const filteredCameras = useMemo(() => {
    let list = cameras.filter((c) => {
      const matchCat = activeCategory === 'all' || c.category.toLowerCase() === activeCategory.toLowerCase();
      const matchBrand = activeBrand === 'all' || c.brand.toLowerCase() === activeBrand.toLowerCase();
      const matchSearch =
        searchQuery.trim() === '' ||
        c.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sensor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.specs.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchBrand && matchSearch;
    });

    if (sortBy === 'price_low') {
      list.sort((a, b) => a.dailyPrice - b.dailyPrice);
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => b.dailyPrice - a.dailyPrice);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    return list;
  }, [cameras, activeCategory, activeBrand, searchQuery, sortBy]);

  const handleSelectCamera = (camera: RentalCamera) => {
    setSelectedCamera(camera);
    setActiveGalleryIndex(0);
    setCurrentView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToCheckout = () => {
    if (!getCurrentUser()) {
      setShowAuthModal(true);
      return;
    }
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceRentalOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getCurrentUser()) {
      setShowAuthModal(true);
      return;
    }
    if (!selectedCamera) return;

    if (!fullName.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
      alert('Please fill in your name, phone number, delivery address, and pincode.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check serviceable PIN code
      const pinRes = await fetch(`/api/pincodes?pincode=${encodeURIComponent(pincode.trim())}`);
      const pinData = await pinRes.json();
      if (pinData.success && pinData.serviceable === false) {
        const randomOrderNo = `CAM-RNT-${Math.floor(100000 + Math.random() * 900000)}`;
        const unserviceableOrder = {
          id: randomOrderNo,
          orderNumber: randomOrderNo,
          type: 'rent',
          status: 'unserviceable',
          customerName: fullName.trim(),
          customerPhone: phone.trim(),
          customerEmail: email.trim(),
          customerAddress: address.trim(),
          city: city.trim(),
          pinCode: pincode.trim(),
          deviceName: selectedCamera.model,
          quotedPrice: priceMath.grandTotal,
          finalPrice: priceMath.grandTotal,
          paymentStatus: 'pending',
          notes: `Unserviceable Area Rental Request for ${selectedCamera.brand} ${selectedCamera.model}. PIN: ${pincode.trim()}`,
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

        setIsSubmitting(false);
        setShowUnserviceableModal(true);
        return;
      }

      const newOrder = saveRentalOrder({
        camera: selectedCamera,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim(),
        customerAddress: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        rentalDays,
        startDate,
        endDate: calculatedEndDate,
        shootType,
        idProofType,
        idProofNumber: idProofNumber.trim(),
        deliveryMethod,
        paymentMethod,
        dailyRate: selectedCamera.dailyPrice,
        discountAmount: priceMath.discountAmount,
        rentalSubtotal: priceMath.rentalSubtotal,
        securityDeposit: selectedCamera.securityDeposit,
        grandTotal: priceMath.grandTotal,
      });

      setConfirmedOrderId(newOrder.orderNumber);
      setCurrentView('confirmed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to create rental order:', err);
      alert('Something went wrong placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/60 flex flex-col w-full max-w-full overflow-x-hidden">
      <CustomerHeader />

      {/* ─────────────────────────────────────────────────────────────
          VIEW 1: ORDER CONFIRMED CELEBRATION
      ────────────────────────────────────────────────────────────── */}
      {currentView === 'confirmed' && selectedCamera && (
        <div className="flex-1 max-w-3xl mx-auto px-4 py-12 sm:py-16 w-full">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl text-center">
            <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle size={44} />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-2">
              Rental Booking Confirmed &amp; Dispatched to Admin
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Congratulations! Booking #{confirmedOrderId}
            </h1>
            <p className="text-sm text-slate-500 mb-6 max-w-lg mx-auto">
              Your pro camera rental for{' '}
              <span className="font-bold text-slate-800">{selectedCamera.model}</span> is confirmed
              for <span className="font-bold text-rose-600">{rentalDays} days</span> from{' '}
              <span className="font-semibold text-slate-700">{startDate}</span> to{' '}
              <span className="font-semibold text-slate-700">{calculatedEndDate}</span>.
            </p>

            {/* Order Summary Receipt Box */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-left text-xs space-y-3 mb-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="font-bold text-slate-500">Camera / Gear</span>
                <span className="font-black text-slate-900 text-right">{selectedCamera.model}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Daily Rental Rate</span>
                <span className="font-bold text-slate-800">
                  ₹{selectedCamera.dailyPrice.toLocaleString('en-IN')} / day
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Rental Duration</span>
                <span className="font-bold text-rose-600">
                  {rentalDays} Days ({selectedCamera.dailyPrice} × {rentalDays} = ₹
                  {(selectedCamera.dailyPrice * rentalDays).toLocaleString('en-IN')})
                </span>
              </div>
              {priceMath.discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Multi-Day Discount ({priceMath.discountPercent}%)</span>
                  <span>-₹{priceMath.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Refundable Security Deposit</span>
                <span className="font-semibold text-slate-700">
                  ₹{selectedCamera.securityDeposit.toLocaleString('en-IN')} (Refunded on return)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Delivery Address</span>
                <span className="font-medium text-slate-800 text-right max-w-[240px] truncate">
                  {address}, {city} - {pincode}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Option</span>
                <span className="font-bold text-slate-800">
                  {paymentMethod === 'COD' ? 'Pay on Doorstep Handover' : `${paymentMethod} Online`}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm font-black">
                <span className="text-slate-900">Total Booking Amount</span>
                <span className="text-rose-600 text-base">
                  ₹{priceMath.grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-left text-xs text-amber-900 mb-6 flex gap-3 items-start">
              <ShieldCheck size={20} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Next Steps for Smooth Shoot Day:</p>
                <p className="text-amber-800 mt-0.5">
                  Our dispatch manager will call you at{' '}
                  <span className="font-bold">{phone}</span> to coordinate your sanitized kit delivery
                  slot. Please keep your physical {idProofType} ready for quick doorstep verification.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedCamera(null);
                  setCurrentView('list');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all"
              >
                Browse More Cameras
              </button>
              <Link
                href="/my-orders"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition-all text-center shadow-md shadow-rose-600/20"
              >
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 2: RENTAL CHECKOUT VIEW
      ────────────────────────────────────────────────────────────── */}
      {currentView === 'checkout' && selectedCamera && (
        <div className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full">
          <button
            type="button"
            onClick={() => setCurrentView('details')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Equipment Details &amp; Calculator</span>
          </button>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Complete Your Camera Rental Booking
                </h2>
                <p className="text-xs text-slate-500">
                  Insured sanitized gear with full kit delivered to your doorstep.
                </p>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 w-fit">
                <ShieldCheck size={15} />
                <span>Sanitized &amp; Sensor Tested</span>
              </div>
            </div>

            {/* Selected Camera Header Summary */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6">
              <div className="w-16 h-16 rounded-xl bg-white p-2 border border-slate-200 flex items-center justify-center shrink-0">
                <img
                  src={selectedCamera.image}
                  alt={selectedCamera.model}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/images/categories/dslr.png';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  {selectedCamera.model}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedCamera.category} · {selectedCamera.mount}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    {rentalDays} Days Rental ({startDate} to {calculatedEndDate})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ₹{selectedCamera.dailyPrice} × {rentalDays} Days
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base sm:text-lg font-black text-slate-900">
                  ₹{priceMath.grandTotal.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-500">
                  Inc. ₹{selectedCamera.securityDeposit} deposit
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePlaceRentalOrder} className="space-y-6">
              {/* Customer Contact Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  1. Customer &amp; Shoot Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Adarsh Kumar"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address & Shoot Type */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  2. Delivery &amp; Verification Details
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Doorstep Delivery / Shoot Address *
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House / Studio / Production Office, Street, Area"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City &amp; Pincode *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          className="w-1/2 px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-white"
                          required
                        />
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="Pincode"
                          className="w-1/2 px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Production / Shoot Type
                      </label>
                      <select
                        value={shootType}
                        onChange={(e) => setShootType(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-white"
                      >
                        <option value="Wedding / Event">Wedding / Reception</option>
                        <option value="Ad Film / Commercial">Ad Film / Commercial</option>
                        <option value="Music Video / Short Film">Music Video / Short Film</option>
                        <option value="Travel / Documentary">Travel / Documentary</option>
                        <option value="Fashion / Studio Portfolio">Fashion / Portfolio</option>
                        <option value="Personal / Vacation">Personal / Vacation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Govt ID for KYC Handover
                      </label>
                      <select
                        value={idProofType}
                        onChange={(e) => setIdProofType(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-white"
                      >
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Passport">Passport</option>
                        <option value="Voter ID">Voter ID</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Delivery Method
                      </label>
                      <select
                        value={deliveryMethod}
                        onChange={(e) =>
                          setDeliveryMethod(e.target.value as 'doorstep' | 'store_pickup')
                        }
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-white"
                      >
                        <option value="doorstep">Insured Doorstep Drop &amp; Pickup</option>
                        <option value="store_pickup">Camsik City Hub Self Pickup</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method - COD Only as requested */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span>💳</span> 3. Payment Method
                </h4>
                <div className="p-4 rounded-2xl border-2 border-rose-600 bg-rose-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                      COD
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Pay on Handover (Cash on Delivery)</p>
                      <p className="text-xs text-slate-500">Pay cash or UPI directly when camera gear arrives at your doorstep</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>

              {/* Price Breakdown Final Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Rental Fee ({rentalDays} Days × ₹{selectedCamera.dailyPrice})
                  </span>
                  <span className="font-bold text-slate-900">
                    ₹{priceMath.basePrice.toLocaleString('en-IN')}
                  </span>
                </div>
                {priceMath.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Multi-Day Discount ({priceMath.discountPercent}%)</span>
                    <span>-₹{priceMath.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Refundable Security Deposit</span>
                  <span className="font-bold text-slate-900">
                    ₹{selectedCamera.securityDeposit.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Doorstep Delivery &amp; Return Collection</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black">
                  <span className="text-slate-900">Grand Total Payable</span>
                  <span className="text-rose-600 text-base">
                    ₹{priceMath.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-rose-600/25 transition-all flex items-center justify-center gap-2"
              >
                <span>
                  {isSubmitting
                    ? 'Processing Rental Booking...'
                    : `Confirm & Book Camera Rental (₹${priceMath.grandTotal.toLocaleString('en-IN')})`}
                </span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 3: PRODUCT DETAILS & RENTAL DURATION CALCULATOR
      ────────────────────────────────────────────────────────────── */}
      {currentView === 'details' && selectedCamera && (
        <div className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full">
          {/* Breadcrumb */}
          <button
            type="button"
            onClick={() => setCurrentView('list')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Rental Cameras</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: Images, Specs, Included Kit */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Photo Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm overflow-hidden">
                <div className="relative aspect-[4/3] w-full flex items-center justify-center bg-slate-50 rounded-2xl p-6 mb-4">
                  <img
                    src={selectedCamera.gallery[activeGalleryIndex] || selectedCamera.image}
                    alt={selectedCamera.model}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/images/categories/dslr.png';
                    }}
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                    {selectedCamera.brand} Official Fleet
                  </span>
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    45-Point Calibrated
                  </span>
                </div>

                {/* Thumbnails */}
                {selectedCamera.gallery.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedCamera.gallery.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveGalleryIndex(i)}
                        className={`w-16 h-16 rounded-xl border p-1 bg-white shrink-0 transition-all ${
                          activeGalleryIndex === i
                            ? 'border-rose-600 ring-2 ring-rose-600/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={img}
                          alt="thumb"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/images/categories/dslr.png';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* What's In The Rental Box Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                    <Package size={18} />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      What&apos;s in the Rental Hard Case
                    </h3>
                    <p className="text-xs text-slate-500">
                      Fully equipped shoot-ready package. No hidden accessories needed.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedCamera.includedKit.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-800"
                    >
                      <CheckCircle2 size={15} className="text-rose-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                    <Layers size={18} />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Technical Specifications &amp; Features
                    </h3>
                    <p className="text-xs text-slate-500">
                      Broadcast and cinema grade optical performance
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Sensor</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{selectedCamera.sensor}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Lens Mount</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{selectedCamera.mount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Max Video Res</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{selectedCamera.videoRes}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {selectedCamera.specs}
                </p>

                <div className="space-y-2 text-xs text-slate-700">
                  {selectedCamera.features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Sticky Booking & Price Calculator */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xl">
                {/* Title & Rating */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold uppercase">
                    {selectedCamera.brand} · {selectedCamera.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>{selectedCamera.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({selectedCamera.reviewsCount})</span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 leading-tight">
                  {selectedCamera.model}
                </h1>

                {/* Base Per-Day Price Display */}
                <div className="flex items-baseline gap-2 pb-5 border-b border-slate-100 mb-5">
                  <span className="text-3xl font-black text-rose-600">
                    ₹{selectedCamera.dailyPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">/ day</span>
                  <span className="ml-auto text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Deposit: ₹{selectedCamera.securityDeposit.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* ── INTERACTIVE DURATION & MULTIPLICATION CALCULATOR ── */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                      1. Shoot Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="date"
                        min={tomorrowStr}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        2. Rental Duration (Days)
                      </label>
                      <span className="text-xs font-extrabold text-rose-600">
                        {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'} Total
                      </span>
                    </div>

                    {/* Stepper counter */}
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        type="button"
                        onClick={() => setRentalDays((d) => Math.max(1, d - 1))}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-base transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <div className="flex-1 py-2 text-center bg-slate-50 border border-slate-200 rounded-xl font-black text-lg text-slate-900">
                        {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}
                      </div>
                      <button
                        type="button"
                        onClick={() => setRentalDays((d) => d + 1)}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-base transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Quick Duration Buttons */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { d: 1, label: '1 Day' },
                        { d: 2, label: '2 Days' },
                        { d: 3, label: '3 Days', badge: '10% OFF' },
                        { d: 7, label: '1 Week', badge: '15% OFF' },
                        { d: 14, label: '2 Weeks', badge: '20% OFF' },
                        { d: 30, label: '1 Month', badge: '30% OFF' },
                      ].map((item) => (
                        <button
                          key={item.d}
                          type="button"
                          onClick={() => setRentalDays(item.d)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                            rentalDays === item.d
                              ? 'border-rose-600 bg-rose-50 text-rose-700 ring-2 ring-rose-600/20'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          }`}
                        >
                          <div>{item.label}</div>
                          {item.badge && (
                            <span className="text-[9px] font-black text-emerald-600 block leading-tight">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── PRICE MULTIPLICATION BREAKDOWN (USER REQUEST) ── */}
                  <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2 text-xs mt-4">
                    <p className="font-black text-rose-950 uppercase tracking-wider text-[11px] pb-1 border-b border-rose-200/60">
                      Live Rental Price Breakdown
                    </p>
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Per-Day Camera Price</span>
                      <span className="font-bold">
                        ₹{selectedCamera.dailyPrice.toLocaleString('en-IN')} / day
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Multiplication (Rate × Days)</span>
                      <span className="font-extrabold text-slate-900">
                        ₹{selectedCamera.dailyPrice} × {rentalDays} = ₹
                        {priceMath.basePrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {priceMath.discountAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-700 font-bold">
                        <span>Multi-Day Bonus Discount ({priceMath.discountPercent}%)</span>
                        <span>-₹{priceMath.discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-slate-700">
                      <span>Refundable Security Deposit</span>
                      <span className="font-bold text-slate-900">
                        +₹{selectedCamera.securityDeposit.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-rose-200 text-sm font-black text-slate-900">
                      <span>Total Amount Payable</span>
                      <span className="text-rose-600 text-lg">
                        ₹{priceMath.grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Proceed CTA */}
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <span>Proceed to Rental Checkout</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Trust Badges Strip */}
              <div className="rounded-2xl bg-white border border-slate-200/80 p-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>Doorstep delivery &amp; free shoot pickup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>100% genuine calibrated camera body &amp; OEM battery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>Full damage &amp; transit insurance included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 4: ALL RENTAL CAMERAS LISTING (BUY DEVICES UI STYLE)
      ────────────────────────────────────────────────────────────── */}
      {currentView === 'list' && (
        <div className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-10 w-full">
          {/* Header Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 text-white p-6 sm:p-10 mb-8 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-wider mb-3">
                <Camera size={13} className="text-rose-400" />
                Camsik Professional Equipment Fleet
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
                Rent Cinema Cameras &amp; Pro Lenses
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Rent Sony FX3, FX6, Canon R5, Nikon Z8, RED Komodo, cinema prime lenses &amp; DJI gimbals.
                Flexible daily rates, sanitized kits with 2 batteries, charger, card &amp; rugged case.
              </p>

              {/* Quick Perks */}
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Free Doorstep Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Calibrated Sensors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Discounts on 3+ Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 mb-8 shadow-sm space-y-4">
            {/* Top row: search & sort */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cameras, cinema bodies, lenses (e.g. Sony FX3, Canon R5, 24-70 GM, RED)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-2xl focus:outline-none focus:border-rose-500 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3.5 py-2.5 text-xs font-bold rounded-2xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-rose-500"
                >
                  <option value="recommended">Most Popular</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {[
                { id: 'all', label: 'All Rental Gear' },
                { id: 'Cinema Cameras', label: 'Cinema Cameras' },
                { id: 'Mirrorless', label: 'Mirrorless' },
                { id: 'Cinema Lenses', label: 'Cinema Lenses' },
                { id: 'Gimbals & Rigs', label: 'Gimbals & Rigs' },
                { id: 'Action & Drones', label: 'Action & Drones' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeCategory === cat.id
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Brand filter chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 scrollbar-hide">
              <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Brand:</span>
              {['all', 'Sony', 'Canon', 'Nikon', 'RED', 'Blackmagic', 'Fujifilm', 'DJI', 'Panasonic'].map(
                (brand) => (
                  <button
                    key={brand}
                    onClick={() => setActiveBrand(brand)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0 ${
                      activeBrand === brand
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                    }`}
                  >
                    {brand === 'all' ? 'All Brands' : brand}
                  </button>
                )
              )}
            </div>
          </div>

          {/* ── CAMERAS LISTING GRID ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCameras.map((cam) => (
              <div
                key={cam.id}
                onClick={() => handleSelectCamera(cam)}
                className="group cursor-pointer bg-white rounded-3xl border border-slate-200/90 hover:border-rose-500/70 p-5 shadow-sm hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1"
              >
                <div>
                  {/* Photo area */}
                  <div className="relative aspect-[4/3] rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-center overflow-hidden mb-4 group-hover:bg-rose-50/20 transition-colors">
                    <img
                      src={cam.image}
                      alt={cam.model}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/images/categories/dslr.png';
                      }}
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200 text-[10px] font-black uppercase text-slate-800">
                      {cam.brand}
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                      Available
                    </span>
                  </div>

                  {/* Rating & Category */}
                  <div className="flex items-center justify-between gap-1 mb-1 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500">{cam.category}</span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span>{cam.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Model Title */}
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1 mb-1">
                    {cam.model}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-3">{cam.sensor}</p>

                  {/* Included Kit Pills */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1 mb-4">
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 size={12} className="text-rose-600 shrink-0" />
                      <span className="truncate">{cam.includedKit[0] || 'Complete Body Kit'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 size={12} className="text-rose-600 shrink-0" />
                      <span className="truncate">{cam.includedKit[1] || 'Dual Charger & Accessories'}</span>
                    </div>
                  </div>
                </div>

                {/* Price & CTA Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-rose-600">
                        ₹{cam.dailyPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">/day</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Dep: ₹{cam.securityDeposit.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCamera(cam);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-extrabold text-xs flex items-center gap-1 transition-all group-hover:bg-rose-600"
                  >
                    <span>Rent Now</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCameras.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <Camera size={44} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800">No rental cameras found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                We couldn&apos;t find any rental equipment matching &ldquo;{searchQuery}&rdquo;. Try clearing your search or category filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setActiveBrand('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
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
        title="Login Required to Rent Camera"
        subtitle="Please verify your mobile number to reserve professional photography equipment."
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

export default function RentalCamerasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RentalCamerasContent />
    </Suspense>
  );
}
