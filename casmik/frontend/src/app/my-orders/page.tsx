'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  Truck,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  LogIn,
  Receipt,
  User,
  Phone,
  Tag,
} from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';
import { getCurrentUser, getCustomerOrders, CustomerUser, CustomerOrderRecord } from '@/lib/auth';

export default function MyOrdersPage() {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [orders, setOrders] = useState<CustomerOrderRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'exchange' | 'buy' | 'sell' | 'rent'>('all');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<CustomerOrderRecord | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    const initialOrders = getCustomerOrders(currentUser?.phone, currentUser?.email);
    setOrders(initialOrders);

    // Also fetch from /api/orders in background to ensure any server-side orders are pulled
    const syncRemoteOrders = async (u: CustomerUser | null) => {
      if (!u) return;
      try {
        const query = u.phone || u.email;
        if (!query) return;
        const res = await fetch(`/api/orders?search=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            // merge into local casmik_orders_v1 so getCustomerOrders picks it up
            const raw = localStorage.getItem('casmik_orders_v1');
            const localOrders: any[] = raw ? JSON.parse(raw) : [];
            const mergedMap = new Map();
            localOrders.forEach(o => mergedMap.set(o.orderNumber || o.id, o));
            data.orders.forEach((o: any) => mergedMap.set(o.orderNumber || o.id, o));
            localStorage.setItem('casmik_orders_v1', JSON.stringify(Array.from(mergedMap.values())));
            setOrders(getCustomerOrders(u.phone, u.email));
          }
        }
      } catch (e) {
        console.warn('Silent orders sync note:', e);
      }
    };

    syncRemoteOrders(currentUser);

    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<CustomerUser | null>;
      const newUser = customEvent.detail;
      setUser(newUser);
      setOrders(getCustomerOrders(newUser?.phone, newUser?.email));
      syncRemoteOrders(newUser);
    };

    const handleOrdersChange = () => {
      const u = getCurrentUser();
      setOrders(getCustomerOrders(u?.phone, u?.email));
    };

    window.addEventListener('casmik_auth_change', handleAuthChange);
    window.addEventListener('casmik_orders_updated', handleOrdersChange);
    window.addEventListener('casmik_partner_orders_updated', handleOrdersChange);
    window.addEventListener('storage', handleOrdersChange);
    return () => {
      window.removeEventListener('casmik_auth_change', handleAuthChange);
      window.removeEventListener('casmik_orders_updated', handleOrdersChange);
      window.removeEventListener('casmik_partner_orders_updated', handleOrdersChange);
      window.removeEventListener('storage', handleOrdersChange);
    };
  }, []);

  const handleSearchByPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneSearch.trim().length >= 10) {
      setOrders(getCustomerOrders(phoneSearch.trim()));
    }
  };

  const filteredOrders = orders
    .filter((o) => {
      if (activeTab === 'all') return true;
      return o.type === activeTab;
    })
    .sort((a, b) => {
      const timeA = Math.max(new Date(a.createdAt || 0).getTime(), new Date((a as any).updatedAt || 0).getTime());
      const timeB = Math.max(new Date(b.createdAt || 0).getTime(), new Date((b as any).updatedAt || 0).getTime());
      return timeB - timeA;
    });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pickup_scheduled':
      case 'handover_scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_inspection':
      case 'under_inspection':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <CustomerHeader />

        {/* Page Banner */}
        <section className="bg-white border-b border-slate-200/80 py-8 sm:py-10">
          <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black mb-3 border border-emerald-200">
                  <Package size={13} className="text-emerald-600" />
                  <span>CUSTOMER DASHBOARD</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  My Orders &amp; Exchanges
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Track your trade-in handovers, refurbished purchases, and live doorstep deliveries.
                </p>
              </div>

              {/* User Profile Card or Login CTA */}
              <div className="flex items-center gap-3">
                {user ? (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">{user.name}</p>
                      <p className="text-[11px] font-semibold text-slate-500">+91 {user.phone}</p>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <LogIn size={14} />
                    <span>Sign In for Saved Orders</span>
                  </Link>
                )}

                <Link
                  href="/exchange-device"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-sm shadow-emerald-600/20"
                >
                  <RefreshCw size={13} />
                  <span>New Exchange</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
          {/* Filter Tabs & Phone Quick-Lookup */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { key: 'all', label: 'All Orders', count: orders.length },
                { key: 'rent', label: 'Camera Rentals', count: orders.filter((o) => o.type === 'rent').length },
                { key: 'exchange', label: 'Exchanges', count: orders.filter((o) => o.type === 'exchange').length },
                { key: 'buy', label: 'Refurbished Buys', count: orders.filter((o) => o.type === 'buy').length },
                { key: 'sell', label: 'Sell Buyback', count: orders.filter((o) => o.type === 'sell').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                      activeTab === tab.key ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick search by mobile */}
            <form onSubmit={handleSearchByPhone} className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="Lookup by Phone..."
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-44"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Find
              </button>
            </form>
          </div>

          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isExchange = order.type === 'exchange';
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Order Top Bar */}
                    <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900">
                          Order #{order.orderNumber}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {order.balanceOwedToUser && order.balanceOwedToUser > 0 ? (
                          <>
                            <div className="text-right">
                              <span className="text-[10px] text-emerald-700 font-bold block">Balance to Receive</span>
                              <span className="text-base font-black text-emerald-600">
                                +₹{order.balanceOwedToUser.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Payout on Handover
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-slate-500 font-medium">Net Amount:</span>
                            <span className="text-base font-black text-slate-900">
                              ₹{order.netPayable.toLocaleString('en-IN')}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {order.paymentStatus === 'paid' ? 'Paid Online' : 'Pay on Delivery'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="p-5 sm:p-6">
                      {isExchange ? (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                          {/* Left: Old Device Handover */}
                          <div className="md:col-span-5 p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 flex items-center gap-3.5">
                            <div className="w-16 h-16 rounded-xl bg-white border border-amber-200/60 p-1 flex items-center justify-center shrink-0">
                              <img
                                src={order.oldDevice?.image || '/assets/images/categories/dslr.png'}
                                alt={order.oldDevice?.model || 'Old Gear'}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                Old Gear Handover
                              </span>
                              <p className="text-sm font-black text-slate-900 truncate mt-1">
                                {order.oldDevice?.brand} {order.oldDevice?.model}
                              </p>
                              <p className="text-xs text-slate-500 font-medium">
                                Valuation: ₹{order.oldDevice?.valuation.toLocaleString('en-IN')}
                                {order.oldDevice?.exchangeBonus ? (
                                  <span className="text-emerald-700 font-bold ml-1">
                                    + ₹{order.oldDevice.exchangeBonus.toLocaleString('en-IN')} Bonus
                                  </span>
                                ) : null}
                              </p>
                            </div>
                          </div>

                          {/* Middle: Exchange Arrow */}
                          <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
                            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
                              <RefreshCw size={16} />
                            </div>
                            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider mt-1">
                              Doorstep Swap
                            </span>
                          </div>

                          {/* Right: New Upgrade Device */}
                          <div className="md:col-span-5 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/60 flex items-center gap-3.5">
                            <div className="w-16 h-16 rounded-xl bg-white border border-emerald-200/60 p-1 flex items-center justify-center shrink-0">
                              <img
                                src={order.newDevice?.image || '/assets/images/refurbished/iphone-15-pro.png'}
                                alt={order.newDevice?.model || 'Upgrade Device'}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Upgrade Delivered
                              </span>
                              <p className="text-sm font-black text-slate-900 truncate mt-1">
                                {order.newDevice?.brand} {order.newDevice?.model}
                              </p>
                              <p className="text-xs text-slate-600 font-medium">
                                {order.newDevice?.storage} · {order.newDevice?.color} ·{' '}
                                <span className="font-bold text-emerald-700">{order.newDevice?.condition}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Buy or Sell Single Item */
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={order.newDevice?.image || order.oldDevice?.image || '/assets/images/categories/dslr.png'}
                              alt="Device"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {order.newDevice ? `${order.newDevice.brand} ${order.newDevice.model}` : `${order.oldDevice?.brand} ${order.oldDevice?.model}`}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {order.newDevice ? `${order.newDevice.storage} · ${order.newDevice.color}` : 'Direct Doorstep Buyback'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Delivery & Schedule Info Bar */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-4 text-slate-600 flex-wrap">
                          {order.pickupDate && (
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                              <Clock size={13} className="text-emerald-600" />
                              Scheduled: {order.pickupDate} ({order.pickupSlot || '10 AM - 1 PM'})
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <MapPin size={13} className="text-slate-400" />
                            {order.customerAddress}, {order.city} - {order.pincode}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptOrder(order)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            <Receipt size={13} />
                            <span>View Breakdown</span>
                          </button>

                          <Link
                            href={`/track-order?phone=${order.customerPhone}`}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-xs"
                          >
                            <Truck size={13} />
                            <span>Track Live</span>
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200/60">
                <ShoppingBag size={28} />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-1">No Orders Found</h2>
              <p className="text-sm text-slate-500 mb-6">
                You haven&apos;t placed any exchange or purchase orders with this mobile number yet.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/exchange-device"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-sm shadow-emerald-600/20"
                >
                  Start an Exchange &rarr;
                </Link>
                <Link
                  href="/buy-refurbished"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                >
                  Browse Refurbished Store
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Breakdown Receipt Modal */}
        {selectedReceiptOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Receipt size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Exchange Price Breakdown</h3>
                  <p className="text-xs text-slate-500 font-semibold">Order #{selectedReceiptOrder.orderNumber}</p>
                </div>
              </div>

              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Upgrade Gear Model:</span>
                  <span className="font-bold text-slate-900">{selectedReceiptOrder.newDevice?.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Upgrade Price:</span>
                  <span className="font-bold text-slate-900">₹{selectedReceiptOrder.upgradePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Your Old Gear Trade-In:</span>
                  <span className="font-bold">- ₹{selectedReceiptOrder.tradeInCredit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Guaranteed Camsik Bonus:</span>
                  <span className="font-bold">- ₹{selectedReceiptOrder.exchangeBonus.toLocaleString('en-IN')}</span>
                </div>
                {selectedReceiptOrder.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon ({selectedReceiptOrder.couponCode}):</span>
                    <span className="font-bold">- ₹{selectedReceiptOrder.couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-slate-200 text-sm font-black text-slate-900">
                  <span>Net Amount to Pay on Handover:</span>
                  <span className="text-emerald-600 text-base">
                    ₹{selectedReceiptOrder.netPayable.toLocaleString('en-IN')}
                  </span>
                </div>

                {selectedReceiptOrder.balanceOwedToUser && selectedReceiptOrder.balanceOwedToUser > 0 && (
                  <div className="pt-2 border-t border-slate-200 text-xs">
                    <div className="flex justify-between font-black text-emerald-700 text-sm">
                      <span>Balance to be Paid to You:</span>
                      <span>+ ₹{selectedReceiptOrder.balanceOwedToUser.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      *Remaining balance will be paid to you via UPI / Bank account immediately after receiving &amp; testing your old device.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-[11px] text-blue-800 font-medium">
                Simultaneous doorstep handover: Hand over your old gear to our certified technician and receive your upgrade device right on the spot.
              </div>

              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="w-full mt-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </div>

      <CustomerFooter />
    </main>
  );
}
