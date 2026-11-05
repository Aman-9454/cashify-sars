'use client';

import React, { useState } from 'react';
import {
  Building2,
  Database,
  Palette,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  Layers,
  Lock,
  Mail,
  Phone,
  Globe,
  Loader2,
  Check,
} from 'lucide-react';
import { THEMES_REGISTRY } from '@/lib/themesRegistry';

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TenantCreationWizard({ isOpen, onClose, onSuccess }: WizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time Provisioning Progress States
  const [provisionProgress, setProvisionProgress] = useState<{
    step: number;
    text: string;
    completed: boolean;
    failed: boolean;
  }>({
    step: 0,
    text: '',
    completed: false,
    failed: false,
  });

  // Step 1: Business Details
  const [businessData, setBusinessData] = useState({
    name: '',
    brandName: '',
    slug: '',
    companyEmail: '',
    supportPhone: '+91 98000 00000',
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    timeZone: 'Asia/Kolkata',
    websiteTitle: '',
    businessType: 'recommerce_retail',
    gstEnabled: true,
    gstNumber: '',
  });

  // Step 2: Database Provisioning Options
  const [dbConfig, setDbConfig] = useState({
    dbName: '',
    seedCatalog: true,
    seedValuationTree: true,
    seedRoles: true,
    seedCms: true,
  });

  // Step 3: Platform & 15-Theme Selection
  const [selectedThemeId, setSelectedThemeId] = useState(THEMES_REGISTRY[0].id);
  const selectedTheme = THEMES_REGISTRY.find((t) => t.id === selectedThemeId) || THEMES_REGISTRY[0];
  const [customColors, setCustomColors] = useState({
    primary: selectedTheme.tokens.primaryColor,
    secondary: selectedTheme.tokens.secondaryColor,
    accent: selectedTheme.tokens.accentColor,
  });

  // Step 4: Client Administrator Setup
  const [adminType, setAdminType] = useState<'direct' | 'invite'>('direct');
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
  });

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const cleanDb = `casmik_tenant_${slug.replace(/-/g, '_')}`;

    setBusinessData((prev) => ({
      ...prev,
      name: val,
      brandName: prev.brandName === '' || prev.brandName === prev.name ? val : prev.brandName,
      slug: prev.slug === '' || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') ? slug : prev.slug,
      websiteTitle: prev.websiteTitle === '' ? `${val} — Instant Device ReCommerce` : prev.websiteTitle,
    }));

    setDbConfig((prev) => ({
      ...prev,
      dbName: cleanDb,
    }));

    if (!adminData.email) {
      setAdminData((prev) => ({
        ...prev,
        email: `admin@${slug || 'tenant'}.com`,
        name: `${val} Admin`,
      }));
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedThemeId(themeId);
    const th = THEMES_REGISTRY.find((t) => t.id === themeId);
    if (th) {
      setCustomColors({
        primary: th.tokens.primaryColor,
        secondary: th.tokens.secondaryColor,
        accent: th.tokens.accentColor,
      });
    }
  };

  const executeProvisioning = async () => {
    setLoading(true);
    setError(null);
    setCurrentStep(5);

    try {
      setProvisionProgress({ step: 1, text: 'Registering tenant in SaaS master control plane...', completed: false, failed: false });
      await new Promise((r) => setTimeout(r, 600));

      setProvisionProgress({ step: 2, text: `Provisioning isolated database '${dbConfig.dbName || `casmik_tenant_${businessData.slug}`}'...`, completed: false, failed: false });
      await new Promise((r) => setTimeout(r, 600));

      setProvisionProgress({ step: 3, text: 'Seeding catalog, 45-point diagnostics & RBAC roles...', completed: false, failed: false });

      const payload = {
        name: businessData.name,
        slug: businessData.slug,
        dbName: dbConfig.dbName || `casmik_tenant_${businessData.slug.replace(/-/g, '_')}`,
        templateId: selectedThemeId,
        status: 'active',
        branding: {
          brandName: businessData.brandName || businessData.name,
          tagline: 'Instant Cash for Used Electronics at Your Doorstep',
          logoUrl: '/images/default-logo.svg',
          primaryColor: customColors.primary,
          secondaryColor: customColors.secondary,
          accentColor: customColors.accent,
          supportEmail: businessData.companyEmail || adminData.email,
          supportPhone: businessData.supportPhone,
          currency: businessData.currency,
          currencySymbol: businessData.currencySymbol,
          timeZone: businessData.timeZone,
          country: businessData.country,
        },
        features: {
          buyback: true,
          refurbished: true,
          rentals: false,
          repairs: true,
          exchange: true,
        },
        subscription: {
          plan: 'growth',
          status: 'active',
          validUntil: new Date(Date.now() + 365 * 86400000).toISOString(),
          maxOrdersPerMonth: 2500,
          customDomainEnabled: true,
          priceMonthly: 7999,
        },
        adminDetails: {
          name: adminData.name || `${businessData.name} Admin`,
          email: adminData.email || businessData.companyEmail,
          passwordHash: adminType === 'direct' ? (adminData.password ? `demo_hash_${adminData.password}` : 'admin123') : undefined,
          inviteToken: adminType === 'invite' ? `inv_${Math.random().toString(36).substring(2, 12)}` : undefined,
        },
        autoProvision: true,
      };

      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Provisioning failed');
      }

      setProvisionProgress({ step: 4, text: 'Tenant ecosystem provisioned successfully!', completed: true, failed: false });
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Server error provisioning tenant');
      setProvisionProgress((prev) => ({ ...prev, failed: true }));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0D121F] border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Wizard Header */}
        <div className="px-8 py-6 border-b border-slate-800/80 bg-[#111728] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Onboard New White-Label Client</h2>
              <p className="text-xs text-slate-400">Step {currentStep} of 5 — Automated Tenant Provisioning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-semibold transition"
          >
            ✕
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-8 pt-4 pb-2 bg-[#0E1422] border-b border-slate-800/60">
          <div className="grid grid-cols-5 gap-2">
            {[
              { num: 1, label: 'Business Details', icon: Building2 },
              { num: 2, label: 'Database Setup', icon: Database },
              { num: 3, label: 'Branding & Theme', icon: Palette },
              { num: 4, label: 'Client Admin', icon: UserCheck },
              { num: 5, label: 'Review & Deploy', icon: Shield },
            ].map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num;
              return (
                <div
                  key={step.num}
                  className={`flex items-center space-x-2 py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : isDone
                      ? 'bg-slate-800/50 border-slate-700/60 text-slate-300'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 font-bold ${
                      isActive
                        ? 'bg-emerald-500 text-black'
                        : isDone
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <span className="hidden sm:inline truncate">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Body */}
        <div className="p-8 flex-1 overflow-y-auto max-h-[60vh] space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: BUSINESS DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white">Step 1: Client & Business Information</h3>
                <p className="text-xs text-slate-400 mt-0.5">Define client identification and regional settings.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Business / Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ReCyclePro Technologies Pvt Ltd"
                    value={businessData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-[#121827] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Consumer Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ReCyclePro"
                    value={businessData.brandName}
                    onChange={(e) => setBusinessData({ ...businessData, brandName: e.target.value })}
                    className="w-full bg-[#121827] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Unique Tenant Slug *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="recyclepro"
                      value={businessData.slug}
                      onChange={(e) => {
                        const s = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        setBusinessData({ ...businessData, slug: s });
                        setDbConfig({ ...dbConfig, dbName: `casmik_tenant_${s.replace(/-/g, '_')}` });
                      }}
                      className="w-full bg-[#121827] border border-slate-700/80 rounded-xl pl-3.5 pr-28 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] text-slate-500 font-mono">.camsik.com</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Company Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@recyclepro.com"
                    value={businessData.companyEmail}
                    onChange={(e) => setBusinessData({ ...businessData, companyEmail: e.target.value })}
                    className="w-full bg-[#121827] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Customer Support Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98000 00000"
                    value={businessData.supportPhone}
                    onChange={(e) => setBusinessData({ ...businessData, supportPhone: e.target.value })}
                    className="w-full bg-[#121827] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Currency & Timezone</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={businessData.currency}
                      onChange={(e) => setBusinessData({ ...businessData, currency: e.target.value, currencySymbol: e.target.value === 'INR' ? '₹' : '$' })}
                      className="bg-[#121827] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="AED">AED (AED)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                    <select
                      value={businessData.timeZone}
                      onChange={(e) => setBusinessData({ ...businessData, timeZone: e.target.value })}
                      className="bg-[#121827] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DATABASE PROVISIONING */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white">Step 2: Database Isolation & Provisioning</h3>
                <p className="text-xs text-slate-400 mt-0.5">Automated provisioning of a dedicated, physically isolated MongoDB database.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#121827] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-medium text-slate-300">Dedicated MongoDB Database Name</label>
                    <p className="text-[11px] text-slate-400">Strictly isolated cluster database for this tenant.</p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
                    Database-per-Tenant Model
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                  <input
                    type="text"
                    value={dbConfig.dbName}
                    onChange={(e) => setDbConfig({ ...dbConfig, dbName: e.target.value })}
                    className="w-full bg-[#0A0D15] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Automated Seed Modules</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { key: 'seedCatalog', title: 'Electronic Catalog & Brands', desc: 'Pre-seeds Smartphones, Laptops, DSLR Cameras, and 30+ top brands' },
                    { key: 'seedValuationTree', title: '45-Point Diagnostics Tree', desc: 'Pre-seeds condition deduction questions, screen tests, and pricing algorithms' },
                    { key: 'seedRoles', title: 'RBAC Roles & Permissions', desc: 'Owner, Admin, Operations, Rider Manager, and Support roles' },
                    { key: 'seedCms', title: 'CMS Sections & Badges', desc: 'Home hero banners, trust badges, and ReCommerce FAQs' },
                  ].map((seedItem) => (
                    <div
                      key={seedItem.key}
                      onClick={() => setDbConfig({ ...dbConfig, [seedItem.key]: !(dbConfig as any)[seedItem.key] })}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                        (dbConfig as any)[seedItem.key]
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                          (dbConfig as any)[seedItem.key] ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs">{seedItem.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{seedItem.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BRANDING & 15-THEME SELECTION */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white">Step 3: Select Design System & Brand Palette</h3>
                <p className="text-xs text-slate-400 mt-0.5">Choose from 15 pre-engineered design systems or customize colors.</p>
              </div>

              {/* Theme Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
                {THEMES_REGISTRY.map((theme) => {
                  const isSelected = selectedThemeId === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleThemeSelect(theme.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500'
                          : 'bg-[#121827] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs text-white">{theme.name}</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-800 text-slate-300 rounded">
                            {theme.badge}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 mb-2">
                          <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: theme.tokens.primaryColor }} />
                          <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: theme.tokens.secondaryColor }} />
                          <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: theme.tokens.accentColor }} />
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2">{theme.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Colors */}
              <div className="p-4 rounded-2xl bg-[#121827] border border-slate-800 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customColors.primary}
                      onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={customColors.primary}
                      onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                      className="w-full bg-[#0A0D15] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Secondary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customColors.secondary}
                      onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={customColors.secondary}
                      onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                      className="w-full bg-[#0A0D15] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Accent / CTA Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customColors.accent}
                      onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={customColors.accent}
                      onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                      className="w-full bg-[#0A0D15] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CLIENT ADMINISTRATOR SETUP */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white">Step 4: Client Administrator Credentials</h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure initial owner access for the client to manage their ReCommerce platform.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setAdminType('direct')}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    adminType === 'direct'
                      ? 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-[#121827] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-semibold text-xs mb-1">Direct Administrator Credentials</div>
                  <div className="text-[11px] text-slate-400">Super Admin sets initial administrator email and password directly.</div>
                </div>

                <div
                  onClick={() => setAdminType('invite')}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    adminType === 'invite'
                      ? 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-[#121827] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-semibold text-xs mb-1">Secure Onboarding Invitation</div>
                  <div className="text-[11px] text-slate-400">Client receives secure invite link to set up their own password and 2FA.</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#121827] border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Administrator Full Name</label>
                  <input
                    type="text"
                    value={adminData.name}
                    onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                    className="w-full bg-[#0A0D15] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Administrator Email Address</label>
                  <input
                    type="email"
                    value={adminData.email}
                    onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                    className="w-full bg-[#0A0D15] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {adminType === 'direct' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Initial Administrator Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={adminData.password}
                      onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                      className="w-full bg-[#0A0D15] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & REAL-TIME PROVISIONING */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-white">Step 5: Review & Provisioning Execution</h3>
                <p className="text-xs text-slate-400 mt-0.5">Verify configuration before initializing the isolated tenant infrastructure.</p>
              </div>

              {loading ? (
                <div className="p-8 rounded-2xl bg-[#121827] border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                  {provisionProgress.failed ? (
                    <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce" />
                  ) : provisionProgress.completed ? (
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  ) : (
                    <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {provisionProgress.completed ? 'Tenant Successfully Deployed!' : provisionProgress.failed ? 'Provisioning Failed' : 'Provisioning Tenant...'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{provisionProgress.text}</p>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#121827] border border-slate-800 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400">Business Name:</span>
                      <div className="font-semibold text-white">{businessData.name}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Tenant Domain:</span>
                      <div className="font-semibold text-emerald-400">{businessData.slug}.camsik.com</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Dedicated Database:</span>
                      <div className="font-semibold text-cyan-400 font-mono">{dbConfig.dbName}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Design System Theme:</span>
                      <div className="font-semibold text-white">{selectedTheme.name}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Administrator:</span>
                      <div className="font-semibold text-white">{adminData.email}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Seed Modules:</span>
                      <div className="font-semibold text-emerald-300">Catalog, 45-Pt QA, RBAC, CMS</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-8 py-5 border-t border-slate-800/80 bg-[#111728] flex items-center justify-between">
          {currentStep > 1 && currentStep < 5 && (
            <button
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              disabled={loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          )}

          <div className="ml-auto flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>

            {currentStep < 4 && (
              <button
                onClick={() => {
                  if (currentStep === 1 && (!businessData.name || !businessData.slug)) {
                    setError('Please fill in business name and slug');
                    return;
                  }
                  setError(null);
                  setCurrentStep((prev) => (prev + 1) as any);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 4 && (
              <button
                onClick={() => setCurrentStep(5)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition"
              >
                <span>Review & Finalize</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 5 && !loading && !provisionProgress.completed && (
              <button
                onClick={executeProvisioning}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/30 flex items-center space-x-2 transition transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm & Auto-Provision Tenant</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

