'use client';

import React from 'react';
import {
  Building2,
  FileText,
  ShieldCheck,
  CheckCircle,
  Briefcase,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';
import { Tenant } from '@/lib/saas/types';

export default function TemplateEnterpriseMinimal({
  tenant,
  catalog,
}: {
  tenant: Tenant;
  catalog: { categories: any[]; brands: any[] };
}) {
  const primaryColor = tenant.branding.primaryColor || '#2563EB';

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      {/* Enterprise Nav */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ backgroundColor: primaryColor }}
            >
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-base text-slate-900 tracking-tight">
                {tenant.branding.brandName}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                ENTERPRISE RECOMMERCE & ASSET DISPOSITION
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs font-medium text-slate-600">
            <span>Corporate Solutions</span>
            <span>Compliance & ISO Wipe</span>
            <div
              className="px-4 py-2 rounded-lg text-white font-semibold text-xs cursor-pointer shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              Request Corporate Quote
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-mono bg-blue-50 border border-blue-200 text-blue-700">
            <Database className="w-3.5 h-3.5" />
            <span>Dedicated Tenant DB: {tenant.dbName}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            Enterprise IT Asset Liquidation & Device ReCommerce
          </h1>

          <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
            Secure, audited, and compliant buyback for bulk MacBooks, corporate smartphones, workstations, and office equipment.
          </p>

          <div className="pt-2 flex items-center space-x-4">
            <div
              className="px-6 py-3 rounded-lg text-white font-semibold text-xs flex items-center space-x-2 cursor-pointer shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Submit Asset Batch (CSV/XLSX)</span>
              <ArrowRight className="w-4 h-4" />
            </div>
            <div className="px-6 py-3 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs cursor-pointer">
              Download Compliance Guide
            </div>
          </div>
        </div>
      </section>

      {/* Categories / Asset Classes */}
      <section className="py-14 px-6 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Supported Asset Classes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(catalog.categories.length > 0
            ? catalog.categories
            : [
                { name: 'Corporate MacBooks & Laptops' },
                { name: 'Executive Smartphones' },
                { name: 'Tablets & iPads' },
                { name: 'Studio & Media Equipment' },
                { name: 'Servers & Networking' },
                { name: 'Monitors & Workstations' },
              ]
          ).map((cat, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition bg-white">
              <div className="font-semibold text-sm text-slate-900">{cat.name}</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>NIST 800-88 Data Sanitization</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>{tenant.branding.brandName} • Powered by Camsik Multi-Tenant Platform</div>
          <div>{tenant.branding.supportEmail}</div>
        </div>
      </footer>
    </div>
  );
}

