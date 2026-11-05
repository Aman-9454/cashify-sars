'use client';

import React from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Laptop,
  Tablet,
  Camera,
  Watch,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Zap,
  Star,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { Tenant } from '@/lib/saas/types';

export default function TemplateModernClean({
  tenant,
  catalog,
}: {
  tenant: Tenant;
  catalog: { categories: any[]; brands: any[] };
}) {
  const primaryColor = tenant.branding.primaryColor || '#10B981';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Client Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              {tenant.branding.brandName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-extrabold text-lg text-slate-900 tracking-tight">
                {tenant.branding.brandName}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {tenant.branding.tagline}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <span className="hover:text-slate-900 cursor-pointer">Sell Device</span>
            {tenant.features.refurbished && (
              <span className="hover:text-slate-900 cursor-pointer">Buy Refurbished</span>
            )}
            {tenant.features.repairs && (
              <span className="hover:text-slate-900 cursor-pointer">Repairs</span>
            )}
            <div
              className="px-4 py-2 rounded-xl text-white font-bold shadow-md cursor-pointer transition transform hover:-translate-y-0.5"
              style={{ backgroundColor: primaryColor }}
            >
              Get Instant Valuation
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-100 via-white to-slate-50 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Dedicated Tenant Database: {tenant.dbName}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Sell Your Old Smartphone & Electronics for <br />
            <span style={{ color: primaryColor }}>Instant Cash at Your Doorstep</span>
          </h1>

          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            Doorstep pickup within 2 hours, 100% data wiping, and instant bank transfer on device inspection.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div
              className="px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl flex items-center space-x-2 cursor-pointer transform hover:-translate-y-0.5 transition"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Select Your Device to Sell</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start space-x-3.5">
              <Zap className="w-6 h-6 shrink-0 mt-0.5" style={{ color: primaryColor }} />
              <div>
                <h4 className="font-bold text-sm text-slate-900">Instant AI Valuation</h4>
                <p className="text-xs text-slate-500 mt-0.5">Accurate price based on your phone condition.</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start space-x-3.5">
              <Truck className="w-6 h-6 shrink-0 mt-0.5" style={{ color: primaryColor }} />
              <div>
                <h4 className="font-bold text-sm text-slate-900">Free Doorstep Pickup</h4>
                <p className="text-xs text-slate-500 mt-0.5">Executive visits your home at your scheduled slot.</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start space-x-3.5">
              <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" style={{ color: primaryColor }} />
              <div>
                <h4 className="font-bold text-sm text-slate-900">Zero Risk & DoD Wipe</h4>
                <p className="text-xs text-slate-500 mt-0.5">Full indemnity & certified data destruction.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories from dedicated tenant DB */}
      <section className="py-14 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Select Category</h2>
            <p className="text-xs text-slate-500 mt-1">Live data loaded directly from `{tenant.dbName}`</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {(catalog.categories.length > 0
            ? catalog.categories
            : [
                { name: 'Smartphones', slug: 'smartphones' },
                { name: 'Laptops', slug: 'laptops' },
                { name: 'Tablets', slug: 'tablets' },
                { name: 'Cameras', slug: 'cameras' },
                { name: 'Smartwatches', slug: 'smartwatches' },
                { name: 'Lenses', slug: 'lenses' },
              ]
          ).map((cat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition text-center cursor-pointer group"
            >
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition group-hover:scale-105"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="font-bold text-xs text-slate-900">{cat.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Sell & Get Quote</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-900">{tenant.branding.brandName}</span> — Powered by CAMSIK SaaS Multi-Tenant Platform
          </div>
          <div className="flex items-center space-x-6">
            <span>{tenant.branding.supportEmail}</span>
            <span>{tenant.branding.supportPhone}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

