'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Database,
  Layers,
  Palette,
  Plus,
  RefreshCw,
  ExternalLink,
  Shield,
  CheckCircle2,
  AlertCircle,
  Search,
  Globe,
  Smartphone,
  Sparkles,
  Server,
  Activity,
  Edit3,
  Trash2,
  Check,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Box,
} from 'lucide-react';
import { Tenant, ProjectTemplate } from '@/lib/saas/types';
import { AVAILABLE_TEMPLATES } from '@/lib/saas/templates';

export default function SaasSuperAdminPage() {
  const [activeTab, setActiveTab] = useState<'clients' | 'templates' | 'databases'>('clients');
  const [clients, setClients] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTemplate, setFilterTemplate] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClientForDb, setSelectedClientForDb] = useState<Tenant | null>(null);
  const [dbStatusDetails, setDbStatusDetails] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Client Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    customDomain: '',
    dbName: '',
    templateId: AVAILABLE_TEMPLATES[0].id,
    plan: 'growth',
    primaryColor: '#10B981',
    secondaryColor: '#0F172A',
    accentColor: '#3B82F6',
    brandName: '',
    tagline: 'Instant Cash for Used Electronics at Your Doorstep',
    supportEmail: '',
    supportPhone: '',
    buyback: true,
    refurbished: true,
    rentals: false,
    repairs: true,
    exchange: true,
    autoProvision: true,
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/saas/clients');
      const data = await res.json();
      if (data.success && data.clients) {
        setClients(data.clients);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
      showToast('error', 'Failed to fetch SaaS clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Auto-generate slug & dbName when client name changes
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const cleanDbName = `casmik_tenant_${slug.replace(/-/g, '_')}`;

    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug === '' || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') ? slug : prev.slug,
      dbName: prev.dbName === '' || prev.dbName.startsWith('casmik_tenant_') ? cleanDbName : prev.dbName,
      brandName: prev.brandName === '' ? name : prev.brandName,
    }));
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      showToast('error', 'Please fill client name and slug');
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch('/api/saas/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          customDomain: formData.customDomain || undefined,
          dbName: formData.dbName || `casmik_tenant_${formData.slug.replace(/-/g, '_')}`,
          templateId: formData.templateId,
          status: 'active',
          branding: {
            brandName: formData.brandName || formData.name,
            tagline: formData.tagline,
            logoUrl: '/images/default-logo.svg',
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
            accentColor: formData.accentColor,
            supportEmail: formData.supportEmail || `support@${formData.slug}.com`,
            supportPhone: formData.supportPhone || '+91 98000 00000',
          },
          features: {
            buyback: formData.buyback,
            refurbished: formData.refurbished,
            rentals: formData.rentals,
            repairs: formData.repairs,
            exchange: formData.exchange,
          },
          subscription: {
            plan: formData.plan,
            status: 'active',
            validUntil: new Date(Date.now() + 365 * 86400000).toISOString(),
            maxOrdersPerMonth: formData.plan === 'enterprise' ? 10000 : formData.plan === 'growth' ? 2500 : 500,
            customDomainEnabled: Boolean(formData.customDomain),
            priceMonthly: formData.plan === 'enterprise' ? 19999 : formData.plan === 'growth' ? 7999 : 2999,
          },
          autoProvision: formData.autoProvision,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', data.message || 'Client created successfully!');
        setShowCreateModal(false);
        fetchClients();
      } else {
        showToast('error', data.message || 'Failed to create client');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Server error creating client');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInspectDb = async (client: Tenant) => {
    setSelectedClientForDb(client);
    setDbStatusDetails(null);
    try {
      const res = await fetch(`/api/saas/clients/${client.id}`);
      const data = await res.json();
      if (data.success) {
        setDbStatusDetails(data.database);
      }
    } catch (err) {
      console.error('Failed to inspect database:', err);
    }
  };

  const handleReprovisionDb = async (clientId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/saas/clients/${clientId}/provision`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        setDbStatusDetails(data.database);
        fetchClients();
      } else {
        showToast('error', data.message);
      }
    } catch (err) {
      showToast('error', 'Provisioning request failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeTemplate = async (client: Tenant, newTemplateId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/saas/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: newTemplateId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Template for ${client.name} updated to ${newTemplateId}!`);
        fetchClients();
      }
    } catch (err) {
      showToast('error', 'Template update failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dbName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTemplate = filterTemplate === 'all' || c.templateId === filterTemplate;
    return matchesSearch && matchesTemplate;
  });

  // Calculate MRR
  const totalMrr = clients.reduce((acc, c) => acc + (c.subscription?.priceMonthly || 0), 0);
  const totalDbs = clients.length;

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-sm font-medium border ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 backdrop-blur-md'
              : 'bg-rose-950/90 text-rose-300 border-rose-500/40 backdrop-blur-md'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* SaaS Super Admin Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0F1420]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">CAMSIK SaaS Super Admin</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Multi-Tenant Platform
                </span>
              </div>
              <p className="text-xs text-slate-400">Database-per-Tenant & Dynamic White-Label Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Client</span>
            </button>
            <button
              onClick={fetchClients}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
              title="Refresh Clients"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {/* KPI Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#131B2E] to-[#0E1524] border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
              <span>Total Active Clients</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">{clients.length}</div>
            <div className="text-[11px] text-emerald-400 mt-2 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% On-Demand Provisioned</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#131B2E] to-[#0E1524] border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
              <span>Dedicated MongoDB DBs</span>
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">{totalDbs}</div>
            <div className="text-[11px] text-cyan-400 mt-2 flex items-center space-x-1">
              <Server className="w-3.5 h-3.5" />
              <span>1 Dedicated DB per Tenant</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#131B2E] to-[#0E1524] border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
              <span>Live ReCommerce Templates</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">{AVAILABLE_TEMPLATES.length}</div>
            <div className="text-[11px] text-purple-400 mt-2 flex items-center space-x-1">
              <Palette className="w-3.5 h-3.5" />
              <span>Dynamic Switch Supported</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#131B2E] to-[#0E1524] border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
              <span>Platform SaaS MRR</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">₹{(totalMrr / 1000).toFixed(1)}k</div>
            <div className="text-[11px] text-amber-400 mt-2 flex items-center space-x-1">
              <span>Tier-based subscription revenue</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
              activeTab === 'clients'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Clients & Dedicated DBs ({clients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
              activeTab === 'templates'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Templates Catalog ({AVAILABLE_TEMPLATES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('databases')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
              activeTab === 'databases'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database Monitor & Isolation</span>
          </button>
        </div>

        {/* TAB 1: CLIENTS & DEDICATED DBS */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search client, subdomain, or db..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121826] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <select
                  value={filterTemplate}
                  onChange={(e) => setFilterTemplate(e.target.value)}
                  className="bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/60"
                >
                  <option value="all">All Templates</option>
                  {AVAILABLE_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clients Table */}
            <div className="bg-[#101625] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141C2E] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Client & Domain</th>
                      <th className="px-6 py-4">Dedicated MongoDB Database</th>
                      <th className="px-6 py-4">Assigned Template</th>
                      <th className="px-6 py-4">SaaS Plan</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredClients.map((client) => {
                      const template = AVAILABLE_TEMPLATES.find((t) => t.id === client.templateId);
                      return (
                        <tr key={client.id} className="hover:bg-slate-800/30 transition">
                          {/* Client & Subdomain */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-md"
                                style={{
                                  backgroundColor: client.branding?.primaryColor || '#10B981',
                                  color: '#000000',
                                }}
                              >
                                {client.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-white text-sm">{client.name}</div>
                                <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                                  <Globe className="w-3 h-3 text-slate-500" />
                                  <span className="text-emerald-400">{client.slug}.camsik.com</span>
                                  {client.customDomain && (
                                    <>
                                      <span className="text-slate-600">•</span>
                                      <span className="text-cyan-400">{client.customDomain}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Dedicated Database */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1.5 font-mono text-[11px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 px-2.5 py-1 rounded-lg w-max">
                                <Database className="w-3 h-3 text-cyan-400" />
                                <span>{client.dbName}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                                <span>Physical Isolation Active</span>
                              </div>
                            </div>
                          </td>

                          {/* Assigned Template */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                                  style={{ backgroundColor: template?.previewColor || '#10B981' }}
                                />
                                <span className="font-medium text-white">{template?.name || client.templateId}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Style: <span className="text-slate-300 font-mono">{template?.layoutStyle}</span>
                              </div>
                            </div>
                          </td>

                          {/* SaaS Plan */}
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                              {client.subscription?.plan || 'starter'}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1">
                              ₹{(client.subscription?.priceMonthly || 0).toLocaleString()}/mo
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                client.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {client.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Storefront Link */}
                              <Link
                                href={`/store/${client.slug}`}
                                target="_blank"
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1 transition text-[11px]"
                                title="Open Live Storefront"
                              >
                                <span>Storefront</span>
                                <ExternalLink className="w-3 h-3 text-emerald-400" />
                              </Link>

                              {/* Inspect Dedicated DB */}
                              <button
                                onClick={() => handleInspectDb(client)}
                                className="px-2.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 flex items-center space-x-1 transition text-[11px]"
                                title="Inspect Database Collections"
                              >
                                <Database className="w-3 h-3" />
                                <span>DB Health</span>
                              </button>

                              {/* Template Switcher Quick Dropdown */}
                              <select
                                value={client.templateId}
                                onChange={(e) => handleChangeTemplate(client, e.target.value)}
                                className="bg-[#161F33] border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-purple-400"
                                title="Change Template"
                              >
                                {AVAILABLE_TEMPLATES.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEMPLATES CATALOG */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Project Templates Engine</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Each client can be assigned a distinct ReCommerce template with customized color palettes, hero structures, and diagnostic evaluation flows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {AVAILABLE_TEMPLATES.map((tmpl) => {
                const assignedCount = clients.filter((c) => c.templateId === tmpl.id).length;
                return (
                  <div
                    key={tmpl.id}
                    className="p-6 rounded-2xl bg-[#101625] border border-slate-800/80 hover:border-slate-700 transition shadow-xl space-y-4 relative overflow-hidden"
                  >
                    {/* Top color bar indicator */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5"
                      style={{ backgroundColor: tmpl.previewColor }}
                    />

                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-bold text-white">{tmpl.name}</h3>
                          <span
                            className="px-2 py-0.5 text-[10px] font-semibold rounded-full border"
                            style={{
                              backgroundColor: `${tmpl.previewColor}15`,
                              color: tmpl.previewColor,
                              borderColor: `${tmpl.previewColor}40`,
                            }}
                          >
                            {tmpl.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tmpl.description}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-bold text-slate-400">Assigned Clients</span>
                        <div className="text-xl font-extrabold text-white">{assignedCount}</div>
                      </div>
                    </div>

                    {/* Color Palette Preview */}
                    <div className="flex items-center space-x-3 pt-2">
                      <span className="text-[11px] text-slate-400 font-medium">Default Palette:</span>
                      <div className="flex items-center space-x-1.5">
                        <div
                          className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: tmpl.defaultTheme.primaryColor }}
                          title={`Primary: ${tmpl.defaultTheme.primaryColor}`}
                        />
                        <div
                          className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: tmpl.defaultTheme.secondaryColor }}
                          title={`Secondary: ${tmpl.defaultTheme.secondaryColor}`}
                        />
                        <div
                          className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: tmpl.defaultTheme.accentColor }}
                          title={`Accent: ${tmpl.defaultTheme.accentColor}`}
                        />
                      </div>
                    </div>

                    {/* Recommended for */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px]">
                      <span className="text-slate-400 font-medium">Best suited for: </span>
                      <span className="text-slate-200 font-medium">{tmpl.recommendedFor}</span>
                    </div>

                    {/* Features list */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">Included Features:</span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                        {tmpl.featuresIncluded.map((feat, i) => (
                          <div key={i} className="flex items-center space-x-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: DATABASES MONITOR */}
        {activeTab === 'databases' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">MongoDB Multi-Database Cluster Status</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Har client ka data alag database me stored hai. Kisi bhi client ka database inspect ya re-seed karein.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-[#101625] border border-slate-800/80 hover:border-slate-700 transition shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm text-white">{c.name}</div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                      <span>Dedicated DB</span>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-cyan-300 break-all">
                    {c.dbName}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Provisioned: {c.dbProvisioned ? 'Yes (Seeded)' : 'Pending'}</span>
                    <span>Plan: {c.subscription?.plan}</span>
                  </div>

                  <div className="pt-2 flex items-center space-x-2">
                    <button
                      onClick={() => handleInspectDb(c)}
                      className="flex-1 py-1.5 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/50 text-cyan-300 border border-cyan-700/50 text-xs font-medium transition"
                    >
                      Inspect Collections
                    </button>
                    <button
                      onClick={() => handleReprovisionDb(c.id)}
                      disabled={actionLoading}
                      className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
                      title="Re-seed Diagnostic Questions & Categories"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: ADD NEW CLIENT WITH DEDICATED DB & TEMPLATE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#10172A] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Onboard New SaaS Client</h3>
                  <p className="text-xs text-slate-400">Creates a dedicated MongoDB database & assigns project template</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-5">
              {/* Step 1: Client & Domain */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">1. Client Identity & Domain</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300">Client / Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. QuickBuyback India"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full bg-[#161F33] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-300">Subdomain Identifier (Slug) *</label>
                    <div className="flex items-center mt-1">
                      <input
                        type="text"
                        required
                        placeholder="quickbuy"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full bg-[#161F33] border border-slate-700 rounded-l-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="bg-slate-800 px-3 py-2 text-[11px] text-slate-400 border border-l-0 border-slate-700 rounded-r-xl">
                        .camsik.com
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300">Custom Domain (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. sell.quickbuy.in"
                      value={formData.customDomain}
                      onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                      className="w-full bg-[#161F33] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-300">Subscription Tier</label>
                    <select
                      value={formData.plan}
                      onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                      className="w-full bg-[#161F33] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 mt-1"
                    >
                      <option value="starter">Starter (₹2,999/mo - 500 orders)</option>
                      <option value="growth">Growth (₹7,999/mo - 2,500 orders + Custom Domain)</option>
                      <option value="enterprise">Enterprise (₹19,999/mo - Unlimited + Priority)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Dedicated Database */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">2. Dedicated MongoDB Database</h4>
                <div>
                  <label className="text-[11px] font-medium text-slate-300">Database Name for this Client *</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Database className="w-4 h-4 text-cyan-400 shrink-0" />
                    <input
                      type="text"
                      required
                      placeholder="casmik_tenant_quickbuy"
                      value={formData.dbName}
                      onChange={(e) => setFormData({ ...formData, dbName: e.target.value })}
                      className="w-full bg-[#161F33] border border-cyan-800/80 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    MongoDB cluster will create this dedicated database specifically for this client.
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="autoProvision"
                    checked={formData.autoProvision}
                    onChange={(e) => setFormData({ ...formData, autoProvision: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <label htmlFor="autoProvision" className="text-xs text-slate-300">
                    Auto-seed default categories, brands, & 45-point diagnostic evaluation questions immediately
                  </label>
                </div>
              </div>

              {/* Step 3: Template & Theme */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">3. Template Selection & Branding</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABLE_TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => setFormData({ ...formData, templateId: tmpl.id, primaryColor: tmpl.defaultTheme.primaryColor })}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                        formData.templateId === tmpl.id
                          ? 'bg-purple-950/40 border-purple-500/80 ring-1 ring-purple-500/50'
                          : 'bg-[#141C2E] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full mt-0.5 shrink-0"
                        style={{ backgroundColor: tmpl.previewColor }}
                      />
                      <div>
                        <div className="font-semibold text-xs text-white">{tmpl.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{tmpl.badge}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300">Primary Color</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-full bg-[#161F33] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-medium text-slate-300">Tagline</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full bg-[#161F33] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Provisioning Database...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Provision Client & Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DATABASE INSPECTOR DRAWER */}
      {selectedClientForDb && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10172A] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Database Inspector</h3>
                  <p className="text-xs text-slate-400">{selectedClientForDb.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClientForDb(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 font-mono text-xs text-cyan-300">
                DB Name: <span className="font-bold">{selectedClientForDb.dbName}</span>
              </div>

              {dbStatusDetails ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Connection Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold">
                      Connected & Healthy
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-400 pt-2">Collections in this Database:</div>
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
                    {dbStatusDetails.collections?.length > 0 ? (
                      dbStatusDetails.collections.map((col: any) => (
                        <div key={col.name} className="flex items-center justify-between px-3.5 py-2 text-xs">
                          <span className="font-mono text-slate-200">{col.name}</span>
                          <span className="text-slate-400 font-semibold">{col.count} docs</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-slate-400 text-center">No collections yet.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                  <span className="text-xs">Inspecting database collections...</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
              <button
                onClick={() => handleReprovisionDb(selectedClientForDb.id)}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                <span>Re-seed Diagnostic Catalog</span>
              </button>
              <button
                onClick={() => setSelectedClientForDb(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

