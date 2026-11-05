'use client';
import React, { useState } from 'react';
import { sellQuestions } from '@/lib/casmikData';
import { ChevronDown, ChevronUp, Edit2, Plus, TrendingUp, TrendingDown } from 'lucide-react';

export default function AdminSectionPricing() {
  const [expandedQ, setExpandedQ] = useState<string | null>('q-display');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Questions', value: sellQuestions?.length, color: 'text-blue-600' },
          { label: 'Total Options', value: sellQuestions?.reduce((s, q) => s + q?.options?.length, 0), color: 'text-purple-600' },
          { label: 'Price Boosters', value: sellQuestions?.flatMap(q => q?.options)?.filter(o => o?.priceAdjustment > 0)?.length, color: 'text-green-600' },
          { label: 'Price Deductions', value: sellQuestions?.flatMap(q => q?.options)?.filter(o => o?.priceAdjustment < 0)?.length, color: 'text-red-600' },
        ]?.map(stat => (
          <div key={stat?.label} className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{stat?.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat?.color}`}>{stat?.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Sell Questions & Price Rules</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Manage questions shown during device sell flow and their price impact</p>
          </div>
          <button className="flex items-center gap-1.5 bg-primary text-white text-sm px-3 py-2 rounded-xl hover:bg-primary/90 transition-colors">
            <Plus size={14} /> Add Question
          </button>
        </div>

        <div className="divide-y divide-border">
          {sellQuestions?.map((q, qi) => (
            <div key={q?.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedQ(expandedQ === q?.id ? null : q?.id)}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-surface/50 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {qi + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{q?.question}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{q?.subtext}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs bg-surface text-muted-foreground px-2 py-1 rounded-lg">{q?.options?.length} options</span>
                  <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" onClick={e => e?.stopPropagation()}>
                    <Edit2 size={13} />
                  </button>
                  {expandedQ === q?.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>
              </button>

              {expandedQ === q?.id && (
                <div className="px-4 pb-4 bg-surface/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {q?.options?.map(opt => (
                      <div key={opt?.id} className="bg-white rounded-xl border border-border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{opt?.icon}</span>
                            <div>
                              <p className="font-semibold text-sm text-foreground">{opt?.label}</p>
                              <p className="text-xs text-muted-foreground">{opt?.description}</p>
                            </div>
                          </div>
                          <button className="p-1 rounded hover:bg-blue-50 text-blue-600 flex-shrink-0"><Edit2 size={11} /></button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {opt?.priceAdjustment !== 0 ? (
                            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${opt?.priceAdjustment > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {opt?.priceAdjustment > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                              {opt?.priceAdjustment > 0 ? '+' : ''}₹{Math.abs(opt?.priceAdjustment)?.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground px-2 py-1 bg-surface rounded-lg">No price change</span>
                          )}
                          <span className="text-xs text-muted-foreground bg-surface px-2 py-1 rounded-lg">{opt?.conditionGrade}</span>
                        </div>
                      </div>
                    ))}
                    <button className="bg-white rounded-xl border border-dashed border-border p-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                      <Plus size={14} /> Add Option
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
