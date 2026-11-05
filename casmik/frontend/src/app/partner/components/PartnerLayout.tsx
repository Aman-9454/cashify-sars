'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { PartnerSection } from '../page';
import { LayoutDashboard, ShoppingBag, ClipboardCheck, DollarSign, Users, BarChart3, Settings, Bell, Menu, ChevronLeft, ChevronRight, Store, MessageSquare, UserCircle, LogOut, Bike } from 'lucide-react';
import { Partner, partners } from '@/lib/casmikData';
import NotificationBell from '@/components/NotificationBell';
import PartnerReferModal from './PartnerReferModal';

interface NavItem { id: PartnerSection; icon: React.ElementType; label: string; badge?: number; }

interface Props {
  activeSection: PartnerSection;
  onSectionChange: (s: PartnerSection) => void;
  children: React.ReactNode;
  currentPartner?: Partner | null;
}

export default function PartnerLayout({ activeSection, onSectionChange, children, currentPartner }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showReferModal, setShowReferModal] = useState(false);
  const [partnerOrderCount, setPartnerOrderCount] = useState<number>(0);
  const [partnerInspectionCount, setPartnerInspectionCount] = useState<number>(0);
  const [partnerSupportCount, setPartnerSupportCount] = useState<number>(0);

  const getPartner = (): Partner | null => {
    if (currentPartner) return currentPartner;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('casmik_partner_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch {}
    }
    return null;
  };

  const partner: Partner = getPartner() || partners[0];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('casmik_partner_session');
      if (!session) {
        setIsAuthenticated(false);
        window.location.href = '/partner/login';
      } else {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Compute live real-time badge counts from API
  useEffect(() => {
    let isMounted = true;
    const updatePartnerMetrics = async () => {
      const currentId = partner?.id;
      if (!currentId) return;

      try {
        const res = await fetch(`/api/orders?partnerId=${encodeURIComponent(currentId)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            if (!isMounted) return;
            const orders = data.orders;
            setPartnerOrderCount(orders.length);
            const inspectionCount = orders.filter((o: any) =>
              ['inspection', 'pickup_scheduled', 'picked_up', 'diagnostics_started', 'qc_in_progress'].includes(o.status)
            ).length;
            setPartnerInspectionCount(inspectionCount);
          }
        }
      } catch {
        try {
          const rawPartner = localStorage.getItem('casmik_partner_orders_v1');
          const pList = rawPartner ? JSON.parse(rawPartner) : [];
          if (Array.isArray(pList) && isMounted) {
            setPartnerOrderCount(pList.length);
          }
        } catch {}
      }

      try {
        const rawTickets = localStorage.getItem('casmik_tickets_v1');
        if (rawTickets) {
          const tList = JSON.parse(rawTickets);
          if (Array.isArray(tList) && isMounted) {
            const activeTickets = tList.filter((t: any) => t.status !== 'resolved' && t.status !== 'closed');
            setPartnerSupportCount(activeTickets.length);
          }
        }
      } catch {}
    };

    updatePartnerMetrics();
    window.addEventListener('casmik_orders_updated', updatePartnerMetrics);
    window.addEventListener('casmik_partner_orders_updated', updatePartnerMetrics);
    window.addEventListener('storage', updatePartnerMetrics);
    return () => {
      isMounted = false;
      window.removeEventListener('casmik_orders_updated', updatePartnerMetrics);
      window.removeEventListener('casmik_partner_orders_updated', updatePartnerMetrics);
      window.removeEventListener('storage', updatePartnerMetrics);
    };
  }, [partner?.id]);

  const navItems: NavItem[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders', badge: partnerOrderCount },
    { id: 'inspection', icon: ClipboardCheck, label: 'Inspection', badge: partnerInspectionCount },
    { id: 'riders', icon: Bike, label: 'My Riders' },
    { id: 'payouts', icon: DollarSign, label: 'Payouts' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
    { id: 'support', icon: MessageSquare, label: 'Support Tickets', badge: partnerSupportCount },
    { id: 'profile', icon: UserCircle, label: 'My Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center p-8">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold">Redirecting to Partner Login...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('casmik_partner_session');
      window.location.href = '/partner/login';
    }
  };

  const initialLetter = partner?.storeName?.[0] || partner?.name?.[0] || 'P';

  const SidebarContent = () => (
    <>
      <div className={`flex items-center h-16 border-b border-gray-100 flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}>
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-sm">C</span>
        </div>
        {!collapsed && (
          <div>
            <p className="font-black text-gray-900 text-sm leading-none">CAMSIK</p>
            <p className="text-xs text-gray-400 leading-none mt-0.5">Partner Portal</p>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {navItems.map((item) => {
          const active = activeSection === item.id;
          return (
            <button key={item.id} onClick={() => { onSectionChange(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center mx-2 rounded-xl transition-all duration-150 mb-0.5 ${collapsed ? 'justify-center w-12 h-10 p-0' : 'gap-2.5 px-3 py-2.5'} ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
              style={{ width: collapsed ? '3rem' : 'calc(100% - 1rem)' }}
            >
              <item.icon size={17} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-sm font-medium flex-1 text-left truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-red-500 text-white">{item.badge}</span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
      {/* Refer & Earn */}
      {!collapsed && (
        <div className="mx-3 mb-3 bg-gradient-to-br from-primary/10 to-green-100 rounded-2xl p-3 text-center">
          <p className="text-lg mb-1">🎁</p>
          <p className="text-xs font-bold text-gray-900">Refer & Earn More</p>
          <p className="text-xs text-gray-500 mb-2">Refer new partners and earn extra commission.</p>
          <button
            onClick={() => setShowReferModal(true)}
            className="w-full py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-transform active:scale-95 shadow-md shadow-primary/20"
          >
            Refer Now
          </button>
        </div>
      )}
      <div className={`border-t border-gray-100 p-3 flex items-center flex-shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
          {initialLetter}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{partner?.storeName || partner?.name}</p>
            <p className="text-xs text-gray-400 truncate">ID: {partner?.id}</p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#f8f9fb] overflow-hidden font-sans">
      {/* Desktop sidebar */}
      <aside className={`relative flex-shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 hidden md:flex ${collapsed ? 'w-16' : 'w-56'}`}>
        <SidebarContent />
        <button onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 z-10">
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-white flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100"><Menu size={20} /></button>
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900 capitalize">
              {activeSection === 'profile' ? 'My Store Profile' :
               activeSection === 'dashboard' ? 'Store Dashboard' :
               activeSection === 'orders' ? 'Orders Management' :
               activeSection === 'inspection' ? 'Device Inspection Hub' :
               activeSection === 'payouts' ? 'Wallet & Payouts' :
               activeSection === 'customers' ? 'Store Customers' :
               activeSection === 'reports' ? 'Performance Reports' :
               activeSection === 'support' ? 'Support Tickets' :
               activeSection === 'settings' ? 'Store Settings' : activeSection}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell
              role="partner"
              onNavigateSection={(section) => onSectionChange(section as PartnerSection)}
              onNavigateToOrder={() => onSectionChange('orders')}
            />
            
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {initialLetter}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-gray-900 leading-none">{partner?.storeName || partner?.name}</p>
                <p className="text-xs text-gray-400 leading-none">ID: {partner?.id}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg px-2.5 py-1.5 transition-colors flex items-center gap-1 border border-red-200"
              title="Sign Out"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>

      <PartnerReferModal
        partner={partner}
        isOpen={showReferModal}
        onClose={() => setShowReferModal(false)}
      />
    </div>
  );
}
