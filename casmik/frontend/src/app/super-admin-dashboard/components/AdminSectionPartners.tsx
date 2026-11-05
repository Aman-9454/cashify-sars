'use client';
import React, { useState } from 'react';
import { partners } from '@/lib/casmikData';
import { Search, Eye, CheckCircle, XCircle, PauseCircle, Star, Phone, Mail, Plus } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


export default function AdminSectionPartners() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = partners.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.storeName.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    active: { label: 'Active', color: 'bg-green-50 text-green-700', icon: CheckCircle },
    inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-600', icon: PauseCircle },
    pending: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700', icon: PauseCircle },
    suspended: { label: 'Suspended', color: 'bg-red-50 text-red-700', icon: XCircle },
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Partners', value: partners.length, color: 'text-blue-600' },
          { label: 'Active', value: partners.filter(p => p.status === 'active').length, color: 'text-green-600' },
          { label: 'Pending Approval', value: partners.filter(p => p.status === 'pending').length, color: 'text-yellow-600' },
          { label: 'Total Payouts Due', value: `₹${partners.reduce((s, p) => s + p.pendingPayout, 0).toLocaleString('en-IN')}`, color: 'text-orange-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="font-semibold text-foreground">All Partners</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search partners..." className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-border rounded-xl px-3 py-2 focus:outline-none">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
            <button className="flex items-center gap-1.5 bg-primary text-white text-sm px-3 py-2 rounded-xl hover:bg-primary/90 transition-colors">
              <Plus size={14} /> Add Partner
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Partner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">City</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Orders</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Earnings</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Pending Payout</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const sc = statusConfig[p.status];
                const Icon = sc.icon;
                return (
                  <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-surface/50 transition-colors ${i % 2 === 0 ? '' : 'bg-surface/20'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <p className="font-semibold text-foreground">{p.storeName}</p>
                          <p className="text-xs text-muted-foreground">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone size={10} />{p.phone}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail size={10} />{p.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.city}, {p.state}</td>
                    <td className="px-4 py-3">
                      {p.rating > 0 ? (
                        <span className="flex items-center gap-1 text-sm font-semibold text-yellow-600"><Star size={12} fill="currentColor" />{p.rating}</span>
                      ) : <span className="text-xs text-muted-foreground">New</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-foreground">{p.totalOrders}</p>
                        <p className="text-xs text-muted-foreground">{p.completedOrders} completed</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-600">₹{p.totalEarnings.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-semibold text-orange-600">₹{p.pendingPayout.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${sc.color}`}>
                        <Icon size={10} />{sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View"><Eye size={14} /></button>
                        {p.status === 'pending' && (
                          <button className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="Approve"><CheckCircle size={14} /></button>
                        )}
                        {p.status === 'active' && (
                          <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Suspend"><XCircle size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
          Showing {filtered.length} of {partners.length} partners
        </div>
      </div>
    </div>
  );
}
