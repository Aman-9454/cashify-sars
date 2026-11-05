'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PartnerLayout from './components/PartnerLayout';
import PartnerDashboard from './components/PartnerDashboard';
import PartnerOrders from './components/PartnerOrders';
import PartnerInspection from './components/PartnerInspection';
import PartnerPayouts from './components/PartnerPayouts';
import SupportTicketsPanel from '@/components/SupportTicketsPanel';
import PartnerProfile from './components/PartnerProfile';
import PartnerCustomers from './components/PartnerCustomers';
import PartnerReports from './components/PartnerReports';
import PartnerSettings from './components/PartnerSettings';
import PartnerRiders from './components/PartnerRiders';
import { Clock, ShieldAlert, RefreshCw, LogOut, ArrowRight, BellRing, CheckCircle, MapPin, Calendar, Camera, X } from 'lucide-react';
import { partners, Partner } from '@/lib/casmikData';

export type PartnerSection = 'dashboard' | 'orders' | 'inspection' | 'payouts' | 'customers' | 'reports' | 'riders' | 'settings' | 'support' | 'profile';

export default function PartnerPage() {
  const [activeSection, setActiveSection] = useState<PartnerSection>('dashboard');
  const [session, setSession] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [inspectingOrderId, setInspectingOrderId] = useState<string | null>(null);

  // New Order Request Pop-up State
  const [newAssignedOrder, setNewAssignedOrder] = useState<any | null>(null);
  const [isAcceptingOrder, setIsAcceptingOrder] = useState(false);
  const [acknowledgedOrderIds, setAcknowledgedOrderIds] = useState<Set<string>>(new Set());

  const handleStartInspection = (orderId: string) => {
    setInspectingOrderId(orderId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('casmik_active_inspection_id', orderId);
    }
    setActiveSection('inspection');
  };

  const checkAuth = async () => {
    if (typeof window === 'undefined') return;
    try {
      const storedSession = localStorage.getItem('casmik_partner_session');
      if (!storedSession) {
        // In local development, if no session exists, check if there's any active partner in API
        try {
          const res = await fetch('/api/partners');
          const data = await res.json();
          if (data.success && Array.isArray(data.partners) && data.partners.length > 0) {
            const firstActive = data.partners.find((p: Partner) => p.status === 'active') || data.partners[0];
            localStorage.setItem('casmik_partner_session', JSON.stringify(firstActive));
            setSession(firstActive);
            setLoading(false);
            return;
          }
        } catch {}
        setSession(null);
        setLoading(false);
        return;
      }
      const currentPartner: Partner = JSON.parse(storedSession);

      // Verify with real backend API in MongoDB
      try {
        const res = await fetch(`/api/partners?id=${currentPartner.id || currentPartner.email}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.partners) && data.partners.length > 0) {
            const liveMatch = data.partners[0];
            localStorage.setItem('casmik_partner_session', JSON.stringify(liveMatch));
            setSession(liveMatch);
            setLoading(false);
            return;
          }
        }
      } catch {}

      // Fallback check against localStorage partners
      const savedPartners = localStorage.getItem('casmik_partners_v1');
      if (savedPartners) {
        const list: Partner[] = JSON.parse(savedPartners);
        const match = list.find(p => p.id === currentPartner.id || p.email === currentPartner.email);
        if (match) {
          localStorage.setItem('casmik_partner_session', JSON.stringify(match));
          setSession(match);
          setLoading(false);
          return;
        }
      }

      setSession(currentPartner);
    } catch {
      setSession(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    const handlePartnerUpdate = () => checkAuth();
    window.addEventListener('casmik_partners_updated', handlePartnerUpdate);
    return () => {
      window.removeEventListener('casmik_partners_updated', handlePartnerUpdate);
    };
  }, []);

  // Real-time SSE stream for newly assigned orders for this partner (no repetitive polling)
  useEffect(() => {
    if (!session?.id) return;

    const checkAssignedOrders = async () => {
      try {
        const res = await fetch(`/api/orders?partnerId=${session.id}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          const pending = data.orders.find(
            (o: any) =>
              (o.status === 'assigned' || o.status === 'created') &&
              (o.partnerId === session.id || o.assignedPartnerId === session.id) &&
              !acknowledgedOrderIds.has(o.id)
          );
          if (pending && (!newAssignedOrder || newAssignedOrder.id !== pending.id)) {
            setNewAssignedOrder(pending);
          }
        }
      } catch (err) {
        // silent
      }
    };

    checkAssignedOrders();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/partners/events?partnerId=${session.id}`);
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'new_order_assigned' && parsed.order) {
            const order = parsed.order;
            if (!acknowledgedOrderIds.has(order.id)) {
              setNewAssignedOrder(order);
            }
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('casmik_partner_orders_updated'));
            }
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // ignore
    }

    window.addEventListener('casmik_orders_updated', checkAssignedOrders);
    window.addEventListener('casmik_partner_orders_updated', checkAssignedOrders);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      window.removeEventListener('casmik_orders_updated', checkAssignedOrders);
      window.removeEventListener('casmik_partner_orders_updated', checkAssignedOrders);
    };
  }, [session?.id, acknowledgedOrderIds, newAssignedOrder]);

  const handleAcceptOrder = async () => {
    if (!newAssignedOrder) return;
    setIsAcceptingOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newAssignedOrder.id,
          status: 'accepted',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAcknowledgedOrderIds(prev => new Set(prev).add(newAssignedOrder.id));
        setNewAssignedOrder(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('casmik_orders_updated'));
          window.dispatchEvent(new Event('casmik_partner_orders_updated'));
        }
        setActiveSection('orders');
      }
    } catch (e) {
      console.warn('Accept order error:', e);
    } finally {
      setIsAcceptingOrder(false);
    }
  };

  const handleDeclineOrder = () => {
    if (!newAssignedOrder) return;
    setAcknowledgedOrderIds(prev => new Set(prev).add(newAssignedOrder.id));
    setNewAssignedOrder(null);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('casmik_partner_session');
      window.location.href = '/partner/login';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">Checking partner authorization...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect immediately to partner login
  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/partner/login';
    }
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-800 space-y-4">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto text-blue-400 border border-blue-500/20">
            <ShieldAlert size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-white">Partner Portal Security</h2>
            <p className="text-slate-400 text-xs">
              Verifying verified partner authorization...
            </p>
          </div>
          <p className="text-[11px] text-slate-500">Redirecting to Partner Login...</p>
        </div>
      </div>
    );
  }

  // Pending Admin Approval screen
  if (session.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-primary/5 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center border border-amber-100">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 text-amber-600 animate-pulse">
            <Clock size={40} />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-3">
            Pending Super Admin Approval
          </span>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Application Under Review</h2>
          <p className="text-gray-500 text-sm mb-6">
            Hello <strong>{session.name}</strong>, your partner application for <strong>{session.storeName}</strong> has been submitted. Camsik Super Admin is currently verifying your details and store documents.
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 text-left mb-6 space-y-2.5 text-xs text-gray-600">
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-400">Partner ID:</span>
              <span className="font-bold text-gray-900">{session.id}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-400">Registered Email:</span>
              <span className="font-semibold text-gray-800">{session.email}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-400">Registered Phone:</span>
              <span className="font-semibold text-gray-800">{session.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">City / State:</span>
              <span className="font-semibold text-gray-800">{session.city}, {session.state}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={checkAuth}
              className="flex-1 py-3 bg-primary text-white rounded-2xl font-bold text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Refresh Status
            </button>
            <button
              onClick={handleLogout}
              className="py-3 px-5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <PartnerDashboard onNavigate={setActiveSection} partner={session} />;
      case 'orders': return <PartnerOrders onStartInspection={handleStartInspection} partner={session} />;
      case 'inspection': return <PartnerInspection initialOrderId={inspectingOrderId} onBackToOrders={() => setActiveSection('orders')} partner={session} />;
      case 'payouts': return <PartnerPayouts partner={session} />;
      case 'customers': return <PartnerCustomers onNavigate={setActiveSection} partner={session} />;
      case 'reports': return <PartnerReports partner={session} />;
      case 'riders': return <PartnerRiders partner={session} />;
      case 'settings': return <PartnerSettings partner={session} onUpdateSession={setSession} />;
      case 'support': return <SupportTicketsPanel panelType="partner" userName={session?.name || "Partner"} />;
      case 'profile': return <PartnerProfile partner={session} onUpdateSession={setSession} />;
      default: return <PartnerDashboard onNavigate={setActiveSection} partner={session} />;
    }
  };

  return (
    <PartnerLayout activeSection={activeSection} onSectionChange={setActiveSection} currentPartner={session}>
      {renderSection()}

      {/* New Order Request Pop-up Modal */}
      {newAssignedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-7 z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                  <BellRing size={22} className="animate-bounce" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg uppercase tracking-wider inline-block">
                    ⚡ New Order Assigned
                  </span>
                  <h3 className="text-lg font-black text-gray-900 mt-0.5">
                    Order #{newAssignedOrder.orderNumber}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDeclineOrder}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Device Info Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-3 flex items-center gap-3.5">
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-primary flex-shrink-0 shadow-sm">
                <Camera size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-black text-slate-900 truncate">
                  {newAssignedOrder.deviceName}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {newAssignedOrder.deviceBrand || 'Camera'} · {(newAssignedOrder.type || 'SELL').toUpperCase()}
                </p>
              </div>
            </div>

            {/* Valuation Offer Box */}
            <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200/70 mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-800">Quoted Valuation Offer</p>
                <p className="text-[11px] text-emerald-600">Buyback price payable to customer</p>
              </div>
              <p className="text-xl font-black text-emerald-700">
                ₹{(newAssignedOrder.finalPrice || newAssignedOrder.quotedPrice || 0).toLocaleString('en-IN')}
              </p>
            </div>

            {/* Order Details List */}
            <div className="space-y-2 text-xs text-gray-600 mb-6 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Customer:</span>
                <span className="font-bold text-gray-900">{newAssignedOrder.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Customer Phone:</span>
                <span className="font-mono font-bold text-gray-900">{newAssignedOrder.customerPhone || newAssignedOrder.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Pickup Location:</span>
                <span className="font-medium text-gray-900 text-right truncate max-w-[220px]">
                  {newAssignedOrder.city} (PIN: {newAssignedOrder.pinCode})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Scheduled Slot:</span>
                <span className="font-medium text-gray-900">
                  {newAssignedOrder.pickupDate} · {newAssignedOrder.pickupSlot}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeclineOrder}
                disabled={isAcceptingOrder}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Decline / Later
              </button>
              <button
                type="button"
                onClick={handleAcceptOrder}
                disabled={isAcceptingOrder}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 cursor-pointer transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isAcceptingOrder ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={16} /> Accept Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PartnerLayout>
  );
}

