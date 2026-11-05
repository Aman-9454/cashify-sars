'use client';
import React, { useState } from 'react';
import { Search, ChevronLeft } from 'lucide-react';
import { brands as allBrands } from '@/lib/casmikData';

interface Props {
  selected: string | null;
  categoryId: string | null;
  onSelect: (id: string, name: string) => void;
  onBack: () => void;
}

export default function StepBrandSelect({ selected, categoryId, onSelect, onBack }: Props) {
  const [query, setQuery] = useState('');

  const filteredBrands = allBrands.filter(b => {
    const matchesCategory = categoryId ? b.categoryId === categoryId : true;
    const matchesQuery = b.name.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery && b.active;
  });

  // If no brands for category, show all brands
  const displayBrands = filteredBrands.length > 0 ? filteredBrands : allBrands.filter(b => b.name.toLowerCase().includes(query.toLowerCase()) && b.active);

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6 fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
        <ChevronLeft size={16} /> Back to Category
      </button>
      <h2 className="text-xl font-bold text-foreground mb-1">Select Brand</h2>
      <p className="text-sm text-muted-foreground mb-5">Choose the brand of your device</p>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search brand..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface transition-all" />
      </div>

      {/* Brand grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {displayBrands.map((brand) => (
          <button key={`brand-btn-${brand.id}`} onClick={() => onSelect(brand.id, brand.name)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-150 btn-press ${selected === brand.id ? 'border-primary bg-primary-50 shadow-green' : 'border-border bg-white hover:border-primary/40 hover:bg-primary-50/30'}`}>
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src={brand.logo}
                alt={brand.alt}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/images/app_logo.png';
                }}
              />
            </div>
            <span className="text-xs font-semibold text-foreground text-center leading-tight">{brand.name}</span>
            <span className="text-xs text-muted-foreground">{brand.modelCount} models</span>
          </button>
        ))}
      </div>

      {displayBrands.length === 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">No brand found for &quot;{query}&quot;</div>
      )}
    </div>
  );
}