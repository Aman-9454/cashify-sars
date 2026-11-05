'use client';
import React, { useState } from 'react';
import { deliveryAgents } from '@/lib/casmikData';
import { 
  TrendingUp, 
  Star, 
  Download, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Award, 
  HelpCircle, 
  ChevronRight, 
  ArrowUpRight, 
  Calendar, 
  FileText, 
  AlertCircle,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const agent = deliveryAgents[0] || {
  id: 'agent-101',
  name: 'Raghu Sharma',
  phone: '9876543210',
  email: 'raghu@camsik.com',
  city: 'Bengaluru',
  pinCodes: ['560034', '560038', '560095'],
  status: 'online',
  rating: 4.9,
  todayPickups: 3,
  todayDeliveries: 1,
  totalDeliveries: 840,
  earnings: 3200,
  vehicle: 'Bike (Hero Splendor)',
  vehicleNumber: 'KA01AB5566',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
  joinedAt: '2023-01-15',
};

const weeklyData = [
  { day: 'Mon', deliveries: 8, earnings: 640 },
  { day: 'Tue', deliveries: 12, earnings: 960 },
  { day: 'Wed', deliveries: 10, earnings: 800 },
  { day: 'Thu', deliveries: 15, earnings: 1200 },
  { day: 'Fri', deliveries: 11, earnings: 880 },
  { day: 'Sat', deliveries: 18, earnings: 1440 },
  { day: 'Sun', deliveries: 14, earnings: 1120 },
];

const incentives = [
  { label: 'Base Delivery & Pickup Pay', amount: 1850, desc: '37 verified door pickups × ₹50 standard rate', icon: '📦' },
  { label: 'Peak Hour Surge Bonus', amount: 350, desc: '7 peak evening window deliveries × ₹50 surge', icon: '⚡' },
  { label: '5-Star Customer Rating Bonus', amount: 200, desc: 'Maintained 4.9+ customer feedback rating', icon: '⭐' },
  { label: 'Fleet Attendance & SLA Bonus', amount: 100, desc: '100% attendance & zero cancellation bonus', icon: '🏆' },
];

const settlements = [
  { id: 'PAY-2024-8192', date: '18 Sep 2026', trips: 14, amount: 1120, status: 'Settled', bank: 'HDFC Bank •••• 4029', ref: 'CMSK90128491' },
  { id: 'PAY-2024-8191', date: '17 Sep 2026', trips: 18, amount: 1440, status: 'Settled', bank: 'HDFC Bank •••• 4029', ref: 'CMSK90128477' },
  { id: 'PAY-2024-8190', date: '16 Sep 2026', trips: 11, amount: 880, status: 'Settled', bank: 'HDFC Bank •••• 4029', ref: 'CMSK90128430' },
  { id: 'PAY-2024-8189', date: '15 Sep 2026', trips: 15, amount: 1200, status: 'Settled', bank: 'HDFC Bank •••• 4029', ref: 'CMSK90128399' },
  { id: 'PAY-2024-8188', date: '14 Sep 2026', trips: 10, amount: 800, status: 'Settled', bank: 'HDFC Bank •••• 4029', ref: 'CMSK90128355' },
];

export default function DeliveryEarnings() {
  const [chartMetric, setChartMetric] = useState<'earnings' | 'deliveries'>('earnings');
  const [instantPayoutModal, setInstantPayoutModal] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [statementSuccess, setStatementSuccess] = useState(false);

  const totalToday = incentives.reduce((s, i) => s + i.amount, 0);
  const weeklyTotal = weeklyData.reduce((s, d) => s + d.earnings, 0);
  const weeklyTrips = weeklyData.reduce((s, d) => s + d.deliveries, 0);

  const handleInstantPayout = () => {
    setPayoutSuccess(true);
    setTimeout(() => {
      setInstantPayoutModal(false);
      setPayoutSuccess(false);
    }, 2500);
  };

  const handleDownloadStatement = () => {
    setStatementSuccess(true);
    setTimeout(() => setStatementSuccess(false), 3000);
  };

  return (
    <div className="w-full space-y-6">
      {/* ─── TOP HEADER & ACTIONS ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Earnings & Settlement Ledger</h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time daily payouts, peak-hour incentives, and direct bank settlement records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadStatement}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm"
          >
            <Download size={14} />
            {statementSuccess ? 'Statement Downloaded!' : 'Export Statement'}
          </button>

          <button
            onClick={() => setInstantPayoutModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black hover:opacity-95 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Zap size={14} /> Instant Payout (₹{totalToday})
          </button>
        </div>
      </div>

      {/* ─── FULL-WIDTH HERO EARNINGS BANNER ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-800 p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Main Today Metric */}
          <div className="lg:col-span-1 lg:border-r border-white/20 lg:pr-6">
            <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 text-emerald-100 mb-2">
              Today&apos;s Net Earnings
            </span>
            <p className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
              ₹{totalToday.toLocaleString('en-IN')}
            </p>
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold">
              <TrendingUp size={15} className="text-emerald-300" />
              <span>+28% higher than yesterday</span>
            </div>
          </div>

          {/* Quick Stat Blocks */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span className="text-xs font-bold text-emerald-100 block mb-1">Weekly Accumulated</span>
              <p className="text-2xl font-black">₹{weeklyTotal.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-emerald-200 mt-1 font-medium">{weeklyTrips} total trips this week</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span className="text-xs font-bold text-emerald-100 block mb-1">Direct Bank Deposit</span>
              <p className="text-base font-black text-white truncate">HDFC Bank •••• 4029</p>
              <p className="text-[11px] text-emerald-200 mt-1 font-medium">Daily automated NEFT at 10:00 PM</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-100 block mb-1">Fleet Tier Status</span>
                <div className="flex items-center gap-1.5">
                  <Award size={18} className="text-amber-300" />
                  <span className="text-base font-black text-white">Gold Tier Agent</span>
                </div>
              </div>
              <span className="text-[11px] text-emerald-200 font-semibold mt-1">
                Eligible for ₹50 extra peak bonus
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4 INCENTIVE DETAIL CARDS ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {incentives.map(item => (
          <div key={item.label} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-base font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                +₹{item.amount}
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{item.label}</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* ─── 12-COLUMN MAIN WORKSPACE ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Recharts Analytics & Milestone */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Weekly Performance Radar</h3>
                <p className="text-xs text-slate-500">Compare day-over-day earnings and task delivery volume</p>
              </div>

              {/* Metric Switch */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setChartMetric('earnings')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    chartMetric === 'earnings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Earnings (₹)
                </button>
                <button
                  onClick={() => setChartMetric('deliveries')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    chartMetric === 'deliveries' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Trips Count
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => chartMetric === 'earnings' ? `₹${v}` : v}
                  />
                  <Tooltip
                    formatter={(v: number) => [
                      chartMetric === 'earnings' ? `₹${v.toLocaleString('en-IN')}` : `${v} orders`,
                      chartMetric === 'earnings' ? 'Daily Earnings' : 'Deliveries'
                    ]}
                    contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Bar
                    dataKey={chartMetric}
                    fill="#059669"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 rounded-2xl p-3.5 text-center">
                <p className="text-xl font-black text-slate-900">{weeklyTrips}</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Total Trips</p>
              </div>
              <div className="bg-emerald-50/60 rounded-2xl p-3.5 text-center border border-emerald-100/60">
                <p className="text-xl font-black text-emerald-800">₹{weeklyTotal.toLocaleString('en-IN')}</p>
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">Total Disbursed</p>
              </div>
              <div className="bg-amber-50/60 rounded-2xl p-3.5 text-center border border-amber-100/60">
                <p className="text-xl font-black text-amber-900 flex items-center justify-center gap-1">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  {agent.rating}
                </p>
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mt-0.5">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Daily Peak Milestone Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Zap size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Evening Target: 10 Pickups</h4>
                  <p className="text-xs text-slate-500">Complete 2 more orders before 9:00 PM to unlock ₹300 bonus</p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                8 / 10 Completed
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full w-4/5 transition-all duration-500" />
            </div>
          </div>
        </div>

        {/* Right (5 cols): Today's Breakdown & Rate Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Today's Itemized Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base">Today&apos;s Pay Slip Breakdown</h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Active Cycle
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {incentives.map(item => (
                <div key={item.label} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-700 flex-shrink-0">
                    +₹{item.amount}
                  </span>
                </div>
              ))}

              <div className="p-4 bg-emerald-50/50 flex items-center justify-between">
                <div>
                  <p className="font-black text-slate-900 text-sm">Net Payable Today</p>
                  <p className="text-xs text-emerald-700">TDS / Platform fee waived</p>
                </div>
                <p className="text-xl font-black text-emerald-800">
                  ₹{totalToday.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Rate Card & Policy */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-md shadow-slate-900/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <h4 className="font-black text-sm text-white">Guaranteed Fleet Payout Card</h4>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-emerald-300">
                Verified
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-slate-300">Doorstep Pickup Base:</span>
                <span className="font-bold text-white">₹50 / device</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-slate-300">Hub Handover Bonus:</span>
                <span className="font-bold text-white">₹30 / bag</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-slate-300">Monsoon / Rain Allowance:</span>
                <span className="font-bold text-emerald-400">+₹40 / trip</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-300">Extended Radius (&gt;8 km):</span>
                <span className="font-bold text-white">₹12 / extra km</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FULL-WIDTH SETTLEMENT TABLE ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900">Direct Bank Settlement History</h3>
            <p className="text-xs text-slate-500 mt-0.5">Automated daily NEFT credits processed to your verified account</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            5 Past Settlements
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Settlement ID</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Completed Trips</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Disbursed To</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settlements.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs font-bold text-slate-700">
                    {row.id}
                  </td>
                  <td className="py-4 px-6 text-xs font-semibold text-slate-600">
                    {row.date}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600">
                    <span className="font-bold text-slate-900">{row.trips}</span> pickups
                  </td>
                  <td className="py-4 px-6 text-sm font-black text-emerald-700">
                    ₹{row.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={13} className="text-slate-400" />
                      <span>{row.bank}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 size={11} className="text-emerald-600" /> {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={handleDownloadStatement}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Download Payout Voucher"
                    >
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── INSTANT PAYOUT MODAL ────────────────────────────────────────── */}
      {instantPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setInstantPayoutModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {!payoutSuccess ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase">Express Transfer</span>
                    <h3 className="text-lg font-black text-slate-900">Instant Spot Payout</h3>
                  </div>
                  <button onClick={() => setInstantPayoutModal(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
                    ✕
                  </button>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center">
                  <span className="text-xs font-bold text-emerald-800">Available Spot Withdrawal</span>
                  <p className="text-3xl font-black text-emerald-900 mt-1">₹{totalToday.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-emerald-700 mt-1">Direct IMPS to HDFC Bank A/c •••• 4029</p>
                </div>

                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl">
                  <div className="flex justify-between">
                    <span>Beneficiary Name:</span>
                    <span className="font-bold text-slate-900">Raghu Sharma</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer Mode:</span>
                    <span className="font-bold text-slate-900">Instant 24x7 IMPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span className="font-bold text-emerald-700">₹0 (Free for Top Tier)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInstantPayout}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-sm hover:opacity-95 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  Authorize Instant Transfer of ₹{totalToday}
                </button>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-xl font-black text-slate-900">Payout Initiated Successfully!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  ₹{totalToday} is being credited to HDFC Bank •••• 4029. Ref: CMSK-IMPS-{Date.now().toString().slice(-6)}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
