'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  ArrowUpDown, 
  Download, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Eye, 
  X, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Star,
  Sparkles
} from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  orderCount: number;
  totalSpent: number;
  latestDevice: string;
  latestOrderType: 'sell' | 'buy' | 'exchange' | 'repair' | 'rent';
  latestOrderDate: string;
  status: 'active' | 'vip' | 'new';
  orders: any[];
}

export default function PartnerCustomers({ onNavigate, partner }: { onNavigate?: (section: any) => void; partner?: any }) {
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sell' | 'buy' | 'exchange'>('all');
  const [filterTier, setFilterTier] = useState<'all' | 'vip' | 'repeat'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        const pId = partner?.id;
        const res = await fetch(`/api/orders?partnerId=${pId || ''}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders) && isMounted) {
            const matched = data.orders.filter((o: any) => 
              !pId || o.partnerId === pId || o.assignedPartnerId === pId
            );
            setLiveOrders(matched);
          }
        }
      } catch (err) {
        console.warn('Customer orders fetch error:', err);
      }
    };

    fetchOrders();

    window.addEventListener('casmik_orders_updated', fetchOrders);
    window.addEventListener('casmik_partner_orders_updated', fetchOrders);

    return () => {
      isMounted = false;
      window.removeEventListener('casmik_orders_updated', fetchOrders);
      window.removeEventListener('casmik_partner_orders_updated', fetchOrders);
    };
  }, [partner?.id]);

  // Derive partner customer list from real live orders
  const customerList: CustomerRecord[] = useMemo(() => {
    const customerMap = new Map<string, CustomerRecord>();

    liveOrders.forEach((ord) => {
      const key = ord.customerPhone || ord.customerName;
      if (!key) return;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: `cust-${Math.abs(key.split('').reduce((a: number, b: string) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16).slice(0, 6)}`,
          name: ord.customerName || 'Customer',
          phone: ord.customerPhone || '+91 98000 00000',
          email: ord.customerEmail || `${ord.customerName?.toLowerCase().replace(/\s+/g, '') || 'user'}@gmail.com`,
          city: ord.city || 'Store Area',
          address: ord.customerAddress || 'Customer Address',
          orderCount: 1,
          totalSpent: ord.finalPrice || ord.quotedPrice || 0,
          latestDevice: ord.deviceName,
          latestOrderType: ord.type,
          latestOrderDate: ord.createdAt || new Date().toISOString(),
          status: 'new',
          orders: [ord],
        });
      } else {
        const existing = customerMap.get(key)!;
        existing.orderCount += 1;
        existing.totalSpent += (ord.finalPrice || ord.quotedPrice || 0);
        existing.orders.push(ord);
        if (new Date(ord.createdAt) > new Date(existing.latestOrderDate)) {
          existing.latestDevice = ord.deviceName;
          existing.latestOrderType = ord.type;
          existing.latestOrderDate = ord.createdAt;
        }
      }
    });

    // Assign status tiers
    return Array.from(customerMap.values()).map(c => {
      if (c.totalSpent > 80000 || c.orderCount >= 3) {
        c.status = 'vip';
      } else if (c.orderCount > 1) {
        c.status = 'active';
      } else {
        c.status = 'new';
      }
      return c;
    });
  }, [liveOrders]);

  const filteredCustomers = customerList.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.latestDevice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || c.latestOrderType === filterType;
    const matchesTier = 
      filterTier === 'all' ? true :
      filterTier === 'vip' ? c.status === 'vip' :
      c.orderCount > 1;

    return matchesSearch && matchesType && matchesTier;
  });

  const totalRevenue = customerList.reduce((sum, c) => sum + c.totalSpent, 0);
  const repeatCount = customerList.filter(c => c.orderCount > 1).length;
  const vipCount = customerList.filter(c => c.status === 'vip').length;

  const handleExportCSV = () => {
    const headers = ['Customer ID', 'Name', 'Phone', 'Email', 'City', 'Orders', 'Total Value (INR)', 'Latest Device'];
    const rows = filteredCustomers.map(c => [
      c.id,
      `"${c.name}"`,
      c.phone,
      c.email,
      c.city,
      c.orderCount,
      c.totalSpent,
      `"${c.latestDevice}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `camsik_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            Store Customers
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
              {customerList.length} Total
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View, search, and connect with customers who transacted with your store.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Customers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{customerList.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Fulfilled by your store</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Repeat Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {customerList.length > 0 ? Math.round((repeatCount / customerList.length) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{repeatCount} returning customers</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">VIP Customers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600">{vipCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">High transaction volume</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Value</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">₹{(totalRevenue / 100000).toFixed(1)}L</p>
          <p className="text-xs text-gray-400 mt-0.5">Combined customer order value</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, device, city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Order Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Order Types</option>
            <option value="sell">Selling Customers</option>
            <option value="buy">Buying Refurbished</option>
            <option value="exchange">Exchange Devices</option>
          </select>

          {/* Tier Filter */}
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Customers</option>
            <option value="repeat">Repeat Customers (2+ Orders)</option>
            <option value="vip">VIP Customers (&gt; ₹80k)</option>
          </select>

          {(searchQuery || filterType !== 'all' || filterTier !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterTier('all');
              }}
              className="text-xs font-bold text-gray-500 hover:text-red-500 underline px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">City / Location</th>
                <th className="px-4 py-3.5">Recent Device</th>
                <th className="px-4 py-3.5">Orders</th>
                <th className="px-4 py-3.5">Total Value</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    className="hover:bg-primary/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-400 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                          {cust.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-primary transition-colors text-xs sm:text-sm">
                            {cust.name}
                          </p>
                          <p className="text-[11px] text-gray-400">{cust.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                        <Phone size={11} className="text-gray-400" />
                        {cust.phone}
                      </p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5 truncate max-w-[170px]">
                        <Mail size={11} className="text-gray-400" />
                        {cust.email}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-xs font-medium text-gray-800 flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        {cust.city}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate max-w-[140px]">{cust.address}</p>
                    </td>

                    <td className="px-4 py-4 max-w-[180px]">
                      <p className="text-xs font-bold text-gray-900 truncate">{cust.latestDevice}</p>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5 capitalize ${
                        cust.latestOrderType === 'sell' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        cust.latestOrderType === 'buy' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {cust.latestOrderType}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-gray-900 px-2.5 py-1 rounded-lg bg-gray-100">
                        {cust.orderCount} {cust.orderCount === 1 ? 'Order' : 'Orders'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-xs font-black text-gray-900">₹{cust.totalSpent.toLocaleString('en-IN')}</p>
                    </td>

                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        cust.status === 'vip' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        cust.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {cust.status === 'vip' && <Sparkles size={11} className="text-purple-600" />}
                        {cust.status === 'active' && <CheckCircle2 size={11} className="text-emerald-600" />}
                        {cust.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                          title="WhatsApp Customer"
                        >
                          <MessageSquare size={14} />
                        </a>
                        <a
                          href={`tel:${cust.phone}`}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                          title="Call Customer"
                        >
                          <Phone size={14} />
                        </a>
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-primary hover:text-white text-gray-700 text-xs font-bold transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <Users size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">No customers matching your search criteria</p>
                    <p className="text-xs text-gray-400 mt-1">Try clearing filters or search keywords</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-gray-100">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-[#0a101f] text-white flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white font-black text-base flex items-center justify-center shadow-lg">
                  {selectedCustomer.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black">{selectedCustomer.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      selectedCustomer.status === 'vip' ? 'bg-purple-500 text-white' : 'bg-primary text-white'
                    }`}>
                      {selectedCustomer.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/70">{selectedCustomer.id} · Member since {new Date(selectedCustomer.latestOrderDate).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Quick Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">{selectedCustomer.phone}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5 truncate">{selectedCustomer.email}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">City &amp; Area</p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">{selectedCustomer.city}</p>
                </div>
              </div>

              {/* Order Summary Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-center">
                  <p className="text-xs text-gray-500 font-semibold">Total Orders Fulfilled</p>
                  <p className="text-2xl font-black text-primary mt-1">{selectedCustomer.orderCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <p className="text-xs text-gray-500 font-semibold">Cumulative Payout / Spend</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Orders History with this Store */}
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-1.5">
                  <ShoppingBag size={15} className="text-primary" />
                  Order History ({selectedCustomer.orders.length})
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                  {selectedCustomer.orders.map((ord) => (
                    <div key={ord.id} className="p-3.5 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900">{ord.orderNumber}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{ord.deviceName}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN')} &bull; Slot: {ord.pickupSlot || 'Standard'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-gray-900">₹{(ord.finalPrice || ord.quotedPrice).toLocaleString('en-IN')}</p>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5 capitalize ${
                          ord.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Actions */}
              <div className="flex gap-3 pt-2">
                <a
                  href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <MessageSquare size={15} /> Message on WhatsApp
                </a>
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Phone size={15} /> Direct Phone Call
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
