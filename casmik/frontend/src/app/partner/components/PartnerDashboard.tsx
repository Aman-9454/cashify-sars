'use client';
import React, { useState, useEffect, useMemo } from 'react';
import type { Order, Partner } from '@/lib/casmikData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PartnerDashboardProps {
  onNavigate?: (section: any) => void;
  partner?: Partner | null;
}

export default function PartnerDashboard({ onNavigate, partner }: PartnerDashboardProps = {}) {
  const [dateRange, setDateRange] = useState('This Week');
  const [partnerOrders, setPartnerOrders] = useState<Order[]>([]);

  // Resolve active partner session with safe fallbacks
  const currentPartner = useMemo(() => {
    if (partner) return partner;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('casmik_partner_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') return parsed as Partner;
        }
      } catch {}
    }
    return {
      id: 'partner-default',
      storeName: 'Camsik Certified Hub',
      name: 'Partner',
      phone: '',
      email: '',
      city: 'Delhi NCR',
      state: 'Delhi',
      pinCodes: [],
      status: 'active' as const,
      rating: 4.8,
      totalOrders: 0,
      completedOrders: 0,
      totalEarnings: 0,
      commission: 5,
      commissionType: 'percentage' as const,
      availableBalance: 0,
      pendingPayout: 0,
      joinedAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80',
    };
  }, [partner]);

  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Fetch real orders and live MongoDB stats for this partner
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const pId = currentPartner.id;
        // 1. Fetch live aggregated stats from backend
        try {
          const dashRes = await fetch(`/api/partners/dashboard?partnerId=${pId}`);
          if (dashRes.ok) {
            const dashData = await dashRes.json();
            if (dashData.success && dashData.dashboard && isMounted) {
              setDashboardStats(dashData.dashboard);
            }
          }
        } catch {}

        // 2. Fetch live partner orders
        const ordersRes = await fetch(`/api/orders?partnerId=${pId}`);
        if (ordersRes.ok) {
          const ordData = await ordersRes.json();
          if (ordData.success && Array.isArray(ordData.orders) && isMounted) {
            const pName = currentPartner.storeName || currentPartner.name;
            const matched = ordData.orders.filter((o: Order) => 
              o.partnerId === pId || o.assignedPartnerId === pId || o.partnerName === pName
            );
            setPartnerOrders(matched);
          }
        }
      } catch (err) {
        console.warn('Dashboard fetch warning:', err);
      }
    };

    fetchDashboardData();

    window.addEventListener('casmik_orders_updated', fetchDashboardData);
    window.addEventListener('casmik_partner_orders_updated', fetchDashboardData);
    window.addEventListener('storage', fetchDashboardData);

    return () => {
      isMounted = false;
      window.removeEventListener('casmik_orders_updated', fetchDashboardData);
      window.removeEventListener('casmik_partner_orders_updated', fetchDashboardData);
      window.removeEventListener('storage', fetchDashboardData);
    };
  }, [currentPartner]);

  // Dynamic earnings and orders calculation from live database
  const totalEarnings = dashboardStats?.storeTradeVolume ?? currentPartner.totalEarnings ?? partnerOrders
    .filter(o => o.status === 'completed' || o.paymentStatus === 'paid')
    .reduce((s, o) => s + (o.finalPrice || o.quotedPrice || 0), 0);

  const totalOrdersCount = dashboardStats?.totalOrdersCount ?? partnerOrders.length ?? currentPartner.totalOrders ?? 0;
  const commissionRate = dashboardStats?.commissionRate ?? currentPartner.commission ?? 5;
  const totalCommission = dashboardStats?.totalCommissionEarned ?? Math.round((totalEarnings * commissionRate) / 100);
  const pendingPayout = dashboardStats?.pendingPayout ?? currentPartner.pendingPayout ?? 0;
  const availableBalance = dashboardStats?.availableFloatBalance ?? currentPartner.availableBalance ?? Math.max(0, totalCommission - pendingPayout);

  // Dynamic 7-day earnings chart from real orders
  const earningsData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayLabel = `${d.getDate().toString().padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}`;
      const dayOrders = partnerOrders.filter(o => {
        const od = o.createdAt ? new Date(o.createdAt) : null;
        return od && od.toDateString() === d.toDateString();
      });
      const dayEarnings = dayOrders.reduce((s, o) => s + (o.finalPrice || o.quotedPrice || 0), 0);
      result.push({ day: dayLabel, earnings: dayEarnings });
    }
    return result;
  }, [partnerOrders]);

  // Dynamic category breakdown from real orders
  const topCategories = useMemo(() => {
    if (partnerOrders.length === 0) {
      return [
        { name: 'Cameras & Lenses', pct: 0, count: 0, color: 'bg-emerald-500' },
        { name: 'Smartphones', pct: 0, count: 0, color: 'bg-blue-500' },
        { name: 'Laptops', pct: 0, count: 0, color: 'bg-purple-500' },
      ];
    }
    const map: Record<string, number> = {};
    partnerOrders.forEach(o => {
      const name = (o.deviceName || '').toLowerCase();
      let cat = 'Cameras & Lenses';
      if (name.includes('iphone') || name.includes('samsung') || name.includes('phone') || name.includes('pixel')) cat = 'Smartphones';
      else if (name.includes('macbook') || name.includes('laptop') || name.includes('dell') || name.includes('thinkpad')) cat = 'Laptops';
      else if (name.includes('ipad') || name.includes('tablet') || name.includes('tab')) cat = 'Tablets';
      else if (o.type === 'rent') cat = 'Rental Fleet';
      map[cat] = (map[cat] || 0) + 1;
    });
    const total = partnerOrders.length || 1;
    const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-cyan-500'];
    return Object.entries(map).map(([name, count], i) => ({
      name,
      count,
      pct: Math.round((count / total) * 100),
      color: colors[i % colors.length],
    }));
  }, [partnerOrders]);

  const recentOrders = partnerOrders.slice(0, 5);

  const kpis = [
    { 
      label: 'TOTAL EARNINGS', 
      value: `₹${(totalEarnings ?? 0).toLocaleString('en-IN')}`, 
      sub: `${partnerOrders.length} active orders`, 
      icon: '💰', 
      color: 'text-green-600', 
      action: () => onNavigate?.('payouts') 
    },
    { 
      label: 'TOTAL ORDERS', 
      value: totalOrdersCount.toString(), 
      sub: 'Live store orders', 
      icon: '🛒', 
      color: 'text-blue-600', 
      action: () => onNavigate?.('orders') 
    },
    { 
      label: 'COMMISSION RATE', 
      value: `${commissionRate}%`, 
      sub: `Earned ₹${(totalCommission ?? 0).toLocaleString('en-IN')}`, 
      icon: '🏅', 
      color: 'text-yellow-600', 
      action: () => onNavigate?.('reports') 
    },
    { 
      label: 'AVAILABLE BALANCE', 
      value: `₹${(availableBalance ?? 0).toLocaleString('en-IN')}`, 
      sub: 'Ready for withdrawal', 
      icon: '💳', 
      color: 'text-purple-600', 
      action: () => onNavigate?.('payouts') 
    },
    { 
      label: 'PENDING PAYOUT', 
      value: `₹${(pendingPayout ?? 0).toLocaleString('en-IN')}`, 
      sub: 'In processing', 
      icon: '⏳', 
      color: 'text-orange-600', 
      action: () => onNavigate?.('payouts') 
    },
  ];

  return (
    <div className="space-y-5 w-full max-w-7xl mx-auto font-sans">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">
            Welcome back, {currentPartner.storeName || currentPartner.name || 'Partner'}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">Here&apos;s what&apos;s happening with your business today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-sm self-start sm:self-auto">
          <span className="text-gray-500">📅</span>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="text-xs sm:text-sm font-semibold text-gray-700 bg-transparent focus:outline-none">
            <option>This Week</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            onClick={kpi.action}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-primary/40 cursor-pointer transition-all hover:scale-[1.02]"
            title={`Click to view details in ${kpi.label}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide leading-tight">{kpi.label}</p>
              <span className="text-xl">{kpi.icon}</span>
            </div>
            <p className={`text-xl font-black ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-green-600 font-semibold mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-bold text-gray-900 uppercase text-xs sm:text-sm tracking-wide">Earnings Overview</h3>
            <button
              onClick={() => onNavigate?.('reports')}
              className="text-xs font-bold text-primary hover:underline bg-primary/10 px-2.5 py-1 rounded-lg"
            >
              Full Analytics Report &rarr;
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
              <Tooltip formatter={(v: number) => [`₹${(v ?? 0).toLocaleString('en-IN')}`, 'Earnings']} />
              <Area type="monotone" dataKey="earnings" stroke="#16a34a" strokeWidth={2.5} fill="url(#earnGrad)" dot={{ fill: '#16a34a', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 uppercase text-xs sm:text-sm tracking-wide">Top Selling Categories</h3>
            <span
              onClick={() => onNavigate?.('reports')}
              className="text-xs text-primary font-bold cursor-pointer hover:underline"
            >
              View All
            </span>
          </div>
          <div className="space-y-3">
            {topCategories.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                    <span className="font-semibold text-gray-700">{cat.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{cat.pct}% ({cat.count})</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 uppercase text-xs sm:text-sm tracking-wide">Recent Orders</h3>
            <span
              onClick={() => onNavigate?.('orders')}
              className="text-xs text-primary font-bold cursor-pointer hover:underline"
            >
              View All &rarr;
            </span>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No orders assigned to this store yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => onNavigate?.('orders')}
                  className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900">{(order.deviceName || 'Device').split(' ').slice(0, 4).join(' ')}</p>
                    <p className="text-xs text-gray-400">ID: {order.orderNumber} · {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Recent'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">₹{(order.quotedPrice ?? 0).toLocaleString('en-IN')}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {(order.status || 'pending').replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payout Overview + Account Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 uppercase text-xs sm:text-sm tracking-wide">Payout Overview</h3>
              <span
                onClick={() => onNavigate?.('payouts')}
                className="text-xs text-primary font-bold cursor-pointer hover:underline"
              >
                View Ledger &rarr;
              </span>
            </div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <p className="text-xs text-gray-500">AVAILABLE BALANCE</p>
                <p className="text-2xl font-black text-gray-900">₹{(availableBalance ?? 0).toLocaleString('en-IN')}</p>
              </div>
              <button
                onClick={() => onNavigate?.('payouts')}
                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                Request Payout
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Total Paid</p>
                <p className="text-sm font-black text-green-700">₹{Math.max(0, (totalEarnings ?? 0) - (pendingPayout ?? 0)).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-sm font-black text-orange-700">₹{(pendingPayout ?? 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 uppercase text-xs sm:text-sm tracking-wide mb-3">Account Summary</h3>
            <div className="space-y-2">
              {[
                { label: 'Partner Name', value: currentPartner.storeName || currentPartner.name },
                { label: 'Partner ID', value: currentPartner.id || 'N/A' },
                { label: 'City', value: currentPartner.city || 'Delhi NCR' },
                { label: 'Commission Rate', value: `${commissionRate}%` },
                { label: 'Rating', value: `⭐ ${currentPartner.rating || 4.8}/5` },
                { label: 'Member Since', value: currentPartner.joinedAt ? new Date(currentPartner.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '2024' },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
