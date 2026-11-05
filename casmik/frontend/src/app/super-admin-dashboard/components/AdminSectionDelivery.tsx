'use client';
import React, { useState } from 'react';
import { deliveryAgents } from '@/lib/casmikData';
import { Search, Eye, Phone, Mail, Star, Plus } from 'lucide-react';

export default function AdminSectionDelivery() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = deliveryAgents.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) || a.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    online: { label: 'Online', color: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
    offline: { label: 'Offline', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
    on_trip: { label: 'On Trip', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Agents', value: deliveryAgents.length, color: 'text-blue-600' },
          { label: 'Online Now', value: deliveryAgents.filter(a => a.status === 'online').length, color: 'text-green-600' },
          { label: 'On Trip', value: deliveryAgents.filter(a => a.status === 'on_trip').length, color: 'text-blue-600' },
          { label: "Today's Pickups", value: deliveryAgents.reduce((s, a) => s + a.todayPickups, 0), color: 'text-orange-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="font-semibold text-foreground">Delivery Executives</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents..." className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-border rounded-xl px-3 py-2 focus:outline-none">
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="on_trip">On Trip</option>
              <option value="offline">Offline</option>
            </select>
            <button className="flex items-center gap-1.5 bg-primary text-white text-sm px-3 py-2 rounded-xl hover:bg-primary/90 transition-colors">
              <Plus size={14} /> Add Agent
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Agent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">City</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Vehicle</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Today</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const sc = statusConfig[a.status];
                return (
                  <tr key={a.id} className={`border-b border-border last:border-0 hover:bg-surface/50 transition-colors ${i % 2 === 0 ? '' : 'bg-surface/20'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={a.avatar} alt={a.name} className="w-9 h-9 rounded-full object-cover" />
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${sc.dot}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{a.name}</p>
                          <p className="text-xs text-muted-foreground">{a.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone size={10} />{a.phone}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail size={10} />{a.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{a.city}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.vehicle}</p>
                        <p className="text-xs text-muted-foreground">{a.vehicleNumber}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm font-semibold text-yellow-600"><Star size={12} fill="currentColor" />{a.rating}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{a.todayPickups}P / {a.todayDeliveries}D</p>
                      <p className="text-xs text-muted-foreground">Pickups / Deliveries</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">{a.totalDeliveries}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View"><Eye size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
          Showing {filtered.length} of {deliveryAgents.length} agents
        </div>
      </div>
    </div>
  );
}
