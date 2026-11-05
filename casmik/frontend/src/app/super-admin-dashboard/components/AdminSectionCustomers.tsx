'use client';
import React, { useState } from 'react';
import { customers } from '@/lib/casmikData';
import { Search, Eye, Ban, CheckCircle, Phone, Mail, MapPin } from 'lucide-react';

export default function AdminSectionCustomers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Extend with more demo customers
  const allCustomers = [
    ...customers,
    { id: 'cust-006', name: 'Meera Krishnan', phone: '9321098765', email: 'meera@email.com', city: 'Bangalore', pinCode: '560038', totalOrders: 2, totalValue: 55000, joinedAt: '2024-01-10', status: 'active' as const, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80' },
    { id: 'cust-007', name: 'Arjun Mehta', phone: '9210987654', email: 'arjun@email.com', city: 'Mumbai', pinCode: '400076', totalOrders: 3, totalValue: 120000, joinedAt: '2024-02-15', status: 'active' as const, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80' },
    { id: 'cust-008', name: 'Kavya Nair', phone: '9109876543', email: 'kavya@email.com', city: 'Bangalore', pinCode: '560066', totalOrders: 1, totalValue: 38000, joinedAt: '2024-03-20', status: 'active' as const, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80' },
    { id: 'cust-009', name: 'Rohit Gupta', phone: '9098765432', email: 'rohit@email.com', city: 'Gurgaon', pinCode: '122002', totalOrders: 4, totalValue: 185000, joinedAt: '2023-12-05', status: 'active' as const, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80' },
    { id: 'cust-010', name: 'Ananya Sharma', phone: '8987654321', email: 'ananya@email.com', city: 'Bangalore', pinCode: '560095', totalOrders: 2, totalValue: 42000, joinedAt: '2024-04-01', status: 'blocked' as const, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80' },
    { id: 'cust-011', name: 'Kiran Rao', phone: '8876543210', email: 'kiran@email.com', city: 'Hyderabad', pinCode: '500034', totalOrders: 1, totalValue: 45000, joinedAt: '2024-05-10', status: 'active' as const, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80' },
    { id: 'cust-012', name: 'Divya Menon', phone: '8765432109', email: 'divya@email.com', city: 'Chennai', pinCode: '600017', totalOrders: 1, totalValue: 55000, joinedAt: '2024-06-15', status: 'active' as const, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80' },
  ];

  const displayList = allCustomers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalOrders = allCustomers.reduce((s, c) => s + c.totalOrders, 0);
  const totalValue = allCustomers.reduce((s, c) => s + c.totalValue, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: allCustomers.length, color: 'text-blue-600' },
          { label: 'Active', value: allCustomers.filter(c => c.status === 'active').length, color: 'text-green-600' },
          { label: 'Total Orders', value: totalOrders, color: 'text-purple-600' },
          { label: 'Total Value', value: `₹${(totalValue / 100000).toFixed(1)}L`, color: 'text-orange-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="font-semibold text-foreground">All Customers</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'blocked')}
              className="text-sm border border-border rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">City</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Orders</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Total Value</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map((c, i) => (
                <tr key={c.id} className={`border-b border-border last:border-0 hover:bg-surface/50 transition-colors ${i % 2 === 0 ? '' : 'bg-surface/20'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone size={10} />{c.phone}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail size={10} />{c.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin size={12} />{c.city}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{c.totalOrders}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">₹{c.totalValue.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.joinedAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${c.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {c.status === 'active' ? <CheckCircle size={10} /> : <Ban size={10} />}
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View"><Eye size={14} /></button>
                      <button className={`p-1.5 rounded-lg transition-colors ${c.status === 'active' ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-600'}`} title={c.status === 'active' ? 'Block' : 'Unblock'}>
                        {c.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
          Showing {displayList.length} of {allCustomers.length} customers
        </div>
      </div>
    </div>
  );
}
