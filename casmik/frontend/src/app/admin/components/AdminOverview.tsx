'use client';
import React, { useState, useEffect } from 'react';
import { orders, partners, deliveryAgents, customers, Order, Partner, DeliveryAgent } from '@/lib/casmikData';
import { TrendingUp, TrendingDown, ShoppingBag, Users, Handshake, Truck, DollarSign, CheckCircle, Clock, Zap, ArrowRight, Eye, ChevronRight, ExternalLink } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { AdminSection, AdminNavigationOptions } from '../page';

const revenueData: { day: string; revenue: number; orders: number }[] = [
  /* Static mock chart data commented out for live data:
  { day: 'Mon', revenue: 125000, orders: 18 },
  { day: 'Tue', revenue: 148000, orders: 22 },
  { day: 'Wed', revenue: 132000, orders: 19 },
  { day: 'Thu', revenue: 165000, orders: 26 },
  { day: 'Fri', revenue: 189000, orders: 31 },
  { day: 'Sat', revenue: 210000, orders: 35 },
  { day: 'Sun', revenue: 178000, orders: 28 },
  */
];

const categoryData: { name: string; value: number; section: AdminSection }[] = [
  /* Static mock category data commented out for live data:
  { name: 'Smartphones', value: 62, section: 'models' as AdminSection },
  { name: 'Laptops', value: 18, section: 'models' as AdminSection },
  { name: 'Tablets', value: 10, section: 'models' as AdminSection },
  { name: 'Smartwatches', value: 6, section: 'models' as AdminSection },
  { name: 'Others', value: 4, section: 'categories' as AdminSection },
  */
];

interface AdminOverviewProps {
  onNavigate?: (section: AdminSection, options?: AdminNavigationOptions) => void;
}

const isMockOrder = (o: any) => {
  if (!o) return false;
  const num = String(o.orderNumber || '');
  const id = String(o.id || '');
  if (id.startsWith('ord-100') || id.startsWith('ord-101') || id.startsWith('ord-102')) return true;
  if (num.startsWith('CSM-2024-00') || num.startsWith('CSM-2024-01') || num.startsWith('CSM-2024-02') || num.startsWith('CSM-2024-03')) return true;
  if (o.customerName === 'Rahul Sharma' || o.customerName === 'Ananya Deshmukh' || o.customerName === 'Vikramaditya Rathore') return true;
  return false;
};

export default function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const [orderList, setOrderList] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('casmik_orders_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed.filter(o => !isMockOrder(o));
        }
      } catch {}
    }
    return [];
  });

  const [partnersList, setPartnersList] = useState<Partner[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('casmik_partners_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed.filter((p: any) => !p.id?.startsWith('partner-00'));
        }
      } catch {}
    }
    return [];
  });

  const [agentList, setAgentList] = useState<DeliveryAgent[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('casmik_delivery_agents_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed.filter((a: any) => !a.id?.startsWith('agent-10') && !a.id?.startsWith('delivery-00'));
        }
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    // Live fetches from APIs
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.orders)) {
          setOrderList(data.orders);
          if (typeof window !== 'undefined') localStorage.setItem('casmik_orders_v1', JSON.stringify(data.orders));
        }
      })
      .catch(() => {});

    fetch('/api/partners')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.partners)) {
          setPartnersList(data.partners);
          if (typeof window !== 'undefined') localStorage.setItem('casmik_partners_v1', JSON.stringify(data.partners));
        }
      })
      .catch(() => {});

    fetch('/api/delivery-agents')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.agents)) {
          setAgentList(data.agents);
          if (typeof window !== 'undefined') localStorage.setItem('casmik_delivery_agents_v1', JSON.stringify(data.agents));
        }
      })
      .catch(() => {});

    const syncData = () => {
      try {
        const rawOrders = localStorage.getItem('casmik_orders_v1');
        if (rawOrders) {
          const parsed = JSON.parse(rawOrders);
          if (Array.isArray(parsed)) setOrderList(parsed.filter(o => !isMockOrder(o)));
        }
        const rawPartners = localStorage.getItem('casmik_partners_v1');
        if (rawPartners) {
          const parsed = JSON.parse(rawPartners);
          if (Array.isArray(parsed)) setPartnersList(parsed.filter((p: any) => !p.id?.startsWith('partner-00')));
        }
        const rawAgents = localStorage.getItem('casmik_delivery_agents_v1');
        if (rawAgents) {
          const parsed = JSON.parse(rawAgents);
          if (Array.isArray(parsed)) setAgentList(parsed.filter((a: any) => !a.id?.startsWith('agent-10') && !a.id?.startsWith('delivery-00')));
        }
      } catch {}
    };

    window.addEventListener('casmik_orders_updated', syncData);
    window.addEventListener('casmik_partner_orders_updated', syncData);
    window.addEventListener('casmik_partners_updated', syncData);
    window.addEventListener('storage', syncData);
    return () => {
      window.removeEventListener('casmik_orders_updated', syncData);
      window.removeEventListener('casmik_partner_orders_updated', syncData);
      window.removeEventListener('casmik_partners_updated', syncData);
      window.removeEventListener('storage', syncData);
    };
  }, []);

  // Compute live revenue chart data from actual orderList
  const dynamicRevenueData = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayMap: Record<string, { revenue: number; orders: number }> = {
      Mon: { revenue: 0, orders: 0 },
      Tue: { revenue: 0, orders: 0 },
      Wed: { revenue: 0, orders: 0 },
      Thu: { revenue: 0, orders: 0 },
      Fri: { revenue: 0, orders: 0 },
      Sat: { revenue: 0, orders: 0 },
      Sun: { revenue: 0, orders: 0 },
    };
    orderList.forEach((o) => {
      const d = o.createdAt ? new Date(o.createdAt) : null;
      if (d && !isNaN(d.getTime())) {
        const dayName = days[(d.getDay() + 6) % 7];
        if (dayMap[dayName]) {
          dayMap[dayName].revenue += (o.finalPrice || o.quotedPrice || 0);
          dayMap[dayName].orders += 1;
        }
      }
    });
    return days.map((day) => ({
      day,
      revenue: dayMap[day].revenue,
      orders: dayMap[day].orders,
    }));
  }, [orderList]);

  // Compute live category data from actual orderList
  const dynamicCategoryData = React.useMemo(() => {
    if (orderList.length === 0) {
      return [];
    }
    const map: Record<string, number> = {};
    orderList.forEach((o) => {
      let cat = 'Cameras & Devices';
      const name = (o.deviceName || '').toLowerCase();
      if (o.type === 'rent') cat = 'Rental Fleet';
      else if (name.includes('macbook') || name.includes('laptop') || name.includes('dell')) cat = 'Laptops';
      else if (name.includes('iphone') || name.includes('phone') || name.includes('s23') || name.includes('s24')) cat = 'Smartphones';
      else if (name.includes('sony') || name.includes('canon') || name.includes('nikon') || name.includes('lens')) cat = 'Cameras & Lenses';
      map[cat] = (map[cat] || 0) + 1;
    });
    const total = orderList.length || 1;
    return Object.entries(map).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      section: 'orders' as AdminSection,
    }));
  }, [orderList]);

  const totalRevenue = orderList
    .filter(o => o.paymentStatus === 'paid' || o.status === 'completed')
    .reduce((s, o) => s + (o.finalPrice || o.quotedPrice || 0), 0);
  
  const completedOrders = orderList.filter(o => o.status === 'completed').length;
  const pendingOrders = orderList.filter(o => ['created', 'assigned', 'accepted', 'pickup_scheduled', 'picked_up', 'in_transit', 'inspection'].includes(o.status)).length;
  const activePartners = partnersList.filter(p => p.status === 'active').length;
  const pendingPartners = partnersList.filter(p => p.status === 'pending').length;
  const onlineAgents = agentList.filter(d => d.status === 'online' || d.status !== 'offline').length;
  const pendingPayouts = partnersList.reduce((s, p) => s + (p.pendingPayout || 0), 0);

  const customerPhones = new Set(orderList.map(o => o.customerPhone).filter(Boolean));
  const totalCustomers = customerPhones.size;

  const now = Date.now();
  const msWeek = 7 * 24 * 60 * 60 * 1000;
  const thisWeekOrders = orderList.filter(o => {
    const t = o.createdAt ? new Date(o.createdAt).getTime() : 0;
    return t >= now - msWeek;
  });
  const prevWeekOrders = orderList.filter(o => {
    const t = o.createdAt ? new Date(o.createdAt).getTime() : 0;
    return t >= now - 2 * msWeek && t < now - msWeek;
  });
  const thisWeekRev = thisWeekOrders.reduce((s, o) => s + (o.finalPrice || o.quotedPrice || 0), 0);
  const prevWeekRev = prevWeekOrders.reduce((s, o) => s + (o.finalPrice || o.quotedPrice || 0), 0);

  const revSub = prevWeekRev > 0
    ? `${thisWeekRev >= prevWeekRev ? '+' : ''}${Math.round(((thisWeekRev - prevWeekRev) / prevWeekRev) * 100)}% vs last week`
    : `${completedOrders} completed orders`;

  const orderSub = prevWeekOrders.length > 0
    ? `${thisWeekOrders.length >= prevWeekOrders.length ? '+' : ''}${Math.round(((thisWeekOrders.length - prevWeekOrders.length) / prevWeekOrders.length) * 100)}% vs last week`
    : `${thisWeekOrders.length} this week`;

  const navigateTo = (section: AdminSection, options?: AdminNavigationOptions) => {
    if (onNavigate) {
      onNavigate(section, options);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('casmik_admin_navigate', { detail: { section, options } }));
    }
  };

  const kpis = [
    {
      label: 'Total Revenue',
      value: totalRevenue >= 100000 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : `₹${totalRevenue.toLocaleString('en-IN')}`,
      sub: revSub,
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
      trend: 'up',
      actionHint: 'View paid orders →',
      onClick: () => navigateTo('orders', { filterStatus: 'completed' }),
      borderHover: 'hover:border-green-400',
    },
    {
      label: 'Total Orders',
      value: orderList.length.toString(),
      sub: orderSub,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
      trend: 'up',
      actionHint: `Manage all ${orderList.length} orders →`,
      onClick: () => navigateTo('orders', { filterStatus: 'all' }),
      borderHover: 'hover:border-blue-400',
    },
    {
      label: 'Completed',
      value: completedOrders.toString(),
      sub: `${orderList.length > 0 ? Math.round((completedOrders / orderList.length) * 100) : 0}% completion rate`,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-600',
      trend: 'up',
      actionHint: 'View completed orders →',
      onClick: () => navigateTo('orders', { filterStatus: 'completed' }),
      borderHover: 'hover:border-emerald-400',
    },
    {
      label: 'Pending',
      value: pendingOrders.toString(),
      sub: pendingOrders > 0 ? `${pendingOrders} need attention` : 'All caught up',
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
      trend: 'neutral',
      actionHint: 'Review pending orders →',
      onClick: () => navigateTo('orders', { filterStatus: 'created' }),
      borderHover: 'hover:border-yellow-400',
    },
    {
      label: 'Active Partners',
      value: activePartners.toString(),
      sub: `${pendingPartners} pending approval`,
      icon: Handshake,
      color: 'bg-purple-50 text-purple-600',
      trend: 'up',
      actionHint: 'Manage studio partners →',
      onClick: () => navigateTo('partners'),
      borderHover: 'hover:border-purple-400',
    },
    {
      label: 'Delivery Agents',
      value: agentList.length.toString(),
      sub: `${onlineAgents} online now`,
      icon: Truck,
      color: 'bg-cyan-50 text-cyan-600',
      trend: 'up',
      actionHint: 'Track agent fleet →',
      onClick: () => navigateTo('delivery'),
      borderHover: 'hover:border-cyan-400',
    },
    {
      label: 'Customers',
      value: totalCustomers.toString(),
      sub: `${totalCustomers} verified clients`,
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600',
      trend: 'up',
      actionHint: 'View customer directory →',
      onClick: () => navigateTo('customers'),
      borderHover: 'hover:border-indigo-400',
    },
    {
      label: 'Pending Payouts',
      value: `₹${pendingPayouts >= 100000 ? (pendingPayouts / 100000).toFixed(1) + 'L' : pendingPayouts.toLocaleString('en-IN')}`,
      sub: 'Due to partners',
      icon: Zap,
      color: 'bg-orange-50 text-orange-600',
      trend: 'neutral',
      actionHint: 'Process partner payouts →',
      onClick: () => navigateTo('payouts'),
      borderHover: 'hover:border-orange-400',
    },
  ];

  const recentOrders = orderList.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Interactive KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            onClick={kpi.onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); kpi.onClick(); } }}
            className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group ${kpi.borderHover}`}
            title={`Click to open ${kpi.label}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color} group-hover:scale-110 transition-transform`}>
                <kpi.icon size={18} />
              </div>
              {kpi.trend === 'up' && <TrendingUp size={14} className="text-green-500 mt-1" />}
              {kpi.trend === 'down' && <TrendingDown size={14} className="text-red-500 mt-1" />}
            </div>
            <p className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">{kpi.value}</p>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
            
            <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold text-gray-400 group-hover:text-primary transition-colors">
              <span>{kpi.actionHint}</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Category Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                Revenue Overview
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">+18.6% ↑</span>
              </h3>
              <p className="text-xs text-gray-500">Live platform transaction throughput this week</p>
            </div>
            <button
              onClick={() => navigateTo('reports')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-all border border-primary/20"
            >
              View Full Analytics Report <ChevronRight size={13} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={dynamicRevenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#16a34a', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Top Categories</h3>
            <button
              onClick={() => navigateTo('categories')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              Manage Catalog →
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-3">Click any category to inspect models &amp; inventory</p>

          <div className="space-y-2.5">
            {dynamicCategoryData.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No order categories recorded yet.</p>
            ) : dynamicCategoryData.map((cat, i) => {
              const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-gray-400'];
              return (
                <div
                  key={cat.name}
                  onClick={() => navigateTo(cat.section)}
                  role="button"
                  tabIndex={0}
                  className="p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group border border-transparent hover:border-gray-200"
                  title={`Click to manage ${cat.name}`}
                >
                  <div className="flex justify-between text-xs mb-1.5 items-center">
                    <span className="font-bold text-gray-800 group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {cat.name}
                      <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </span>
                    <span className="font-black text-gray-900">{cat.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[i]} group-hover:brightness-110 transition-all`} style={{ width: `${cat.value}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <p className="text-xs text-gray-500">Click any order row to open full live details &amp; status workflow</p>
          </div>
          <button
            onClick={() => navigateTo('orders')}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer"
          >
            View All {orderList.length} Orders <ArrowRight size={13} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Order</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Device</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Partner</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigateTo('orders', { orderId: order.id })}
                  className="hover:bg-emerald-50/50 transition-colors cursor-pointer group"
                  title="Click to view & edit this order"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-gray-900 text-xs group-hover:text-primary transition-colors flex items-center gap-1">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-gray-800 text-xs">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.city}</p>
                  </td>
                  <td className="px-4 py-3.5 max-w-[170px]">
                    <p className="text-xs text-gray-700 truncate font-medium">{order.deviceName}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg capitalize ${
                      order.type === 'sell' ? 'bg-green-50 text-green-700 border border-green-200' :
                      order.type === 'buy' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      order.type === 'exchange'? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                    }`}>{order.type}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-black text-gray-900 text-xs">₹{(order.quotedPrice).toLocaleString('en-IN')}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg capitalize ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'created' ? 'bg-blue-50 text-blue-700' :
                      order.status === 'inspection'? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    }`}>{order.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    {order.partnerName ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo('partners');
                        }}
                        className="text-xs text-gray-700 font-medium hover:text-primary hover:underline"
                        title="Click to view partners"
                      >
                        {order.partnerName}
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold text-xs bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo('orders', { orderId: order.id });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-primary hover:text-white text-gray-600 text-xs font-bold transition-all group-hover:bg-primary group-hover:text-white"
                    >
                      <Eye size={12} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
