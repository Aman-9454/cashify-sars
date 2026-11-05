'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getOrderStatusColor, getOrderStatusLabel, getTypeColor } from '@/lib/casmikData';
import type { Order, OrderStatus, DeliveryAgent, Partner } from '@/lib/casmikData';
import { Search, CheckCircle, XCircle, Eye, Phone, MapPin, X, Truck, Wifi, WifiOff, ChevronDown, SlidersHorizontal, ClipboardCheck, Sparkles, Lock, CreditCard, ArrowRight, ShieldAlert, CheckCircle2, ShieldCheck, Calendar, Clock, MessageSquare, PhoneCall } from 'lucide-react';
import LiveOrderTracker from '@/components/LiveOrderTracker';
import { triggerNotification, playNotificationBeep } from '@/lib/notifications';
import { checkPartnerBalance, deductPartnerBalance } from '@/lib/partnerWallet';
import OrderChatModal from '@/components/OrderChatModal';
import OrderCallModal from '@/components/OrderCallModal';

const STATUS_PROGRESSION: Record<string, number> = {
  assigned: 1,
  new: 1,
  created: 1,
  accepted: 2,
  pickup_scheduled: 3,
  picked_up: 4,
  in_transit: 5,
  inspection: 6,
  completed: 7,
  cancelled: 99,
};

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'assigned', label: 'New / Assigned' },
  { value: 'accepted', label: 'Order Accepted' },
  { value: 'pickup_scheduled', label: 'Pickup Scheduled' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'inspection', label: 'Under Inspection' },
  { value: 'completed', label: 'Order Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getAllowedForwardStatuses = (currentStatus: OrderStatus) => {
  if (currentStatus === 'completed') {
    return [{ value: 'completed' as OrderStatus, label: 'Order Completed' }];
  }
  const currentRank = STATUS_PROGRESSION[currentStatus] || 1;
  return STATUS_OPTIONS.filter(opt => {
    const optRank = STATUS_PROGRESSION[opt.value] || 1;
    if (opt.value === 'cancelled') return currentRank < 7;
    return optRank >= currentRank;
  });
};

const getActivePartnerId = (fallbackPartner?: Partner | null): string => {
  if (fallbackPartner?.id) return fallbackPartner.id;
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_partner_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) return parsed.id;
      }
    } catch {}
  }
  return '';
};

const getStoredPartnerOrders = (activeId?: string): Order[] => {
  const currentId = activeId || getActivePartnerId();
  if (typeof window !== 'undefined') {
    try {
      const savedPartner = localStorage.getItem('casmik_partner_orders_v1');
      const savedGlobal = localStorage.getItem('casmik_orders_v1');

      const partnerList: Order[] = savedPartner ? JSON.parse(savedPartner) : [];
      const globalList: Order[] = savedGlobal ? JSON.parse(savedGlobal) : [];

      const orderMap = new Map<string, Order>();
      [...globalList, ...partnerList].forEach((o: Order) => {
        if (o && o.id) {
          if (!currentId || o.partnerId === currentId || o.assignedPartnerId === currentId) {
            orderMap.set(o.id, o);
          }
        }
      });

      if (orderMap.size > 0) {
        return Array.from(orderMap.values()).sort((a, b) => {
          const timeA = Math.max(new Date(a.createdAt || 0).getTime(), new Date(a.updatedAt || 0).getTime());
          const timeB = Math.max(new Date(b.createdAt || 0).getTime(), new Date(b.updatedAt || 0).getTime());
          return timeB - timeA;
        });
      }
    } catch (e) {}
  }
  return [];
};

const getAvailableDeliveryAgents = (activeId?: string): DeliveryAgent[] => {
  const currentId = activeId || getActivePartnerId();
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_delivery_agents_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly filter only riders that belong to THIS partner.
          // Admin fleet riders and other partners' riders are NEVER visible to this partner!
          return parsed.filter((a: DeliveryAgent) => !currentId || a.partnerId === currentId);
        }
      }
    } catch {}
  }
  return [];
};

interface DBOrder {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  pin_code: string;
  city: string;
  device_name: string;
  device_brand: string;
  device_model: string;
  device_storage: string;
  device_color: string;
  quoted_price: number;
  final_price: number;
  partner_id: string | null;
  partner_name: string | null;
  delivery_agent_id: string | null;
  delivery_agent_name: string | null;
  pickup_date: string | null;
  pickup_slot: string | null;
  payment_status: string;
  inspection_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function dbToOrder(o: DBOrder): Order {
  return {
    id: o.id, orderNumber: o.order_number, type: o.order_type as Order['type'],
    status: o.status as OrderStatus, customerId: '', customerName: o.customer_name,
    customerPhone: o.customer_phone, customerEmail: o.customer_email || '',
    customerAddress: o.customer_address || '', pinCode: o.pin_code || '', city: o.city || '',
    deviceName: o.device_name, deviceBrand: o.device_brand || '', deviceModel: o.device_model || '',
    deviceStorage: o.device_storage || '', deviceColor: o.device_color || '',
    quotedPrice: o.quoted_price || 0, finalPrice: o.final_price || 0,
    partnerId: o.partner_id, partnerName: o.partner_name,
    deliveryAgentId: o.delivery_agent_id, deliveryAgentName: o.delivery_agent_name,
    deliveryAgentPhone: (o as any).delivery_agent_phone || null,
    deviceCollected: (o as any).device_collected || false,
    collectedAt: (o as any).collected_at || null,
    deviceImei: (o as any).device_imei || null,
    inspectionNotes: (o as any).inspection_notes || null,
    pickupDate: o.pickup_date || '', pickupSlot: o.pickup_slot || '',
    createdAt: o.created_at, updatedAt: o.updated_at,
    paymentStatus: o.payment_status as Order['paymentStatus'],
    inspectionScore: o.inspection_score, notes: o.notes || '',
  };
}

interface PartnerOrdersProps {
  onStartInspection?: (orderId: string) => void;
  partner?: Partner | null;
}

export default function PartnerOrders({ onStartInspection, partner }: PartnerOrdersProps) {
  const currentPartnerId = partner?.id || getActivePartnerId();
  const [orderList, setOrderList] = useState<Order[]>(() => getStoredPartnerOrders(currentPartnerId));
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'live'>('list');
  const [statusToast, setStatusToast] = useState<{ message: string; actionLabel?: string; onAction?: () => void } | null>(null);

  // Delivery Person Assignment Modal State
  const [assignDeliveryModal, setAssignDeliveryModal] = useState<Order | null>(null);
  const [selectedDeliveryAgentId, setSelectedDeliveryAgentId] = useState('');
  const [deliveryPickupDate, setDeliveryPickupDate] = useState('');
  const [deliveryPickupSlot, setDeliveryPickupSlot] = useState('');
  const [partnerRidersList, setPartnerRidersList] = useState<DeliveryAgent[]>(() => getAvailableDeliveryAgents(currentPartnerId));

  // Live Chat & Direct Calling Modals
  const [chatModalOrder, setChatModalOrder] = useState<Order | null>(null);
  const [callModalTarget, setCallModalTarget] = useState<{ name: string; phone: string; role: string; orderNumber?: string } | null>(null);

  // Payout Disbursal Modal State
  const [payoutOrder, setPayoutOrder] = useState<Order | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'imps' | 'cash'>('upi');
  const [payoutRef, setPayoutRef] = useState('');
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [insufficientBalanceWarning, setInsufficientBalanceWarning] = useState<{
    required: number;
    available: number;
    shortfall: number;
  } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    const fetchFreshOrders = async () => {
      try {
        const currentId = partner?.id || getActivePartnerId();
        // 1. Fetch live orders from MongoDB
        const res = await fetch(`/api/orders?partnerId=${currentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders) && isMounted) {
            const matched = data.orders.filter((o: Order) => 
              !currentId || o.partnerId === currentId || o.assignedPartnerId === currentId
            );
            const sorted = matched.sort((a: Order, b: Order) => {
              const timeA = Math.max(new Date(a.createdAt || 0).getTime(), new Date(a.updatedAt || 0).getTime());
              const timeB = Math.max(new Date(b.createdAt || 0).getTime(), new Date(b.updatedAt || 0).getTime());
              return timeB - timeA;
            });
            setOrderList(sorted);
            setSelectedOrder(prev => prev ? (sorted.find((o: Order) => o.id === prev.id) || prev) : (sorted[0] || null));
          }
        }

        // 2. Fetch live riders for this partner
        try {
          const agentsRes = await fetch(`/api/delivery-agents?partnerId=${currentId}`);
          if (agentsRes.ok) {
            const agentsData = await agentsRes.json();
            if (agentsData.success && Array.isArray(agentsData.agents) && isMounted) {
              setPartnerRidersList(agentsData.agents);
            }
          }
        } catch {}
      } catch (err) {
        console.warn('Orders fetch error:', err);
      }
    };

    fetchFreshOrders();

    const handleSync = () => {
      fetchFreshOrders();
    };

    window.addEventListener('casmik_partner_orders_updated', handleSync);
    window.addEventListener('casmik_orders_updated', handleSync);
    window.addEventListener('casmik_delivery_agents_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener('casmik_partner_orders_updated', handleSync);
      window.removeEventListener('casmik_orders_updated', handleSync);
      window.removeEventListener('casmik_delivery_agents_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [partner?.id]);

  // Partner self-handling (in-store inspection / walk-in / self-pickup)
  const handlePartnerSelfFulfill = async (orderId: string) => {
    const target = orderList.find(o => o.id === orderId);
    if (!target) return;
    const updatedOrder: Order = {
      ...target,
      deliveryAgentId: null,
      deliveryAgentName: null,
      deliveryAgentPhone: null,
      status: (target.status === 'created' || target.status === 'assigned' ? 'accepted' : target.status) as OrderStatus,
      notes: `${target.notes ? target.notes + ' · ' : ''}Store Direct Handling: Partner inspecting & fulfilling directly.`,
      updatedAt: new Date().toISOString(),
    };

    const updated = orderList.map(o => o.id === orderId ? updatedOrder : o);
    setOrderList(updated);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(updatedOrder);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('casmik_partner_orders_v1', JSON.stringify(updated));
      try {
        const rawGlobal = localStorage.getItem('casmik_orders_v1');
        if (rawGlobal) {
          const gList: Order[] = JSON.parse(rawGlobal);
          localStorage.setItem('casmik_orders_v1', JSON.stringify(gList.map(o => o.id === orderId ? updatedOrder : o)));
        }
      } catch {}
      window.dispatchEvent(new Event('casmik_orders_updated'));
      window.dispatchEvent(new Event('casmik_partner_orders_updated'));
    }

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          deliveryAgentId: null,
          deliveryAgentName: null,
          deliveryAgentPhone: null,
          status: updatedOrder.status,
          notes: updatedOrder.notes,
        }),
      });
    } catch {}

    triggerNotification({
      type: 'status_update',
      targetRole: 'all',
      title: `Order #${target.orderNumber} Handled Directly by Store`,
      shortDetails: `Partner store "${target.partnerName || 'Pixel Pro Tech Hub'}" is handling inspection and payout directly in-store.`,
      orderNumber: target.orderNumber,
      deviceName: target.deviceName,
      customerName: target.customerName,
      price: target.quotedPrice,
      status: updatedOrder.status,
    });
  };

  const handleAssignDeliveryAgent = async () => {
    if (!assignDeliveryModal || !selectedDeliveryAgentId) return;
    const allAgents = partnerRidersList.length > 0 ? partnerRidersList : getAvailableDeliveryAgents(currentPartnerId);
    const agent = allAgents.find(a => a.id === selectedDeliveryAgentId);
    if (!agent) return;

    const pickupDate = deliveryPickupDate || assignDeliveryModal.pickupDate || 'Today';
    const pickupSlot = deliveryPickupSlot || assignDeliveryModal.pickupSlot || '10:00 AM - 1:00 PM';

    const updatedOrder: Order = {
      ...assignDeliveryModal,
      partnerId: currentPartnerId || assignDeliveryModal.partnerId,
      partnerName: partner?.storeName || partner?.name || assignDeliveryModal.partnerName || 'Store Partner',
      partnerPhone: partner?.phone || assignDeliveryModal.partnerPhone || '',
      deliveryAgentId: agent.id,
      deliveryAgentName: agent.name,
      deliveryAgentPhone: agent.phone,
      status: 'pickup_scheduled' as OrderStatus,
      pickupDate,
      pickupSlot,
      updatedAt: new Date().toISOString(),
    };

    setOrderList(prev => {
      const updated = prev.map(o => o.id === assignDeliveryModal.id ? updatedOrder : o);
      if (typeof window !== 'undefined') {
        localStorage.setItem('casmik_partner_orders_v1', JSON.stringify(updated));
      }
      return updated;
    });

    if (selectedOrder?.id === assignDeliveryModal.id) {
      setSelectedOrder(updatedOrder);
    }

    if (typeof window !== 'undefined') {
      try {
        const savedGlobal = localStorage.getItem('casmik_orders_v1');
        if (savedGlobal) {
          const list = JSON.parse(savedGlobal);
          if (Array.isArray(list)) {
            const updated = list.map((o: any) => o.id === assignDeliveryModal.id ? updatedOrder : o);
            localStorage.setItem('casmik_orders_v1', JSON.stringify(updated));
          }
        }
      } catch {}
      window.dispatchEvent(new Event('casmik_orders_updated'));
      window.dispatchEvent(new Event('casmik_partner_orders_updated'));
    }

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: assignDeliveryModal.id,
          partnerId: currentPartnerId || assignDeliveryModal.partnerId,
          partnerName: partner?.storeName || partner?.name || assignDeliveryModal.partnerName || 'Store Partner',
          partnerPhone: partner?.phone || assignDeliveryModal.partnerPhone || '',
          deliveryAgentId: agent.id,
          deliveryAgentName: agent.name,
          deliveryAgentPhone: agent.phone,
          status: 'pickup_scheduled',
          pickupDate,
          pickupSlot,
        }),
      });
    } catch {}

    try {
      await supabase
        .from('orders')
        .update({
          partner_id: currentPartnerId,
          delivery_agent_id: agent.id,
          delivery_agent_name: agent.name,
          status: 'pickup_scheduled',
          pickup_date: pickupDate,
          pickup_slot: pickupSlot,
        })
        .eq('id', assignDeliveryModal.id);
    } catch {}

    triggerNotification({
      type: 'status_update',
      targetRole: 'all',
      title: `Order #${assignDeliveryModal.orderNumber} Assigned to Delivery Rider`,
      shortDetails: `Partner assigned Order #${assignDeliveryModal.orderNumber} (${assignDeliveryModal.deviceName}) to executive "${agent.name}" (${agent.phone}) for doorstep pickup.`,
      orderNumber: assignDeliveryModal.orderNumber,
      deviceName: assignDeliveryModal.deviceName,
      customerName: assignDeliveryModal.customerName,
      price: assignDeliveryModal.quotedPrice,
      status: 'pickup_scheduled',
    });

    setStatusToast({
      message: `🚚 Order #${assignDeliveryModal.orderNumber} assigned to ${agent.name}. Diagnostics & status now managed by the rider!`,
    });
    setTimeout(() => setStatusToast(null), 4000);

    setAssignDeliveryModal(null);
    setSelectedDeliveryAgentId('');
  };

  const fetchOrders = useCallback(async () => {
    const currentId = getActivePartnerId();
    const orderMap = new Map<string, Order>();

    // 1. Populate stored partner orders so newly placed / assigned orders are NEVER lost
    const localOrders = getStoredPartnerOrders(currentId);
    localOrders.forEach(o => orderMap.set(o.id, o));

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('partner_id', currentId)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        data.map(dbToOrder).forEach(o => orderMap.set(o.id, o));
        setIsConnected(true);
      }
    } catch (err: any) {
      console.log('Partner orders remote notice:', err.message);
    } finally {
      setLoading(false);
    }

    const merged = Array.from(orderMap.values()).sort((a, b) => {
      const timeA = Math.max(new Date(a.createdAt || 0).getTime(), new Date(a.updatedAt || 0).getTime());
      const timeB = Math.max(new Date(b.createdAt || 0).getTime(), new Date(b.updatedAt || 0).getTime());
      return timeB - timeA;
    });
    setOrderList(merged);
  }, [supabase]);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('partner-orders-realtime')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'orders',
        filter: currentPartnerId ? `partner_id=eq.${currentPartnerId}` : undefined
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrderList(prev => [dbToOrder(payload.new as DBOrder), ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setOrderList(prev => prev.map(o => o.id === (payload.new as DBOrder).id ? dbToOrder(payload.new as DBOrder) : o));
          setSelectedOrder(prev => prev?.id === (payload.new as DBOrder).id ? dbToOrder(payload.new as DBOrder) : prev);
        } else if (payload.eventType === 'DELETE') {
          setOrderList(prev => prev.filter(o => o.id !== (payload.old as any).id));
        }
      })
      .subscribe(status => setIsConnected(status === 'SUBSCRIBED'));

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  // Master status change handler: enforces forward-only progression and completed lock
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const currentOrder = orderList.find(o => o.id === orderId);
    if (!currentOrder) return;

    // Strict lock: once completed, cannot change anything!
    if (currentOrder.status === 'completed') {
      setStatusToast({
        message: `⚠️ This order is completed & locked. No further changes can be made.`,
      });
      setTimeout(() => setStatusToast(null), 4000);
      return;
    }

    // Strict restriction: If order has been shared / assigned to a delivery person,
    // partner CANNOT change status! Status progression & diagnostics are managed by the delivery executive.
    if (currentOrder.deliveryAgentId) {
      setStatusToast({
        message: `⚠️ This order is assigned to delivery rider (${currentOrder.deliveryAgentName || 'Rider'}). Partner cannot change status — only the field executive can update order status.`,
      });
      setTimeout(() => setStatusToast(null), 4500);
      return;
    }

    // Forward-only rule: cannot go back to an earlier step
    const currentRank = STATUS_PROGRESSION[currentOrder.status] || 1;
    const newRank = STATUS_PROGRESSION[newStatus] || 1;

    if (newStatus !== 'cancelled' && newRank < currentRank) {
      setStatusToast({
        message: `⚠️ Order progress is forward-only. You cannot move back to a previous status.`,
      });
      setTimeout(() => setStatusToast(null), 4000);
      return;
    }

    const nowIso = new Date().toISOString();
    const updatedOrder: Order = { ...currentOrder, status: newStatus, updatedAt: nowIso };

    // 1. Immediately update orderList in state, keeping latest orders at the top
    setOrderList(prev => {
      const updated = prev.map(o => o.id === orderId ? updatedOrder : o).sort((a, b) => {
        const timeA = Math.max(new Date(a.createdAt || 0).getTime(), new Date(a.updatedAt || 0).getTime());
        const timeB = Math.max(new Date(b.createdAt || 0).getTime(), new Date(b.updatedAt || 0).getTime());
        return timeB - timeA;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('casmik_partner_orders_v1', JSON.stringify(updated));
      }
      return updated;
    });

    // 2. Update selectedOrder if it's currently open in modal
    setSelectedOrder(prev => prev && prev.id === orderId ? updatedOrder : prev);

    // 3. Update global orders in localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedGlobal = localStorage.getItem('casmik_orders_v1');
        if (savedGlobal) {
          const list = JSON.parse(savedGlobal);
          if (Array.isArray(list)) {
            const updated = list.map((o: any) => o.id === orderId ? updatedOrder : o);
            localStorage.setItem('casmik_orders_v1', JSON.stringify(updated));
          }
        }
      } catch {}
      window.dispatchEvent(new Event('casmik_orders_updated'));
      window.dispatchEvent(new Event('casmik_partner_orders_updated'));
    }

    // 4. Show success toast notification with optional immediate action
    const label = getOrderStatusLabel(newStatus);
    if (newStatus === 'accepted') {
      setStatusToast({
        message: `Order marked as Accepted! Ready for device inspection.`,
        actionLabel: 'Start Inspection →',
        onAction: () => {
          handleStatusChange(orderId, 'inspection');
          onStartInspection?.(orderId);
        }
      });
    } else {
      setStatusToast({
        message: `Order status advanced to "${label}"`,
      });
    }
    setTimeout(() => setStatusToast(null), 4500);

    // 4.1. Trigger real-time notification with sound chime across Admin, Partner, and User
    triggerNotification({
      type: 'status_update',
      targetRole: 'all',
      title: `Order #${currentOrder.orderNumber} Status Updated`,
      shortDetails: `Status advanced to "${label}" for ${currentOrder.deviceName} (${currentOrder.customerName || 'Customer'})`,
      orderNumber: currentOrder.orderNumber,
      deviceName: currentOrder.deviceName,
      customerName: currentOrder.customerName,
      price: currentOrder.finalPrice || currentOrder.quotedPrice,
      status: newStatus,
    });

    // 5. Try remote supabase update
    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    } catch (err: any) {
      console.log('Remote status update note:', err.message);
    }
  };

  // Complete Payout & Lock Order permanently with Partner Wallet Deduction
  const handleDisbursePayout = async () => {
    if (!payoutOrder) return;
    const amount = payoutOrder.finalPrice > 0 ? payoutOrder.finalPrice : payoutOrder.quotedPrice;

    // Strict Partner Wallet Balance Check
    const partnerCheck = checkPartnerBalance(payoutOrder.partnerId, amount);
    if (!partnerCheck.hasSufficientBalance) {
      setPayoutOrder(null);
      setInsufficientBalanceWarning({
        required: amount,
        available: partnerCheck.availableBalance,
        shortfall: partnerCheck.shortfall,
      });
      return;
    }

    setIsProcessingPayout(true);

    // Deduct from assigned partner wallet
    const deductRes = deductPartnerBalance(payoutOrder.partnerId, amount, payoutOrder.orderNumber, payoutOrder.customerName);
    if (!deductRes.success) {
      setIsProcessingPayout(false);
      setPayoutOrder(null);
      setInsufficientBalanceWarning({
        required: amount,
        available: deductRes.newBalance,
        shortfall: amount - deductRes.newBalance,
      });
      return;
    }

    const updatedOrder: Order = {
      ...payoutOrder,
      status: 'completed',
      paymentStatus: 'paid',
      finalPrice: amount,
      notes: `${payoutOrder.notes || ''} [Payout of ₹${amount.toLocaleString('en-IN')} disbursed via ${payoutMethod.toUpperCase()}${payoutRef ? ` Ref: ${payoutRef}` : ''}]`.trim(),
      updatedAt: new Date().toISOString(),
    };

    setOrderList(prev => {
      const updated = prev.map(o => o.id === payoutOrder.id ? updatedOrder : o);
      if (typeof window !== 'undefined') {
        localStorage.setItem('casmik_partner_orders_v1', JSON.stringify(updated));
      }
      return updated;
    });

    if (selectedOrder?.id === payoutOrder.id) {
      setSelectedOrder(updatedOrder);
    }

    if (typeof window !== 'undefined') {
      try {
        const savedGlobal = localStorage.getItem('casmik_orders_v1');
        if (savedGlobal) {
          const list = JSON.parse(savedGlobal);
          if (Array.isArray(list)) {
            const updated = list.map((o: any) => o.id === payoutOrder.id ? updatedOrder : o);
            localStorage.setItem('casmik_orders_v1', JSON.stringify(updated));
          }
        }
      } catch {}
    }

    try {
      await supabase.from('orders').update({
        status: 'completed',
        payment_status: 'paid',
        final_price: amount,
        notes: updatedOrder.notes,
        updated_at: updatedOrder.updatedAt,
      }).eq('id', payoutOrder.id);
    } catch (err: any) {
      console.log('Remote payout update note:', err.message);
    }

    setIsProcessingPayout(false);
    const targetOrderNumber = payoutOrder.orderNumber;
    setPayoutOrder(null);
    setStatusToast({
      message: `🎉 Payout of ₹${amount.toLocaleString('en-IN')} complete! Order ${targetOrderNumber} moved to Completed and permanently locked.`,
    });
    setTimeout(() => setStatusToast(null), 5000);

    // Trigger payout notification with chime sound
    triggerNotification({
      type: 'payout',
      targetRole: 'all',
      title: `💳 Payout Disbursed: ₹${amount.toLocaleString('en-IN')}`,
      shortDetails: `Spot payout of ₹${amount.toLocaleString('en-IN')} successfully completed for #${targetOrderNumber} (${payoutOrder.deviceName}) via ${payoutMethod.toUpperCase()}. Order is now Completed & Locked.`,
      orderNumber: targetOrderNumber,
      deviceName: payoutOrder.deviceName,
      customerName: payoutOrder.customerName,
      price: amount,
      status: 'completed',
    });
  };

  const handleAccept = (id: string) => handleStatusChange(id, 'accepted');
  const handleReject = (id: string) => handleStatusChange(id, 'rejected');
  const handlePickup = (id: string) => handleStatusChange(id, 'picked_up');
  const handlePartnerStartInspection = (id: string) => {
    const target = orderList.find(o => o.id === id);
    if (target?.deliveryAgentId) {
      setStatusToast({
        message: `⚠️ Order #${target.orderNumber} is assigned to delivery rider (${target.deliveryAgentName}). Only field executive can conduct doorstep diagnostics.`,
      });
      setTimeout(() => setStatusToast(null), 4500);
      return;
    }
    handleStatusChange(id, 'inspection');
    onStartInspection?.(id);
  };

  const filtered = orderList
    .filter(o => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.deviceName.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (filterStatus === 'all') return true;
      if (filterStatus === 'assigned') {
        return ['assigned', 'new', 'created', 'pending'].includes(o.status);
      }
      if (filterStatus === 'picked_up') {
        return ['picked_up', 'in_transit'].includes(o.status);
      }
      if (filterStatus === 'inspection') {
        return ['inspection', 'inspection_completed'].includes(o.status);
      }
      if (filterStatus === 'completed') {
        return ['completed', 'paid'].includes(o.status);
      }
      return o.status === filterStatus;
    })
    .sort((a, b) => {
      const timeA = Math.max(new Date(a.createdAt || 0).getTime(), new Date(a.updatedAt || 0).getTime());
      const timeB = Math.max(new Date(b.createdAt || 0).getTime(), new Date(b.updatedAt || 0).getTime());
      return timeB - timeA;
    });

  const tabs = [
    { id: 'all', label: 'All', count: orderList.length },
    { id: 'assigned', label: 'New', count: orderList.filter(o => ['assigned', 'new', 'created', 'pending'].includes(o.status)).length },
    { id: 'accepted', label: 'Accepted', count: orderList.filter(o => o.status === 'accepted').length },
    { id: 'picked_up', label: 'Picked Up', count: orderList.filter(o => ['picked_up', 'in_transit'].includes(o.status)).length },
    { id: 'inspection', label: 'Inspection', count: orderList.filter(o => ['inspection', 'inspection_completed'].includes(o.status)).length },
    { id: 'completed', label: 'Completed', count: orderList.filter(o => ['completed', 'paid'].includes(o.status)).length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {statusToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-gray-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
          <span>{statusToast.message}</span>
          {statusToast.actionLabel && statusToast.onAction && (
            <button
              onClick={statusToast.onAction}
              className="ml-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1 flex-shrink-0"
            >
              <ClipboardCheck size={12} /> {statusToast.actionLabel}
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            Order Management
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle size={11} className="text-emerald-600" />
              {isConnected ? 'Live Synced' : `Active Store Orders (${orderList.length})`}
            </span>
          </h2>
          <p className="text-sm text-gray-500">Manage your assigned orders and update order statuses</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        {[{ id: 'list', label: '📋 My Orders' }, { id: 'live', label: '🔴 Live Tracker' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary/40'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'live' ? (
        <LiveOrderTracker panel="partner" partnerId={currentPartnerId} title="Partner Live Order Tracker" />
      ) : (
        <>
          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setFilterStatus(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${filterStatus === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary/40'}`}>
                {tab.label}
                {tab.count > 0 && <span className={`px-1.5 py-0.5 rounded-full text-xs font-black ${filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{tab.count}</span>}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search orders..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
          </div>

          <div className="space-y-3">
            {filtered.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-black text-gray-500 group-hover:text-primary transition-colors">{order.orderNumber}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg capitalize ${getTypeColor(order.type)}`}>{order.type}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${getOrderStatusColor(order.status)}`}>{getOrderStatusLabel(order.status)}</span>
                      {order.deliveryAgentName && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <Truck size={10} className="text-blue-600" /> Rider: {order.deliveryAgentName}
                        </span>
                      )}
                      {order.deviceCollected && (
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-emerald-700" /> Collected ({order.inspectionScore || 100}%)
                        </span>
                      )}
                      {order.inspectionScore !== null && order.inspectionScore !== undefined && !order.deviceCollected && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                          Score: {order.inspectionScore}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{order.deviceName}</p>
                  </div>

                  {/* Pricing: Show Updated Inspection Price if available */}
                  {order.finalPrice > 0 ? (
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300 inline-block mb-0.5">
                        Inspected Payout
                      </span>
                      <p className="text-xl font-black text-emerald-600">
                        ₹{order.finalPrice.toLocaleString('en-IN')}
                      </p>
                      {order.finalPrice !== order.quotedPrice ? (
                        <p className="text-[11px] text-gray-400 line-through">
                          Quote: ₹{order.quotedPrice.toLocaleString('en-IN')}
                        </p>
                      ) : (
                        <p className="text-[11px] text-emerald-700 font-semibold">100% Valuation</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Quoted Price</span>
                      <p className="text-lg font-black text-gray-900">₹{order.quotedPrice.toLocaleString('en-IN')}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {order.customerName ? order.customerName[0] : 'C'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{order.customerName}</p>
                      <p className="text-gray-400">{order.customerPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 text-gray-600">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0 text-primary" />
                    <div>
                      <p className="font-semibold text-gray-800">{order.city}</p>
                      <p className="text-gray-400">PIN: {order.pinCode}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3 bg-gray-50/70 px-3 py-1.5 rounded-xl">
                  <span>📅 Pickup: <strong>{order.pickupDate || 'Flexible'}</strong></span>
                  <span>🕐 {order.pickupSlot || '10:00 AM - 1:00 PM'}</span>
                </div>

                {/* Card Actions Bar: Accept, Details, Call, Assign Rider, Disburse Payout, and Forward-Only Status Dropdown */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-primary hover:text-white hover:border-primary transition-colors cursor-pointer"
                  >
                    <Eye size={13} /> Details
                  </button>

                  <a
                    href={`tel:${order.customerPhone}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors cursor-pointer"
                  >
                    <Phone size={13} /> Call
                  </a>

                  {/* Assign / Change Delivery Executive - ONLY for active non-completed orders! */}
                  {order.status !== 'completed' && order.status !== 'paid' && order.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAssignDeliveryModal(order);
                        setSelectedDeliveryAgentId(order.deliveryAgentId || '');
                        setDeliveryPickupDate(order.pickupDate || '');
                        setDeliveryPickupSlot(order.pickupSlot || '');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                        order.deliveryAgentId
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-600 hover:text-white'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-600 hover:text-white'
                      }`}
                      title={order.deliveryAgentId ? `Reassign Rider (${order.deliveryAgentName})` : 'Dispatch delivery executive for pickup'}
                    >
                      <Truck size={13} /> {order.deliveryAgentId ? 'Change Rider' : 'Assign Rider'}
                    </button>
                  )}

                  {/* Terminal Completed State */}
                  {order.status === 'completed' || order.status === 'paid' ? (
                    <>
                      {order.deliveryAgentName && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-bold rounded-xl border border-gray-200">
                          <Truck size={13} className="text-gray-500" />
                          <span>Fulfilled by: {order.deliveryAgentName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 ml-auto px-3.5 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-black rounded-xl border border-emerald-200 shadow-sm">
                        <Lock size={12} className="text-emerald-600" />
                        <span>Completed &amp; Locked</span>
                      </div>
                    </>
                  ) : order.deliveryAgentId ? (
                    /* Active order assigned to delivery rider */
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 text-xs font-bold rounded-xl border border-blue-200">
                        <Truck size={13} className="text-blue-600" />
                        <span>Rider: {order.deliveryAgentName || 'Assigned'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setChatModalOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Chat with assigned delivery executive"
                      >
                        <MessageSquare size={13} /> Chat Rider
                      </button>
                      {order.deliveryAgentPhone && (
                        <button
                          type="button"
                          onClick={() =>
                            setCallModalTarget({
                              name: order.deliveryAgentName || 'Delivery Rider',
                              phone: order.deliveryAgentPhone!,
                              role: 'Delivery Executive',
                              orderNumber: order.orderNumber,
                            })
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          title="Direct phone call to delivery rider"
                        >
                          <Phone size={13} /> Call Rider
                        </button>
                      )}
                      <div className="flex items-center gap-1.5 ml-auto px-3 py-1.5 bg-blue-50 text-blue-800 text-xs font-bold rounded-xl border border-blue-200" title="Diagnostics & status progression managed by the delivery executive.">
                        <Lock size={12} className="text-blue-600" />
                        <span>Managed by Rider</span>
                      </div>
                    </div>
                  ) : (
                    /* Non-allocated active orders: Partner can complete his own order directly! */
                    order.status !== 'accepted' && order.status !== 'picked_up' && order.status !== 'inspection' ? (
                      <button
                        type="button"
                        onClick={() => handleAccept(order.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors shadow-sm shadow-green-600/20 cursor-pointer"
                      >
                        <CheckCircle size={13} /> Accept Order
                      </button>
                    ) : order.status === 'accepted' ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handlePartnerStartInspection(order.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 cursor-pointer"
                        >
                          <ClipboardCheck size={13} /> Start Inspection
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePickup(order.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <Truck size={13} /> Start Pickup
                        </button>
                      </div>
                    ) : order.status === 'inspection' ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {order.finalPrice > 0 ? (
                          <button
                            type="button"
                            onClick={() => setPayoutOrder(order)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
                          >
                            <CreditCard size={13} /> Disburse Payout (₹{order.finalPrice.toLocaleString('en-IN')})
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handlePartnerStartInspection(order.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors shadow-sm shadow-amber-500/20 cursor-pointer"
                        >
                          <ClipboardCheck size={13} /> {order.finalPrice > 0 ? 'Review Inspection' : 'Continue Inspection'}
                        </button>
                      </div>
                    ) : order.status === 'picked_up' ? (
                      <button
                        type="button"
                        onClick={() => handlePartnerStartInspection(order.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 cursor-pointer"
                      >
                        <ClipboardCheck size={13} /> Start Inspection
                      </button>
                    ) : null
                  )}
                  ) : (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="text-[11px] font-bold text-gray-500 hidden sm:inline">Advance:</span>
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl pl-2.5 pr-7 py-2 text-gray-800 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none shadow-sm transition-all"
                        >
                          {getAllowedForwardStatuses(order.status).map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  )
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-sm font-semibold">No orders found</p>
              </div>
            )}
          </div>
        </>
      )}

      {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
              <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto border border-gray-100">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-bold text-gray-400">Order Details</span>
                    <h3 className="text-lg font-black text-gray-900">{selectedOrder.orderNumber}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg capitalize ${getTypeColor(selectedOrder.type)}`}>
                      {selectedOrder.type}
                    </span>
                    <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Order Status</p>
                      <p className="font-bold text-sm text-gray-900 mt-0.5">{getOrderStatusLabel(selectedOrder.status)}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-xl ${getOrderStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* CHANGE ORDER STATUS SECTION OR PERMANENT LOCKED BANNER */}
                  {selectedOrder.deliveryAgentId ? (
                    <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck size={16} className="text-blue-600" />
                          <h4 className="text-sm font-black text-blue-950">Managed by Delivery Executive</h4>
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${getOrderStatusColor(selectedOrder.status)}`}>
                          {getOrderStatusLabel(selectedOrder.status)}
                        </span>
                      </div>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        This order is allocated to <strong>{selectedOrder.deliveryAgentName || 'Delivery Rider'}</strong> ({selectedOrder.deliveryAgentPhone || 'Field Rider'}).
                        Diagnostics, inspection scoring, spot payment, and status progression are handled exclusively by the rider at customer doorstep. Partner controls are locked.
                      </p>
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <button
                          type="button"
                          onClick={() => setChatModalOrder(selectedOrder)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <MessageSquare size={14} /> Chat with Rider
                        </button>
                        {selectedOrder.deliveryAgentPhone && (
                          <button
                            type="button"
                            onClick={() =>
                              setCallModalTarget({
                                name: selectedOrder.deliveryAgentName || 'Delivery Rider',
                                phone: selectedOrder.deliveryAgentPhone!,
                                role: 'Delivery Executive',
                                orderNumber: selectedOrder.orderNumber,
                              })
                            }
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <Phone size={14} /> Call Rider
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setCallModalTarget({
                              name: selectedOrder.customerName,
                              phone: selectedOrder.customerPhone,
                              role: 'Customer',
                              orderNumber: selectedOrder.orderNumber,
                            })
                          }
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          <Phone size={14} /> Call Customer
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePartnerSelfFulfill(selectedOrder.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs ml-auto"
                          title="Cancel rider dispatch and handle device inspection & payout directly in-store"
                        >
                          <span>🏬 Handle in Store Myself (Recall Rider)</span>
                        </button>
                      </div>
                    </div>
                  ) : selectedOrder.status === 'completed' ? (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-emerald-900">Order Completed &amp; Payout Finalized</h4>
                          <p className="text-[11px] text-emerald-700 font-semibold">Payment Status: Paid · Archival Record Locked</p>
                        </div>
                        <span className="ml-auto px-2.5 py-1 bg-emerald-200/90 text-emerald-900 text-[10px] font-extrabold rounded-md uppercase tracking-wider flex items-center gap-1">
                          <Lock size={11} /> Locked
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 leading-relaxed mt-2">
                        Customer payout of <strong>₹{(selectedOrder.finalPrice || selectedOrder.quotedPrice).toLocaleString('en-IN')}</strong> has been finalized and disbursed. This order is in terminal completed state and cannot be modified or reverted.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-primary/5 via-white to-gray-50 border border-primary/20 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                          <SlidersHorizontal size={14} className="text-primary" /> Advance Order Status
                        </p>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${getOrderStatusColor(selectedOrder.status)}`}>
                          Current: {getOrderStatusLabel(selectedOrder.status)}
                        </span>
                      </div>

                      {/* Fulfillment Mode Choice */}
                      <div className="grid grid-cols-2 gap-2 mb-3 p-2 bg-white rounded-xl border border-gray-200/80">
                        <button
                          type="button"
                          onClick={() => {
                            setAssignDeliveryModal(selectedOrder);
                            setSelectedDeliveryAgentId(selectedOrder.deliveryAgentId || '');
                            setDeliveryPickupDate(selectedOrder.pickupDate || '');
                            setDeliveryPickupSlot(selectedOrder.pickupSlot || '');
                          }}
                          className="py-2 px-2.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Truck size={13} className="text-blue-600" />
                          <span>Assign Delivery Rider</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePartnerSelfFulfill(selectedOrder.id)}
                          className="py-2 px-2.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>🏬 Handle in Store Myself</span>
                        </button>
                      </div>

                      {selectedOrder.deliveryAgentId ? (
                        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-xs text-blue-900 font-semibold mb-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                            🚚
                          </div>
                          <div>
                            <p className="font-bold">Managed by Delivery Executive ({selectedOrder.deliveryAgentName || 'Rider'})</p>
                            <p className="text-[11px] text-blue-700">This order is assigned to field rider. Diagnostics, inspection, and status transitions are controlled exclusively by the delivery executive.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-gray-500 mb-2.5">Progress is forward-only (completed stages are locked):</p>

                          {/* Quick Action Pills - Forward Only */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                            {/* 1. Accept */}
                            <button
                              type="button"
                              disabled={STATUS_PROGRESSION[selectedOrder.status] >= 2}
                              onClick={() => handleStatusChange(selectedOrder.id, 'accepted')}
                              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                                STATUS_PROGRESSION[selectedOrder.status] > 2
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : selectedOrder.status === 'accepted'
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm cursor-default'
                                  : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50 cursor-pointer'
                              }`}
                            >
                              {STATUS_PROGRESSION[selectedOrder.status] >= 2 ? '✓ Accepted' : '✓ Accept'}
                            </button>

                            {/* 2. Picked Up */}
                            <button
                              type="button"
                              disabled={STATUS_PROGRESSION[selectedOrder.status] >= 4}
                              onClick={() => handleStatusChange(selectedOrder.id, 'picked_up')}
                              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                                STATUS_PROGRESSION[selectedOrder.status] > 4
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : selectedOrder.status === 'picked_up'
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm cursor-default'
                                  : STATUS_PROGRESSION[selectedOrder.status] < 2
                                  ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50 cursor-pointer'
                              }`}
                            >
                              {STATUS_PROGRESSION[selectedOrder.status] >= 4 ? '✓ Picked Up' : '🚚 Picked Up'}
                            </button>

                            {/* 3. Start Inspection */}
                            <button
                              type="button"
                              disabled={STATUS_PROGRESSION[selectedOrder.status] > 6}
                              onClick={() => {
                                handleStatusChange(selectedOrder.id, 'inspection');
                                setSelectedOrder(null);
                                onStartInspection?.(selectedOrder.id);
                              }}
                              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                                selectedOrder.status === 'inspection'
                                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm cursor-pointer'
                                  : STATUS_PROGRESSION[selectedOrder.status] < 2
                                  ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50 cursor-pointer'
                              }`}
                            >
                              🔍 Inspection
                            </button>

                            {/* 4. Complete / Payout */}
                            <button
                              type="button"
                              onClick={() => {
                                const amount = selectedOrder.finalPrice > 0 ? selectedOrder.finalPrice : selectedOrder.quotedPrice;
                                const balanceCheck = checkPartnerBalance(selectedOrder.partnerId, amount);
                                if (!balanceCheck.hasSufficientBalance) {
                                  setInsufficientBalanceWarning({
                                    required: amount,
                                    available: balanceCheck.availableBalance,
                                    shortfall: balanceCheck.shortfall,
                                  });
                                  return;
                                }
                                setPayoutOrder(selectedOrder);
                              }}
                              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                selectedOrder.status === 'inspection' && selectedOrder.finalPrice > 0
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm hover:bg-emerald-700'
                                  : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                              }`}
                            >
                              💳 Payout
                            </button>
                          </div>

                          {/* Forward-Only Dropdown Selector */}
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60">
                            <label htmlFor="modal-status-select" className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                              Advance Status:
                            </label>
                            <div className="relative flex-1">
                              <select
                                id="modal-status-select"
                                value={selectedOrder.status}
                                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                                className="w-full text-xs font-bold bg-white border border-gray-300 rounded-xl pl-3 pr-8 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                              >
                                {getAllowedForwardStatuses(selectedOrder.status).map(opt => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Device Info */}
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Device Information</p>
                    <p className="font-black text-gray-900 text-base">{selectedOrder.deviceName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedOrder.deviceBrand} · {selectedOrder.deviceModel} · {selectedOrder.deviceStorage} · {selectedOrder.deviceColor}
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Customer Details</p>
                      <a
                        href={`tel:${selectedOrder.customerPhone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors"
                      >
                        <Phone size={12} /> Call Customer
                      </a>
                    </div>
                    <p className="font-bold text-gray-900 text-sm">{selectedOrder.customerName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{selectedOrder.customerPhone} {selectedOrder.customerEmail ? `· ${selectedOrder.customerEmail}` : ''}</p>
                    <p className="text-xs text-gray-700 mt-2 bg-white p-2.5 rounded-xl border border-gray-200/70">
                      📍 {selectedOrder.customerAddress}, {selectedOrder.city} - {selectedOrder.pinCode}
                    </p>
                  </div>

                  {/* Schedule & Price (Highlight Updated Inspection Price) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5">
                      <p className="text-xs font-bold text-blue-700 mb-1">Pickup Slot</p>
                      <p className="font-bold text-gray-900 text-sm">{selectedOrder.pickupDate || 'Today'}</p>
                      <p className="text-xs text-gray-500">{selectedOrder.pickupSlot || '10 AM - 1 PM'}</p>
                    </div>
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5">
                      <p className="text-xs font-bold text-emerald-700 mb-1">
                        {selectedOrder.finalPrice > 0 ? 'Updated Inspection Price' : 'Quoted Price'}
                      </p>
                      <p className="text-xl font-black text-emerald-700">
                        ₹{(selectedOrder.finalPrice > 0 ? selectedOrder.finalPrice : selectedOrder.quotedPrice).toLocaleString('en-IN')}
                      </p>
                      {selectedOrder.finalPrice > 0 && selectedOrder.finalPrice !== selectedOrder.quotedPrice && (
                        <div className="text-[11px] text-gray-500 mt-1 flex flex-col">
                          <span className="line-through text-gray-400">Quote: ₹{selectedOrder.quotedPrice.toLocaleString('en-IN')}</span>
                          <span className="text-red-600 font-bold">
                            Deductions: -₹{(selectedOrder.quotedPrice - selectedOrder.finalPrice).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      {selectedOrder.inspectionScore !== null && selectedOrder.inspectionScore !== undefined && (
                        <p className="text-[11px] font-bold text-teal-700 mt-1">
                          Diagnostic Score: {selectedOrder.inspectionScore}%
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3.5">
                      <p className="text-xs font-bold text-amber-800 mb-1">Notes / Instructions</p>
                      <p className="text-xs text-amber-900">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* Delivery Executive Section in Partner Modal */}
                  <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <Truck size={14} className="text-blue-600" /> Assigned Delivery Executive
                      </p>
                      {selectedOrder.status !== 'completed' && selectedOrder.status !== 'paid' && selectedOrder.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            setAssignDeliveryModal(selectedOrder);
                            setSelectedDeliveryAgentId(selectedOrder.deliveryAgentId || '');
                            setDeliveryPickupDate(selectedOrder.pickupDate || '');
                            setDeliveryPickupSlot(selectedOrder.pickupSlot || '');
                            setSelectedOrder(null);
                          }}
                          className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                        >
                          {selectedOrder.deliveryAgentId ? 'Change Rider →' : '+ Assign Rider'}
                        </button>
                      )}
                    </div>
                    {selectedOrder.deliveryAgentName ? (
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div>
                          <p className="font-bold text-slate-900">{selectedOrder.deliveryAgentName}</p>
                          {selectedOrder.deliveryAgentPhone && (
                            <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                              <Phone size={11} className="text-blue-500" />
                              <a href={`tel:${selectedOrder.deliveryAgentPhone}`} className="hover:underline">{selectedOrder.deliveryAgentPhone}</a>
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full capitalize">
                          {selectedOrder.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No delivery executive assigned to this order yet. Assign an executive for doorstep device inspection and collection.</p>
                    )}
                  </div>

                  {/* Doorstep Inspection Completed Banner if Collected */}
                  {selectedOrder.deviceCollected && (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-4 shadow-md">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={18} className="text-emerald-100" />
                          <span className="text-xs font-black uppercase tracking-wider">Device Collected & Inspected</span>
                        </div>
                        <span className="text-xs font-black bg-white/20 px-2.5 py-0.5 rounded-full">
                          Score: {selectedOrder.inspectionScore || 100}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs bg-black/10 rounded-xl p-2.5 mt-2">
                        <div>
                          <p className="text-emerald-100 text-[11px]">Final Valuation:</p>
                          <p className="text-base font-black text-white">₹{(selectedOrder.finalPrice || selectedOrder.quotedPrice).toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-emerald-100 text-[11px]">Handover Timestamp:</p>
                          <p className="font-semibold text-white truncate">
                            {selectedOrder.collectedAt ? new Date(selectedOrder.collectedAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Verified at Doorstep'}
                          </p>
                        </div>
                        {selectedOrder.deviceImei && (
                          <div className="col-span-2 border-t border-white/10 pt-1 mt-1">
                            <p className="text-emerald-100 text-[11px]">Device IMEI: <span className="font-mono font-bold text-white">{selectedOrder.deviceImei}</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Actions inside Modal */}
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                    {selectedOrder.status === 'completed' || selectedOrder.status === 'paid' ? (
                      <div className="flex-1 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock size={15} className="text-emerald-600" />
                          <span>Order Fulfilled &amp; Locked</span>
                        </div>
                        {selectedOrder.deliveryAgentName && (
                          <span className="text-[11px] text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                            Fulfilled by: {selectedOrder.deliveryAgentName}
                          </span>
                        )}
                      </div>
                    ) : selectedOrder.deliveryAgentId ? (
                      <div className="flex-1 flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setChatModalOrder(selectedOrder);
                          }}
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare size={14} /> Chat with Rider
                        </button>
                        {selectedOrder.deliveryAgentPhone && (
                          <button
                            type="button"
                            onClick={() =>
                              setCallModalTarget({
                                name: selectedOrder.deliveryAgentName || 'Delivery Rider',
                                phone: selectedOrder.deliveryAgentPhone!,
                                role: 'Delivery Executive',
                                orderNumber: selectedOrder.orderNumber,
                              })
                            }
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Phone size={14} /> Call Rider
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setAssignDeliveryModal(selectedOrder);
                            setSelectedDeliveryAgentId(selectedOrder.deliveryAgentId || '');
                            setDeliveryPickupDate(selectedOrder.pickupDate || '');
                            setDeliveryPickupSlot(selectedOrder.pickupSlot || '');
                            setSelectedOrder(null);
                          }}
                          className="py-3 px-4 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Truck size={14} /> Change Rider
                        </button>
                      </div>
                    ) : (
                      <>
                        {selectedOrder.status === 'inspection' && selectedOrder.finalPrice > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setPayoutOrder(selectedOrder);
                            }}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CreditCard size={14} /> Disburse Payout (₹{selectedOrder.finalPrice.toLocaleString('en-IN')})
                          </button>
                        )}

                        {/* Button to Assign Delivery Rider */}
                        <button
                          type="button"
                          onClick={() => {
                            setAssignDeliveryModal(selectedOrder);
                            setSelectedDeliveryAgentId(selectedOrder.deliveryAgentId || '');
                            setDeliveryPickupDate(selectedOrder.pickupDate || '');
                            setDeliveryPickupSlot(selectedOrder.pickupSlot || '');
                            setSelectedOrder(null);
                          }}
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Truck size={14} /> Assign to Rider
                        </button>

                        {selectedOrder.status !== 'accepted' && selectedOrder.status !== 'inspection' && selectedOrder.status !== 'picked_up' && (
                          <button
                            type="button"
                            onClick={() => handleAccept(selectedOrder.id)}
                            className="flex-1 py-3 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle size={14} /> Accept Order
                          </button>
                        )}
                        {selectedOrder.status === 'accepted' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                handlePartnerStartInspection(selectedOrder.id);
                                setSelectedOrder(null);
                              }}
                              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <ClipboardCheck size={14} /> Start Inspection
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePickup(selectedOrder.id)}
                              className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Truck size={14} /> Start Pickup
                            </button>
                          </>
                        )}
                        {selectedOrder.status === 'picked_up' && (
                          <button
                            type="button"
                            onClick={() => {
                              handlePartnerStartInspection(selectedOrder.id);
                              setSelectedOrder(null);
                            }}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <ClipboardCheck size={14} /> Start Inspection
                          </button>
                        )}
                        {selectedOrder.status === 'inspection' && !selectedOrder.finalPrice && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(null);
                              onStartInspection?.(selectedOrder.id);
                            }}
                            className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <ClipboardCheck size={14} /> Continue Inspection
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DISBURSE PAYOUT MODAL */}
          {payoutOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPayoutOrder(null)} />
              <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 z-10 border border-gray-100">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-base">Disburse Spot Payout</h3>
                      <p className="text-xs text-gray-500">{payoutOrder.orderNumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPayoutOrder(null)}
                    className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Payout Summary Box */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 mb-4 shadow-md">
                  <div className="flex justify-between items-center text-xs text-emerald-100 mb-1">
                    <span>Payable to Customer</span>
                    {payoutOrder.inspectionScore !== null && (
                      <span className="bg-white/20 px-2 py-0.5 rounded font-bold">
                        Score: {payoutOrder.inspectionScore}%
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-black">
                    ₹{(payoutOrder.finalPrice > 0 ? payoutOrder.finalPrice : payoutOrder.quotedPrice).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-emerald-100 mt-2">
                    {payoutOrder.customerName} · {payoutOrder.deviceName}
                  </p>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3 mb-4">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Select Payment Mode</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'upi', label: 'Instant UPI', icon: '⚡' },
                      { id: 'imps', label: 'IMPS Bank', icon: '🏦' },
                      { id: 'cash', label: 'Spot Cash', icon: '💵' },
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPayoutMethod(m.id as any)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          payoutMethod === m.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm ring-1 ring-emerald-500'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-base">{m.icon}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Transaction Reference / UTR (Optional)
                    </label>
                    <input
                      type="text"
                      value={payoutRef}
                      onChange={(e) => setPayoutRef(e.target.value)}
                      placeholder={payoutMethod === 'cash' ? 'Cash handover note' : 'UPI UTR / IMPS ref ID'}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 mb-4 flex items-start gap-2">
                  <Lock size={14} className="mt-0.5 flex-shrink-0 text-amber-600" />
                  <span>
                    <strong>Important:</strong> Once payout is confirmed, this order will shift to <strong>Completed</strong> and will be permanently locked. No further status changes can be made.
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutOrder(null)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingPayout}
                    onClick={handleDisbursePayout}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingPayout ? 'Processing...' : `Confirm & Complete Payout`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* INSUFFICIENT WALLET BALANCE MODAL */}
          {insufficientBalanceWarning && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInsufficientBalanceWarning(null)} />
              <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 z-10 border border-red-100 text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 font-black text-2xl">
                  ⚠️
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1">Insufficient Wallet Balance</h3>
                <p className="text-xs text-gray-500 mb-4">
                  You do not have enough balance in your store wallet to disburse this customer payout. Please add funds to your wallet to proceed.
                </p>
                <div className="bg-red-50/60 rounded-2xl p-4 space-y-2 text-xs mb-5 border border-red-100">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Required Payout:</span>
                    <span className="font-bold text-gray-900">₹{insufficientBalanceWarning.required.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Wallet Balance:</span>
                    <span className="font-bold text-red-600">₹{insufficientBalanceWarning.available.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-t border-red-200/60 pt-2 font-black text-sm">
                    <span className="text-red-700">Shortfall:</span>
                    <span className="text-red-600">₹{insufficientBalanceWarning.shortfall.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setInsufficientBalanceWarning(null)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setInsufficientBalanceWarning(null);
                      window.location.href = '/partner';
                    }}
                    className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 cursor-pointer"
                  >
                    Add Funds in Wallet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ASSIGN TO DELIVERY RIDER MODAL */}
          {assignDeliveryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAssignDeliveryModal(null)} />
              <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-7 z-10 max-h-[92vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <div>
                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1">
                      <Truck size={13} /> Partner Dispatch Console
                    </span>
                    <h3 className="text-lg font-black text-gray-900">Assign Delivery Executive</h3>
                  </div>
                  <button onClick={() => setAssignDeliveryModal(null)} className="p-2 rounded-xl hover:bg-gray-100 cursor-pointer">
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>

                {/* Target Order Summary */}
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 mb-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-slate-700">{assignDeliveryModal.orderNumber}</span>
                    <span className="text-xs font-bold text-emerald-700">₹{(assignDeliveryModal.finalPrice || assignDeliveryModal.quotedPrice).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-sm font-black text-slate-900">{assignDeliveryModal.deviceName}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1"><MapPin size={11} className="text-primary" /> {assignDeliveryModal.city} (PIN: {assignDeliveryModal.pinCode})</span>
                    <span>Customer: <strong>{assignDeliveryModal.customerName}</strong></span>
                  </div>
                </div>

                {/* Schedule Slot Inputs */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 mb-1 block">Scheduled Date</label>
                    <input
                      type="date"
                      value={deliveryPickupDate}
                      onChange={e => setDeliveryPickupDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 mb-1 block">Pickup Window</label>
                    <select
                      value={deliveryPickupSlot}
                      onChange={e => setDeliveryPickupSlot(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                    >
                      <option value="">Select Time Slot</option>
                      <option value="10:00 AM - 1:00 PM">10:00 AM - 1:00 PM</option>
                      <option value="1:00 PM - 4:00 PM">1:00 PM - 4:00 PM</option>
                      <option value="4:00 PM - 7:00 PM">4:00 PM - 7:00 PM</option>
                      <option value="7:00 PM - 9:00 PM">7:00 PM - 9:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* List of Delivery Agents */}
                <div className="space-y-2.5 mb-5 max-h-64 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-gray-800 block">Select Store Rider:</label>
                    <span className="text-[11px] text-gray-500 font-semibold">Dedicated Store Fleet</span>
                  </div>
                  {partnerRidersList.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
                      <p className="text-xs font-bold text-amber-900">No riders created yet for your store</p>
                      <p className="text-[11px] text-amber-700">
                        Admin riders do not appear in your portal. Please add your own delivery partners from the &quot;My Riders&quot; tab to assign pickups.
                      </p>
                    </div>
                  ) : (
                    partnerRidersList.map(agent => {
                      const isPinMatch = agent.pinCodes?.includes(assignDeliveryModal.pinCode);
                      const isSelected = selectedDeliveryAgentId === agent.id;
                      return (
                        <button
                          key={agent.id}
                          type="button"
                          onClick={() => setSelectedDeliveryAgentId(agent.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                              : 'border-gray-100 hover:border-gray-200 bg-white'
                          }`}
                        >
                          <img src={agent.avatar} alt={agent.name} className="w-11 h-11 rounded-2xl object-cover border border-gray-200 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black text-gray-900 truncate">{agent.name}</p>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                agent.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {agent.status}
                              </span>
                              {isPinMatch && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full">
                                  PIN Match ✓
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                              {agent.vehicle} ({agent.vehicleNumber}) · 📞 {agent.phone}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {agent.city} · ⭐ {agent.rating} · {agent.todayPickups || 0} pickups today
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAssignDeliveryModal(null)}
                    className="flex-1 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAssignDeliveryAgent}
                    disabled={!selectedDeliveryAgentId}
                    className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Truck size={14} /> Assign to Executive
                  </button>
                </div>
              </div>
            </div>
          )}

      {/* LIVE ORDER CHAT MODAL */}
      <OrderChatModal
        isOpen={!!chatModalOrder}
        onClose={() => setChatModalOrder(null)}
        order={chatModalOrder}
        currentRole="partner"
        currentUserName="Pixel Pro Tech Hub (Partner)"
        currentUserPhone="9845067890"
        onOpenCall={(target) =>
          setCallModalTarget({
            name: target.name,
            phone: target.phone,
            role: target.role,
            orderNumber: chatModalOrder?.orderNumber,
          })
        }
      />

      {/* DIRECT PHONE CALL MODAL */}
      <OrderCallModal
        isOpen={!!callModalTarget}
        onClose={() => setCallModalTarget(null)}
        contactName={callModalTarget?.name || ''}
        contactPhone={callModalTarget?.phone || ''}
        contactRole={callModalTarget?.role || ''}
        orderNumber={callModalTarget?.orderNumber}
      />
    </div>
  );
}
