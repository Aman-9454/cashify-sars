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
  Server,
  Check,
  TrendingUp,
  DollarSign,
  Radio,
  Copy,
  UserCheck,
  Smartphone,
  Trash2,
  Power,
  Sliders,
  Cpu,
  Download,
  Terminal,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Tenant } from '@/lib/types';
import { AVAILABLE_TEMPLATES } from '@/lib/templates';
import TenantCreationWizard from './components/TenantCreationWizard';
import ThemePreviewStudio from './components/ThemePreviewStudio';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'clients' | 'studio' | 'templates' | 'domains' | 'builds' | 'databases'>('clients');
  const [clients, setClients] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTemplate, setFilterTemplate] = useState('all');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedClientForDb, setSelectedClientForDb] = useState<Tenant | null>(null);
  const [selectedClientForStudio, setSelectedClientForStudio] = useState<Tenant | null>(null);
  const [dbStatusDetails, setDbStatusDetails] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Domains State
  const [domains, setDomains] = useState<any[]>([]);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [newDomainTenantId, setNewDomainTenantId] = useState('');

  // Builds State
  const [builds, setBuilds] = useState<any[]>([]);
  const [buildTenantId, setBuildTenantId] = useState('');
  const [buildPanelType, setBuildPanelType] = useState('user_android');
  const [buildType, setBuildType] = useState('release_apk');
  const [selectedBuildLogs, setSelectedBuildLogs] = useState<string[] | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (data.success && data.clients) {
        setClients(data.clients);
        if (data.clients.length > 0) {
          if (!newDomainTenantId) setNewDomainTenantId(data.clients[0].id);
          if (!buildTenantId) setBuildTenantId(data.clients[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
      showToast('error', 'Failed to fetch SaaS clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/domains');
      const data = await res.json();
      if (data.success) setDomains(data.domains || []);
    } catch (err) {
      console.error('Failed to load domains:', err);
    }
  };

  const fetchBuilds = async () => {
    try {
      const res = await fetch('/api/builds');
      const data = await res.json();
      if (data.success) setBuilds(data.builds || []);
    } catch (err) {
      console.error('Failed to load builds:', err);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchDomains();
    fetchBuilds();
  }, []);

  const handleInspectDb = async (client: Tenant) => {
    setSelectedClientForDb(client);
    setDbStatusDetails(null);
    try {
      const res = await fetch(`/api/clients/${client.id}`);
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
      const res = await fetch(`/api/clients/${clientId}/provision`, {
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

  const handleDuplicateClient = async (client: Tenant) => {
    if (!confirm(`Duplicate configuration and dedicated database for '${client.name}'?`)) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/clients/${client.id}/duplicate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        fetchClients();
      } else {
        showToast('error', data.message);
      }
    } catch (err) {
      showToast('error', 'Failed to duplicate client');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImpersonateAdmin = async (client: Tenant) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/clients/${client.id}/impersonate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.portalUrl) {
        showToast('success', `Impersonating ${client.name} — opening tenant admin...`);
        window.open(data.portalUrl, '_blank');
      } else {
        showToast('error', data.message || 'Impersonation failed');
      }
    } catch (err) {
      showToast('error', 'Failed to impersonate tenant admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (client: Tenant) => {
    const newStatus = client.status === 'active' ? 'suspended' : 'active';
    try {
      setActionLoading(true);
      const res = await fetch(`/api/clients/${client.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Tenant status set to '${newStatus}'!`);
        fetchClients();
      } else {
        showToast('error', data.message);
      }
    } catch (err) {
      showToast('error', 'Failed to update tenant status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClient = async (client: Tenant) => {
    if (!confirm(`Are you sure you want to delete client '${client.name}'? This cannot be undone.`)) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Client deleted successfully');
        fetchClients();
      } else {
        showToast('error', data.message);
      }
    } catch (err) {
      showToast('error', 'Failed to delete client');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput || !newDomainTenantId) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: newDomainTenantId, domain: newDomainInput }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        setNewDomainInput('');
        fetchDomains();
      } else {
        showToast('error', data.message);
      }
    } catch (err) {
      showToast('error', 'Failed to register domain');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyDomain = async (domainStr: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/domains/${encodeURIComponent(domainStr)}/verify`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Domain '${domainStr}' verification completed!`);
        fetchDomains();
      } else {
        showToast('error', data.message);
      }
    } catch (err) {
      showToast('error', 'Domain verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildTenantId) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: buildTenantId,
          panelType: buildPanelType,
          buildType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        fetchBuilds();
      } else {
        showToast('error', data.message);
      }
    } catch (err) {
      showToast('error', 'Failed to trigger build');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenStudio = (client: Tenant) => {
    setSelectedClientForStudio(client);
    setActiveTab('studio');
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dbName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTemplate = filterTemplate === 'all' || c.templateId === filterTemplate;
    return matchesSearch && matchesTemplate;
  });

  const totalMrr = clients.reduce((acc, c) => acc + (c.subscription?.priceMonthly || 0), 0);
  const totalDbs = clients.length;

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-sm font-medium border animate-fadeIn ${
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

      {/* Header */}
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
                  Database-per-Tenant Model
                </span>
              </div>
              <p className="text-xs text-slate-400">12-Panel White-Label Control Plane & Automation Suite</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowWizard(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Onboard Client Wizard</span>
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

      {/* Main Content */}
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
              <span>Independent White-Label Tenants</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#131B2E] to-[#0E1524] border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
              <span>Isolated Databases</span>
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">{totalDbs}</div>
            <div className="text-[11px] text-cyan-400 mt-2 flex items-center space-x-1">
              <Server className="w-3.5 h-3.5" />
              <span>Zero Cross-Tenant Leakage</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#131B2E] to-[#0E1524] border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
              <span>Available Themes</span>
              <Palette className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">{AVAILABLE_TEMPLATES.length}</div>
            <div className="text-[11px] text-purple-400 mt-2 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5" />
              <span>15 Pre-Engineered Design Systems</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#131B2E] to-[#0E1524] border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
              <span>Monthly SaaS Revenue</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">₹{(totalMrr / 1000).toFixed(1)}k</div>
            <div className="text-[11px] text-amber-400 mt-2 flex items-center space-x-1">
              <span>Active Monthly Subscriptions</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
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
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
              activeTab === 'studio'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>12-Panel Live Theme Studio</span>
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
            onClick={() => setActiveTab('domains')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
              activeTab === 'domains'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Custom Domains & SSL</span>
          </button>

          <button
            onClick={() => setActiveTab('builds')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
              activeTab === 'builds'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Mobile App Build Generator</span>
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
            <span>Database Monitor & Health</span>
          </button>
        </div>

        {/* TAB 1: CLIENTS TABLE */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
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

              <select
                value={filterTemplate}
                onChange={(e) => setFilterTemplate(e.target.value)}
                className="bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/60"
              >
                <option value="all">All Templates ({AVAILABLE_TEMPLATES.length})</option>
                {AVAILABLE_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

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

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="font-mono text-cyan-300 font-medium text-[11px] flex items-center space-x-1.5">
                                <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span>{client.dbName}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Provisioned: {client.dbProvisioned ? (
                                  <span className="text-emerald-400 font-semibold">Active & Seeded</span>
                                ) : (
                                  <span className="text-amber-400 font-semibold">Pending</span>
                                )}
                              </div>
                            </div>
                          </td>

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

                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                              {client.subscription?.plan || 'starter'}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1">
                              ₹{(client.subscription?.priceMonthly || 0).toLocaleString()}/mo
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                client.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : client.status === 'suspended'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {client.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Open 12-Panel Theme Studio */}
                              <button
                                onClick={() => handleOpenStudio(client)}
                                className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/60 transition"
                                title="Open 12-Panel Live Theme Studio"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>

                              {/* Impersonate Admin */}
                              <button
                                onClick={() => handleImpersonateAdmin(client)}
                                className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 transition"
                                title="Impersonate Tenant Admin"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>

                              {/* Duplicate Tenant */}
                              <button
                                onClick={() => handleDuplicateClient(client)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                                title="Duplicate Tenant & DB"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* Inspect DB */}
                              <button
                                onClick={() => handleInspectDb(client)}
                                className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 transition"
                                title="Inspect Database"
                              >
                                <Database className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Status (Active / Suspend) */}
                              <button
                                onClick={() => handleToggleStatus(client)}
                                className={`p-1.5 rounded-lg border transition ${
                                  client.status === 'active'
                                    ? 'bg-amber-950/60 hover:bg-amber-900/60 text-amber-400 border-amber-800/60'
                                    : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border-emerald-800/60'
                                }`}
                                title={client.status === 'active' ? 'Suspend Tenant' : 'Activate Tenant'}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteClient(client)}
                                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 transition"
                                title="Delete Tenant"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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

        {/* TAB 2: 12-PANEL LIVE THEME STUDIO */}
        {activeTab === 'studio' && (
          <ThemePreviewStudio
            tenant={selectedClientForStudio || clients[0]}
            onSave={async (tokens, overrides) => {
              const target = selectedClientForStudio || clients[0];
              if (!target) return;
              try {
                setActionLoading(true);
                const res = await fetch(`/api/clients/${target.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    branding: {
                      ...target.branding,
                      primaryColor: tokens.primaryColor,
                      secondaryColor: tokens.secondaryColor,
                      accentColor: tokens.accentColor,
                      panelOverrides: overrides,
                    },
                  }),
                });
                const data = await res.json();
                if (data.success) {
                  showToast('success', `Branding saved for ${target.name}!`);
                  fetchClients();
                }
              } catch (err) {
                showToast('error', 'Failed to save branding');
              } finally {
                setActionLoading(false);
              }
            }}
          />
        )}

        {/* TAB 3: TEMPLATES CATALOG */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">15 Pre-Engineered Design System Templates</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every template is wired with dynamic tokens across all 12 web and mobile applications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {AVAILABLE_TEMPLATES.map((tmpl) => {
                const assignedCount = clients.filter((c) => c.templateId === tmpl.id).length;
                return (
                  <div
                    key={tmpl.id}
                    className="p-6 rounded-2xl bg-[#101625] border border-slate-800/80 hover:border-slate-700 transition shadow-xl space-y-4 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5"
                      style={{ backgroundColor: tmpl.previewColor }}
                    />

                    <div>
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
                          <span className="text-[11px] font-bold text-slate-400">Tenants</span>
                          <div className="text-xl font-extrabold text-white">{assignedCount}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 pt-3">
                        <span className="text-[11px] text-slate-400 font-medium">Palette:</span>
                        <div className="flex items-center space-x-1.5">
                          <div
                            className="w-5 h-5 rounded-full border border-white/20"
                            style={{ backgroundColor: tmpl.tokens.primaryColor }}
                          />
                          <div
                            className="w-5 h-5 rounded-full border border-white/20"
                            style={{ backgroundColor: tmpl.tokens.secondaryColor }}
                          />
                          <div
                            className="w-5 h-5 rounded-full border border-white/20"
                            style={{ backgroundColor: tmpl.tokens.accentColor }}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] mt-3">
                        <span className="text-slate-400 font-medium">Recommended: </span>
                        <span className="text-slate-200">{tmpl.recommendedFor}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setSelectedClientForStudio(clients[0] || null);
                          setActiveTab('studio');
                        }}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Inspect in 12-Panel Studio</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOM DOMAINS & SSL */}
        {activeTab === 'domains' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-base font-bold text-white">Custom Domain Mapping & Automated DNS Engine</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Map custom client hostnames (e.g. sell.gadgethub.in) to their white-label storefront and admin panel.
              </p>
            </div>

            {/* Register Domain Form */}
            <form onSubmit={handleAddDomain} className="p-5 rounded-2xl bg-[#101625] border border-slate-800/80 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Map New Domain</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300">Select Client Tenant</label>
                  <select
                    value={newDomainTenantId}
                    onChange={(e) => setNewDomainTenantId(e.target.value)}
                    className="w-full bg-[#141C2E] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 mt-1"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.slug}.camsik.com)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-slate-300">Custom Domain Hostname</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      required
                      placeholder="e.g. sell.gadgethub.in"
                      value={newDomainInput}
                      onChange={(e) => setNewDomainInput(e.target.value)}
                      className="w-full bg-[#141C2E] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 whitespace-nowrap transition"
                    >
                      Add Domain
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Domain Records Table */}
            <div className="bg-[#101625] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141C2E] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Domain Hostname</th>
                      <th className="px-6 py-4">Assigned Tenant</th>
                      <th className="px-6 py-4">DNS Configuration Required</th>
                      <th className="px-6 py-4">Status & SSL</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {domains.map((dom) => (
                      <tr key={dom.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 font-mono text-white text-xs font-semibold">
                            <Globe className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{dom.domain}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-white">{dom.tenantSlug}</span>
                        </td>

                        <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                          <div>CNAME &rarr; <span className="text-cyan-300">camsik-proxy.camsik.com</span></div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                dom.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {dom.status}
                            </span>
                            <span className="text-[10px] text-slate-400">SSL: {dom.sslStatus}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleVerifyDomain(dom.domain)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition"
                          >
                            Verify DNS
                          </button>
                        </td>
                      </tr>
                    ))}
                    {domains.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-xs">
                          No custom domains registered yet. Use the form above to connect custom client hostnames.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MOBILE APP BUILD GENERATOR */}
        {activeTab === 'builds' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-base font-bold text-white">Mobile App Build Studio (Android & iOS)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate branded Android APKs, Play Store AAB bundles, and iOS IPAs for all 4 mobile codebases.
              </p>
            </div>

            {/* Build Trigger Form */}
            <form onSubmit={handleTriggerBuild} className="p-5 rounded-2xl bg-[#101625] border border-slate-800/80 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Trigger New Compilation Job</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300">Target Tenant</label>
                  <select
                    value={buildTenantId}
                    onChange={(e) => setBuildTenantId(e.target.value)}
                    className="w-full bg-[#141C2E] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 mt-1"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300">Application Panel</label>
                  <select
                    value={buildPanelType}
                    onChange={(e) => setBuildPanelType(e.target.value)}
                    className="w-full bg-[#141C2E] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 mt-1"
                  >
                    <option value="user_android">User App (Android APK/AAB)</option>
                    <option value="user_ios">User App (iOS IPA)</option>
                    <option value="partner_android">Partner POS (Android)</option>
                    <option value="partner_ios">Partner POS (iOS)</option>
                    <option value="delivery_android">Delivery Rider (Android)</option>
                    <option value="delivery_ios">Delivery Rider (iOS)</option>
                    <option value="admin_android">Admin Mobile (Android)</option>
                    <option value="admin_ios">Admin Mobile (iOS)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300">Artifact Format</label>
                  <select
                    value={buildType}
                    onChange={(e) => setBuildType(e.target.value)}
                    className="w-full bg-[#141C2E] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 mt-1"
                  >
                    <option value="release_apk">Release APK (Direct Sideload)</option>
                    <option value="aab">Android App Bundle (AAB - Play Store)</option>
                    <option value="ipa">iOS IPA (TestFlight / App Store)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-1.5"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>Compile Build</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Build History Table */}
            <div className="bg-[#101625] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141C2E] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Build Job ID</th>
                      <th className="px-6 py-4">Tenant & Application</th>
                      <th className="px-6 py-4">Artifact Format</th>
                      <th className="px-6 py-4">Compilation Status</th>
                      <th className="px-6 py-4 text-right">Artifact & Logs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {builds.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4 font-mono text-[11px] text-cyan-300">
                          {b.id}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{b.appName || b.tenantSlug}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{b.panelType}</div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase font-mono bg-slate-800 text-slate-200">
                            {b.buildType} ({b.artifactSizeMb} MB)
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{b.status}</span>
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setSelectedBuildLogs(b.buildLogs || [])}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 transition"
                            >
                              <Terminal className="w-3 h-3" />
                              <span>Logs</span>
                            </button>

                            {b.artifactUrl && (
                              <a
                                href={b.artifactUrl}
                                download
                                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center space-x-1 transition"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download</span>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {builds.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-xs">
                          No mobile builds generated yet. Select a tenant and trigger your first automated compilation.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DATABASES CLUSTER */}
        {activeTab === 'databases' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">MongoDB Cluster Database Isolation</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every tenant is provisioned with its own physically separated MongoDB database (`casmik_tenant_slug`).
              </p>
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
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      <span>Dedicated</span>
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

      {/* 5-STEP TENANT ONBOARDING WIZARD */}
      <TenantCreationWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSuccess={() => {
          setShowWizard(false);
          showToast('success', 'Tenant provisioned and catalog seeded successfully!');
          fetchClients();
        }}
      />

      {/* INSPECT DB MODAL */}
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
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 max-h-56 overflow-y-auto">
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

      {/* BUILD LOGS MODAL */}
      {selectedBuildLogs && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0D14] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Flutter Compilation Logs</h3>
              </div>
              <button onClick={() => setSelectedBuildLogs(null)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>
            <div className="bg-[#05070B] border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-80 overflow-y-auto">
              {selectedBuildLogs.map((log, i) => (
                <div key={i} className="text-slate-300 leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
            <div className="text-right pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedBuildLogs(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
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
