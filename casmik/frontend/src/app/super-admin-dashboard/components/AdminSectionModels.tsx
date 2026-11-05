'use client';
import React, { useState } from 'react';
import { deviceModels, brands, categories } from '@/lib/casmikData';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminSectionModels() {
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');

  const filtered = deviceModels.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchBrand = brandFilter === 'all' || m.brandId === brandFilter;
    return matchSearch && matchBrand;
  });

  const getBrandName = (id: string) => brands.find(b => b.id === id)?.name || id;
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Models', value: deviceModels.length, color: 'text-blue-600' },
          { label: 'Active', value: deviceModels.filter(m => m.active).length, color: 'text-green-600' },
          { label: 'Brands Covered', value: [...new Set(deviceModels.map(m => m.brandId))].length, color: 'text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="font-semibold text-foreground">Device Models</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search models..." className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="text-sm border border-border rounded-xl px-3 py-2 focus:outline-none">
              <option value="all">All Brands</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <button className="flex items-center gap-1.5 bg-primary text-white text-sm px-3 py-2 rounded-xl hover:bg-primary/90 transition-colors whitespace-nowrap">
              <Plus size={14} /> Add Model
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Model</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Brand</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Base Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Storage Options</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id} className={`border-b border-border last:border-0 hover:bg-surface/50 transition-colors ${i % 2 === 0 ? '' : 'bg-surface/20'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={m.image} alt={m.alt} className="w-10 h-10 rounded-lg object-contain bg-surface" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.colors.length} colors</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{getBrandName(m.brandId)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{getCategoryName(m.categoryId)}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">₹{m.basePrice.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {m.storages.map(s => (
                        <span key={s} className="text-xs bg-surface text-muted-foreground px-1.5 py-0.5 rounded-md">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${m.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {m.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Edit2 size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
          Showing {filtered.length} of {deviceModels.length} models
        </div>
      </div>
    </div>
  );
}
