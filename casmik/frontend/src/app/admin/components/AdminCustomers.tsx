'use client';
import React, { useState, useEffect } from 'react';
import { Customer } from '@/lib/casmikData';
import { Search, Eye, Ban, CheckCircle } from 'lucide-react';

export default function AdminCustomers() {
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.orders)) {
          const map = new Map<string, Customer>();
          data.orders.forEach((o: any) => {
            const phone = (o.customerPhone || o.phone || '').trim();
            if (!phone) return;
            if (!map.has(phone)) {
              map.set(phone, {
                id: `cust-${phone}`,
                name: o.customerName || 'Customer',
                phone: phone,
                email: o.customerEmail || `${phone}@camsik.in`,
                city: o.city || 'Mumbai',
                pinCode: o.pinCode || '400001',
                totalOrders: 1,
                totalValue: o.finalPrice || o.quotedPrice || 0,
                joinedAt: o.createdAt || new Date().toISOString(),
                status: 'active',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80',
              });
            } else {
              const existing = map.get(phone)!;
              existing.totalOrders += 1;
              existing.totalValue += (o.finalPrice || o.quotedPrice || 0);
            }
          });
          setCustomerList(Array.from(map.values()));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = customerList.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.email.toLowerCase().includes(query.toLowerCase()) ||
    c.city.toLowerCase().includes(query.toLowerCase())
  );

  const handleToggle = (id: string) => {
    setCustomerList(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'blocked' as const : 'active' as const } : c));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-gray-900">Customer Management</h2>
        <p className="text-sm text-gray-500">{customerList.length} registered customers</p>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search customers..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Customer</th>
              <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Contact</th>
              <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Location</th>
              <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Orders</th>
              <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Total Value</th>
              <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-xs text-gray-400">Loading live customers from real orders...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-xs text-gray-400">No customers found. As live orders arrive, customers will appear here automatically.</td>
              </tr>
            ) : filtered.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <img src={customer.avatar} alt={customer.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-gray-900 text-xs">{customer.name}</p>
                      <p className="text-xs text-gray-400">Since {new Date(customer.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-xs text-gray-700">{customer.phone}</p>
                  <p className="text-xs text-gray-400">{customer.email}</p>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-xs text-gray-700">{customer.city}</p>
                  <p className="text-xs text-gray-400">PIN: {customer.pinCode}</p>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-xs font-bold text-gray-900">{customer.totalOrders}</p>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-xs font-bold text-green-700">₹{customer.totalValue.toLocaleString('en-IN')}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1.5">
                    <button className="p-1.5 rounded-lg bg-gray-100 hover:bg-primary hover:text-white transition-colors"><Eye size={13} /></button>
                    <button onClick={() => handleToggle(customer.id)} className={`p-1.5 rounded-lg transition-colors ${customer.status === 'active' ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {customer.status === 'active' ? <Ban size={13} /> : <CheckCircle size={13} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
