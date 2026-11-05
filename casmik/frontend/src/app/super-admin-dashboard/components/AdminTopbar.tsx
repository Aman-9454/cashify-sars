'use client';
import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import type { AdminSection } from './AdminLayout';

const sectionTitles: Record<AdminSection, string> = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  partners: 'Partners',
  delivery: 'Delivery Executives',
  'sell-orders': 'Sell Orders',
  'buy-orders': 'Buy Orders',
  'exchange-orders': 'Exchange Orders',
  'repair-orders': 'Repair Orders',
  pickups: 'Pickups',
  categories: 'Categories',
  brands: 'Brands',
  models: 'Models',
  inventory: 'Inventory',
  pricing: 'Pricing Engine',
  questions: 'Questions & Answers',
  coupons: 'Coupons & Offers',
  payments: 'Payments',
  payouts: 'Partner Payouts',
  pincodes: 'PIN Codes',
  support: 'Support Tickets',
  reviews: 'Reviews',
  notifications: 'Notifications',
  cms: 'CMS',
  reports: 'Reports & Analytics',
  settings: 'Settings',
  roles: 'Roles & Permissions',
};

interface Props {
  onMenuToggle: () => void;
  activeSection: AdminSection;
}

export default function AdminTopbar({ onMenuToggle, activeSection }: Props) {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="h-16 bg-white border-b border-border flex items-center px-6 gap-4 flex-shrink-0">
      <button onClick={onMenuToggle} className="text-muted-foreground hover:text-foreground lg:hidden">
        <Menu size={20} />
      </button>
      <div className="flex-1">
        <h1 className="text-lg font-bold text-foreground">{sectionTitles[activeSection]}</h1>
        <p className="text-xs text-muted-foreground">{greeting}, Adarsh · {dateStr}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors">
          <Search size={16} />
        </button>
        <button className="relative w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors">
          <Bell size={16} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">4</span>
        </button>
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">A</div>
      </div>
    </header>
  );
}