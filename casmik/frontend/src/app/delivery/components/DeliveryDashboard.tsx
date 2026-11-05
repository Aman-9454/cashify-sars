'use client';
import React, { useState, useEffect } from 'react';
import { orders, deliveryAgents, getOrderStatusLabel, getOrderStatusColor } from '@/lib/casmikData';
import type { Order, OrderStatus } from '@/lib/casmikData';
import { 
  MapPin, 
  Package, 
  CheckCircle, 
  Clock, 
  Star, 
  Truck, 
  Phone, 
  Navigation, 
  ArrowRight, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Flame,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface DeliveryDashboardProps {
  onNavigateToTasks?: () => void;
  onNavigateToEarnings?: () => void;
}

export default function DeliveryDashboard({ onNavigateToTasks, onNavigateToEarnings }: DeliveryDashboardProps) {
  const [taskList, setTaskList] = useState<Order[]>([]);
  const [agent, setAgent] = useState(deliveryAgents[0]);

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('casmik_delivery_session');
      if (savedSession) {
        setAgent(JSON.parse(savedSession));
      }
    } catch {}

    const loadDashboardData = () => {
      try {
        const savedOrders = localStorage.getItem('casmik_orders_v1');
        const agentId = agent?.id || 'agent-101';
        if (savedOrders) {
          const parsed = JSON.parse(savedOrders);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const myTasks = parsed.filter((o: Order) => Boolean(o.deliveryAgentId) && (o.deliveryAgentId === agentId || o.deliveryAgentId === 'agent-101' || o.deliveryAgentId === 'delivery-001'));
            setTaskList(myTasks);
            return;
          }
        }
      } catch {}
      setTaskList(orders.filter(o => Boolean(o.deliveryAgentId) && (o.deliveryAgentId === 'agent-101' || o.deliveryAgentId === 'delivery-001')));
    };

    loadDashboardData();
    window.addEventListener('casmik_orders_updated', loadDashboardData);
    window.addEventListener('casmik_partner_orders_updated', loadDashboardData);
    window.addEventListener('storage', loadDashboardData);
    return () => {
      window.removeEventListener('casmik_orders_updated', loadDashboardData);
      window.removeEventListener('casmik_partner_orders_updated', loadDashboardData);
      window.removeEventListener('storage', loadDashboardData);
    };
  }, [agent?.id]);

  const [scheduleTab, setScheduleTab] = useState<'today' | 'tomorrow' | 'completed'>('today');

  const parseTimeSlot = (slot?: string): number => {
    if (!slot) return 999;
    const s = slot.toLowerCase();
    const match = s.match(/(\d+)(?::(\d+))?\s*(am|pm)?/);
    if (!match) return 999;
    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const meridiem = match[3] || (s.includes('pm') ? 'pm' : 'am');
    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const isTmrw = (dateStr?: string) => {
    if (!dateStr) return false;
    const l = dateStr.toLowerCase();
    if (l.includes('tomorrow')) return true;
    const now = new Date();
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d.toDateString() === t.toDateString();
  };

  const completedOrders = taskList.filter(o => o.status === 'completed' || o.paymentStatus === 'paid');
  const activeOrders = taskList.filter(o => !['completed', 'paid'].includes(o.status) && o.paymentStatus !== 'paid');

  const todayPickups = activeOrders
    .filter(o => !isTmrw(o.pickupDate))
    .sort((a, b) => parseTimeSlot(a.pickupSlot) - parseTimeSlot(b.pickupSlot));

  const tomorrowPickups = activeOrders
    .filter(o => isTmrw(o.pickupDate))
    .sort((a, b) => parseTimeSlot(a.pickupSlot) - parseTimeSlot(b.pickupSlot));

  const currentDisplayList =
    scheduleTab === 'today' ? todayPickups :
    scheduleTab === 'tomorrow' ? tomorrowPickups : completedOrders;

  const handleMarkComplete = async (orderId: string) => {
    const updated = taskList.map(t => t.id === orderId ? { ...t, status: 'completed' as OrderStatus, paymentStatus: 'paid' as const } : t);
    setTaskList(updated);
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('casmik_orders_v1') || '[]');
        const newOrders = existing.map((o: any) => o.id === orderId ? { ...o, status: 'completed', paymentStatus: 'paid' } : o);
        localStorage.setItem('casmik_orders_v1', JSON.stringify(newOrders));
        window.dispatchEvent(new Event('casmik_orders_updated'));
      } catch {}
    }
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: 'completed', paymentStatus: 'paid' }),
      });
    } catch {}
  };

  const pendingPickups = todayPickups.filter(o => ['assigned', 'accepted', 'pickup_scheduled'].includes(o.status));
  const inTransit = todayPickups.filter(o => ['picked_up', 'in_transit', 'inspection'].includes(o.status));
  const completedToday = completedOrders;

  const targetPickups = 6;
  const completedCount = completedToday.length;
  const isBonusUnlocked = completedCount >= targetPickups;
  const bonusAmount = isBonusUnlocked ? 300 : 0;
  const calculatedEarnings = (completedCount * 500) + bonusAmount;
  const liveEarnings = calculatedEarnings > 0 ? calculatedEarnings : (agent?.earnings || 3200);

  const remainingPickups = Math.max(0, targetPickups - completedCount);
  const progressPercent = Math.min(100, Math.round((completedCount / targetPickups) * 100));

  const nextTask = todayPickups[0] || tomorrowPickups[0] || taskList[0];

  return (
    <div className="space-y-6 w-full">
      {/* ─── HERO EXECUTIVE OPERATIONS CARD ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-primary to-teal-700 text-white shadow-xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Agent info */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative flex-shrink-0">
              {agent?.avatar ? (
                <img 
                  src={agent.avatar} 
                  alt={agent.name} 
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl object-cover border-4 border-white/20 shadow-lg" 
                />
              ) : (
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-white text-emerald-700 font-black text-2xl flex items-center justify-center shadow-lg">
                  {agent?.name?.[0] || 'D'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-3 border-white flex items-center justify-center">
                <CheckCircle2 size={13} className="text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{agent?.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                  {agent?.vehicle || 'Two-Wheeler'} · {agent?.vehicleNumber || 'KA-01-AB-5566'}
                </span>
              </div>
              <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                Assigned Zone: <strong>Delhi NCR & Gurgaon South</strong> · Active Fleet Executive
              </p>

              <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                <div className="flex items-center gap-1 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-xl">
                  <Star size={13} className="fill-amber-300 text-amber-300" />
                  <span className="font-bold text-amber-200">{agent?.rating || '4.9'}</span>
                  <span className="text-white/60">({agent?.totalDeliveries || 840} completed)</span>
                </div>
                <div className="flex items-center gap-1 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-xl text-emerald-200 font-bold">
                  <ShieldCheck size={13} className="text-emerald-300" />
                  <span>KYC Verified & Insured</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats in Hero */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-black/20 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 flex-shrink-0">
            <div className="text-center px-2 sm:px-4">
              <p className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Pending</p>
              <p className="text-xl sm:text-2xl font-black mt-0.5">{pendingPickups.length}</p>
              <span className="text-[10px] text-white/70">Pickups</span>
            </div>
            <div className="text-center px-2 sm:px-4 border-x border-white/15">
              <p className="text-xs text-emerald-200 font-bold uppercase tracking-wider">In Transit</p>
              <p className="text-xl sm:text-2xl font-black mt-0.5">{inTransit.length}</p>
              <span className="text-[10px] text-white/70">Active</span>
            </div>
            <div className="text-center px-2 sm:px-4">
              <p className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Earned</p>
              <p className="text-xl sm:text-2xl font-black mt-0.5 text-amber-300">₹{liveEarnings.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-white/70">Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4 COMPREHENSIVE OPERATIONAL STAT CARDS ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Pending Pickups */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Pickups</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Package size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900">{pendingPickups.length}</p>
            <span className="text-xs text-blue-600 font-bold">Orders waiting for collection</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Next pickup slot:</span>
            <span className="font-bold text-slate-800">10:00 AM - 1:00 PM</span>
          </div>
        </div>

        {/* Card 2: In-Transit / Inspection */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Devices In Transit</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Truck size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900">{inTransit.length}</p>
            <span className="text-xs text-amber-600 font-bold">En route to Hub</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Destination:</span>
            <span className="font-bold text-slate-800">Camsik Certified Hub</span>
          </div>
        </div>

        {/* Card 3: Completed Today */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Today</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900">{completedToday.length}</p>
            <span className="text-xs text-emerald-600 font-bold">100% verified payouts</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Customer Satisfaction:</span>
            <span className="font-bold text-emerald-700">100% Positive</span>
          </div>
        </div>

        {/* Card 4: Daily Settlement Earnings */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Earnings</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Zap size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900">₹{liveEarnings.toLocaleString('en-IN')}</p>
            <span className="text-xs text-emerald-600 font-bold">+23% vs yesterday</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Settlement mode:</span>
            <span className="font-bold text-slate-800">Direct Bank Deposit (12 AM)</span>
          </div>
        </div>
      </div>

      {/* ─── 2-COLUMN MAIN OPERATIONS WORKFLOW ─────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE & UPCOMING TASKS (8 Cols) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Priority Next Pickup Alert Banner */}
          {nextTask && (
            <div className="bg-white rounded-3xl border-2 border-primary/30 p-5 sm:p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                    Recommended Next Stop
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  #{nextTask.orderNumber}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-7">
                  <h3 className="text-lg font-black text-slate-900 leading-snug">{nextTask.deviceName}</h3>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                    <MapPin size={13} className="text-primary flex-shrink-0" />
                    <span>{nextTask.customerAddress || 'Connaught Place, Central Delhi'}, {nextTask.pinCode || '110001'}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400 flex-shrink-0" />
                    <span>Customer Slot: <strong>{nextTask.pickupDate || 'Today'} · {nextTask.pickupSlot || '10:00 AM - 1:00 PM'}</strong></span>
                  </p>
                </div>

                <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col gap-2">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Spot Value:</span>
                    <span className="text-base font-black text-emerald-600">₹{(nextTask.quotedPrice || 45000).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(nextTask.customerAddress || nextTask.city || 'Delhi')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Navigation size={13} />
                      <span>GPS Maps</span>
                    </a>
                    {nextTask.customerPhone && (
                      <a
                        href={`tel:${nextTask.customerPhone}`}
                        className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-emerald-200 transition-colors"
                      >
                        <Phone size={13} />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Pickups & Completed Orders Console */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header & Schedule Filter Tabs */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Assigned Pickups & Operations</h3>
                <p className="text-xs text-slate-500 mt-0.5">Sequenced pickup routing for optimal doorstep turnaround</p>
              </div>

              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setScheduleTab('today')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    scheduleTab === 'today'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📅 Today ({todayPickups.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleTab('tomorrow')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    scheduleTab === 'tomorrow'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⏰ Tomorrow ({tomorrowPickups.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleTab('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    scheduleTab === 'completed'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✅ Completed ({completedOrders.length})
                </button>
              </div>
            </div>

            {/* List Content */}
            <div className="divide-y divide-slate-100">
              {currentDisplayList.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Package size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Orders in this Section</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {scheduleTab === 'today' ? 'All today pickups have been completed or none assigned.' :
                     scheduleTab === 'tomorrow' ? 'No orders scheduled for tomorrow yet.' :
                     'Completed doorstep pickups will be cataloged here.'}
                  </p>
                </div>
              ) : (
                currentDisplayList.map((task, idx) => (
                  <div key={task.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Sequence Stop Badge */}
                      <div className="flex flex-col items-center">
                        <div className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 font-black shadow-xs ${
                          task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          scheduleTab === 'today' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          <span className="text-[10px] uppercase font-bold leading-none">Stop</span>
                          <span className="text-base font-black leading-none mt-0.5">#{idx + 1}</span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs font-bold text-slate-500">#{task.orderNumber}</span>
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-900 text-white flex items-center gap-1">
                            <Clock size={10} /> {task.pickupSlot || '10:00 AM - 1:00 PM'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getOrderStatusColor(task.status)}`}>
                            {getOrderStatusLabel(task.status)}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 truncate">{task.deviceName}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Customer: <strong className="text-slate-800">{task.customerName}</strong> ({task.customerPhone})
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1">
                          <MapPin size={11} className="flex-shrink-0 text-emerald-600" />
                          <span>{task.customerAddress || 'Customer Address'}, {task.city} (PIN: {task.pinCode})</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 flex-shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                      <p className="text-base font-black text-emerald-600">₹{task.quotedPrice?.toLocaleString('en-IN')}</p>
                      <div className="flex items-center gap-2">
                        {task.customerAddress && (
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(task.customerAddress + ' ' + (task.pinCode || ''))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Navigation size={11} /> Map
                          </a>
                        )}
                        <a
                          href={`tel:${task.customerPhone}`}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Phone size={11} /> Call
                        </a>
                        {task.status !== 'completed' && task.paymentStatus !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => handleMarkComplete(task.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                          >
                            <CheckCircle2 size={12} /> Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PERFORMANCE, GOALS & LIVE HELPLINE (4 Cols) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Daily Goal & Incentive Milestone */}
          <div
            onClick={onNavigateToEarnings}
            className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-md cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/20 text-white">
                Daily Peak Incentive
              </span>
              <Flame size={20} className="text-amber-200 animate-pulse" />
            </div>

            <h3 className="text-xl font-black">₹300 Extra Bonus Target</h3>
            <p className="text-xs text-amber-100 mt-1 leading-relaxed">
              {isBonusUnlocked ? (
                <span>🎉 <strong>Target Complete!</strong> You completed all 6 pickups and unlocked the daily ₹300 speed bonus!</span>
              ) : (
                <span>Complete <strong>{remainingPickups} more pickup{remainingPickups > 1 ? 's' : ''}</strong> before 6:00 PM today to unlock the full daily speed milestone bonus.</span>
              )}
            </p>

            <div className="mt-4 bg-black/20 rounded-2xl p-3">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span>Progress: {completedCount} of {targetPickups} pickups</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToEarnings?.();
              }}
              className="mt-4 w-full py-2.5 bg-white text-orange-600 rounded-xl text-xs font-black hover:bg-amber-50 transition-colors shadow-sm cursor-pointer"
            >
              View Full Earnings Breakdown →
            </button>
          </div>

          {/* Performance & Quality Score */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 flex items-center justify-between">
              <span>Performance Ratings</span>
              <span className="text-xs font-bold text-emerald-600">Top 5% Executive</span>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-600">On-Time Arrival Rate</span>
                  <span className="text-slate-900">98%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-600">Customer Rating</span>
                  <span className="text-amber-600 flex items-center gap-0.5">
                    <Star size={11} className="fill-amber-400 text-amber-400" /> 4.9 / 5.0
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-600">Inspection Accuracy</span>
                  <span className="text-blue-600">99.2%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '99%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Camsik Hub Operations Contact */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="font-black text-sm text-slate-900">Assigned Processing Hub</h3>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <p className="text-xs font-bold text-slate-900">Camsik Certified Central Hub</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Connaught Place, Outer Circle, New Delhi</p>
              <p className="text-[11px] text-slate-500 mt-1">Hub Manager: <strong>Vikram Singhania</strong></p>
            </div>
            <div className="flex gap-2">
              <a
                href="tel:9876543210"
                className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
              >
                <Phone size={12} />
                <span>Call Hub Manager</span>
              </a>
              <a
                href="https://maps.google.com/?q=Connaught+Place+Delhi"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                title="Open Hub on Maps"
              >
                <Navigation size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
