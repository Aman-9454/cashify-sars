'use client';
import React, { useState } from 'react';
import { categories } from '@/lib/casmikData';
import { Plus, Edit2, ToggleLeft, ToggleRight, Search, Package } from 'lucide-react';
import ImageUploadField from '@/components/ui/ImageUploadField';

const getInitialCats = (): typeof categories => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_categories_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return categories;
};

export default function AdminCategories() {
  const [cats, setCats] = useState(getInitialCats);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<typeof categories[0] | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '📱', image: '' });

  const filtered = cats.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  const handleToggle = (id: string) => {
    setCats(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, active: !c.active } : c);
      if (typeof window !== 'undefined') localStorage.setItem('casmik_categories_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const handleEdit = (cat: typeof categories[0]) => {
    setEditingCat(cat);
    setForm({ name: cat.name, description: cat.description, icon: cat.icon, image: cat.image });
    setShowModal(true);
  };

  const handleSave = () => {
    let updated: typeof categories;
    if (editingCat) {
      updated = cats.map(c => c.id === editingCat.id ? { ...c, ...form } : c);
    } else {
      const newCat = { ...form, id: `cat-${Date.now()}`, slug: form.name.toLowerCase().replace(/\s+/g, '-'), alt: form.name, brandCount: 0, modelCount: 0, active: true, sortOrder: cats.length + 1 };
      updated = [...cats, newCat];
    }
    setCats(updated);
    if (typeof window !== 'undefined') localStorage.setItem('casmik_categories_v1', JSON.stringify(updated));
    setShowModal(false);
    setEditingCat(null);
    setForm({ name: '', description: '', icon: '📱', image: '' });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900">Categories</h2>
          <p className="text-sm text-gray-500">{cats.length} categories · {cats.filter(c => c.active).length} active</p>
        </div>
        <button onClick={() => { setEditingCat(null); setForm({ name: '', description: '', icon: '📱', image: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search categories..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white" />
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((cat) => (
          <div key={cat.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${cat.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
            <div className="relative h-32 overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-3">
              <img src={cat.image} alt={cat.alt} className="max-w-full max-h-full object-contain filter drop-shadow-sm" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-3 flex items-center gap-2">
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-white font-bold text-sm">{cat.name}</span>
              </div>
              <div className="absolute top-2 right-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cat.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {cat.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-500 mb-2 line-clamp-1">{cat.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><Package size={11} />{cat.brandCount} brands</span>
                <span>{cat.modelCount} models</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(cat)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => handleToggle(cat.id)} className={`p-1.5 rounded-lg border transition-colors ${cat.active ? 'border-green-200 text-green-600 hover:bg-green-50' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                  {cat.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <h3 className="text-lg font-black text-gray-900 mb-5">{editingCat ? 'Edit Category' : 'Add New Category'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Category Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Smartphones"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Icon (Emoji)</label>
                <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="📱"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description..."
                  rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
              </div>
              <ImageUploadField
                label="Image URL"
                value={form.image}
                onChange={url => setForm(f => ({ ...f, image: url }))}
                placeholder="/assets/images/categories/... or click Upload"
                folder="categories"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={!form.name} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                {editingCat ? 'Save Changes' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
