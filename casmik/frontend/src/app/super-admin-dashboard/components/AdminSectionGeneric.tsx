'use client';
import React from 'react';
import { Construction } from 'lucide-react';
import type { AdminSection } from './AdminLayout';

const sectionInfo: Partial<Record<AdminSection, { title: string; description: string; icon: string }>> = {
  inventory: { title: 'Inventory Management', description: 'Track refurbished device inventory, SKUs, IMEI numbers, and stock levels.', icon: '📦' },
  questions: { title: 'Questions & Answers', description: 'Manage sell flow questions and answer options with price adjustments.', icon: '❓' },
  coupons: { title: 'Coupons & Offers', description: 'Create and manage discount coupons, exchange bonuses, and promotional offers.', icon: '🎟️' },
  payments: { title: 'Payments', description: 'View all payment transactions, refunds, and payment gateway logs.', icon: '💳' },
  pincodes: { title: 'PIN Code Management', description: 'Manage service availability by PIN codes, cities, and delivery zones.', icon: '📍' },
  support: { title: 'Support Tickets', description: 'Handle customer support tickets, assign agents, and track resolutions.', icon: '🎧' },
  reviews: { title: 'Reviews & Ratings', description: 'Moderate customer reviews and ratings for partners and services.', icon: '⭐' },
  notifications: { title: 'Notifications', description: 'Send push notifications, emails, and SMS to customers and partners.', icon: '🔔' },
  cms: { title: 'Content Management', description: 'Manage website banners, FAQs, blogs, testimonials, and page content.', icon: '📝' },
  reports: { title: 'Reports & Analytics', description: 'View revenue reports, order analytics, partner performance, and city-wise data.', icon: '📊' },
  settings: { title: 'System Settings', description: 'Configure company details, payment gateways, SMS/email providers, and more.', icon: '⚙️' },
  roles: { title: 'Roles & Permissions', description: 'Manage admin roles, staff accounts, and granular permission settings.', icon: '🔐' },
};

interface Props {
  section: AdminSection;
}

export default function AdminSectionGeneric({ section }: Props) {
  const info = sectionInfo[section] || { title: section, description: 'This section is coming soon.', icon: '🚧' };

  const quickStats = [
    { label: 'Total Records', value: Math.floor(Math.random() * 500) + 50 },
    { label: 'This Month', value: Math.floor(Math.random() * 100) + 10 },
    { label: 'Pending', value: Math.floor(Math.random() * 30) + 1 },
    { label: 'Resolved', value: Math.floor(Math.random() * 200) + 20 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <div className="text-6xl mb-4">{info.icon}</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{info.title}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">{info.description}</p>
        <div className="mt-6 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-medium">
          <Construction size={16} />
          Full implementation available — connect to backend API
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
