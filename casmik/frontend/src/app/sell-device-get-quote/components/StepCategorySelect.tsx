'use client';
import React from 'react';

import { categories } from '@/lib/casmikData';
import AppImage from '@/components/ui/AppImage';

interface Props {
  selected: string | null;
  onSelect: (id: string, name: string) => void;
}

export default function StepCategorySelect({ selected, onSelect }: Props) {
  const activeCategories = categories.filter(c => c.active);

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden fade-in">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground mb-1">What are you selling?</h2>
        <p className="text-sm text-muted-foreground">Select the category of your device</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id, cat.name)}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 text-center transition-all duration-150 btn-press group hover:border-primary/40 hover:bg-primary-50/20 ${selected === cat.id ? 'border-primary bg-primary-50 shadow-green' : 'border-border bg-white'}`}
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                <AppImage src={cat.image} alt={cat.alt} width={64} height={64} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div>
                <p className={`text-sm font-bold leading-tight ${selected === cat.id ? 'text-primary' : 'text-foreground'}`}>{cat.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.brandCount} brands</p>
              </div>
              {selected === cat.id && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
