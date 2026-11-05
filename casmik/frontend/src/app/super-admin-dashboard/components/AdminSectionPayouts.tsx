'use client';
import React from 'react';
import { partners } from '@/lib/casmikData';
import { CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminSectionPayouts() {
  const totalPending = partners?.reduce((s, p) => s + p?.pendingPayout, 0);
  const totalEarnings = partners?.reduce((s, p) => s + p?.totalEarnings, 0);
  const activePartners = partners?.filter(p => p?.status === 'active');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pending Payouts', value: `₹${totalPending?.toLocaleString('en-IN')}`, color: 'text-orange-600', icon: Clock },
          { label: 'Total Earnings (All)', value: `₹${(totalEarnings / 100000)?.toFixed(1)}L`, color: 'text-green-600', icon: TrendingUp },
          { label: 'Partners Awaiting', value: activePartners?.filter(p => p?.pendingPayout > 0)?.length, color: 'text-red-600', icon: DollarSign },
          { label: 'Processed This Month', value: '₹3.2L', color: 'text-blue-600', icon: CheckCircle },
        ]?.map(stat => (
          <div key={stat?.label} className="bg-white rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon size={14} className={stat?.color} />
              <p className="text-xs text-muted-foreground">{stat?.label}</p>
            </div>
            <p className={`text-2xl font-bold ${stat?.color}`}>{stat?.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Partner Payout Summary</h2>
          <button className="flex items-center gap-1.5 bg-primary text-white text-sm px-3 py-2 rounded-xl hover:bg-primary/90 transition-colors">
            Process All Payouts
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Partner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Total Earnings</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Available Balance</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Pending Payout</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Commission %</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {partners?.map((p, i) => (
                <tr key={p?.id} className={`border-b border-border last:border-0 hover:bg-surface/50 transition-colors ${i % 2 === 0 ? '' : 'bg-surface/20'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p?.avatar} alt={p?.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">{p?.storeName}</p>
                        <p className="text-xs text-muted-foreground">{p?.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">₹{p?.totalEarnings?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">₹{p?.availableBalance?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 font-semibold text-orange-600">₹{p?.pendingPayout?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{p?.commission}%</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${p?.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p?.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p?.pendingPayout > 0 && p?.status === 'active' ? (
                      <button className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                        Pay ₹{p?.pendingPayout?.toLocaleString('en-IN')}
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">No pending</span>
                    )}
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
