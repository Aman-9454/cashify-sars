'use client';
import React, { useState } from 'react';
import { deviceModels, brands, categories } from '@/lib/casmikData';
import { Search, Plus, Edit2, Trash2, Package, ChevronDown } from 'lucide-react';
import ImageUploadField from '@/components/ui/ImageUploadField';

const getInitialModels = (): typeof deviceModels => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_models_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return deviceModels;
};

const defaultForm = {
  name: '',
  categoryId: categories[0]?.id || 'cat-smartphone',
  brandId: brands[0]?.id || 'apple',
  basePrice: 50000,
  storageOptions: '128GB, 256GB, 512GB',
  image: '',
};

export default function AdminModels() {
  const [modelsList, setModelsList] = useState(getInitialModels);
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModel, setEditModel] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const fetchModelsFromApi = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/models');
      const data = await res.json();
      if (data.success && Array.isArray(data.models) && data.models.length > 0) {
        setModelsList(data.models);
        if (typeof window !== 'undefined') {
          localStorage.setItem('casmik_models_v1', JSON.stringify(data.models));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch models from API:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchModelsFromApi();
  }, []);

  const filtered = modelsList.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchBrand = filterBrand === 'all' || m.brandId === filterBrand;
    const matchCat = filterCategory === 'all' || m.categoryId === filterCategory;
    return matchSearch && matchBrand && matchCat;
  });

  const getBrandName = (brandId: string) => brands.find(b => b.id === brandId)?.name || brandId;
  const getCategoryName = (catId: string) => categories.find(c => c.id === catId)?.name || catId;

  const handleOpenAdd = () => {
    setEditModel(null);
    setForm(defaultForm);
    setShowAddModal(true);
  };

  const handleOpenEdit = (m: typeof deviceModels[0]) => {
    setEditModel(m.id);
    setForm({
      name: m.name,
      categoryId: m.categoryId,
      brandId: m.brandId,
      basePrice: m.basePrice,
      storageOptions: (m.storages || []).join(', '),
      image: m.image,
    });
  };

  const handleSave = async () => {
    const storagesArr = form.storageOptions.split(',').map(s => s.trim()).filter(Boolean);
    let updated: typeof deviceModels;

    if (editModel) {
      const targetModel = modelsList.find(m => m.id === editModel);
      const updatedModel = {
        ...targetModel,
        id: editModel,
        name: form.name,
        categoryId: form.categoryId,
        brandId: form.brandId,
        basePrice: Number(form.basePrice) || 0,
        storages: storagesArr.length ? storagesArr : (targetModel?.storages || ['128GB']),
        image: form.image,
      };
      updated = modelsList.map(m => m.id === editModel ? updatedModel as any : m);

      // Live API Update
      fetch('/api/models', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedModel),
      }).catch(err => console.error('Failed to update model in DB:', err));
    } else {
      const newModel = {
        id: `mod-${Date.now()}`,
        brandId: form.brandId,
        categoryId: form.categoryId,
        name: form.name,
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        basePrice: Number(form.basePrice) || 0,
        image: form.image || '/assets/images/phones/generic.png',
        alt: form.name,
        storages: storagesArr.length ? storagesArr : ['128GB', '256GB'],
        colors: ['Default'],
        active: true,
        popular: false,
        specs: {},
      };
      updated = [newModel as any, ...modelsList];

      // Live API Create
      fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModel),
      }).catch(err => console.error('Failed to create model in DB:', err));
    }

    setModelsList(updated);
    if (typeof window !== 'undefined') localStorage.setItem('casmik_models_v1', JSON.stringify(updated));
    setShowAddModal(false);
    setEditModel(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      const updated = modelsList.filter(m => m.id !== id);
      setModelsList(updated);
      if (typeof window !== 'undefined') localStorage.setItem('casmik_models_v1', JSON.stringify(updated));

      // Live API Delete
      fetch(`/api/models?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch(err => console.error('Failed to delete model from DB:', err));
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">Device Models</h2>
          <p className="text-sm text-gray-500">{modelsList.length} models across {brands.length} brands</p>
        </div>
        <button onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 cursor-pointer">
          <Plus size={16} /> Add Model
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search models..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="relative">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
            <option value="all">All Brands</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <span className="text-xs text-gray-500 self-center">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Model</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Brand</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Base Price</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Storage</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(model => (
                <tr key={model.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {model.image ? (
                          <img src={model.image} alt={model.alt} className="w-full h-full object-contain" />
                        ) : (
                          <Package size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{model.name}</p>
                        <p className="text-xs text-gray-400">{model.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getCategoryName(model.categoryId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getBrandName(model.brandId)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">₹{model.basePrice.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {model.storages.slice(0, 2).map(s => (
                        <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg font-medium">{s}</span>
                      ))}
                      {model.storages.length > 2 && <span className="text-xs text-gray-400">+{model.storages.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${model.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {model.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenEdit(model)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer" title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(model.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No models found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editModel) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-gray-900 mb-4">{editModel ? 'Edit Model' : 'Add New Model'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Model Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. iPhone 16 Pro Max"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Brand</label>
                  <select
                    value={form.brandId}
                    onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Base Price (₹)</label>
                <input
                  type="number"
                  value={form.basePrice}
                  onChange={e => setForm(f => ({ ...f, basePrice: Number(e.target.value) || 0 }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 75000"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Storage Options (comma separated)</label>
                <input
                  value={form.storageOptions}
                  onChange={e => setForm(f => ({ ...f, storageOptions: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="128GB, 256GB, 512GB"
                />
              </div>
              <ImageUploadField
                label="Image URL"
                value={form.image}
                onChange={url => setForm(f => ({ ...f, image: url }))}
                placeholder="https://... or click Upload"
                folder="models"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setEditModel(null); }}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!form.name}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-primary/20"
              >
                {editModel ? 'Save Changes' : 'Add Model'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
