'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { DeliverySection } from '../page';
import { 
  LayoutDashboard, 
  Package, 
  DollarSign, 
  User, 
  MessageSquare, 
  LogOut, 
  Truck, 
  Star, 
  ShieldCheck, 
  PhoneCall, 
  ChevronRight,
  TrendingUp,
  MapPin,
  HelpCircle,
  Menu,
  X,
  ClipboardCheck
} from 'lucide-react';
import { deliveryAgents, DeliveryAgent, orders } from '@/lib/casmikData';
import NotificationBell from '@/components/NotificationBell';

interface NavItem { 
  id: DeliverySection; 
  icon: React.ElementType; 
  label: string; 
  badge?: number; 
  desc: string;
}

interface Props {
  activeSection: DeliverySection;
  onSectionChange: (s: DeliverySection) => void;
  children: React.ReactNode;
  currentAgent?: DeliveryAgent | null;
}

export default function DeliveryLayout({ activeSection, onSectionChange, children, currentAgent }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('casmik_delivery_session');
      if (!session) {
        setIsAuthenticated(false);
        window.location.href = '/delivery/login';
      } else {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const getAgent = (): DeliveryAgent | null => {
    if (currentAgent) return currentAgent;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('casmik_delivery_session');
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return null;
  };

  const agent: DeliveryAgent = getAgent() || deliveryAgents[0];
  const [isOnline, setIsOnline] = useState(agent?.status !== 'offline');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [taskCount, setTaskCount] = useState(5);

  useEffect(() => {
    const updateTaskCount = () => {
      try {
        const raw = localStorage.getItem('casmik_orders_v1');
        const all = raw ? JSON.parse(raw) : orders;
        const activeTasks = all.filter((o: any) => 
          Boolean(o.deliveryAgentId) &&
          (o.deliveryAgentId === agent?.id || o.deliveryAgentId === 'agent-101') &&
          ['assigned', 'accepted', 'pickup_scheduled', 'picked_up'].includes(o.status)
        );
        setTaskCount(activeTasks.length);
      } catch {}
    };

    updateTaskCount();
    window.addEventListener('casmik_orders_updated', updateTaskCount);
    window.addEventListener('casmik_partner_orders_updated', updateTaskCount);
    window.addEventListener('storage', updateTaskCount);
    return () => {
      window.removeEventListener('casmik_orders_updated', updateTaskCount);
      window.removeEventListener('casmik_partner_orders_updated', updateTaskCount);
      window.removeEventListener('storage', updateTaskCount);
    };
  }, [agent?.id]);

  const navItems: NavItem[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', desc: 'Real-time metrics & route' },
    { id: 'tasks', icon: Package, label: 'My Tasks', badge: taskCount, desc: 'Active & scheduled pickups' },
    { id: 'inspection', icon: ClipboardCheck, label: 'Inspection Hub', desc: '12-point doorstep diagnostics' },
    { id: 'earnings', icon: DollarSign, label: 'Earnings & Payouts', desc: 'Daily settlement & bonuses' },
    { id: 'support', icon: MessageSquare, label: 'Support Tickets', desc: 'Direct admin helpline' },
    { id: 'profile', icon: User, label: 'Profile & KYC', desc: 'Vehicle & documents' },
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('casmik_delivery_session');
      window.location.href = '/delivery/login';
    }
  };

  const sectionTitles: Record<DeliverySection, { title: string; subtitle: string }> = {
    dashboard: { title: 'Executive Operations Dashboard', subtitle: 'Overview of your route, scheduled pickups, and daily targets' },
    tasks: { title: 'Pickup & Delivery Task Queue', subtitle: 'Live customer pickup orders, address routing, and OTP collection' },
    inspection: { title: 'Doorstep 12-Point Inspection Hub', subtitle: 'Hardware diagnostics, photo capture angles, customer OTP, and device collection' },
    earnings: { title: 'Earnings & Spot Payout Ledger', subtitle: 'Track base payouts, peak-hour incentives, and daily bank deposits' },
    support: { title: 'Executive Support Desk', subtitle: 'Submit address issues, customer escalation tickets, and get real-time assistance' },
    profile: { title: 'Delivery Partner Profile & KYC', subtitle: 'Manage identity verification, vehicle details, and active service areas' },
  };

  const currentInfo = sectionTitles[activeSection] || sectionTitles.dashboard;

  return (
    <div className="flex h-screen bg-[#f8f9fb] overflow-hidden font-sans text-slate-800">
      {/* ─── DESKTOP SLEEK SIDEBAR (lg+) ────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200/80 flex-shrink-0 z-30 shadow-sm">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100">
          <Link href="/delivery" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-900 tracking-tight">CAMSIK</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">Fleet</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Delivery Executive Portal</p>
            </div>
          </Link>
        </div>

        {/* Executive Agent Card in Sidebar */}
        <div className="p-4 mx-3 my-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              {agent?.avatar ? (
                <img src={agent.avatar} alt={agent.name} className="w-12 h-12 rounded-xl object-cover border-2 border-white/20" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary text-white font-black flex items-center justify-center text-base">
                  {agent?.name?.[0] || 'D'}
                </div>
              )}
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${isOnline ? 'bg-emerald-400' : 'bg-slate-400'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-sm text-white truncate">{agent?.name}</p>
              <p className="text-[11px] text-slate-300 truncate">{agent?.vehicle} · {agent?.vehicleNumber}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">{agent?.rating || '4.9'}</span>
                <span className="text-[10px] text-slate-400">· {agent?.totalDeliveries || 840} runs</span>
              </div>
            </div>
          </div>

          {/* Status Switch Inside Agent Box */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              {isOnline ? 'Active Online' : 'Offline'}
            </span>
            <button 
              type="button"
              onClick={() => setIsOnline(o => !o)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${isOnline ? 'bg-emerald-500' : 'bg-slate-600'}`}
              title="Toggle duty status"
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200 ${isOnline ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer text-left ${
                  active 
                    ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/20' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600'}`}>
                    <item.icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate leading-snug">{item.label}</p>
                    <p className="text-[10px] text-slate-400 font-normal truncate">{item.desc}</p>
                  </div>
                </div>

                {item.badge && item.badge > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight size={14} className={`text-slate-300 transition-transform ${active ? 'text-primary translate-x-0.5' : ''}`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Cards */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {/* Quick SOS / Support Box */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                <PhoneCall size={14} />
              </div>
              <div>
                <p className="text-xs font-black text-emerald-950">Fleet Helpline</p>
                <p className="text-[10px] text-emerald-700 font-medium">1800-CAMSIK-24</p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md">24/7</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT WRAPPER ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200/80 flex-shrink-0 z-20">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-18 gap-3">
            {/* Left: Mobile Drawer Trigger + Page Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Fleet Portal</span>
                  <span className="text-slate-300 hidden sm:inline">/</span>
                  <h1 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 truncate">
                    {currentInfo.title}
                  </h1>
                </div>
                <p className="text-xs text-slate-500 hidden md:block truncate mt-0.5">
                  {currentInfo.subtitle}
                </p>
              </div>
            </div>

            {/* Right: Duty Status Badge + NotificationBell + Profile Quick Pill */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Online/Offline Toggle (Header) */}
              <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl px-3 py-1.5 transition-colors">
                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                  {isOnline ? 'Online & Available' : 'On Break'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOnline(o => !o)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all duration-200 ${isOnline ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Notification Bell with Sound Chime & Shift to Read support */}
              <NotificationBell 
                role="delivery" 
                onNavigateSection={(sec) => onSectionChange(sec as any)} 
              />

              {/* Agent Profile Pill */}
              <div className="flex items-center gap-2.5 bg-slate-100/80 rounded-2xl p-1.5 pr-3 border border-slate-200/60">
                {agent?.avatar ? (
                  <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-xl object-cover flex-shrink-0 border border-white shadow-xs" />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {agent?.name?.[0] || 'D'}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-black text-slate-900 leading-none truncate max-w-[100px]">{agent?.name}</p>
                  <p className="text-[10px] text-slate-500 font-semibold leading-none mt-1">ID: {agent?.id || 'EXE-01'}</p>
                </div>
              </div>

              {/* Header Logout */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-rose-200 transition-colors"
                title="Sign Out"
              >
                <LogOut size={13} />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Sub-header Notice Strip */}
          <div className={`px-4 sm:px-8 py-1.5 text-xs font-bold text-center transition-all ${isOnline ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {isOnline 
              ? '🟢 Ready for Pickup Tasks — GPS Location Active & Synced with Operations Center' 
              : '⚫ You are OFFLINE — Toggle switch above to start receiving new device collection tasks'}
          </div>
        </header>

        {/* ─── FULL-WIDTH MAIN VIEW ────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60">
          <div className="w-full max-w-[1600px] mx-auto space-y-6">
            {children}
          </div>
        </main>

        {/* ─── MOBILE BOTTOM BAR (Below lg screens) ─────────────────────────── */}
        <nav className="lg:hidden bg-white border-t border-slate-200/80 flex-shrink-0 z-20 shadow-lg">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-all relative ${
                    active ? 'text-primary font-bold' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {item.badge && item.badge > 0 && (
                    <span className="absolute top-1.5 right-1/4 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                  <item.icon size={19} className={active ? 'scale-110 transition-transform' : ''} />
                  <span className="text-[10px]">{item.label}</span>
                  {active && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ─── MOBILE DRAWER OVERLAY ────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-black text-lg text-slate-900">CAMSIK Delivery</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="py-4 flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left font-bold text-sm ${
                    activeSection === item.id ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
