import React from 'react';
import Link from 'next/link';
import { getAllTenants } from '@/lib/saas/tenantMaster';
import { AVAILABLE_TEMPLATES } from '@/lib/saas/templates';
import { Building2, ExternalLink, ShieldCheck, Database, Palette, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StoreIndexPage() {
  const tenants = await getAllTenants();

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 font-sans p-6 sm:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Tenant SaaS Demo</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Active Client Storefronts</h1>
            <p className="text-xs text-slate-400 mt-1">
              Har client ka apna dedicated database aur customized project template live test karein.
            </p>
          </div>

          <Link
            href="/saas-admin"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
          >
            <span>Open Super Admin</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tenants.map((tenant) => {
            const template = AVAILABLE_TEMPLATES.find((t) => t.id === tenant.templateId);
            return (
              <div
                key={tenant.id}
                className="p-6 rounded-2xl bg-[#101625] border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: tenant.branding.primaryColor || '#10B981' }}
                />

                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black text-sm shadow-md"
                      style={{ backgroundColor: tenant.branding.primaryColor || '#10B981' }}
                    >
                      {tenant.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{tenant.name}</h3>
                      <div className="text-[11px] text-slate-400 mt-0.5">{tenant.slug}.camsik.com</div>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {tenant.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 italic">"{tenant.branding.tagline}"</p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-medium flex items-center space-x-1">
                      <Database className="w-3 h-3 text-cyan-400" />
                      <span>Dedicated DB</span>
                    </div>
                    <div className="font-mono text-[11px] text-cyan-300 truncate mt-0.5">
                      {tenant.dbName}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-medium flex items-center space-x-1">
                      <Palette className="w-3 h-3 text-purple-400" />
                      <span>Template Style</span>
                    </div>
                    <div className="font-medium text-[11px] text-purple-300 truncate mt-0.5">
                      {template?.name || tenant.templateId}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <Link
                    href={`/store/${tenant.slug}`}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    <span>View Storefront</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

