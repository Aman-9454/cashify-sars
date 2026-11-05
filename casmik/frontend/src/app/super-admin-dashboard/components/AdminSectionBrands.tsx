'use client';
import React, { useState } from 'react';
import { brands, categories } from '@/lib/casmikData';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminSectionBrands() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const filtered = brands.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || b.categoryId === catFilter;
    return matchSearch && matchCat;
  });

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Brands', value: brands.length, color: 'text-blue-600' },
          { label: 'Active', value: brands.filter(b => b.active).length, color: 'text-green-600' },
          { label: 'Categories', value: [...new Set(brands.map(b => b.categoryId))].length, color: 'text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="font-semibold text-foreground">Device Brands</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search brands..." className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="text-sm border border-border rounded-xl px-3 py-2 focus:outline-none">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="flex items-center gap-1.5 bg-primary text-white text-sm px-3 py-2 rounded-xl hover:bg-primary/90 transition-colors whitespace-nowrap">
              <Plus size={14} /> Add Brand
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4">
          {filtered.map(brand => (
            <div key={brand.id} className={`group rounded-2xl border p-3 flex flex-col items-center gap-2 transition-all hover:shadow-md ${brand.active ? 'border-border bg-white' : 'border-border bg-surface opacity-60'}`}>
              <div className="w-14 h-14 rounded-xl bg-surface flex items-center justify-center overflow-hidden">
                <img src={brand.logo} alt={brand.alt} className="w-12 h-12 object-contain" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm text-foreground">{brand.name}</p>
                <p className="text-xs text-muted-foreground">{getCategoryName(brand.categoryId)}</p>
                <p className="text-xs text-muted-foreground">{brand.modelCount} models</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Edit2 size={12} /></button>
                <button className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
          Showing {filtered.length} of {brands.length} brands
        </div>
      </div>
    </div>
  );
}
