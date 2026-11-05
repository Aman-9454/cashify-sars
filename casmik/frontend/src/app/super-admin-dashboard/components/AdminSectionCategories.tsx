'use client';
import React, { useState } from 'react';
import { categories } from '@/lib/casmikData';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search } from 'lucide-react';

export default function AdminSectionCategories() {
  const [search, setSearch] = useState('');
  const [catList, setCatList] = useState(categories);

  const filtered = catList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = (id: string) => {
    setCatList(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Categories', value: catList.length, color: 'text-blue-600' },
          { label: 'Active', value: catList.filter(c => c.active).length, color: 'text-green-600' },
          { label: 'Total Brands', value: catList.reduce((s, c) => s + c.brandCount, 0), color: 'text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="font-semibold text-foreground">Device Categories</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..." className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <button className="flex items-center gap-1.5 bg-primary text-white text-sm px-3 py-2 rounded-xl hover:bg-primary/90 transition-colors whitespace-nowrap">
              <Plus size={14} /> Add Category
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {filtered.map(cat => (
            <div key={cat.id} className={`rounded-2xl border overflow-hidden transition-all ${cat.active ? 'border-border' : 'border-border opacity-60'}`}>
              <div className="relative h-32 bg-surface overflow-hidden">
                <img src={cat.image} alt={cat.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-3 text-white">
                  <span className="text-2xl">{cat.icon}</span>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => toggleActive(cat.id)}
                    className={`p-1 rounded-lg text-white transition-colors ${cat.active ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'}`}
                    title={cat.active ? 'Disable' : 'Enable'}
                  >
                    {cat.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm truncate">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{cat.brandCount} brands</span>
                  <span>·</span>
                  <span>{cat.modelCount} models</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:bg-surface transition-colors">
                    <Edit2 size={11} /> Edit
                  </button>
                  <button className="flex items-center justify-center gap-1 py-1.5 px-2 border border-red-200 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
