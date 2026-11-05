'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ChevronRight, 
  AlertCircle, 
  FileText, 
  ArrowUpRight,
  RefreshCw,
  Bike,
  ShieldCheck
} from 'lucide-react';

export default function UserOrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const loadOrders = () => {
    if (typeof window === 'undefined') return;
    try {
      const storedCustomerOrders = localStorage.getItem('casmik_customer_orders_v1');
      const allOrders = localStorage.getItem('casmik_orders_v1');

      let list = [];
      if (storedCustomerOrders) {
        list = JSON.parse(storedCustomerOrders);
      } else if (allOrders) {
        list = JSON.parse(allOrders).slice(0, 5);
      } else {
        // Sample default active orders for instant demonstration
        list = [
          {
            id: 'CSK-938210',
            type: 'sell',
            device: 'Apple iPhone 14 Pro (128 GB)',
            category: 'Smartphones',
            customerName: 'Adarsh Sachan',
            phone: '+91 98765 43210',
            address: 'Flat 402, Green Glen Heights, Bengaluru',
            date: 'Today, 21 Sep 2026',
            timeSlot: '02:00 PM - 05:00 PM',
            status: 'assigned',
            price: 58000,
            assignedRider: 'Vikram Singh',
            riderPhone: '+91 98112 34567',
            createdAt: new Date().toISOString()
          },
          {
            id: 'CSK-819204',
            type: 'sell',
            device: 'Sony Alpha A7 III (Body)',
            category: 'DSLR & Mirrorless',
            customerName: 'Adarsh Sachan',
            phone: '+91 98765 43210',
            address: 'Flat 402, Green Glen Heights, Bengaluru',
            date: '18 Sep 2026',
            timeSlot: 'Completed',
            status: 'paid',
            price: 78000,
            assignedRider: 'Rahul Verma',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
          }
        ];
      }
      setOrders(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Paid & Completed
          </span>
        );
      case 'assigned':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <Bike className="w-3 h-3" />
            Rider Assigned
          </span>
        );
      case 'in_inspection':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            In Inspection
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pickup Scheduled
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 px-3.5 py-3 text-slate-100 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-black text-white tracking-wider uppercase">
            My Orders & Tracking ({orders.length})
          </h2>
        </div>
        <button
          onClick={loadOrders}
          className="text-slate-400 hover:text-white transition-colors p-1"
          title="Refresh Orders"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-6 text-center space-y-2">
          <Package className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs font-bold text-slate-300">No active orders found</p>
          <p className="text-[11px] text-slate-500">Sell a device or buy refurbished to track your order live!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
              className="bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 rounded-3xl p-4 space-y-3 shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/70">
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {order.id}
                </span>
                {getStatusBadge(order.status)}
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">{order.device || order.name || 'Device Buyback'}</h3>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Payout Amount:</span>
                  <span className="font-black text-emerald-400 text-sm">
                    ₹{(order.price || order.offeredPrice || 45000).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Collapsible Order Timeline */}
              {selectedOrder?.id === order.id && (
                <div className="pt-3 border-t border-slate-700/70 space-y-3 text-xs animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-white block">Order Scheduled</span>
                        <span className="text-[10px] text-slate-400">{order.date || 'Today'}, {order.timeSlot || 'Slot booked'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        order.status !== 'pending_pickup' ? 'bg-emerald-400' : 'bg-slate-600'
                      }`} />
                      <div>
                        <span className="font-bold text-white block">Delivery Executive Assigned</span>
                        <span className="text-[10px] text-slate-400">
                          {order.assignedRider ? `${order.assignedRider} (${order.riderPhone})` : 'Assigning rider in 15 mins'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        order.status === 'paid' || order.status === 'completed' ? 'bg-emerald-400' : 'bg-slate-600'
                      }`} />
                      <div>
                        <span className="font-bold text-white block">Inspection & Instant Payout</span>
                        <span className="text-[10px] text-slate-400">
                          {order.status === 'paid' ? 'Disbursed via UPI' : 'Pending doorstep test'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {order.assignedRider && (
                    <div className="bg-slate-900/80 rounded-2xl p-2.5 flex items-center justify-between border border-slate-800">
                      <div className="flex items-center gap-2">
                        <Bike className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="text-[11px] font-bold text-white block">{order.assignedRider}</span>
                          <span className="text-[9px] text-slate-400">Arriving in 25 mins</span>
                        </div>
                      </div>
                      <a
                        href={`tel:${order.riderPhone || '9876543210'}`}
                        className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Tap for timeline & tracking</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedOrder?.id === order.id ? 'rotate-90' : ''}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
