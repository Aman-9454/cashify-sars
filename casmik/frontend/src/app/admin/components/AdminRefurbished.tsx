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
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle,
  X,
  BatteryCharging,
  ShieldCheck,
} from 'lucide-react';
import {
  RefurbishedProduct,
  ProductCategory,
  ProductCondition,
  getRefurbishedProducts,
  saveRefurbishedProducts,
  resetRefurbishedProducts,
  getModelKey,
} from '@/lib/refurbishedCatalog';

const conditionColors: Record<ProductCondition, string> = {
  Superb: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Good: 'bg-blue-50 text-blue-700 border border-blue-200',
  Fair: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const statusColors = {
  available: 'bg-emerald-50 text-emerald-700',
  sold: 'bg-gray-100 text-gray-500',
  reserved: 'bg-orange-50 text-orange-700',
};

export default function AdminRefurbished() {
  const [search, setSearch] = useState('');
  const [filterCondition, setFilterCondition] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterModel, setFilterModel] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<RefurbishedProduct | null>(null);
  const [devices, setDevices] = useState<RefurbishedProduct[]>([]);

  // Form fields for Add / Edit
  const [formModel, setFormModel] = useState('');
  const [formModelId, setFormModelId] = useState('');
  const [formBrand, setFormBrand] = useState('Apple');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Smartphones');
  const [formCondition, setFormCondition] = useState<ProductCondition>('Superb');
  const [formConditionNote, setFormConditionNote] = useState('Like new, minimal marks');
  const [formStorage, setFormStorage] = useState('128GB');
  const [formColor, setFormColor] = useState('Natural Titanium');
  const [formSellingPrice, setFormSellingPrice] = useState('58999');
  const [formOriginalPrice, setFormOriginalPrice] = useState('134900');
  const [formBattery, setFormBattery] = useState('98');
  const [formWarranty, setFormWarranty] = useState('12 months');
  const [formStock, setFormStock] = useState('3');
  const [formImage, setFormImage] = useState('/assets/images/refurbished/iphone-15-pro.png');
  const [formSpecs, setFormSpecs] = useState('');
  const [formStatus, setFormStatus] = useState<'available' | 'reserved' | 'sold'>('available');

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/refurbished');
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        setDevices(data.products);
        saveRefurbishedProducts(data.products);
        return;
      }
    } catch (e) {
      console.warn('Error fetching refurbished from API:', e);
    }
    setDevices(getRefurbishedProducts());
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const openAddModal = () => {
    setEditProduct(null);
    setFormModel('');
    setFormModelId('');
    setFormBrand('Apple');
    setFormCategory('Smartphones');
    setFormCondition('Superb');
    setFormConditionNote('Like new, minimal marks');
    setFormStorage('128GB');
    setFormColor('Natural Titanium');
    setFormSellingPrice('58999');
    setFormOriginalPrice('134900');
    setFormBattery('98');
    setFormWarranty('12 months');
    setFormStock('3');
    setFormImage('/assets/images/refurbished/iphone-15-pro.png');
    setFormSpecs('Certified authentic, 45-point testing passed');
    setFormStatus('available');
    setShowAddModal(true);
  };

  const openAddVariantModal = (source: RefurbishedProduct) => {
    setEditProduct(null);
    setFormModel(source.model);
    setFormModelId(getModelKey(source));
    setFormBrand(source.brand);
    setFormCategory(source.category);

    let nextCond: ProductCondition = 'Good';
    let nextNote = 'Flawless display, minor back scuffs';
    let priceMult = 0.88;
    let nextBattery = '92';
    let nextWarranty = '12 months';

    if (source.condition === 'Superb') {
      nextCond = 'Good';
      nextNote = 'Flawless display, light body marks';
      priceMult = 0.88;
      nextBattery = '92';
    } else if (source.condition === 'Good') {
      nextCond = 'Fair';
      nextNote = 'Visible exterior scuffs, 100% functional';
      priceMult = 0.80;
      nextBattery = '85';
      nextWarranty = '6 months';
    } else {
      nextCond = 'Superb';
      nextNote = 'Like new, minimal marks';
      priceMult = 1.15;
      nextBattery = '98';
    }

    setFormCondition(nextCond);
    setFormConditionNote(nextNote);
    setFormStorage(source.storage);
    setFormColor(source.color);
    setFormSellingPrice(Math.round(source.sellingPrice * priceMult).toString());
    setFormOriginalPrice(source.originalPrice.toString());
    setFormBattery(nextBattery);
    setFormWarranty(nextWarranty);
    setFormStock('2');
    setFormImage(source.image);
    setFormSpecs(source.specs || '');
    setFormStatus('available');
    setShowAddModal(true);
  };

  const openEditModal = (p: RefurbishedProduct) => {
    setEditProduct(p);
    setFormModel(p.model);
    setFormModelId(p.modelId || getModelKey(p));
    setFormBrand(p.brand);
    setFormCategory(p.category);
    setFormCondition(p.condition);
    setFormConditionNote(p.conditionNote || 'Like new, minimal marks');
    setFormStorage(p.storage);
    setFormColor(p.color);
    setFormSellingPrice(p.sellingPrice.toString());
    setFormOriginalPrice(p.originalPrice.toString());
    setFormBattery(p.batteryHealth.toString());
    setFormWarranty(p.warranty);
    setFormStock(p.stock.toString());
    setFormImage(p.image);
    setFormSpecs(p.specs || '');
    setFormStatus(p.status);
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const sellP = parseInt(formSellingPrice, 10) || 0;
    const origP = parseInt(formOriginalPrice, 10) || sellP;
    const discount = origP > sellP ? Math.round(((origP - sellP) / origP) * 100) : 0;
    const stockQty = parseInt(formStock, 10) || 1;

    let updatedList: RefurbishedProduct[];

    if (editProduct) {
      const updatedItem: RefurbishedProduct = {
        ...editProduct,
        model: formModel,
        brand: formBrand,
        category: formCategory,
        condition: formCondition,
        conditionNote: formConditionNote,
        storage: formStorage,
        color: formColor,
        sellingPrice: sellP,
        originalPrice: origP,
        discount,
        batteryHealth: isNaN(Number(formBattery)) ? formBattery : Number(formBattery),
        warranty: formWarranty,
        stock: stockQty,
        image: formImage,
        gallery: [formImage, ...(editProduct.gallery.filter((g) => g !== formImage).slice(0, 2))],
        specs: formSpecs,
        status: formStatus,
      };

      updatedList = devices.map((item) => (item.id === editProduct.id ? updatedItem : item));

      // Live MongoDB Update
      fetch('/api/refurbished', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      }).catch((err) => console.error('Failed to update product via API:', err));
    } else {
      const computedModelId =
        formModelId && formModelId.trim() !== ''
          ? formModelId.trim().toLowerCase()
          : formModel.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const newProduct: RefurbishedProduct = {
        id: 'ref-' + Date.now(),
        modelId: computedModelId,
        brand: formBrand,
        model: formModel,
        category: formCategory,
        condition: formCondition,
        conditionNote: formConditionNote,
        storage: formStorage,
        color: formColor,
        sellingPrice: sellP,
        originalPrice: origP,
        discount,
        batteryHealth: isNaN(Number(formBattery)) ? formBattery : Number(formBattery),
        warranty: formWarranty,
        rating: 4.9,
        reviews: 50,
        deliveryDays: 2,
        image: formImage,
        gallery: [formImage],
        stock: stockQty,
        status: formStatus,
        specs: formSpecs,
        inspectionReport: {
          display: 'Passed',
          battery: 'Passed',
          camera: 'Passed',
          speakers: 'Passed',
          chargingPort: 'Passed',
          sensor: 'Passed',
        },
      };

      updatedList = [newProduct, ...devices];

      // Live MongoDB Insert
      fetch('/api/refurbished', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      }).catch((err) => console.error('Failed to create product via API:', err));
    }

    setDevices(updatedList);
    saveRefurbishedProducts(updatedList);
    setShowAddModal(false);
    setEditProduct(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this refurbished product?')) {
      // Live MongoDB Delete
      fetch(`/api/refurbished?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch((err) => console.error('Failed to delete product via API:', err));

      const updatedList = devices.filter((x) => x.id !== id);
      setDevices(updatedList);
      saveRefurbishedProducts(updatedList);
    }
  };

  const handleReset = async () => {
    if (confirm('Reset refurbished inventory to official default catalog?')) {
      try {
        const res = await fetch('/api/refurbished', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reset' }),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setDevices(data.products);
          saveRefurbishedProducts(data.products);
          return;
        }
      } catch (err) {
        console.error('Failed to reset via API:', err);
      }
      const resetList = resetRefurbishedProducts();
      setDevices(resetList);
    }
  };

  const uniqueModels = Array.from(
    new Map(
      devices.map((d) => [
        getModelKey(d),
        {
          modelKey: getModelKey(d),
          model: d.model,
          brand: d.brand,
          category: d.category,
          image: d.image,
          specs: d.specs || '',
        },
      ])
    ).values()
  );

  const filtered = devices.filter((d) => {
    const matchSearch =
      d.model.toLowerCase().includes(search.toLowerCase()) ||
      d.brand.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase()) ||
      getModelKey(d).includes(search.toLowerCase());
    const matchCond = filterCondition === 'all' || d.condition.toLowerCase() === filterCondition.toLowerCase();
    const matchCat = filterCategory === 'all' || d.category.toLowerCase() === filterCategory.toLowerCase();
    const matchModel = filterModel === 'all' || getModelKey(d) === filterModel;
    return matchSearch && matchCond && matchCat && matchModel;
  });

  const totalStock = devices.reduce((s, d) => s + d.stock, 0);
  const avgDiscount = devices.length > 0 ? Math.round(devices.reduce((s, d) => s + d.discount, 0) / devices.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold mb-1">
            <Sparkles size={13} />
            LIVE CATALOG STORE SYNC
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Refurbished Devices Catalog</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Manage certified inventory across Smartphones, Cameras, Laptops, Tablets & Wearables
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/buy-refurbished"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
          >
            <span>Live Store Preview</span>
            <ExternalLink size={14} />
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors"
            title="Reset to default seed products"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors"
          >
            <Plus size={16} />
            <span>Add Device</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Listings', value: devices.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Stock Available', value: totalStock + ' units', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Buyer Discount', value: avgDiscount + '%', color: 'text-purple-600', bg: 'bg-purple-50' },
          {
            label: 'Active Listings',
            value: devices.filter((d) => d.status === 'available').length,
            color: 'text-teal-600',
            bg: 'bg-teal-50',
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xl sm:text-2xl font-black text-gray-900">{kpi.value}</p>
            <p className={`text-xs font-bold mt-1 ${kpi.color}`}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search model, brand or specs..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-xs font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
          >
            <option value="all">All Categories</option>
            <option value="Smartphones">Smartphones</option>
            <option value="Cameras">Cameras & Optics</option>
            <option value="Laptops">Laptops</option>
            <option value="Tablets">Tablets</option>
            <option value="Smartwatches">Smartwatches</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-xs font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white max-w-[200px] truncate"
          >
            <option value="all">All Models Family</option>
            {uniqueModels.map((m) => (
              <option key={m.modelKey} value={m.modelKey}>
                {m.brand} {m.model}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-xs font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
          >
            <option value="all">All Conditions</option>
            <option value="Superb">Superb</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Grid of Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((device) => (
          <div
            key={device.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="relative bg-gray-50 h-44 flex items-center justify-center p-3">
                <img src={device.image} alt={device.model} className="h-32 object-contain" />
                <span className={`absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-md ${conditionColors[device.condition]}`}>
                  {device.condition}
                </span>
                <span className="absolute top-3 right-3 text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700">
                  {device.discount}% OFF
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm">{device.model}</h3>
                    <p className="text-xs text-gray-500">
                      {device.brand} · {device.storage} · {device.color}
                    </p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${statusColors[device.status]}`}>
                    {device.status}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-black text-gray-900">₹{device.sellingPrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-400 line-through">₹{device.originalPrice.toLocaleString('en-IN')}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-xs font-black text-gray-900 truncate">
                      {typeof device.batteryHealth === 'number' ? `${device.batteryHealth}%` : device.batteryHealth}
                    </p>
                    <p className="text-[10px] text-gray-400">Health/Diag</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-xs font-black text-gray-900">{device.warranty}</p>
                    <p className="text-[10px] text-gray-400">Warranty</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-xs font-black text-gray-900">{device.stock} units</p>
                    <p className="text-[10px] text-gray-400">In Stock</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-gray-100 flex items-center justify-between mt-2">
              <span className="text-xs font-bold text-gray-500">{device.category}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openAddVariantModal(device)}
                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-extrabold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Add another condition variant for this model"
                >
                  <Plus size={12} />
                  <span>Variant</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(device)}
                  className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                  title="Edit product"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(device.id)}
                  className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                  title="Delete product"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg sm:text-xl font-black text-gray-900">
                {editProduct ? 'Edit Refurbished Device' : 'Add Refurbished Device'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">Model Family & Name</label>
                  {uniqueModels.length > 0 && (
                    <span className="text-[10px] text-emerald-600 font-bold">Quick pick existing to link variants</span>
                  )}
                </div>

                {uniqueModels.length > 0 && !editProduct && (
                  <div className="mb-2">
                    <select
                      value={formModelId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormModelId(val);
                        const match = uniqueModels.find((m) => m.modelKey === val);
                        if (match) {
                          setFormModel(match.model);
                          setFormBrand(match.brand);
                          setFormCategory(match.category);
                          setFormImage(match.image);
                          if (match.specs) setFormSpecs(match.specs);
                        }
                      }}
                      className="w-full border border-emerald-200 bg-emerald-50/40 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mb-1.5"
                    >
                      <option value="">-- Or Select Existing Model to Add Variant --</option>
                      {uniqueModels.map((m) => (
                        <option key={m.modelKey} value={m.modelKey}>
                          {m.brand} {m.model} ({m.modelKey})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <input
                  required
                  value={formModel}
                  onChange={(e) => {
                    setFormModel(e.target.value);
                    if (!formModelId) {
                      setFormModelId(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. iPhone 15 Pro, Sony Alpha A7 IV, MacBook Air M2"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Brand</label>
                  <input
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="Apple, Samsung, Sony..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  >
                    <option value="Smartphones">Smartphones</option>
                    <option value="Cameras">Cameras & Optics</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Smartwatches">Smartwatches</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Condition Grade</label>
                  <select
                    value={formCondition}
                    onChange={(e) => {
                      const cond = e.target.value as ProductCondition;
                      setFormCondition(cond);
                      if (cond === 'Superb') setFormConditionNote('Like new, minimal marks');
                      if (cond === 'Good') setFormConditionNote('Flawless display, minor back scuffs');
                      if (cond === 'Fair') setFormConditionNote('Visible signs of use, 100% functional');
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  >
                    <option value="Superb">Superb (Pristine / Like New)</option>
                    <option value="Good">Good (Lightly Used)</option>
                    <option value="Fair">Fair (Budget / Visible signs)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Condition Note</label>
                  <input
                    value={formConditionNote}
                    onChange={(e) => setFormConditionNote(e.target.value)}
                    placeholder="Like new, minimal marks"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Storage / Variant</label>
                  <input
                    value={formStorage}
                    onChange={(e) => setFormStorage(e.target.value)}
                    placeholder="128GB, Body Only, 256GB SSD"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Color</label>
                  <input
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    placeholder="Natural Titanium, Black"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Selling Price (₹)</label>
                  <input
                    required
                    type="number"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Original MRP Price (₹)</label>
                  <input
                    required
                    type="number"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Battery / Shutter</label>
                  <input
                    value={formBattery}
                    onChange={(e) => setFormBattery(e.target.value)}
                    placeholder="98 or Shutter: 3,420"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Warranty</label>
                  <input
                    value={formWarranty}
                    onChange={(e) => setFormWarranty(e.target.value)}
                    placeholder="12 months"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Stock</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Product Image URL</label>
                <input
                  required
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="/assets/images/refurbished/... or https://..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Quick Image Presets</label>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {[
                    { label: 'iPhone 15 Natural', url: '/assets/images/refurbished/iphone-15-pro.png' },
                    { label: 'iPhone 15 Blue', url: '/assets/images/refurbished/iphone-15-pro-blue.jpg' },
                    { label: 'iPhone 15 Black', url: '/assets/images/refurbished/iphone-15-pro-black.jpg' },
                    { label: 'iPhone 15 White', url: '/assets/images/refurbished/iphone-15-pro-white.jpg' },
                    { label: 'iPhone 14 Purple', url: '/assets/images/refurbished/iphone-14-pro-max.png' },
                    { label: 'iPhone 14 Gold', url: '/assets/images/refurbished/iphone-14-pro-gold.jpg' },
                    { label: 'Galaxy S24 Black', url: '/assets/images/refurbished/galaxy-s24-ultra.png' },
                    { label: 'Galaxy S24 Violet', url: '/assets/images/refurbished/galaxy-s24-violet.jpg' },
                    { label: 'MacBook Air', url: '/assets/images/refurbished/macbook-air-m2.png' },
                    { label: 'MacBook Pro', url: '/assets/images/refurbished/macbook-pro-14.png' },
                    { label: 'Sony A7 Camera', url: '/assets/images/refurbished/sony-a7.jpg' },
                    { label: 'iPad Pro', url: '/assets/images/refurbished/ipad-pro-m2.jpg' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormImage(preset.url)}
                      className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Specs / Features Brief</label>
                <textarea
                  rows={2}
                  value={formSpecs}
                  onChange={(e) => setFormSpecs(e.target.value)}
                  placeholder="Key specs, processor, display, camera details..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditProduct(null);
                  }}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md"
                >
                  {editProduct ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}