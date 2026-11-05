'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Camera,
  Calendar,
  CheckCircle,
  X,
  ShieldCheck,
  Package,
  Layers,
  Clock,
  Phone,
  User,
  CreditCard,
  Truck,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import {
  RentalCamera,
  RentalBrand,
  RentalCategory,
  getRentalCameras,
  saveRentalCameras,
  resetRentalCameras,
} from '@/lib/rentalCatalog';
import { getRentalOrders, updateRentalOrderStatus } from '@/lib/rentalOrders';
import { Order, OrderStatus } from '@/lib/casmikData';

export default function AdminRentalCameras({ initialTab = 'fleet' }: { initialTab?: 'fleet' | 'orders' }) {
  const [activeTab, setActiveTab] = useState<'fleet' | 'orders'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [cameras, setCameras] = useState<RentalCamera[]>([]);
  const [rentalOrders, setRentalOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editCamera, setEditCamera] = useState<RentalCamera | null>(null);

  // Form Fields
  const [formBrand, setFormBrand] = useState<RentalBrand>('Sony');
  const [formModel, setFormModel] = useState('');
  const [formCategory, setFormCategory] = useState<RentalCategory>('Cinema Cameras');
  const [formDailyPrice, setFormDailyPrice] = useState('2899');
  const [formWeeklyPrice, setFormWeeklyPrice] = useState('16999');
  const [formDeposit, setFormDeposit] = useState('8000');
  const [formSensor, setFormSensor] = useState('Full-Frame CMOS');
  const [formMount, setFormMount] = useState('Sony E-Mount');
  const [formVideoRes, setFormVideoRes] = useState('4K 120p 10-Bit');
  const [formStock, setFormStock] = useState('3');
  const [formStatus, setFormStatus] = useState<'available' | 'rented' | 'maintenance'>('available');
  const [formImage, setFormImage] = useState('/assets/images/refurbished/sony-a7.jpg');
  const [formSpecs, setFormSpecs] = useState('');
  const [formKit, setFormKit] = useState(
    '2x Batteries, Dual Fast Charger, 128GB High-Speed Card, Rugged Hard Case'
  );

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadData = () => {
    fetch('/api/rentals')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.cameras)) {
          setCameras(d.cameras);
          saveRentalCameras(d.cameras);
        } else {
          setCameras(getRentalCameras());
        }
      })
      .catch(() => setCameras(getRentalCameras()));

    fetch('/api/orders?type=rent')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.orders)) {
          setRentalOrders(d.orders);
        } else {
          setRentalOrders(getRentalOrders());
        }
      })
      .catch(() => {
        setRentalOrders(getRentalOrders());
      });
  };

  useEffect(() => {
    loadData();

    const handleCatalogUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<RentalCamera[]>;
      if (customEvent.detail) {
        setCameras(customEvent.detail);
      } else {
        loadData();
      }
    };

    const handleOrdersUpdate = () => {
      loadData();
    };

    window.addEventListener('casmik_rental_catalog_updated', handleCatalogUpdate);
    window.addEventListener('casmik_rental_orders_updated', handleOrdersUpdate);
    window.addEventListener('casmik_orders_updated', handleOrdersUpdate);

    return () => {
      window.removeEventListener('casmik_rental_catalog_updated', handleCatalogUpdate);
      window.removeEventListener('casmik_rental_orders_updated', handleOrdersUpdate);
      window.removeEventListener('casmik_orders_updated', handleOrdersUpdate);
    };
  }, []);

  const openAddModal = () => {
    setEditCamera(null);
    setFormBrand('Sony');
    setFormModel('');
    setFormCategory('Cinema Cameras');
    setFormDailyPrice('2499');
    setFormWeeklyPrice('14999');
    setFormDeposit('6000');
    setFormSensor('Full-Frame BSI Sensor');
    setFormMount('Sony E-Mount');
    setFormVideoRes('4K 120p / 10-bit');
    setFormStock('3');
    setFormStatus('available');
    setFormImage('/assets/images/refurbished/sony-a7.jpg');
    setFormSpecs('Professional cinema body with active cooling, dual ISO, 15+ stops dynamic range');
    setFormKit('2x OEM Batteries, Dual Charger, 128GB V90 Memory Card, Rugged Pelican Case');
    setShowModal(true);
  };

  const openEditModal = (cam: RentalCamera) => {
    setEditCamera(cam);
    setFormBrand(cam.brand);
    setFormModel(cam.model);
    setFormCategory(cam.category);
    setFormDailyPrice(cam.dailyPrice.toString());
    setFormWeeklyPrice(cam.weeklyPrice.toString());
    setFormDeposit(cam.securityDeposit.toString());
    setFormSensor(cam.sensor);
    setFormMount(cam.mount);
    setFormVideoRes(cam.videoRes);
    setFormStock(cam.stock.toString());
    setFormStatus(cam.status);
    setFormImage(cam.image);
    setFormSpecs(cam.specs);
    setFormKit(cam.includedKit.join(', '));
    setShowModal(true);
  };

  const handleSaveCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formModel.trim()) {
      alert('Please enter a camera model name.');
      return;
    }

    const kitArray = formKit
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (editCamera) {
      // Edit existing
      const updatedCamera: RentalCamera = {
        ...editCamera,
        brand: formBrand,
        model: formModel,
        category: formCategory,
        dailyPrice: Number(formDailyPrice) || editCamera.dailyPrice,
        weeklyPrice: Number(formWeeklyPrice) || editCamera.weeklyPrice,
        securityDeposit: Number(formDeposit) || editCamera.securityDeposit,
        sensor: formSensor,
        mount: formMount,
        videoRes: formVideoRes,
        stock: Number(formStock) || 1,
        status: formStatus,
        image: formImage,
        specs: formSpecs,
        includedKit: kitArray.length > 0 ? kitArray : editCamera.includedKit,
      };

      const updated = cameras.map((c) => (c.id === editCamera.id ? updatedCamera : c));
      saveRentalCameras(updated);
      setCameras(updated);

      try {
        await fetch('/api/rentals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCamera),
        });
      } catch (err) {
        console.error('Failed to update rental camera in MongoDB:', err);
      }
    } else {
      // Add new camera
      const newId = `rent-${formBrand.toLowerCase()}-${Date.now().toString(36)}`;
      const newCamera: RentalCamera = {
        id: newId,
        modelId: newId,
        brand: formBrand,
        model: formModel,
        category: formCategory,
        dailyPrice: Number(formDailyPrice) || 1999,
        weeklyPrice: Number(formWeeklyPrice) || 11999,
        securityDeposit: Number(formDeposit) || 5000,
        sensor: formSensor,
        mount: formMount,
        videoRes: formVideoRes,
        rating: 5.0,
        reviewsCount: 1,
        image: formImage,
        gallery: [formImage, '/assets/images/categories/dslr.png'],
        includedKit:
          kitArray.length > 0
            ? kitArray
            : ['2x High-Capacity Batteries', 'Dual Charger', '128GB Memory Card', 'Weatherproof Bag'],
        specs: formSpecs || 'Verified 45-point tested cinema/mirrorless equipment',
        features: [
          'Calibrated and sensor-cleaned before every dispatch',
          'Supplied in heavy-duty weatherproof protective flight case',
          'Full-day door-to-door insurance coverage included',
        ],
        stock: Number(formStock) || 2,
        status: formStatus,
        popular: false,
        minDays: 1,
      };
      const updated = [newCamera, ...cameras];
      saveRentalCameras(updated);
      setCameras(updated);

      try {
        await fetch('/api/rentals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCamera),
        });
      } catch (err) {
        console.error('Failed to add rental camera to MongoDB:', err);
      }
    }
    setShowModal(false);
  };

  const handleDeleteCamera = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the rental catalog?`)) {
      const updated = cameras.filter((c) => c.id !== id);
      saveRentalCameras(updated);
      setCameras(updated);

      try {
        await fetch(`/api/rentals?id=${id}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to delete rental camera from MongoDB:', err);
      }
    }
  };

  const handleResetCatalog = () => {
    if (confirm('Reset rental catalog to default 18+ pro cameras & lenses? Any custom additions will be reverted.')) {
      const def = resetRentalCameras();
      setCameras(def);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    updateRentalOrderStatus(orderId, nextStatus);
    setRentalOrders(getRentalOrders());
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  // Filter Cameras
  const filteredCameras = cameras.filter((c) => {
    const matchBrand = filterBrand === 'all' || c.brand.toLowerCase() === filterBrand.toLowerCase();
    const matchCat = filterCategory === 'all' || c.category.toLowerCase() === filterCategory.toLowerCase();
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchSearch =
      search.trim() === '' ||
      c.model.toLowerCase().includes(search.toLowerCase()) ||
      c.brand.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.specs.toLowerCase().includes(search.toLowerCase());
    return matchBrand && matchCat && matchStatus && matchSearch;
  });

  // Stats calculation
  const totalFleetValue = cameras.reduce((acc, c) => acc + c.dailyPrice * c.stock * 30, 0);
  const totalStock = cameras.reduce((acc, c) => acc + c.stock, 0);
  const availableStock = cameras.filter((c) => c.status === 'available').length;
  const activeOrdersCount = rentalOrders.filter(
    (o) => !['completed', 'cancelled', 'rejected'].includes(o.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <Camera size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Camera Rental Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your cinema & mirrorless rental fleet, live bookings, daily rates, and customer orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/rental-cameras"
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink size={14} />
            <span>Open Rental Store</span>
          </Link>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus size={15} />
            <span>Add Rental Camera</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Fleet Units</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900">{totalStock}</h3>
            <span className="text-[11px] font-bold text-slate-500">{cameras.length} Models</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Available to Rent</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-emerald-600">{availableStock}</h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Ready
            </span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Bookings</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-rose-600">{activeOrdersCount}</h3>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
              {rentalOrders.length} Total
            </span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Capacity</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-indigo-600">
              ₹{(totalFleetValue / 100000).toFixed(1)}L
            </h3>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              Estimated
            </span>
          </div>
        </div>
      </div>

      {/* ── TABS: FLEET CATALOG VS RENTAL ORDERS ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('fleet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'fleet'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Camera size={16} />
          <span>Rental Fleet Catalog ({cameras.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Package size={16} />
          <span>Rental Orders &amp; Bookings ({rentalOrders.length})</span>
          {activeOrdersCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-white text-rose-600">
              {activeOrdersCount}
            </span>
          )}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: RENTAL FLEET (CAMERAS LIST)
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rental cameras, brands, lenses, video resolution..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Cinema Cameras">Cinema Cameras</option>
                <option value="Mirrorless">Mirrorless</option>
                <option value="Cinema Lenses">Cinema Lenses</option>
                <option value="Gimbals & Rigs">Gimbals &amp; Rigs</option>
                <option value="Action & Drones">Action &amp; Drones</option>
              </select>

              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
              >
                <option value="all">All Brands</option>
                <option value="Sony">Sony</option>
                <option value="Canon">Canon</option>
                <option value="Nikon">Nikon</option>
                <option value="RED">RED</option>
                <option value="Blackmagic">Blackmagic</option>
                <option value="Fujifilm">Fujifilm</option>
                <option value="DJI">DJI</option>
                <option value="Panasonic">Panasonic</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="rented">Currently Rented</option>
                <option value="maintenance">Maintenance</option>
              </select>

              <button
                onClick={handleResetCatalog}
                title="Reset to default 18+ pro camera models"
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Camera Grid Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Camera / Device</th>
                    <th className="py-3.5 px-4">Category &amp; Mount</th>
                    <th className="py-3.5 px-4">Daily Rate</th>
                    <th className="py-3.5 px-4">Deposit</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCameras.map((cam) => (
                    <tr key={cam.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 p-1.5 border border-slate-200/80 flex items-center justify-center shrink-0">
                            <img
                              src={cam.image}
                              alt={cam.model}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = '/assets/images/categories/dslr.png';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                              {cam.model}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {cam.sensor} · {cam.videoRes}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] mb-0.5">
                          {cam.category}
                        </span>
                        <p className="text-[11px] text-slate-400">{cam.mount}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-extrabold text-slate-900 text-sm">
                          ₹{cam.dailyPrice.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] font-normal text-slate-500">/day</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          ₹{cam.weeklyPrice.toLocaleString('en-IN')} /week
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-700">
                          ₹{cam.securityDeposit.toLocaleString('en-IN')}
                        </span>
                        <p className="text-[10px] text-slate-400">Refundable</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800">{cam.stock} units</span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            cam.status === 'available'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : cam.status === 'rented'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cam.status === 'available'
                                ? 'bg-emerald-500 animate-pulse'
                                : cam.status === 'rented'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {cam.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(cam)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                            title="Edit Camera Details"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCamera(cam.id, cam.model)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
                            title="Delete Camera"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCameras.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        No rental cameras found matching your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: RENTAL ORDERS & BOOKINGS LIST
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Booking ID</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Rented Camera</th>
                    <th className="py-3.5 px-4">Dates &amp; Duration</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rentalOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md text-[11px]">
                          {order.orderNumber}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-extrabold text-slate-900">{order.customerName}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone size={11} className="text-slate-400" />
                          <span>{order.customerPhone}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          {order.city} · {order.pinCode}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{order.deviceName}</p>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {order.deviceBrand}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <Calendar size={13} className="text-rose-600" />
                          <span>{order.pickupDate || 'Immediate'}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {order.deviceStorage || 'Multiple Days'}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-extrabold text-slate-900 text-sm">
                          ₹{order.finalPrice.toLocaleString('en-IN')}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {order.paymentStatus === 'paid' ? 'Paid Online' : 'Pay on Handover'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-rose-500"
                        >
                          <option value="created">Created (New)</option>
                          <option value="accepted">Confirmed</option>
                          <option value="pickup_scheduled">Dispatched</option>
                          <option value="picked_up">Active (Rented)</option>
                          <option value="completed">Returned (Completed)</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye size={13} />
                          <span>View Contract</span>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {rentalOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <Package size={36} className="mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-slate-600">No rental camera orders placed yet.</p>
                        <p className="text-xs text-slate-400 mt-1">
                          When users book cameras on the frontend, their orders will appear here automatically.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ADD / EDIT RENTAL CAMERA
      ────────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {editCamera ? 'Edit Rental Camera' : 'Add New Camera to Rental Fleet'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure daily rental rate, refundable deposit, specifications and included kit.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCamera} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value as RentalBrand)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Sony">Sony</option>
                    <option value="Canon">Canon</option>
                    <option value="Nikon">Nikon</option>
                    <option value="RED">RED</option>
                    <option value="Blackmagic">Blackmagic</option>
                    <option value="Fujifilm">Fujifilm</option>
                    <option value="DJI">DJI</option>
                    <option value="Panasonic">Panasonic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as RentalCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Cinema Cameras">Cinema Cameras</option>
                    <option value="Mirrorless">Mirrorless</option>
                    <option value="Cinema Lenses">Cinema Lenses</option>
                    <option value="Gimbals & Rigs">Gimbals &amp; Rigs</option>
                    <option value="Action & Drones">Action &amp; Drones</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Camera Model Title
                </label>
                <input
                  type="text"
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  placeholder="e.g. Sony FX3 Cinema Line Full-Frame"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daily Rate (₹/day)
                  </label>
                  <input
                    type="number"
                    value={formDailyPrice}
                    onChange={(e) => setFormDailyPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Weekly Rate (₹/wk)
                  </label>
                  <input
                    type="number"
                    value={formWeeklyPrice}
                    onChange={(e) => setFormWeeklyPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={formDeposit}
                    onChange={(e) => setFormDeposit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sensor Spec</label>
                  <input
                    type="text"
                    value={formSensor}
                    onChange={(e) => setFormSensor(e.target.value)}
                    placeholder="e.g. 12.1MP Full-Frame Exmor R"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lens Mount</label>
                  <input
                    type="text"
                    value={formMount}
                    onChange={(e) => setFormMount(e.target.value)}
                    placeholder="e.g. Sony E-Mount / Canon RF"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Video Res</label>
                  <input
                    type="text"
                    value={formVideoRes}
                    onChange={(e) => setFormVideoRes(e.target.value)}
                    placeholder="e.g. 4K 120p 10-Bit"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Availability</label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as 'available' | 'rented' | 'maintenance')
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="available">Available (Ready to Rent)</option>
                    <option value="rented">Currently Rented</option>
                    <option value="maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL / Path</label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  What&apos;s Included in the Rental Kit (comma separated)
                </label>
                <textarea
                  value={formKit}
                  onChange={(e) => setFormKit(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  placeholder="e.g. 2x OEM Batteries, Dual Charger, 128GB V90 Card, Rugged Case, Top Handle"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Overview &amp; Technical Highlights
                </label>
                <textarea
                  value={formSpecs}
                  onChange={(e) => setFormSpecs(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  placeholder="e.g. 15+ stops dynamic range, S-Cinetone, active cooling fan, Dual ISO 800 / 12,800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
                >
                  {editCamera ? 'Update Camera' : 'Add to Rental Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: VIEW RENTAL ORDER CONTRACT
      ────────────────────────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <Package size={18} />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Rental Booking #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-[11px] text-slate-500">Official Equipment Rental Contract</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Rented Camera:</span>
                  <span className="font-extrabold text-slate-900 text-right">
                    {selectedOrder.deviceName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rental Duration:</span>
                  <span className="font-bold text-rose-600">
                    {selectedOrder.deviceStorage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shoot Start Date:</span>
                  <span className="font-medium text-slate-800">{selectedOrder.pickupDate}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                  <span className="text-slate-700">Total Booking Amount:</span>
                  <span className="font-black text-rose-600 text-sm">
                    ₹{selectedOrder.finalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <p className="font-bold text-slate-800">Customer Details</p>
                <p className="text-slate-600">Name: {selectedOrder.customerName}</p>
                <p className="text-slate-600">Phone: {selectedOrder.customerPhone}</p>
                <p className="text-slate-600">Address: {selectedOrder.customerAddress}, {selectedOrder.city} - {selectedOrder.pinCode}</p>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-[11px] text-slate-700 whitespace-pre-line font-mono">
                  {selectedOrder.notes}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500">Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)
                    }
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="created">Created (New)</option>
                    <option value="accepted">Confirmed</option>
                    <option value="pickup_scheduled">Dispatched</option>
                    <option value="picked_up">Active (Rented)</option>
                    <option value="completed">Returned (Completed)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Close Contract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
