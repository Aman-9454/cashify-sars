'use client';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { orders as defaultOrders, getOrderStatusLabel, getOrderStatusColor, getTypeColor } from '@/lib/casmikData';
import type { OrderStatus, Order } from '@/lib/casmikData';
import { Package, CheckCircle, Clock, Truck, Search, Wrench, CreditCard, MapPin, Phone, X, Wifi, WifiOff, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';

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
  created_at?: string;
}

const STATUS_STEPS = [
  { key: 'created', label: 'Order Created', icon: Package, desc: 'Your order has been placed' },
  { key: 'assigned', label: 'Partner Assigned', icon: CheckCircle, desc: 'A partner has been assigned' },
  { key: 'accepted', label: 'Partner Accepted', icon: CheckCircle, desc: 'Partner confirmed your order' },
  { key: 'pickup_scheduled', label: 'Pickup Scheduled', icon: Clock, desc: 'Pickup agent is on the way' },
  { key: 'picked_up', label: 'Device Picked Up', icon: Truck, desc: 'Your device has been collected' },
  { key: 'inspection', label: 'Under Inspection', icon: Search, desc: 'Device is being inspected' },
  { key: 'inspection_completed', label: 'Inspection Done', icon: CheckCircle, desc: 'Inspection completed' },
  { key: 'payment_processing', label: 'Payment Processing', icon: CreditCard, desc: 'Payment is being processed' },
  { key: 'paid', label: 'Payment Done', icon: CheckCircle, desc: 'Payment sent to your account' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, desc: 'Order successfully completed' },
];

const REPAIR_STEPS = [
  { key: 'created', label: 'Order Created', icon: Package, desc: 'Your repair order is placed' },
  { key: 'assigned', label: 'Partner Assigned', icon: CheckCircle, desc: 'Repair partner assigned' },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle, desc: 'Partner confirmed your repair' },
  { key: 'pickup_scheduled', label: 'Pickup Scheduled', icon: Clock, desc: 'Pickup agent is on the way' },
  { key: 'picked_up', label: 'Device Picked Up', icon: Truck, desc: 'Device collected for repair' },
  { key: 'inspection', label: 'Under Repair', icon: Wrench, desc: 'Your device is being repaired' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, desc: 'Repair done, device returned' },
];

function orderObjToLiveOrder(o: any): LiveOrder {
  return {
    id: o.id || o.orderNumber || `ord-${Date.now()}`,
    order_number: o.orderNumber || o.order_number || o.id || 'CSM-2024',
    order_type: o.type || o.order_type || 'sell',
    status: o.status || 'created',
    customer_name: o.customerName || o.customer_name || 'Customer',
    customer_phone: o.customerPhone || o.customer_phone || o.phone || '',
    device_name: o.deviceName || o.device_name || o.device || 'Camera / Tech Device',
    quoted_price: Number(o.quotedPrice ?? o.quoted_price ?? o.price ?? 0),
    final_price: Number(o.finalPrice ?? o.final_price ?? o.quotedPrice ?? o.price ?? 0),
    partner_name: o.partnerName || o.partner_name || null,
    delivery_agent_name: o.deliveryAgentName || o.delivery_agent_name || null,
    pickup_date: o.pickupDate || o.pickup_date || null,
    pickup_slot: o.pickupSlot || o.pickup_slot || null,
    city: o.city || null,
    pin_code: o.pinCode || o.pin_code || o.pincode || null,
    payment_status: o.paymentStatus || o.payment_status || 'pending',
    inspection_score: o.inspectionScore ?? o.inspection_score ?? null,
    notes: o.notes || null,
    updated_at: o.updatedAt || o.updated_at || new Date().toISOString(),
    created_at: o.createdAt || o.created_at || new Date().toISOString(),
  };
}

function OrderTrackerContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeQuery, setActiveQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<LiveOrder | null>(null);
  const [recentUpdate, setRecentUpdate] = useState<string | null>(null);

  const supabase = createClient();

  const fetchOrders = useCallback(async (queryRaw: string, isSilent = false) => {
    const q = queryRaw.trim();
    if (!q) return;
    if (!isSilent) setLoading(true);
    setHasSearched(true);
    setActiveQuery(q);

    const cleanDigits = q.replace(/\D/g, '');
    const isPhoneNumber = cleanDigits.length >= 10;
    const orderMap = new Map<string, LiveOrder>();

    // 1. Check local storage orders first (instant reactive response)
    if (typeof window !== 'undefined') {
      try {
        const localKeys = ['casmik_orders_v1', 'casmik_partner_orders_v1', 'camsik_customer_orders'];
        localKeys.forEach((key) => {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              list.forEach((item: any) => {
                const num = (item.orderNumber || item.order_number || item.id || '').toLowerCase();
                const phone = (item.customerPhone || item.customer_phone || item.phone || '').replace(/\D/g, '');
                const qLower = q.toLowerCase();

                if (
                  num === qLower ||
                  num.includes(qLower) ||
                  (isPhoneNumber && phone.includes(cleanDigits.slice(-10)))
                ) {
                  const mapped = orderObjToLiveOrder(item);
                  orderMap.set(mapped.order_number, mapped);
                }
              });
            }
          }
        });
      } catch (err) {
        console.warn('Local storage tracker check warning:', err);
      }
    }

    // 2. Fetch from backend /api/orders (covers MongoDB & in-memory cache)
    try {
      const apiParam = isPhoneNumber ? `phone=${encodeURIComponent(cleanDigits.slice(-10))}` : `search=${encodeURIComponent(q)}`;
      const res = await fetch(`/api/orders?${apiParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          data.orders.forEach((o: any) => {
            const mapped = orderObjToLiveOrder(o);
            orderMap.set(mapped.order_number, mapped);
          });
        }
      }
      if (!isPhoneNumber) {
        const resId = await fetch(`/api/orders?orderId=${encodeURIComponent(q)}`);
        if (resId.ok) {
          const dataId = await resId.json();
          if (dataId.success && Array.isArray(dataId.orders)) {
            dataId.orders.forEach((o: any) => {
              const mapped = orderObjToLiveOrder(o);
              orderMap.set(mapped.order_number, mapped);
            });
          }
        }
      }
    } catch (err) {
      console.warn('API orders query warning:', err);
    }

    // 3. Fetch from remote Supabase orders table
    try {
      let sbQuery = supabase.from('orders').select('*');
      if (isPhoneNumber) {
        sbQuery = sbQuery.or(`customer_phone.ilike.%${cleanDigits.slice(-10)}%,order_number.ilike.%${q}%`);
      } else {
        sbQuery = sbQuery.or(`order_number.ilike.%${q}%,id.eq.${q}`);
      }
      const { data, error } = await sbQuery.order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        data.forEach((row: any) => {
          const mapped = orderObjToLiveOrder(row);
          orderMap.set(mapped.order_number, mapped);
        });
      }
    } catch (err: any) {
      console.warn('Supabase orders query note:', err.message);
    }

    // 4. Fallback search against default dummy orders
    defaultOrders.forEach((o: Order) => {
      const num = o.orderNumber.toLowerCase();
      const phone = (o.customerPhone || '').replace(/\D/g, '');
      const qLower = q.toLowerCase();

      if (num === qLower || num.includes(qLower) || (isPhoneNumber && phone.includes(cleanDigits.slice(-10)))) {
        if (!orderMap.has(o.orderNumber)) {
          orderMap.set(o.orderNumber, orderObjToLiveOrder(o));
        }
      }
    });

    const results = Array.from(orderMap.values()).sort((a, b) => {
      const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
      const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
      return timeB - timeA;
    });

    setOrders(results);
    if (!isSilent) setLoading(false);
  }, [supabase]);

  // Read URL query params on mount (e.g. ?orderId=CSM-2024-156 or ?phone=9876543210)
  useEffect(() => {
    const orderParam = searchParams.get('orderId') || searchParams.get('orderNumber') || searchParams.get('q');
    const phoneParam = searchParams.get('phone');
    const initialQuery = (orderParam || phoneParam || '').trim();

    if (initialQuery) {
      setSearchInput(initialQuery);
      fetchOrders(initialQuery, false);
    }
  }, [searchParams, fetchOrders]);

  // Real-time synchronization
  useEffect(() => {
    if (!activeQuery) return;

    const handleLocalSync = () => {
      fetchOrders(activeQuery, true);
    };

    window.addEventListener('casmik_orders_updated', handleLocalSync);
    window.addEventListener('casmik_partner_orders_updated', handleLocalSync);
    window.addEventListener('storage', handleLocalSync);

    // Supabase Realtime channel
    const channel = supabase
      .channel(`live-tracking-${activeQuery.replace(/[^a-zA-Z0-9]/g, '')}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const orderNum = (payload.new && 'order_number' in payload.new ? (payload.new as any).order_number : null);
        if (orderNum) {
          setRecentUpdate(orderNum);
          setTimeout(() => setRecentUpdate(null), 4000);
        }

        if (payload.eventType === 'UPDATE' && payload.new) {
          const updated = orderObjToLiveOrder(payload.new);
          setOrders(prev => prev.map(o => o.order_number === updated.order_number ? updated : o));
          setSelectedOrder(prev => prev?.order_number === updated.order_number ? updated : prev);
        } else if (payload.eventType === 'INSERT' && payload.new) {
          const inserted = orderObjToLiveOrder(payload.new);
          setOrders(prev => [inserted, ...prev]);
        }
      })
      .subscribe(status => setIsConnected(status === 'SUBSCRIBED'));

    // 5-second polling to ensure updates from riders or partners appear live without UI flash
    const interval = setInterval(() => {
      fetchOrders(activeQuery, true);
    }, 5000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      window.removeEventListener('casmik_orders_updated', handleLocalSync);
      window.removeEventListener('casmik_partner_orders_updated', handleLocalSync);
      window.removeEventListener('storage', handleLocalSync);
    };
  }, [activeQuery, fetchOrders, supabase]);

  const handleSearch = () => {
    const q = searchInput.trim();
    if (q.length >= 3) {
      fetchOrders(q);
    }
  };

  const getSteps = (orderType: string) => orderType === 'repair' ? REPAIR_STEPS : STATUS_STEPS;
  const getStepIndex = (steps: typeof STATUS_STEPS, status: string) => steps.findIndex(s => s.key === status);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Package size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">Track Your Order</h1>
        <p className="text-gray-500 text-sm">
          Enter your Order ID (e.g. <span className="font-mono font-bold text-gray-700">CSM-2024-156</span>) or mobile number to see live status
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-6">
        <div className="flex gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Order ID (e.g. CSM-2024-156) or Mobile Number"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw size={15} className="animate-spin" /> : 'Track'}
          </button>
        </div>

        {activeQuery && (
          <div className="flex items-center justify-between mt-3 text-xs pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {isConnected ? <Wifi size={10} /> : <CheckCircle size={10} />}
                {isConnected ? 'Real-Time Live Updates' : 'Auto-Sync Active'}
              </span>
              <span className="text-gray-500">Tracking: <strong className="font-mono text-gray-800">{activeQuery}</strong></span>
            </div>
            <button
              onClick={() => fetchOrders(activeQuery)}
              className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-[11px] font-semibold"
            >
              <RefreshCw size={11} /> Refresh
            </button>
          </div>
        )}
      </div>

      {/* Recent Update Banner */}
      {recentUpdate && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2 text-sm text-green-800 font-semibold animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
          Order #{recentUpdate} status just updated in real time!
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-bold text-gray-700 text-sm">Searching order tracking records...</p>
        </div>
      ) : hasSearched ? (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 sm:p-12 text-center shadow-sm">
              <p className="text-4xl mb-3">📭</p>
              <h3 className="font-bold text-gray-800 text-lg mb-1">No orders found for &ldquo;{activeQuery}&rdquo;</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-5 leading-relaxed">
                Please verify your Order Number (e.g. <span className="font-mono font-bold text-primary">CSM-2024-156</span>) or the 10-digit mobile number used during booking.
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/sell-device-get-quote"
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary/90"
                >
                  Sell Device
                </Link>
                <Link
                  href="/my-orders"
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
                >
                  View My Orders
                </Link>
              </div>
            </div>
          ) : (
            orders.map(order => {
              const steps = getSteps(order.order_type);
              const currentIdx = getStepIndex(steps, order.status);
              const isTerminal = ['completed', 'cancelled', 'rejected'].includes(order.status);

              return (
                <div
                  key={order.id || order.order_number}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all cursor-pointer hover:shadow-md ${
                    recentUpdate === order.order_number ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="p-5 sm:p-6">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-5 flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            #{order.order_number}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg capitalize ${getTypeColor(order.order_type as any)}`}>
                            {order.order_type}
                          </span>
                          {recentUpdate === order.order_number && (
                            <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md animate-pulse">
                              ● Live Update
                            </span>
                          )}
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 mt-1">{order.device_name}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {order.city ? `${order.city} · ` : ''}{order.pickup_date || 'Scheduled Pickup'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-black text-gray-900">
                          ₹{(order.final_price || order.quoted_price || 0).toLocaleString('en-IN')}
                        </p>
                        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg mt-1 ${getOrderStatusColor(order.status as OrderStatus)}`}>
                          {getOrderStatusLabel(order.status as OrderStatus)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Steps Timeline */}
                    <div className="space-y-2.5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 mb-4">
                      {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isDone = idx < currentIdx || (isTerminal && order.status === 'completed');
                        const isCurrent = idx === currentIdx;
                        return (
                          <div
                            key={step.key}
                            className={`flex items-center gap-3 py-1.5 px-3 rounded-xl transition-all ${
                              isCurrent
                                ? 'bg-white border border-primary/30 shadow-xs'
                                : isDone
                                ? 'opacity-85'
                                : 'opacity-40'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isDone
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : isCurrent
                                ? 'bg-primary text-white ring-2 ring-primary/30'
                                : 'bg-gray-200 text-gray-400'
                            }`}>
                              <Icon size={13} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold ${isCurrent ? 'text-primary' : isDone ? 'text-emerald-800' : 'text-gray-500'}`}>
                                {step.label}
                              </p>
                              {isCurrent && <p className="text-[11px] text-gray-500">{step.desc}</p>}
                            </div>
                            {isCurrent && <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Partner & Delivery Agent Card */}
                    {(order.partner_name || order.delivery_agent_name) && (
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs flex-wrap gap-2">
                        {order.partner_name && (
                          <div className="flex items-center gap-1.5 text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                            <MapPin size={13} className="text-primary flex-shrink-0" />
                            <span>Partner: <strong>{order.partner_name}</strong></span>
                          </div>
                        )}
                        {order.delivery_agent_name && (
                          <div className="flex items-center gap-1.5 text-gray-700 bg-blue-50/60 px-2.5 py-1 rounded-lg border border-blue-100">
                            <Truck size={13} className="text-blue-600 flex-shrink-0" />
                            <span>Rider: <strong>{order.delivery_agent_name}</strong></span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <p className="text-5xl mb-4">📦</p>
          <h3 className="font-bold text-gray-700 text-base mb-1">Enter your Order ID or mobile number above</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Live doorstep inspection, diagnostic verification, and instant payout statuses update automatically.
          </p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Order Details</span>
                <h3 className="text-lg font-black text-gray-900 font-mono">#{selectedOrder.order_number}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg capitalize ${getTypeColor(selectedOrder.order_type as any)}`}>
                  {selectedOrder.order_type}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${getOrderStatusColor(selectedOrder.status as OrderStatus)}`}>
                  {getOrderStatusLabel(selectedOrder.status as OrderStatus)}
                </span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Device Details</p>
                <p className="font-bold text-gray-900 text-sm">{selectedOrder.device_name}</p>
                {selectedOrder.customer_name && (
                  <p className="text-xs text-gray-500 mt-1">Customer: {selectedOrder.customer_name}</p>
                )}
              </div>

              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Pricing & Payout</p>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">Quoted Valuation</span>
                  <span className="font-bold text-gray-900">₹{(selectedOrder.quoted_price || 0).toLocaleString('en-IN')}</span>
                </div>
                {selectedOrder.final_price > 0 && (
                  <div className="flex justify-between text-sm pt-1 border-t border-emerald-200/50 mt-1">
                    <span className="font-bold text-emerald-800">Final Payout</span>
                    <span className="font-black text-emerald-700 text-base">₹{selectedOrder.final_price.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {selectedOrder.pickup_date && (
                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-blue-700 uppercase mb-1">Scheduled Doorstep Pickup</p>
                  <p className="text-sm font-bold text-gray-900">📅 {selectedOrder.pickup_date}</p>
                  {selectedOrder.pickup_slot && <p className="text-xs text-gray-600 mt-0.5">🕐 Slot: {selectedOrder.pickup_slot}</p>}
                </div>
              )}

              {selectedOrder.inspection_score && (
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-purple-700 uppercase mb-1">Diagnostic Inspection Score</p>
                  <p className="text-2xl font-black text-purple-800">{selectedOrder.inspection_score} / 100</p>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-gray-600">
                  <strong className="block font-semibold text-gray-700 mb-0.5">Order Notes:</strong>
                  {selectedOrder.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerOrderTrackerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50/30 flex flex-col justify-between">
      <CustomerHeader />
      <div className="flex-1 py-10 px-4">
        <Suspense fallback={
          <div className="max-w-2xl mx-auto py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">Loading Order Tracker...</p>
          </div>
        }>
          <OrderTrackerContent />
        </Suspense>
      </div>
      <CustomerFooter />
    </main>
  );
}
