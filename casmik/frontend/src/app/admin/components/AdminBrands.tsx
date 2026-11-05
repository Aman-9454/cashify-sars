'use client';
import React, { useState } from 'react';
import { brands, categories } from '@/lib/casmikData';
import { Plus, Edit2, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import ImageUploadField from '@/components/ui/ImageUploadField';

const getInitialBrands = (): typeof brands => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_brands_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return brands;
};

export default function AdminBrands() {
  const [brandList, setBrandList] = useState(getInitialBrands);
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<typeof brands[0] | null>(null);
  const [form, setForm] = useState({ name: '', categoryId: 'cat-smartphone', logo: '' });

  const filtered = brandList.filter(b =>
    b.name.toLowerCase().includes(query.toLowerCase()) &&
    (filterCat === 'all' || b.categoryId === filterCat)
  );

  const handleToggle = (id: string) => {
    setBrandList(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, active: !b.active } : b);
      if (typeof window !== 'undefined') localStorage.setItem('casmik_brands_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const handleEdit = (brand: typeof brands[0]) => {
    setEditingBrand(brand);
    setForm({ name: brand.name, categoryId: brand.categoryId, logo: brand.logo });
    setShowModal(true);
  };

  const handleSave = () => {
    let updated: typeof brands;
    if (editingBrand) {
      updated = brandList.map(b => b.id === editingBrand.id ? { ...b, ...form } : b);
    } else {
      updated = [...brandList, { ...form, id: `brand-${Date.now()}`, slug: form.name.toLowerCase(), alt: form.name, modelCount: 0, active: true }];
    }
    setBrandList(updated);
    if (typeof window !== 'undefined') localStorage.setItem('casmik_brands_v1', JSON.stringify(updated));
    setShowModal(false);
    setEditingBrand(null);
    setForm({ name: '', categoryId: 'cat-smartphone', logo: '' });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900">Brands</h2>
          <p className="text-sm text-gray-500">{brandList.length} brands across {categories.length} categories</p>
        </div>
        <button onClick={() => { setEditingBrand(null); setForm({ name: '', categoryId: 'cat-smartphone', logo: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Plus size={16} /> Add Brand
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search brands..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Brand Grid - like reference screenshot */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {filtered.map((brand) => (
          <div key={brand.id} className={`bg-white rounded-2xl border-2 p-3 flex flex-col items-center gap-2 transition-all hover:shadow-md group ${brand.active ? 'border-gray-100' : 'border-gray-200 opacity-50'}`}>
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={brand.logo} alt={brand.alt} className="max-w-full max-h-full object-contain" />
            </div>
            <span className="text-xs font-bold text-gray-800 text-center leading-tight">{brand.name}</span>
            <span className="text-xs text-gray-400">{brand.modelCount} models</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(brand)} className="p-1 rounded-lg bg-gray-100 hover:bg-primary hover:text-white transition-colors">
                <Edit2 size={10} />
              </button>
              <button onClick={() => handleToggle(brand.id)} className={`p-1 rounded-lg transition-colors ${brand.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {brand.active ? <ToggleRight size={10} /> : <ToggleLeft size={10} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <h3 className="text-lg font-black text-gray-900 mb-5">{editingBrand ? 'Edit Brand' : 'Add New Brand'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Brand Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Apple"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Category *</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <ImageUploadField
                label="Logo URL"
                value={form.logo}
                onChange={url => setForm(f => ({ ...f, logo: url }))}
                placeholder="https://... or click Upload"
                folder="brands"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={!form.name} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50">
                {editingBrand ? 'Save Changes' : 'Add Brand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
