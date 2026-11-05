'use client';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

// Backend integration point: fetch from /api/v1/admin/reports/orders-by-type
const orderTypeData = [
  { type: 'Sell', count: 1842, color: '#16a34a' },
  { type: 'Buy', count: 764, color: '#3b82f6' },
  { type: 'Exchange', count: 312, color: '#8b5cf6' },
  { type: 'Repair', count: 198, color: '#f59e0b' },
];

const CustomTooltip2 = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-foreground mb-1">{label} Orders</p>
      <p className="font-bold text-foreground">{payload[0]?.value?.toLocaleString('en-IN')} orders</p>
    </div>
  );
};

export default function OrdersBarChartInner() {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 h-full">
      <div className="mb-4">
        <h3 className="font-bold text-foreground text-base">Orders by Service</h3>
        <p className="text-xs text-muted-foreground mt-0.5">This month breakdown</p>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={orderTypeData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="type"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip2 />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {orderTypeData.map((entry, index) => (
              <Cell key={`cell-${entry.type}`} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {orderTypeData.map((item) => (
          <div key={`legend-${item.type}`} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-muted-foreground">{item.type}</span>
            <span className="text-xs font-bold text-foreground ml-auto">{item.count.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}