'use client';

import React from 'react';
import {
  Zap,
  Cpu,
  Shield,
  Terminal,
  ArrowRight,
  Database,
  Radio,
  Flame,
  Camera,
  Laptop,
} from 'lucide-react';
import { Tenant } from '@/lib/saas/types';

export default function TemplateDarkTech({
  tenant,
  catalog,
}: {
  tenant: Tenant;
  catalog: { categories: any[]; brands: any[] };
}) {
  const primaryColor = tenant.branding.primaryColor || '#06B6D4';

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Glow ambient background */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[140px] opacity-25 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Cyber Header */}
      <header className="border-b border-slate-800/80 bg-[#030712]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-black shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-white tracking-wider font-mono">
                {tenant.branding.brandName}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
                CYBERNETIC GEAR TRADE-IN
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="text-slate-400 hover:text-white cursor-pointer">[TRADE-IN]</span>
            {tenant.features.rentals && (
              <span className="text-slate-400 hover:text-white cursor-pointer">[RENTAL GEAR]</span>
            )}
            <div
              className="px-4 py-2 rounded-xl text-black font-bold font-mono text-xs cursor-pointer shadow-lg transition"
              style={{ backgroundColor: primaryColor }}
            >
              INITIALIZE QUOTE &gt;
            </div>
          </div>
        </div>
      </header>

      {/* Cyber Hero */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
            <Database className="w-3.5 h-3.5" />
            <span>Dedicated MongoDB: {tenant.dbName}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-none font-mono">
            High-Performance <br />
            <span style={{ color: primaryColor }}>Flagship & Rig Liquidation</span>
          </h1>

          <p className="text-sm text-slate-400 font-mono max-w-xl mx-auto">
            Algorithmically priced tech trade-ins. Sell MacBooks, iPhones, DSLRs & GPUs with cryptographically secure data annihilation.
          </p>

          <div className="pt-4 flex justify-center">
            <div
              className="px-8 py-3.5 rounded-xl font-mono text-xs font-bold text-black uppercase tracking-wider flex items-center space-x-2 cursor-pointer shadow-xl shadow-cyan-500/20"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Instant Diagnostic Scan</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid (Dark Glassmorphic) */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-mono font-bold uppercase text-white flex items-center space-x-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Active Device Matrix</span>
          </h2>
          <span className="text-xs font-mono text-slate-500">Source: `{tenant.dbName}`</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {(catalog.categories.length > 0
            ? catalog.categories
            : [
                { name: 'Smartphones', slug: 'smartphones' },
                { name: 'Gaming Laptops', slug: 'laptops' },
                { name: 'DSLR & Cinema', slug: 'cameras' },
                { name: 'Tablets', slug: 'tablets' },
                { name: 'Lenses', slug: 'lenses' },
                { name: 'Smartwatches', slug: 'smartwatches' },
              ]
          ).map((cat, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/60 transition group cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-lg mb-2.5 flex items-center justify-center font-mono text-xs font-bold"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                0{i + 1}
              </div>
              <div className="font-mono text-xs font-bold text-white group-hover:text-cyan-400 transition">
                {cat.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">ESTIMATE_VALUE()</div>
            </div>
          ))}
        </div>
      </section>

      {/* Cyber Footer */}
      <footer className="border-t border-slate-800/80 bg-[#020617] py-8 px-6 text-xs font-mono text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            NODE: <span className="text-slate-300">{tenant.branding.brandName}</span> | HOSTED ON CAMSIK SAAS
          </div>
          <div>{tenant.branding.supportEmail}</div>
        </div>
      </footer>
    </div>
  );
}

