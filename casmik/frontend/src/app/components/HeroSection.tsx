'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Shield, Zap, Truck, Lock, TrendingUp, X } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { deviceModels, brands } from '@/lib/casmikData';

const benefitPills = [
  { icon: Truck, label: 'Free Pickup', sub: 'From anywhere' },
  { icon: Zap, label: 'Instant Payment', sub: 'UPI / Bank Transfer' },
  { icon: Lock, label: 'Secure Data Wipe', sub: '100% Safe Process' },
  { icon: Shield, label: 'No Hidden Charges', sub: '100% Transparent' },
];

const floatingCards = [
  { id: 'float-1', icon: TrendingUp, title: 'Max Value Guaranteed', sub: 'We beat market price by up to 20%*', color: 'bg-primary/10 border-primary/20', iconColor: 'text-primary' },
  { id: 'float-2', icon: Shield, title: '100% Safe & Secure', sub: 'Military grade data protection', color: 'bg-info/10 border-info/20', iconColor: 'text-info' },
];

interface SearchResult {
  id: string;
  type: 'model' | 'brand';
  name: string;
  brandName?: string;
  image?: string;
}

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getResults = (): SearchResult[] => {
    if (!query || query.length < 1) return [];
    const lower = query.toLowerCase();
    const results: SearchResult[] = [];
    brands.filter(b => b.name.toLowerCase().includes(lower)).slice(0, 2).forEach(b => {
      results.push({ id: `brand-${b.id}`, type: 'brand', name: b.name, image: b.logo });
    });
    deviceModels.filter(m => m.name.toLowerCase().includes(lower)).slice(0, 5).forEach(m => {
      const brand = brands.find(b => b.id === m.brandId);
      results.push({ id: `model-${m.id}`, type: 'model', name: m.name, brandName: brand?.name, image: m.image });
    });
    return results.slice(0, 7);
  };

  const results = getResults();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-white hero-dots">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-8 lg:gap-12 items-center">
          <div className="xl:col-span-3 slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6">
              <Shield size={12} />
              TRUSTED BY 10,00,000+ HAPPY CUSTOMERS
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-foreground leading-tight mb-3 text-balance">
              Turn Your Old Devices
              <br />
              Into{' '}
              <span className="text-primary relative">
                Instant Value
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none">
                  <path d="M2 6 Q75 2 150 6 Q225 10 298 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mt-4 mb-8 max-w-lg leading-relaxed">
              Sell your used smartphones, laptops, tablets &amp; more at the best price with free pickup and instant payment.
            </p>

            {/* Search bar with live autocomplete */}
            <div className="relative mb-6 max-w-xl">
              <div className="flex items-center gap-0 rounded-2xl border-2 border-border bg-white shadow-md focus-within:border-primary focus-within:shadow-green transition-all duration-200 overflow-hidden">
                <div className="pl-4 pr-2 flex items-center">
                  <Search size={18} className="text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Search device — e.g. iPhone 15 Pro Max"
                  className="flex-1 py-4 pr-2 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
                />
                {query && (
                  <button onClick={() => { setQuery(''); setShowSuggestions(false); }} className="px-2 text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                )}
                <Link href="/sell-device-get-quote"
                  className="m-1.5 px-5 py-3 gradient-green text-white rounded-xl text-sm font-semibold shadow-green btn-press whitespace-nowrap flex items-center gap-1.5">
                  Get My Quote <ArrowRight size={14} />
                </Link>
              </div>

              {/* Autocomplete dropdown */}
              {showSuggestions && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-border shadow-lg z-20 overflow-hidden fade-in">
                  {results.map(r => (
                    <Link key={r.id} href="/sell-device-get-quote" onMouseDown={() => setQuery(r.name)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted text-sm transition-colors">
                      {r.image && <img src={r.image} alt={r.name} className="w-8 h-8 rounded-lg object-cover bg-muted flex-shrink-0" />}
                      <div className="flex-1">
                        <span className="text-foreground font-medium">{r.name}</span>
                        {r.brandName && <span className="text-muted-foreground text-xs ml-1">by {r.brandName}</span>}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.type === 'brand' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {r.type === 'brand' ? 'Brand' : 'Sell →'}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              {showSuggestions && query.length > 0 && results.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-border shadow-lg z-20 px-4 py-4 text-sm text-muted-foreground fade-in">
                  No results for &quot;{query}&quot; — <Link href="/sell-device-get-quote" className="text-primary font-semibold">browse all devices →</Link>
                </div>
              )}
            </div>

            {/* Benefit pills */}
            <div className="flex flex-wrap gap-3">
              {benefitPills.map(pill => (
                <div key={`pill-${pill.label}`} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-border shadow-sm text-xs">
                  <pill.icon size={13} className="text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground leading-none">{pill.label}</p>
                    <p className="text-muted-foreground mt-0.5">{pill.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-2 relative flex items-center justify-center">
            <div className="absolute -top-4 -right-4 z-10 hidden lg:block">
              {floatingCards.map(card => (
                <div key={card.id} className={`mb-3 flex items-start gap-3 px-4 py-3 rounded-2xl border bg-white shadow-md w-52 fade-in`}>
                  <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center flex-shrink-0`}>
                    <card.icon size={16} className={card.iconColor} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground leading-tight">{card.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{card.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative w-72 h-72 lg:w-80 lg:h-80">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-100 to-white opacity-80 blur-2xl" />
              <div className="relative z-10 flex items-center justify-center h-full">
                <AppImage
                  src="https://images.unsplash.com/photo-1542163276-2620fe05e7b5"
                  alt="Premium smartphones and electronics displayed on white platform — iPhone, Samsung, MacBook"
                  width={320} height={320}
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-6 bg-primary/20 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
