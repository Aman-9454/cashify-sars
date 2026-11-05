'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ExternalLink, ArrowLeft } from 'lucide-react';
import AdminPanelLayout from './components/AdminPanelLayout';
import AdminOverview from './components/AdminOverview';
import AdminCategories from './components/AdminCategories';
import AdminBrands from './components/AdminBrands';
import AdminModels from './components/AdminModels';
import AdminOrders from './components/AdminOrders';
import AdminPartners from './components/AdminPartners';
import AdminDelivery from './components/AdminDelivery';
import AdminPricing from './components/AdminPricing';
import AdminCustomers from './components/AdminCustomers';
import AdminPayouts from './components/AdminPayouts';
import AdminCMS from './components/AdminCMS';
import AdminReports from './components/AdminReports';
import AdminSettings from './components/AdminSettings';
import AdminNotifications from './components/AdminNotifications';
import AdminPushNotifications from './components/AdminPushNotifications';
import AdminRefurbished from './components/AdminRefurbished';
import AdminRepairIssues from './components/AdminRepairIssues';
import AdminInventory from './components/AdminInventory';
import AdminSupportTickets from './components/AdminSupportTickets';
import AdminCoupons from './components/AdminCoupons';
import AdminRentalCameras from './components/AdminRentalCameras';

export type AdminSection = 'overview' | 'orders' | 'categories' | 'brands' | 'models' | 'lenses' | 'pricing' | 'partners' | 'delivery' | 'customers' | 'payouts' | 'cms' | 'reports' | 'settings' | 'notifications' | 'push_notifications' | 'refurbished' | 'repair_issues' | 'inventory' | 'support_tickets' | 'coupons' | 'rental_cameras' | 'rental_orders';

export interface AdminNavigationOptions {
  filterStatus?: string;
  filterType?: string;
  orderId?: string;
  tab?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [impersonatedTenant, setImpersonatedTenant] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [ordersFilterStatus, setOrdersFilterStatus] = useState<string>('all');
  const [ordersFilterType, setOrdersFilterType] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleNavigate = useCallback((section: AdminSection, options?: AdminNavigationOptions) => {
    setActiveSection(section);
    if (options?.filterStatus !== undefined) {
      setOrdersFilterStatus(options.filterStatus);
    }
    if (options?.filterType !== undefined) {
      setOrdersFilterType(options.filterType);
    }
    if (options?.orderId !== undefined) {
      setSelectedOrderId(options.orderId);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');
      const tenant = searchParams.get('tenant');

      // Super Admin Impersonation Handshake
      if (token && token.startsWith('imp_')) {
        localStorage.setItem('casmik_admin_auth', 'true');
        localStorage.setItem('casmik_impersonation_token', token);
        if (tenant) {
          localStorage.setItem('casmik_active_tenant', tenant);
          setImpersonatedTenant(tenant);
        }
        setIsAuthorized(true);
        return;
      }

      const activeTenant = localStorage.getItem('casmik_active_tenant');
      if (activeTenant) {
        setImpersonatedTenant(activeTenant);
      }

      const auth = localStorage.getItem('casmik_admin_auth');
      if (auth !== 'true') {
        router.replace('/admin/login');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [router]);

  useEffect(() => {
    const handleNavEvent = (e: any) => {
      if (e.detail?.section) {
        handleNavigate(e.detail.section, e.detail.options);
      }
    };
    window.addEventListener('casmik_admin_navigate', handleNavEvent);
    return () => window.removeEventListener('casmik_admin_navigate', handleNavEvent);
  }, [handleNavigate]);

  if (isAuthorized !== true) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white select-none">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 shadow-xl shadow-purple-500/20">
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-white">CAMSIK Admin Security</h2>
            <p className="text-xs text-slate-400">Verifying administrator authorization...</p>
          </div>
          <p className="text-[11px] text-slate-500">Redirecting to Login...</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview onNavigate={handleNavigate} />;
      case 'orders':
        return (
          <AdminOrders
            initialFilterStatus={ordersFilterStatus}
            initialFilterType={ordersFilterType}
            initialOrderId={selectedOrderId || undefined}
          />
        );
      case 'categories':
        return <AdminCategories />;
      case 'brands':
        return <AdminBrands />;
      case 'models':
        return <AdminModels />;
      case 'pricing':
        return <AdminPricing />;
      case 'partners':
        return <AdminPartners />;
      case 'delivery':
        return <AdminDelivery />;
      case 'customers':
        return <AdminCustomers />;
      case 'payouts':
        return <AdminPayouts />;
      case 'cms':
        return <AdminCMS />;
      case 'reports':
        return <AdminReports />;
      case 'settings':
        return <AdminSettings />;
      case 'notifications':
        return <AdminNotifications />;
      case 'push_notifications':
        return <AdminPushNotifications />;
      case 'refurbished':
        return <AdminRefurbished />;
      case 'repair_issues':
        return <AdminRepairIssues />;
      case 'inventory':
        return <AdminInventory />;
      case 'support_tickets':
        return <AdminSupportTickets />;
      case 'coupons':
        return <AdminCoupons />;
      case 'rental_cameras':
      case 'rental_orders':
        return <AdminRentalCameras />;
      default:
        return <AdminOverview onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Super Admin Impersonation Notice Banner */}
      {impersonatedTenant && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-4 py-2 border-b border-purple-500/40 text-xs font-semibold flex items-center justify-between sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Impersonation Active: Viewing tenant portal for <strong className="text-emerald-400 font-mono">@{impersonatedTenant}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="http://localhost:4030"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 bg-purple-500/30 hover:bg-purple-500/40 rounded-lg text-purple-200 text-[11px] font-bold transition flex items-center space-x-1"
            >
              <span>Super Admin Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => {
                localStorage.removeItem('casmik_impersonation_token');
                localStorage.removeItem('casmik_active_tenant');
                setImpersonatedTenant(null);
                window.location.href = '/admin';
              }}
              className="text-slate-300 hover:text-white text-[11px] underline"
            >
              Exit Session
            </button>
          </div>
        </div>
      )}

      <AdminPanelLayout activeSection={activeSection} onSectionChange={setActiveSection}>
        {renderSection()}
      </AdminPanelLayout>
    </div>
  );
}
