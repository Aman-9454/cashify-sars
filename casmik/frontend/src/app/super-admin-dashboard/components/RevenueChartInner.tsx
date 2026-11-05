'use client';
import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

// Backend integration point: fetch from /api/v1/admin/reports/revenue?period=30d
const revenueData = [
  { date: '25 Jul', revenue: 980000, orders: 142 },
  { date: '27 Jul', revenue: 1120000, orders: 158 },
  { date: '29 Jul', revenue: 890000, orders: 131 },
  { date: '31 Jul', revenue: 1340000, orders: 187 },
  { date: '02 Aug', revenue: 1560000, orders: 203 },
  { date: '04 Aug', revenue: 1210000, orders: 172 },
  { date: '06 Aug', revenue: 1680000, orders: 224 },
  { date: '08 Aug', revenue: 1450000, orders: 198 },
  { date: '10 Aug', revenue: 1920000, orders: 251 },
  { date: '12 Aug', revenue: 1780000, orders: 238 },
  { date: '14 Aug', revenue: 2100000, orders: 276 },
  { date: '16 Aug', revenue: 1650000, orders: 221 },
  { date: '18 Aug', revenue: 2340000, orders: 298 },
  { date: '20 Aug', revenue: 2180000, orders: 285 },
  { date: '22 Aug', revenue: 2580000, orders: 312 },
  { date: '23 Aug', revenue: 2420000, orders: 294 },
];

const ranges = [
  { id: 'range-7d', label: '7D' },
  { id: 'range-30d', label: '30D' },
  { id: 'range-90d', label: '90D' },
];

const formatINR = (val: number) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Revenue</span>
          <span className="font-bold text-primary">{formatINR(payload[0]?.value || 0)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Orders</span>
          <span className="font-bold text-foreground">{payload[1]?.value || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default function RevenueChartInner() {
  const [activeRange, setActiveRange] = useState('range-30d');

  const displayData = activeRange === 'range-7d' ? revenueData.slice(-7) : revenueData;

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-bold text-foreground text-base">Revenue Overview</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-extrabold text-foreground font-tabular">₹48.7L</p>
            <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary-50 px-2 py-1 rounded-lg">
              <TrendingUp size={11} />
              +23.4%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">vs ₹39.5L last month</p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRange(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRange === r.id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={displayData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatINR}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--primary)"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}