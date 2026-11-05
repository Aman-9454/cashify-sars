'use client';
import React, { useState } from 'react';
import { orders, partners, getOrderStatusLabel, getOrderStatusColor, getTypeColor } from '@/lib/casmikData';
import { Search, Eye, UserCheck } from 'lucide-react';

interface Props {
  type: 'sell' | 'buy' | 'exchange' | 'repair' | 'pickups';
}

export default function AdminSectionOrders({ type }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignModal, setAssignModal] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState('');

  const filteredOrders = orders.filter(o => {
    if (type === 'pickups') {
      return ['pickup_scheduled', 'picked_up', 'assigned', 'accepted'].includes(o.status);
    }
    return o.type === type;
  }).filter(o => {
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.deviceName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const typeLabels: Record<string, string> = {
    sell: 'Sell Orders', buy: 'Buy Orders', exchange: 'Exchange Orders', repair: 'Repair Orders', pickups: 'Pickups'
  };

  const activePartners = partners.filter(p => p.status === 'active');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: filteredOrders.length, color: 'text-blue-600' },
          { label: 'Unassigned', value: filteredOrders.filter(o => !o.partnerId).length, color: 'text-red-600' },
          { label: 'In Progress', value: filteredOrders.filter(o => !['completed', 'cancelled', 'rejected'].includes(o.status)).length, color: 'text-yellow-600' },
          { label: 'Completed', value: filteredOrders.filter(o => o.status === 'completed').length, color: 'text-green-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="font-semibold text-foreground">{typeLabels[type]}</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-border rounded-xl px-3 py-2 focus:outline-none">
              <option value="all">All Status</option>
              <option value="created">Created</option>
              <option value="assigned">Assigned</option>
              <option value="pickup_scheduled">Pickup Scheduled</option>
              <option value="inspection">Inspection</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Device</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Partner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Pickup Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o, i) => (
                <tr key={o.id} className={`border-b border-border last:border-0 hover:bg-surface/50 transition-colors ${i % 2 === 0 ? '' : 'bg-surface/20'}`}>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-semibold text-foreground">{o.orderNumber}</p>
                    <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded-md mt-0.5 ${getTypeColor(o.type)}`}>{o.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{o.customerName}</p>
                    <p className="text-xs text-muted-foreground">{o.city} · {o.pinCode}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground text-xs">{o.deviceName}</p>
                    <p className="text-xs text-muted-foreground">{o.deviceBrand}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">₹{o.quotedPrice.toLocaleString('en-IN')}</p>
                    <p className={`text-xs font-medium ${o.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>{o.paymentStatus}</p>
                  </td>
                  <td className="px-4 py-3">
                    {o.partnerName ? (
                      <p className="text-sm text-foreground">{o.partnerName}</p>
                    ) : (
                      <button
                        onClick={() => setAssignModal(o.id)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                      >
                        <UserCheck size={12} /> Assign
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.pickupDate}<br />{o.pickupSlot}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${getOrderStatusColor(o.status)}`}>
                      {getOrderStatusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View"><Eye size={14} /></button>
                      {!o.partnerId && (
                        <button onClick={() => setAssignModal(o.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="Assign Partner"><UserCheck size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
          Showing {filteredOrders.length} orders
        </div>
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-lg text-foreground mb-4">Assign Partner</h3>
            <p className="text-sm text-muted-foreground mb-4">Select a partner for order <span className="font-mono font-semibold">{orders.find(o => o.id === assignModal)?.orderNumber}</span></p>
            <div className="space-y-2 mb-6">
              {activePartners.map(p => (
                <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedPartner === p.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-surface'}`}>
                  <input type="radio" name="partner" value={p.id} checked={selectedPartner === p.id} onChange={() => setSelectedPartner(p.id)} className="text-primary" />
                  <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">{p.storeName}</p>
                    <p className="text-xs text-muted-foreground">{p.city} · {p.pinCodes.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-yellow-600">★ {p.rating}</p>
                    <p className="text-xs text-muted-foreground">{p.totalOrders} orders</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setAssignModal(null); setSelectedPartner(''); }} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-surface transition-colors">Cancel</button>
              <button
                onClick={() => { setAssignModal(null); setSelectedPartner(''); }}
                disabled={!selectedPartner}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Assign Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
