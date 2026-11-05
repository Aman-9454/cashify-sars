'use client';
import React from 'react';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard, Users, Handshake, Truck, Tag, Package, Warehouse,
  Calculator, HelpCircle, Ticket, CreditCard, MapPin, MessageSquare,
  Star, Bell, FileText, BarChart3, Settings, Shield, ChevronLeft,
  ChevronRight, Wrench, RefreshCw, Zap, Globe, ShoppingBag,
} from 'lucide-react';
import type { AdminSection } from './AdminLayout';

interface NavItem {
  id: AdminSection;
  icon: React.ElementType;
  label: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'warning' | 'danger';
}

const navGroups: { group: string; items: NavItem[] }[] = [
  {
    group: 'Overview',
    items: [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    group: 'Users & Partners',
    items: [
      { id: 'customers', icon: Users, label: 'Customers', badge: 12, badgeVariant: 'default' },
      { id: 'partners', icon: Handshake, label: 'Partners', badge: 3, badgeVariant: 'warning' },
      { id: 'delivery', icon: Truck, label: 'Delivery Execs' },
    ],
  },
  {
    group: 'Orders',
    items: [
      { id: 'sell-orders', icon: Tag, label: 'Sell Orders', badge: 47, badgeVariant: 'danger' },
      { id: 'buy-orders', icon: ShoppingBag, label: 'Buy Orders', badge: 23 },
      { id: 'exchange-orders', icon: RefreshCw, label: 'Exchange Orders' },
      { id: 'repair-orders', icon: Wrench, label: 'Repair Orders', badge: 8 },
      { id: 'pickups', icon: Truck, label: 'Pickups', badge: 15, badgeVariant: 'warning' },
    ],
  },
  {
    group: 'Catalog',
    items: [
      { id: 'categories', icon: Tag, label: 'Categories' },
      { id: 'brands', icon: Globe, label: 'Brands' },
      { id: 'models', icon: Package, label: 'Models' },
      { id: 'inventory', icon: Warehouse, label: 'Inventory' },
    ],
  },
  {
    group: 'Pricing',
    items: [
      { id: 'pricing', icon: Calculator, label: 'Pricing Engine' },
      { id: 'questions', icon: HelpCircle, label: 'Questions' },
      { id: 'coupons', icon: Ticket, label: 'Coupons' },
    ],
  },
  {
    group: 'Finance',
    items: [
      { id: 'payments', icon: CreditCard, label: 'Payments' },
      { id: 'payouts', icon: Zap, label: 'Partner Payouts', badge: '₹2.4L', badgeVariant: 'warning' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { id: 'pincodes', icon: MapPin, label: 'PIN Codes' },
      { id: 'support', icon: MessageSquare, label: 'Support Tickets', badge: 19, badgeVariant: 'danger' },
      { id: 'reviews', icon: Star, label: 'Reviews' },
      { id: 'notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    group: 'Content',
    items: [
      { id: 'cms', icon: FileText, label: 'CMS' },
      { id: 'reports', icon: BarChart3, label: 'Reports' },
    ],
  },
  {
    group: 'System',
    items: [
      { id: 'settings', icon: Settings, label: 'Settings' },
      { id: 'roles', icon: Shield, label: 'Roles & Permissions' },
    ],
  },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  activeSection: AdminSection;
  onSectionChange: (s: AdminSection) => void;
}

export default function AdminSidebar({ collapsed, onToggle, activeSection, onSectionChange }: Props) {
  const badgeColors: Record<string, string> = {
    default: 'bg-primary/10 text-primary',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
  };

  return (
    <aside
      className={`relative flex-shrink-0 bg-secondary text-white flex flex-col admin-sidebar-transition overflow-hidden ${collapsed ? 'w-16' : 'w-60'}`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-4 gap-2'}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span className="font-extrabold text-base text-white">Camsik</span>
            <p className="text-xs text-white/40 leading-none">Super Admin</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.group} className="mb-1">
            {!collapsed && (
              <p className="px-4 py-1.5 text-xs font-semibold text-white/30 uppercase tracking-widest">
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center mx-2 rounded-xl transition-all duration-150 mb-0.5 text-left ${collapsed ? 'justify-center w-12 h-10 p-0' : 'gap-2.5 px-3 py-2.5'} ${active ? 'bg-primary text-white shadow-green' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                  style={collapsed ? { width: '3rem' } : {}}
                >
                  <item.icon size={17} className="flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${badgeColors[item.badgeVariant || 'default']}`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Bottom user */}
      <div className={`border-t border-white/10 p-3 flex items-center flex-shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
          A
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Adarsh Kumar</p>
            <p className="text-xs text-white/40 truncate">Super Admin</p>
          </div>
        )}
      </div>
    </aside>
  );
}