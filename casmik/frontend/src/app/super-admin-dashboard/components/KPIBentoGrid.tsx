'use client';
import React from 'react';
import { TrendingUp, TrendingDown, ShoppingBag, Truck, Handshake, Smartphone, CreditCard, ArrowUpRight, AlertTriangle } from 'lucide-react';

// Backend integration point: fetch from /api/v1/admin/dashboard/kpis
const kpis = [
  {
    id: 'kpi-revenue',
    label: 'Total Revenue',
    value: '₹48.7L',
    sub: 'This month',
    change: '+23.4%',
    changeDir: 'up',
    icon: TrendingUp,
    color: 'text-primary',
    bg: 'bg-primary/10',
    cardClass: 'col-span-2 row-span-1',
    hero: true,
  },
  {
    id: 'kpi-orders-today',
    label: 'Orders Today',
    value: '247',
    sub: 'Since midnight',
    change: '+18 vs yesterday',
    changeDir: 'up',
    icon: ShoppingBag,
    color: 'text-info',
    bg: 'bg-info/10',
    cardClass: '',
    hero: false,
  },
  {
    id: 'kpi-active-pickups',
    label: 'Active Pickups',
    value: '63',
    sub: 'In transit now',
    change: '⚠ 8 delayed',
    changeDir: 'warn',
    icon: Truck,
    color: 'text-warning',
    bg: 'bg-warning/10',
    cardClass: '',
    hero: false,
  },
  {
    id: 'kpi-pending-payouts',
    label: 'Pending Payouts',
    value: '₹2.4L',
    sub: '34 partners waiting',
    change: '↑ Process by Friday',
    changeDir: 'warn',
    icon: CreditCard,
    color: 'text-danger',
    bg: 'bg-danger/10',
    cardClass: '',
    hero: false,
    alert: true,
  },
  {
    id: 'kpi-active-partners',
    label: 'Active Partners',
    value: '182',
    sub: 'Across 100+ cities',
    change: '+7 new this month',
    changeDir: 'up',
    icon: Handshake,
    color: 'text-purple-500',
    bg: 'bg-purple-100',
    cardClass: '',
    hero: false,
  },
  {
    id: 'kpi-devices-quoted',
    label: 'Devices Quoted',
    value: '1,482',
    sub: 'Today',
    change: '+12% vs yesterday',
    changeDir: 'up',
    icon: Smartphone,
    color: 'text-primary',
    bg: 'bg-primary/10',
    cardClass: '',
    hero: false,
  },
  {
    id: 'kpi-completion-rate',
    label: 'Completion Rate',
    value: '91.4%',
    sub: 'Last 30 days',
    change: '-1.2% vs last month',
    changeDir: 'down',
    icon: TrendingDown,
    color: 'text-warning',
    bg: 'bg-warning/10',
    cardClass: '',
    hero: false,
  },
  {
    id: 'kpi-avg-quote',
    label: 'Avg Quote Value',
    value: '₹32,480',
    sub: 'Per sell order',
    change: '+₹1,240 this week',
    changeDir: 'up',
    icon: TrendingUp,
    color: 'text-primary',
    bg: 'bg-primary/10',
    cardClass: '',
    hero: false,
  },
];

export default function KPIBentoGrid() {
  // Grid plan: 8 cards → 4-col grid
  // Row 1: hero spans 2 cols + 2 regular
  // Row 2: 4 regular
  const heroKpi = kpis?.[0];
  const rest = kpis?.slice(1);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Hero card — spans 2 cols */}
      <div
        className={`col-span-2 bg-white rounded-2xl border border-border shadow-sm p-5 hover:shadow-md transition-all duration-200 relative overflow-hidden ${heroKpi?.alert ? 'border-danger/30 bg-danger/5' : ''}`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-11 h-11 rounded-xl ${heroKpi?.bg} flex items-center justify-center`}>
              <heroKpi.icon size={20} className={heroKpi?.color} />
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary-50 px-2 py-1 rounded-lg">
              <ArrowUpRight size={11} />
              Live
            </div>
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{heroKpi?.label}</p>
          <p className="text-4xl font-extrabold text-foreground font-tabular">{heroKpi?.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{heroKpi?.sub}</p>
          <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
            heroKpi?.changeDir === 'up' ? 'text-primary' : heroKpi?.changeDir === 'down' ? 'text-danger' : 'text-warning'
          }`}>
            {heroKpi?.changeDir === 'up' ? <TrendingUp size={11} /> : heroKpi?.changeDir === 'down' ? <TrendingDown size={11} /> : <AlertTriangle size={11} />}
            {heroKpi?.change}
          </div>
        </div>
      </div>
      {/* Rest — regular cards */}
      {rest?.map((kpi) => (
        <div
          key={kpi?.id}
          className={`bg-white rounded-2xl border shadow-sm p-4 hover:shadow-md transition-all duration-200 ${kpi?.alert ? 'border-danger/30 bg-red-50/30' : 'border-border'}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className={`w-9 h-9 rounded-xl ${kpi?.bg} flex items-center justify-center`}>
              <kpi.icon size={16} className={kpi?.color} />
            </div>
            {kpi?.alert && <AlertTriangle size={14} className="text-danger" />}
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 leading-tight">{kpi?.label}</p>
          <p className="text-2xl font-extrabold text-foreground font-tabular leading-tight">{kpi?.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{kpi?.sub}</p>
          <div className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${
            kpi?.changeDir === 'up' ? 'text-primary' : kpi?.changeDir === 'down' ? 'text-danger' : 'text-warning'
          }`}>
            {kpi?.changeDir === 'up' ? <TrendingUp size={10} /> : kpi?.changeDir === 'down' ? <TrendingDown size={10} /> : <AlertTriangle size={10} />}
            <span className="truncate">{kpi?.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}