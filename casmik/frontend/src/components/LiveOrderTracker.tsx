'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { orders as defaultOrders, getOrderStatusLabel, getOrderStatusColor, getTypeColor } from '@/lib/casmikData';
import type { Order, OrderStatus } from '@/lib/casmikData';
import { CheckCircle, Clock, Package, Truck, Search, Wrench, CreditCard, X, Wifi, WifiOff, CheckCircle2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface LiveOrder {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  device_name: string;
  quoted_price: number;
  final_price: number;
  partner_name: string | null;
  delivery_agent_name: string | null;
  pickup_date: string | null;
  pickup_slot: string | null;
  city: string | null;
  pin_code: string | null;
  payment_status: string;
  inspection_score: number | null;
  notes: string | null;
  updated_at: string;
  created_at: string;
}

interface LiveOrderTrackerProps {
  panel?: 'admin' | 'partner' | 'delivery' | 'customer';
  partnerId?: string;
  deliveryAgentId?: string;
  customerId?: string;
  maxItems?: number;
  compact?: boolean;
  title?: string;
}

function orderToLiveOrder(o: Order): LiveOrder {
  return {
    id: o.id,
    order_number: o.orderNumber,
    order_type: o.type,
    status: o.status,
    customer_name: o.customerName,
    customer_phone: o.customerPhone,
    device_name: o.deviceName,
    quoted_price: o.quotedPrice,
    final_price: o.finalPrice,
    partner_name: o.partnerName,
    delivery_agent_name: o.deliveryAgentName,
    pickup_date: o.pickupDate,
    pickup_slot: o.pickupSlot,
    city: o.city,
    pin_code: o.pinCode,
    payment_status: o.paymentStatus,
    inspection_score: o.inspectionScore,
    notes: o.notes,
    updated_at: o.updatedAt,
    created_at: o.createdAt,
  };
}

const getFallbackLiveOrders = (): LiveOrder[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_orders_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(orderToLiveOrder);
        }
      }
    } catch (e) {
      console.warn('LiveOrderTracker failed to parse local orders', e);
    }
  }
  return defaultOrders.map(orderToLiveOrder);
};

const STATUS_STEPS = [
  { key: 'created', label: 'Order Created', icon: Package },
  { key: 'assigned', label: 'Partner Assigned', icon: CheckCircle },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle },
  { key: 'pickup_scheduled', label: 'Pickup Scheduled', icon: Clock },
  { key: 'picked_up', label: 'Picked Up', icon: Truck },
  { key: 'inspection', label: 'Inspection', icon: Search },
  { key: 'inspection_completed', label: 'Inspection Done', icon: CheckCircle },
  { key: 'payment_processing', label: 'Payment Processing', icon: CreditCard },
  { key: 'paid', label: 'Payment Done', icon: CheckCircle },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
];

const REPAIR_STEPS = [
  { key: 'created', label: 'Order Created', icon: Package },
  { key: 'assigned', label: 'Partner Assigned', icon: CheckCircle },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle },
  { key: 'pickup_scheduled', label: 'Pickup Scheduled', icon: Clock },
  { key: 'picked_up', label: 'Picked Up', icon: Truck },
  { key: 'inspection', label: 'Under Repair', icon: Wrench },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
];

function OrderProgressBar({ status, orderType }: { status: string; orderType: string }) {
  const steps = orderType === 'repair' ? REPAIR_STEPS : STATUS_STEPS;
  const currentIdx = steps.findIndex(s => s.key === status);
  const isTerminal = ['completed', 'cancelled', 'rejected'].includes(status);

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isDone = idx < currentIdx || (isTerminal && status === 'completed');
        const isCurrent = idx === currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                isDone ? 'bg-green-500 text-white' : isCurrent ?'bg-primary text-white ring-2 ring-primary/30': 'bg-gray-100 text-gray-400'
              }`}>
                <Icon size={13} />
              </div>
              <p className={`text-[9px] mt-1 font-semibold text-center max-w-[52px] leading-tight ${
                isCurrent ? 'text-primary' : isDone ? 'text-green-600' : 'text-gray-400'
              }`}>{step.label}</p>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-[12px] rounded-full transition-all ${
                idx < currentIdx ? 'bg-green-400' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function LiveOrderTracker({
  panel = 'admin',
  partnerId,
  deliveryAgentId,
  customerId,
  maxItems = 20,
  compact = false,
  title = 'Live Order Tracker',
}: LiveOrderTrackerProps) {
  const [orders, setOrders] = useState<LiveOrder[]>(getFallbackLiveOrders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LiveOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [recentUpdate, setRecentUpdate] = useState<string | null>(null);
  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    try {
      let q = supabase.from('orders').select('*').order('updated_at', { ascending: false }).limit(maxItems);

      if (partnerId) q = q.eq('partner_id', partnerId);
      if (deliveryAgentId) q = q.eq('delivery_agent_id', deliveryAgentId);
      if (customerId) q = q.eq('customer_id', customerId);

      const { data, error: fetchError } = await q;
      if (!fetchError && data && data.length > 0) {
        setOrders(data);
        setError(null);
        setIsConnected(true);
        return;
      }
    } catch (err: any) {
      console.log('LiveOrderTracker fetch notice, active on fallback store:', err.message);
    } finally {
      setLoading(false);
    }

    // Seamlessly load fallback orders
    let fallback = getFallbackLiveOrders();
    if (partnerId) fallback = fallback.filter(o => o.partner_name && o.partner_name.toLowerCase().includes(partnerId.toLowerCase()));
    if (deliveryAgentId) fallback = fallback.filter(o => o.delivery_agent_name && o.delivery_agent_name.toLowerCase().includes(deliveryAgentId.toLowerCase()));
    setOrders(fallback.slice(0, maxItems));
    setError(null);
  }, [partnerId, deliveryAgentId, customerId, maxItems, supabase]);

  useEffect(() => {
    fetchOrders();

    const channelName = `live-orders-${panel}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        ...(partnerId ? { filter: `partner_id=eq.${partnerId}` } : {}),
      }, (payload) => {
        setRecentUpdate(payload.new && 'order_number' in payload.new ? (payload.new as any).order_number : null);
        setTimeout(() => setRecentUpdate(null), 3000);

        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new as LiveOrder, ...prev].slice(0, maxItems));
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === (payload.new as LiveOrder).id ? payload.new as LiveOrder : o));
          if (selectedOrder?.id === (payload.new as LiveOrder).id) {
            setSelectedOrder(payload.new as LiveOrder);
          }
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== (payload.old as any).id));
        }
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [panel, partnerId, deliveryAgentId, customerId, maxItems, fetchOrders]);

  const filtered = orders.filter(o => {
    const matchQuery = !query || o.order_number.toLowerCase().includes(query.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(query.toLowerCase()) ||
      o.device_name.toLowerCase().includes(query.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchQuery && matchStatus;
  });

  const activeCount = orders.filter(o => !['completed', 'cancelled', 'rejected'].includes(o.status)).length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading live orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              {title}
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {isConnected ? <Wifi size={10} /> : <CheckCircle2 size={11} />}
                {isConnected ? 'Live Supabase' : `Active (${orders.length} Tracked)`}
              </span>
            </h2>
            <p className="text-sm text-gray-500">{activeCount} active orders · updates in real time</p>
          </div>
        </div>
        {recentUpdate && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-xl animate-pulse">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Order {recentUpdate} updated
          </div>
        )}
      </div>

      {error && orders.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          ⚠️ {error} — connecting to orders service...
        </div>
      )}

      {/* Filters */}
      {!compact && (
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search orders, customers, devices..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
            <option value="all">All Status</option>
            <option value="created">Created</option>
            <option value="assigned">Assigned</option>
            <option value="accepted">Accepted</option>
            <option value="pickup_scheduled">Pickup Scheduled</option>
            <option value="picked_up">Picked Up</option>
            <option value="inspection">Inspection</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm font-semibold text-gray-500">No orders found</p>
          </div>
        ) : (
          filtered.map(order => (
            <div key={order.id}
              className={`bg-white rounded-2xl border shadow-sm p-4 hover:shadow-md transition-all cursor-pointer ${
                recentUpdate === order.order_number ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-100'
              }`}
              onClick={() => setSelectedOrder(order)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-gray-500">{order.order_number}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg capitalize ${getTypeColor(order.order_type as any)}`}>
                    {order.order_type}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${getOrderStatusColor(order.status as OrderStatus)}`}>
                    {getOrderStatusLabel(order.status as OrderStatus)}
                  </span>
                  {recentUpdate === order.order_number && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg animate-pulse">
                      ● Just Updated
                    </span>
                  )}
                </div>
                <p className="text-sm font-black text-gray-900 flex-shrink-0">
                  ₹{(order.final_price || order.quoted_price || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">{order.device_name}</p>
                  <p className="text-xs text-gray-500">{order.customer_name} · {order.city}</p>
                </div>
                {order.partner_name && (
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-700">{order.partner_name}</p>
                    {order.delivery_agent_name && (
                      <p className="text-xs text-gray-400">🚴 {order.delivery_agent_name}</p>
                    )}
                  </div>
                )}
              </div>

              {!compact && (
                <OrderProgressBar status={order.status} orderType={order.order_type} />
              )}
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900">{selectedOrder.order_number}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg capitalize ${getTypeColor(selectedOrder.order_type as any)}`}>
                    {selectedOrder.order_type}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${getOrderStatusColor(selectedOrder.status as OrderStatus)}`}>
                    {getOrderStatusLabel(selectedOrder.status as OrderStatus)}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            {/* Progress */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-xs font-bold text-gray-500 mb-2">Order Progress</p>
              <OrderProgressBar status={selectedOrder.status} orderType={selectedOrder.order_type} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-500 mb-1">Customer</p>
                <p className="text-sm font-bold text-gray-900">{selectedOrder.customer_name}</p>
                <p className="text-xs text-gray-500">{selectedOrder.customer_phone}</p>
                {selectedOrder.city && <p className="text-xs text-gray-400">{selectedOrder.city} · {selectedOrder.pin_code}</p>}
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-500 mb-1">Device</p>
                <p className="text-sm font-bold text-gray-900">{selectedOrder.device_name}</p>
                {selectedOrder.pickup_date && <p className="text-xs text-gray-500">📅 {selectedOrder.pickup_date}</p>}
                {selectedOrder.pickup_slot && <p className="text-xs text-gray-400">🕐 {selectedOrder.pickup_slot}</p>}
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-3 mb-4">
              <p className="text-xs font-bold text-gray-500 mb-2">Pricing</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Quoted Price</span>
                <span className="font-bold text-gray-900">₹{(selectedOrder.quoted_price || 0).toLocaleString('en-IN')}</span>
              </div>
              {selectedOrder.final_price > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Final Price</span>
                  <span className="font-bold text-green-700">₹{selectedOrder.final_price.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {selectedOrder.partner_name && (
              <div className="bg-purple-50 rounded-xl p-3 mb-4">
                <p className="text-xs font-bold text-gray-500 mb-1">Assignment</p>
                <p className="text-sm font-bold text-gray-900">Partner: {selectedOrder.partner_name}</p>
                {selectedOrder.delivery_agent_name && (
                  <p className="text-xs text-gray-500">Delivery: {selectedOrder.delivery_agent_name}</p>
                )}
              </div>
            )}

            {selectedOrder.inspection_score && (
              <div className="bg-blue-50 rounded-xl p-3 mb-4">
                <p className="text-xs font-bold text-gray-500 mb-1">Inspection Score</p>
                <p className="text-2xl font-black text-blue-700">{selectedOrder.inspection_score}/100</p>
              </div>
            )}

            {selectedOrder.notes && (
              <div className="bg-yellow-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-500 mb-1">Notes</p>
                <p className="text-xs text-gray-700">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
