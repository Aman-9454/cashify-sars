'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { orders as defaultOrders, partners, deliveryAgents, getOrderStatusLabel, getOrderStatusColor, getTypeColor } from '@/lib/casmikData';
import type { Order, OrderStatus, DeliveryAgent, Partner } from '@/lib/casmikData';
import { 
  Search, 
  Eye, 
  UserCheck, 
  X, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  ChevronDown, 
  SlidersHorizontal, 
  CheckCircle,
  Truck,
  Phone,
  Calendar,
  Clock,
  ShieldCheck,
  MapPin,
  Sparkles
} from 'lucide-react';
import LiveOrderTracker from '@/components/LiveOrderTracker';
import { triggerNotification } from '@/lib/notifications';
import FullVerificationReportModal from '@/app/sell-device-get-quote/components/FullVerificationReportModal';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'created', label: 'Order Created' },
  { value: 'assigned', label: 'New / Assigned' },
  { value: 'accepted', label: 'Order Accepted' },
  { value: 'pickup_scheduled', label: 'Pickup Scheduled' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'inspection', label: 'Under Inspection' },
  { value: 'completed', label: 'Order Completed' },
  { value: 'unserviceable', label: 'Unserviceable Area' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_PROGRESSION: Record<string, number> = {
  created: 1,
  assigned: 2,
  accepted: 3,
  pickup_scheduled: 4,
  picked_up: 5,
  in_transit: 6,
  inspection: 7,
  completed: 8,
  unserviceable: 90,
  cancelled: 99,
  rejected: 99,
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
    id: o.id,
    orderNumber: o.order_number,
    type: o.order_type as Order['type'],
    status: o.status as OrderStatus,
    customerId: '',
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    customerEmail: o.customer_email || '',
    customerAddress: o.customer_address || '',
    pinCode: o.pin_code || '',
    city: o.city || '',
    deviceName: o.device_name,
    deviceBrand: o.device_brand || '',
    deviceModel: o.device_model || '',
    deviceStorage: o.device_storage || '',
    deviceColor: o.device_color || '',
    quotedPrice: o.quoted_price || 0,
    finalPrice: o.final_price || 0,
    partnerId: o.partner_id,
    partnerName: o.partner_name,
    deliveryAgentId: o.delivery_agent_id,
    deliveryAgentName: o.delivery_agent_name,
    deliveryAgentPhone: (o as any).delivery_agent_phone || null,
    deviceCollected: (o as any).device_collected || false,
    collectedAt: (o as any).collected_at || null,
    deviceImei: (o as any).device_imei || null,
    inspectionNotes: (o as any).inspection_notes || null,
    pickupDate: o.pickup_date || '',
    pickupSlot: o.pickup_slot || '',
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    paymentStatus: o.payment_status as Order['paymentStatus'],
    inspectionScore: o.inspection_score,
    notes: o.notes || '',
  };
}

const isMockOrder = (o: any) => {
  if (!o) return false;
  const num = String(o.orderNumber || '');
  const id = String(o.id || '');
  if (id.startsWith('ord-100') || id.startsWith('ord-101') || id.startsWith('ord-102')) return true;
  if (num.startsWith('CSM-2024-00') || num.startsWith('CSM-2024-01') || num.startsWith('CSM-2024-02') || num.startsWith('CSM-2024-03')) return true;
  if (o.customerName === 'Rahul Sharma' || o.customerName === 'Ananya Deshmukh' || o.customerName === 'Vikramaditya Rathore') return true;
  return false;
};

const getStoredOrders = (): Order[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_orders_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter(o => !isMockOrder(o));
          if (clean.length !== parsed.length) {
            localStorage.setItem('casmik_orders_v1', JSON.stringify(clean));
          }
          return clean;
        }
      }
    } catch (e) {
      console.warn('Failed to parse local orders', e);
    }
  }
  return [];
};

const getAvailableDeliveryAgents = (): DeliveryAgent[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_delivery_agents_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((a: any) => !a.id?.startsWith('agent-10') && !a.id?.startsWith('delivery-00'));
          return clean;
        }
      }
    } catch {}
  }
  return [];
};

export const isAdminCreatedRider = (agent: DeliveryAgent): boolean => {
  if (!agent) return false;
  if (agent.createdBy === 'partner') return false;
  if (agent.createdBy === 'admin') return true;
  if (agent.partnerId && agent.partnerId !== 'admin') return false;
  if (agent.partnerName && agent.partnerName !== 'Admin Fleet' && agent.partnerName !== 'Admin') return false;
  return true;
};


interface AdminOrdersProps {
  initialFilterStatus?: string;
  initialFilterType?: string;
  initialOrderId?: string | null;
  onClearFilters?: () => void;
}

export default function AdminOrders({
  initialFilterStatus = 'all',
  initialFilterType = 'all',
  initialOrderId = null,
  onClearFilters,
}: AdminOrdersProps = {}) {
  const [orderList, setOrderList] = useState<Order[]>(getStoredOrders);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState(initialFilterType || 'all');
  const [filterStatus, setFilterStatus] = useState(initialFilterStatus || 'all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assignModal, setAssignModal] = useState<Order | null>(null);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [livePartners, setLivePartners] = useState<Partner[]>([]);
  const [showAllPartners, setShowAllPartners] = useState(false);

  // Delivery Person Assignment Modal State
  const [assignDeliveryModal, setAssignDeliveryModal] = useState<Order | null>(null);
  const [selectedDeliveryAgentId, setSelectedDeliveryAgentId] = useState('');
  const [scheduledPickupDate, setScheduledPickupDate] = useState('');
  const [scheduledPickupSlot, setScheduledPickupSlot] = useState('');
  const [adminVerificationReport, setAdminVerificationReport] = useState<any | null>(null);

  const [activeTab, setActiveTab] = useState<'list' | 'live'>('list');
  const supabase = createClient();

  // Listen for storage and custom events for instant cross-tab & cross-role reactive updates
  useEffect(() => {
    const handleSync = () => {
      const fresh = getStoredOrders();
      setOrderList(fresh);
      setSelectedOrder(prev => prev ? (fresh.find(o => o.id === prev.id) || prev) : null);
    };
    window.addEventListener('casmik_orders_updated', handleSync);
    window.addEventListener('casmik_partner_orders_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('casmik_orders_updated', handleSync);
      window.removeEventListener('casmik_partner_orders_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Fetch live active partners from API and listen for partner updates
  useEffect(() => {
    const fetchLivePartners = () => {
      fetch('/api/partners')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.partners)) {
            setLivePartners(data.partners.filter((p: Partner) => p.status === 'active'));
          }
        })
        .catch(() => {});
    };
    fetchLivePartners();
    window.addEventListener('casmik_partners_updated', fetchLivePartners);
    return () => window.removeEventListener('casmik_partners_updated', fetchLivePartners);
  }, []);

  // Fetch live delivery agents for admin assignment
  const [availableAgents, setAvailableAgents] = useState<DeliveryAgent[]>([]);

  useEffect(() => {
    const fetchDeliveryAgents = () => {
      fetch('/api/delivery-agents')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.agents)) {
            setAvailableAgents(data.agents);
          } else {
            setAvailableAgents(getAvailableDeliveryAgents());
          }
        })
        .catch(() => {
          setAvailableAgents(getAvailableDeliveryAgents());
        });
    };
    fetchDeliveryAgents();
    window.addEventListener('casmik_delivery_agents_updated', fetchDeliveryAgents);
    return () => window.removeEventListener('casmik_delivery_agents_updated', fetchDeliveryAgents);
  }, []);

  const allAvailableDeliveryAgents = availableAgents.length > 0 ? availableAgents : getAvailableDeliveryAgents();
  const adminEligibleRiders = allAvailableDeliveryAgents.filter(isAdminCreatedRider);

  const openAssignDeliveryModal = (order: Order) => {
    setAssignDeliveryModal(order);
    const currentAgent = allAvailableDeliveryAgents.find(a => a.id === order.deliveryAgentId);
    if (currentAgent && isAdminCreatedRider(currentAgent)) {
      setSelectedDeliveryAgentId(order.deliveryAgentId || '');
    } else {
      setSelectedDeliveryAgentId('');
    }
    setScheduledPickupDate(order.pickupDate || '');
    setScheduledPickupSlot(order.pickupSlot || '');
  };

  useEffect(() => {
    if (initialFilterStatus) {
      setFilterStatus(initialFilterStatus);
    }
  }, [initialFilterStatus]);

  useEffect(() => {
    if (initialFilterType) {
      setFilterType(initialFilterType);
    }
  }, [initialFilterType]);

  useEffect(() => {
    if (initialOrderId && orderList.length > 0) {
      const found = orderList.find(o => o.id === initialOrderId || o.orderNumber === initialOrderId);
      if (found) {
        setSelectedOrder(found);
      }
    }
  }, [initialOrderId, orderList]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success && Array.isArray(json.orders)) {
        setOrderList(json.orders);
        if (typeof window !== 'undefined') {
          localStorage.setItem('casmik_orders_v1', JSON.stringify(json.orders));
        }
        setIsConnected(true);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('API fetch orders notice:', e);
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const mapped = data.map(dbToOrder);
        setOrderList(mapped);
        if (typeof window !== 'undefined') {
          localStorage.setItem('casmik_orders_v1', JSON.stringify(mapped));
        }
        setIsConnected(true);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.log('Orders fetch remote notice, active on persistent local store:', err.message);
    }

    // Fallback to local store or defaults
    const fallback = getStoredOrders();
    setOrderList(fallback);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
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
  }, [fetchOrders, supabase]);

  const filtered = orderList
    .filter(o =>
      (o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
       o.customerName.toLowerCase().includes(query.toLowerCase()) ||
       o.deviceName.toLowerCase().includes(query.toLowerCase()) ||
       (o.city && o.city.toLowerCase().includes(query.toLowerCase()))) &&
      (filterType === 'all' || o.type === filterType) &&
      (filterStatus === 'all' || 
       (filterStatus === 'pending'
         ? ['created', 'assigned', 'accepted', 'pickup_scheduled'].includes(o.status)
         : o.status === filterStatus))
    )
    .sort((a, b) => {
      const timeA = Math.max(new Date(a.createdAt || 0).getTime(), new Date(a.updatedAt || 0).getTime());
      const timeB = Math.max(new Date(b.createdAt || 0).getTime(), new Date(b.updatedAt || 0).getTime());
      return timeB - timeA;
    });

  // Calculate partner proximity to the order address PIN code
  const getPartnerProximity = useCallback((partner: Partner, orderPin: string, orderCity?: string) => {
    const cleanOrder = (orderPin || '').trim().replace(/\D/g, '');
    const orderNum = parseInt(cleanOrder, 10) || 0;
    const partnerPins = (partner.pinCodes || []).map(p => (p || '').trim().replace(/\D/g, '')).filter(Boolean);

    let isExact = false;
    let bestPin = partnerPins[0] || '';
    let minDiff = 999999;
    let rank = 5;
    let label = 'Other Area';

    for (const p of partnerPins) {
      const pNum = parseInt(p, 10) || 0;
      if (cleanOrder && p === cleanOrder) {
        isExact = true;
        bestPin = p;
        minDiff = 0;
        rank = 0;
        label = 'Exact PIN Match ✓';
        break;
      }
      if (cleanOrder.length >= 4 && p.slice(0, 4) === cleanOrder.slice(0, 4)) {
        const diff = Math.abs(pNum - orderNum);
        if (diff < minDiff) {
          minDiff = diff;
          bestPin = p;
          rank = 1;
          label = `Same Local Area (PIN: ${p})`;
        }
      } else if (cleanOrder.length >= 3 && p.slice(0, 3) === cleanOrder.slice(0, 3)) {
        const diff = Math.abs(pNum - orderNum);
        if (diff < minDiff) {
          minDiff = diff;
          bestPin = p;
          rank = 2;
          label = `Same District (PIN: ${p})`;
        }
      } else if (cleanOrder.length >= 2 && p.slice(0, 2) === cleanOrder.slice(0, 2)) {
        const diff = Math.abs(pNum - orderNum);
        if (diff < minDiff) {
          minDiff = diff;
          bestPin = p;
          rank = 3;
          label = `Same Region (PIN: ${p})`;
        }
      } else if (orderNum && pNum) {
        const diff = Math.abs(pNum - orderNum);
        if (diff < minDiff) {
          minDiff = diff;
          bestPin = p;
        }
      }
    }

    const sameCity = !!(orderCity && partner.city && partner.city.toLowerCase() === orderCity.toLowerCase());
    if (sameCity && rank > 3) {
      rank = 3;
      label = `Same City (${partner.city})`;
    }

    return { isExact, bestPin, minDiff, rank, label, sameCity };
  }, []);

  const rankedPartners = React.useMemo(() => {
    if (!assignModal) return [];
    const pool = livePartners.length > 0 ? livePartners : partners.filter(p => p.status === 'active');
    
    const withProx = pool.map(partner => {
      const prox = getPartnerProximity(partner, assignModal.pinCode, assignModal.city);
      return { partner, ...prox };
    });

    withProx.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.minDiff - b.minDiff;
    });

    return withProx;
  }, [assignModal, livePartners, getPartnerProximity]);

  const displayedPartners = React.useMemo(() => {
    if (!assignModal) return [];
    if (showAllPartners) return rankedPartners;
    // Show only nearest partners (matching exact PIN, area, district, or region/city)
    const near = rankedPartners.filter(p => p.rank <= 3);
    if (near.length > 0) return near;
    // If no partner is in the same region, show the closest 1 available
    return rankedPartners.slice(0, 1);
  }, [rankedPartners, showAllPartners, assignModal]);

  // Pre-select the nearest partner when modal opens
  useEffect(() => {
    if (assignModal) {
      setShowAllPartners(false);
      if (assignModal.partnerId) {
        setSelectedPartner(assignModal.partnerId);
      } else if (displayedPartners.length > 0) {
        setSelectedPartner(displayedPartners[0].partner.id);
      } else {
        setSelectedPartner('');
      }
    }
  }, [assignModal]);

  const handleAssign = async () => {
    if (!assignModal || !selectedPartner) return;
    const pool = livePartners.length > 0 ? livePartners : partners;
    const partner = pool.find(p => p.id === selectedPartner) || partners.find(p => p.id === selectedPartner);
    const updatedOrder: Order = {
      ...assignModal,
      partnerId: selectedPartner,
      partnerName: partner?.storeName || '',
      status: (assignModal.status === 'created' ? 'assigned' : assignModal.status) as OrderStatus,
      updatedAt: new Date().toISOString(),
    };

    const updated = orderList.map(o => o.id === assignModal.id ? updatedOrder : o);
    setOrderList(updated);
    if (selectedOrder?.id === assignModal.id) {
      setSelectedOrder(updatedOrder);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('casmik_orders_v1', JSON.stringify(updated));
      try {
        const rawPartner = localStorage.getItem('casmik_partner_orders_v1');
        const pList: Order[] = rawPartner ? JSON.parse(rawPartner) : [];
        const filteredPList = pList.filter(o => o.id !== updatedOrder.id);
        localStorage.setItem('casmik_partner_orders_v1', JSON.stringify([updatedOrder, ...filteredPList]));
      } catch {}
      window.dispatchEvent(new Event('casmik_orders_updated'));
      window.dispatchEvent(new Event('casmik_partner_orders_updated'));
    }

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: assignModal.id,
          partnerId: selectedPartner,
          partnerName: partner?.storeName || '',
          status: updatedOrder.status,
        }),
      });
    } catch (e) {
      console.warn('API partner assign warning:', e);
    }

    try {
      await supabase
        .from('orders')
        .update({ partner_id: selectedPartner, partner_name: partner?.storeName || '', status: updatedOrder.status })
        .eq('id', assignModal.id);
    } catch (err: any) {
      console.log('Assign error:', err.message);
    }

    // Trigger notification to partner, admin and customer
    triggerNotification({
      type: 'status_update',
      targetRole: 'all',
      title: `Order #${assignModal.orderNumber} Assigned to Partner`,
      shortDetails: `Admin assigned Order #${assignModal.orderNumber} (${assignModal.deviceName}) to partner "${partner?.storeName || 'Camsik Partner'}" for pickup & processing.`,
      orderNumber: assignModal.orderNumber,
      deviceName: assignModal.deviceName,
      customerName: assignModal.customerName,
      price: assignModal.quotedPrice,
      status: 'assigned',
    });

    setAssignModal(null);
    setSelectedPartner('');
  };

  const handleUnassignPartner = async (orderId: string) => {
    const target = orderList.find(o => o.id === orderId);
    if (!target) return;
    const updatedOrder: Order = {
      ...target,
      partnerId: null,
      partnerName: null,
      status: (target.status === 'assigned' ? 'created' : target.status) as OrderStatus,
      updatedAt: new Date().toISOString(),
    };
    const updated = orderList.map(o => o.id === orderId ? updatedOrder : o);
    setOrderList(updated);
    if (selectedOrder?.id === orderId) setSelectedOrder(updatedOrder);

    if (typeof window !== 'undefined') {
      localStorage.setItem('casmik_orders_v1', JSON.stringify(updated));
      try {
        const raw = localStorage.getItem('casmik_partner_orders_v1');
        if (raw) {
          const pList: Order[] = JSON.parse(raw);
          localStorage.setItem('casmik_partner_orders_v1', JSON.stringify(pList.filter(o => o.id !== orderId)));
        }
      } catch {}
      window.dispatchEvent(new Event('casmik_orders_updated'));
      window.dispatchEvent(new Event('casmik_partner_orders_updated'));
    }

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, partnerId: null, partnerName: null, status: updatedOrder.status }),
      });
    } catch {}
  };

  const handleUnassignDelivery = async (orderId: string) => {
    const target = orderList.find(o => o.id === orderId);
    if (!target) return;
    const updatedOrder: Order = {
      ...target,
      deliveryAgentId: null,
      deliveryAgentName: null,
      deliveryAgentPhone: null,
      status: (target.status === 'pickup_scheduled' ? (target.partnerId ? 'assigned' : 'created') : target.status) as OrderStatus,
      updatedAt: new Date().toISOString(),
    };
    const updated = orderList.map(o => o.id === orderId ? updatedOrder : o);
    setOrderList(updated);
    if (selectedOrder?.id === orderId) setSelectedOrder(updatedOrder);

    if (typeof window !== 'undefined') {
      localStorage.setItem('casmik_orders_v1', JSON.stringify(updated));
      window.dispatchEvent(new Event('casmik_orders_updated'));
      window.dispatchEvent(new Event('casmik_partner_orders_updated'));
    }

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, deliveryAgentId: null, deliveryAgentName: null, deliveryAgentPhone: null, status: updatedOrder.status }),
      });
    } catch {}
  };

  const handleAssignDelivery = async () => {
    if (!assignDeliveryModal || !selectedDeliveryAgentId) return;
    const allAgents = allAvailableDeliveryAgents;
    const agent = allAgents.find(a => a.id === selectedDeliveryAgentId);
    if (!agent) return;

    if (!isAdminCreatedRider(agent)) {
      alert(`Cannot assign "${agent.name}". Admin can only assign riders created by Admin.`);
      return;
    }

    const pickupDate = assignDeliveryModal.pickupDate || 'Today';
    const pickupSlot = assignDeliveryModal.pickupSlot || '10:00 AM - 1:00 PM';

    const updatedOrder: Order = {
      ...assignDeliveryModal,
      deliveryAgentId: agent.id,
      deliveryAgentName: agent.name,
      deliveryAgentPhone: agent.phone,
      status: 'pickup_scheduled' as OrderStatus,
      pickupDate,
      pickupSlot,
      updatedAt: new Date().toISOString(),
    };

    const updated = orderList.map(o => o.id === assignDeliveryModal.id ? updatedOrder : o);
    setOrderList(updated);
    if (selectedOrder?.id === assignDeliveryModal.id) {
      setSelectedOrder(updatedOrder);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('casmik_orders_v1', JSON.stringify(updated));
      try {
        const partnerOrders = localStorage.getItem('casmik_partner_orders_v1');
        if (partnerOrders) {
          const list = JSON.parse(partnerOrders);
          if (Array.isArray(list)) {
            const upPartner = list.map((o: Order) => o.id === assignDeliveryModal.id ? updatedOrder : o);
            localStorage.setItem('casmik_partner_orders_v1', JSON.stringify(upPartner));
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
          deliveryAgentId: agent.id,
          deliveryAgentName: agent.name,
          deliveryAgentPhone: agent.phone,
          status: 'pickup_scheduled',
          pickupDate,
          pickupSlot,
        }),
      });
    } catch (e) {
      console.warn('API update notice:', e);
    }

    try {
      await supabase
        .from('orders')
        .update({
          delivery_agent_id: agent.id,
          delivery_agent_name: agent.name,
          status: 'pickup_scheduled',
          pickup_date: pickupDate,
          pickup_slot: pickupSlot,
        })
        .eq('id', assignDeliveryModal.id);
    } catch (err: any) {
      console.log('Supabase delivery assign notice:', err.message);
    }

    triggerNotification({
      type: 'status_update',
      targetRole: 'all',
      title: `Order #${assignDeliveryModal.orderNumber} Assigned to Delivery Agent`,
      shortDetails: `Admin assigned Order #${assignDeliveryModal.orderNumber} (${assignDeliveryModal.deviceName}) to delivery executive "${agent.name}" (${agent.phone}) for doorstep pickup.`,
      orderNumber: assignDeliveryModal.orderNumber,
      deviceName: assignDeliveryModal.deviceName,
      customerName: assignDeliveryModal.customerName,
      price: assignDeliveryModal.quotedPrice,
      status: 'pickup_scheduled',
    });

    setAssignDeliveryModal(null);
    setSelectedDeliveryAgentId('');
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const targetOrder = orderList.find(o => o.id === orderId);
    if (!targetOrder) return;

    if (targetOrder.status === 'completed') {
      alert('⚠️ This order is completed & locked. No further changes can be made.');
      return;
    }

    const currentRank = STATUS_PROGRESSION[targetOrder.status] || 1;
    const nextRank = STATUS_PROGRESSION[newStatus] || 1;

    if (newStatus !== 'cancelled' && newStatus !== 'rejected' && nextRank <= currentRank) {
      alert('⚠️ Order progression is forward-only. You cannot move back to a previous stage.');
      return;
    }

    const updated = orderList.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrderList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('casmik_orders_v1', JSON.stringify(updated));
    }
    setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev);

    if (targetOrder) {
      const label = getOrderStatusLabel(newStatus);
      triggerNotification({
        type: 'status_update',
        targetRole: 'all',
        title: `Admin Updated Order #${targetOrder.orderNumber}`,
        shortDetails: `Status of Order #${targetOrder.orderNumber} (${targetOrder.deviceName}) updated to "${label}".`,
        orderNumber: targetOrder.orderNumber,
        deviceName: targetOrder.deviceName,
        customerName: targetOrder.customerName,
        price: targetOrder.finalPrice || targetOrder.quotedPrice,
        status: newStatus,
      });
    }

    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    } catch (err: any) {
      console.log('Admin status update note:', err.message);
    }
  };

  const stats = {
    total: orderList.length,
    pending: orderList.filter(o => ['created', 'assigned'].includes(o.status)).length,
    active: orderList.filter(o => ['accepted', 'pickup_scheduled', 'picked_up', 'inspection'].includes(o.status)).length,
    completed: orderList.filter(o => o.status === 'completed' || o.status === 'paid').length,
    unserviceable: orderList.filter(o => o.status === 'unserviceable').length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            Orders Management
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {isConnected ? <Wifi size={10} /> : <CheckCircle2 size={11} />}
              {isConnected ? 'Live Supabase' : `Active (${orderList.length} Orders)`}
            </span>
          </h2>
          <p className="text-sm text-gray-500">All orders across sell, buy, exchange & repair</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchOrders} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{ id: 'list', label: '📋 Orders List' }, { id: 'live', label: '🔴 Live Tracker' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary/40'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'live' ? (
        <LiveOrderTracker panel="admin" title="Admin Live Order Tracker" maxItems={50} />
      ) : (
        <>
          {/* Stats Cards (Interactive Click-to-filter) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {[
              { label: 'Total Orders', value: stats.total, icon: '📦', color: 'bg-blue-50 text-blue-700', statusKey: 'all' },
              { label: 'Pending', value: stats.pending, icon: '⏳', color: 'bg-yellow-50 text-yellow-700', statusKey: 'pending' },
              { label: 'Active', value: stats.active, icon: '🔄', color: 'bg-purple-50 text-purple-700', statusKey: 'accepted' },
              { label: 'Completed', value: stats.completed, icon: '✅', color: 'bg-green-50 text-green-700', statusKey: 'completed' },
              { label: 'Unserviceable', value: stats.unserviceable, icon: '🚫', color: 'bg-rose-50 text-rose-700', statusKey: 'unserviceable' },
            ].map(s => (
              <div
                key={s.label}
                onClick={() => setFilterStatus(s.statusKey)}
                className={`bg-white rounded-2xl p-4 border shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${
                  filterStatus === s.statusKey
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
                title={`Click to filter by ${s.label}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{s.value}</p>
                    <p className="text-xs font-semibold text-gray-500">{s.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Filter Banner */}
          {(filterStatus !== 'all' || filterType !== 'all' || query) && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Filtered View: {filterStatus !== 'all' ? `Status: "${filterStatus.replace(/_/g, ' ')}"` : ''} {filterType !== 'all' ? `· Type: "${filterType}"` : ''} {query ? `· Search: "${query}"` : ''} ({filtered.length} results)
              </span>
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterType('all');
                  setQuery('');
                  if (onClearFilters) onClearFilters();
                }}
                className="hover:underline font-black text-xs text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-primary/30"
              >
                Clear All Filters ✕
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search orders, customers, devices..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
              <option value="all">All Types</option>
              <option value="sell">Sell</option>
              <option value="buy">Buy</option>
              <option value="exchange">Exchange</option>
              <option value="repair">Repair</option>
              <option value="rent">Rental</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
              <option value="all">All Status</option>
              <option value="pending">Pending Attention</option>
              <option value="created">Created</option>
              <option value="assigned">Assigned</option>
              <option value="inspection">Inspection</option>
              <option value="completed">Completed</option>
              <option value="unserviceable">Unserviceable Area</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Order</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Device</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">PIN & Area</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Fulfillment & Rider</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-primary/5 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-900 text-xs group-hover:text-primary transition-colors">{order.orderNumber}</p>
                        <p className="text-xs text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : ''}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-800 text-xs">{order.customerName}</p>
                        <p className="text-xs text-gray-400">{order.city} · {order.pinCode}</p>
                      </td>
                      <td className="px-4 py-3.5 max-w-[150px]">
                        <p className="text-xs text-gray-700 truncate font-medium">{order.deviceName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-xs text-gray-400">{order.pickupDate}</p>
                          {(order.deviceVerificationStatus === 'verified' || order.deviceVerificationId) && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-xs font-bold text-gray-800">{order.pinCode || 'N/A'}</span>
                          {order.status === 'unserviceable' ? (
                            <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded w-fit">
                              Unserviceable ✕
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded w-fit">
                              Serviceable ✓
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg capitalize ${getTypeColor(order.type)}`}>{order.type}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-gray-900 text-xs">₹{order.quotedPrice.toLocaleString('en-IN')}</p>
                        {order.finalPrice > 0 && order.finalPrice !== order.quotedPrice && (
                          <p className="text-xs text-green-600 font-semibold">Final: ₹{order.finalPrice.toLocaleString('en-IN')}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            disabled={order.status === 'completed'}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border border-transparent ${order.status === 'completed' ? 'cursor-not-allowed opacity-90' : 'hover:border-gray-300 cursor-pointer'} appearance-none pr-6 transition-all ${getOrderStatusColor(order.status)}`}
                          >
                            {STATUS_OPTIONS.map(opt => {
                              const curRank = STATUS_PROGRESSION[order.status] || 1;
                              const optRank = STATUS_PROGRESSION[opt.value] || 1;
                              const isPast = optRank < curRank && opt.value !== 'cancelled' && opt.value !== 'rejected';
                              return (
                                <option
                                  key={opt.value}
                                  value={opt.value}
                                  disabled={isPast}
                                  className={isPast ? "bg-gray-100 text-gray-400 italic" : "bg-white text-gray-800 font-semibold"}
                                >
                                  {opt.label} {isPast ? '(Passed)' : ''}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          {order.partnerName ? (
                            <p className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                              {order.partnerName}
                            </p>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400">Store: Unassigned</span>
                          )}

                          {order.deliveryAgentName ? (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/70 w-fit">
                              <Truck size={11} className="text-blue-600" />
                              <span>{order.deliveryAgentName}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                              <Truck size={11} /> <span>No Rider</span>
                            </div>
                          )}

                          {order.deviceCollected && (
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300 w-fit">
                              <CheckCircle2 size={10} className="text-emerald-700" />
                              <span>Collected ({order.inspectionScore || 100}%)</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                            title="View Details & Manage"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAssignModal(order);
                              setSelectedPartner(order.partnerId || '');
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              order.partnerId
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-300'
                                : 'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200'
                            }`}
                            title={order.partnerId ? `Partner: ${order.partnerName} (Click to reassign/change)` : 'Assign Partner Store'}
                          >
                            <UserCheck size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openAssignDeliveryModal(order)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              order.deliveryAgentId
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-300'
                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200'
                            }`}
                            title={order.deliveryAgentId ? `Rider: ${order.deliveryAgentName} (Click to reassign)` : 'Assign Delivery Executive'}
                          >
                            <Truck size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <AlertCircle size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No orders found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-xs font-bold text-gray-400">Order Management</span>
                <h3 className="text-lg font-black text-gray-900">{selectedOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-gray-100 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg capitalize ${getTypeColor(selectedOrder.type)}`}>{selectedOrder.type}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${getOrderStatusColor(selectedOrder.status)}`}>{getOrderStatusLabel(selectedOrder.status)}</span>
                {selectedOrder.deviceCollected && (
                  <span className="text-xs font-black px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 size={12} /> Doorstep Collected
                  </span>
                )}
              </div>

              {/* CHANGE ORDER STATUS SECTION IN ADMIN MODAL */}
              <div className="bg-gradient-to-br from-primary/5 via-white to-gray-50 border border-primary/20 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                    <SlidersHorizontal size={14} className="text-primary" /> Change Order Status
                  </p>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${getOrderStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status === 'completed' ? '🔒 Order Completed & Locked' : getOrderStatusLabel(selectedOrder.status)}
                  </span>
                </div>

                {selectedOrder.status === 'completed' ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800 mb-2">
                    🔒 This order is completed & locked. No further modifications or reversals can be made.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {[
                        { key: 'accepted', label: '✓ Accept', rank: 3, activeClass: 'bg-blue-600 text-white border-blue-600', inactiveClass: 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50' },
                        { key: 'picked_up', label: '🚚 Picked Up', rank: 5, activeClass: 'bg-purple-600 text-white border-purple-600', inactiveClass: 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50' },
                        { key: 'inspection', label: '🔍 Inspection', rank: 7, activeClass: 'bg-amber-600 text-white border-amber-600', inactiveClass: 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50' },
                        { key: 'completed', label: '🎉 Complete', rank: 8, activeClass: 'bg-green-600 text-white border-green-600', inactiveClass: 'bg-white text-green-700 border-green-200 hover:bg-green-50' },
                      ].map(btn => {
                        const curRank = STATUS_PROGRESSION[selectedOrder.status] || 1;
                        const isPast = btn.rank <= curRank;
                        return (
                          <button
                            key={btn.key}
                            type="button"
                            disabled={isPast}
                            onClick={() => handleStatusChange(selectedOrder.id, btn.key as OrderStatus)}
                            className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                              isPast
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                                : selectedOrder.status === btn.key
                                ? btn.activeClass
                                : `${btn.inactiveClass} cursor-pointer`
                            }`}
                          >
                            {btn.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60">
                      <label htmlFor="admin-modal-status-select" className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                        All Statuses:
                      </label>
                      <div className="relative flex-1">
                        <select
                          id="admin-modal-status-select"
                          value={selectedOrder.status}
                          disabled={selectedOrder.status === 'paid' || (selectedOrder.status as string) === 'completed'}
                          onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                          className="w-full text-xs font-bold bg-white border border-gray-300 rounded-xl pl-3 pr-8 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                        >
                          {STATUS_OPTIONS.map(opt => {
                            const curRank = STATUS_PROGRESSION[selectedOrder.status] || 1;
                            const optRank = STATUS_PROGRESSION[opt.value] || 1;
                            const isPast = optRank < curRank && opt.value !== 'cancelled' && opt.value !== 'rejected';
                            return (
                              <option
                                key={opt.value}
                                value={opt.value}
                                disabled={isPast}
                                className={isPast ? "text-gray-400 bg-gray-100 italic" : "text-gray-900 bg-white"}
                              >
                                {opt.label} {isPast ? '(Completed)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* DOORSTEP INSPECTION STATUS BANNER IF COLLECTED */}
              {selectedOrder.deviceCollected && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-4 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={20} className="text-emerald-100" />
                      <span className="text-xs font-black uppercase tracking-wider">Device Collected & Inspected</span>
                    </div>
                    <span className="text-xs font-black bg-white/20 px-2.5 py-0.5 rounded-full">
                      Score: {selectedOrder.inspectionScore || 100}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-black/10 rounded-xl p-2.5 mt-2">
                    <div>
                      <p className="text-emerald-100 text-[11px]">Final Doorstep Payout:</p>
                      <p className="text-base font-black text-white">₹{(selectedOrder.finalPrice || selectedOrder.quotedPrice).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-emerald-100 text-[11px]">Handover Timestamp:</p>
                      <p className="font-semibold text-white truncate">
                        {selectedOrder.collectedAt ? new Date(selectedOrder.collectedAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Verified at Doorstep'}
                      </p>
                    </div>
                    {selectedOrder.deviceImei && (
                      <div className="col-span-2 border-t border-white/10 pt-1.5 mt-1">
                        <p className="text-emerald-100 text-[11px]">Verified Device IMEI: <span className="font-mono font-bold text-white">{selectedOrder.deviceImei}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DEVICE & IMEI VERIFICATION CERTIFICATE CARD (Section 36) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Security & Inspection</span>
                      <h4 className="font-bold text-slate-900 text-xs">Device & IMEI Verification Report</h4>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    selectedOrder.deviceVerificationStatus === 'verified' || selectedOrder.deviceVerificationId
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedOrder.deviceVerificationStatus === 'mismatch'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {selectedOrder.deviceVerificationStatus === 'verified' || selectedOrder.deviceVerificationId
                      ? '✓ Verified'
                      : selectedOrder.deviceVerificationStatus === 'mismatch'
                      ? '⚠ Mismatch'
                      : 'Pending Inspection'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Masked IMEI</span>
                    <span className="font-mono font-bold text-gray-900">
                      {selectedOrder.imeiMasked || (selectedOrder.deviceImei ? `${selectedOrder.deviceImei.slice(0, 2)}******${selectedOrder.deviceImei.slice(-5)}` : '35******12345')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Verification ID</span>
                    <span className="font-mono font-bold text-primary">
                      {selectedOrder.deviceVerificationId || 'CAM-IMEI-AUTO'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Device Matching</span>
                    <span className="font-bold text-emerald-600">
                      {selectedOrder.brandVerified !== false ? '✓ Matched' : '⚠ Discrepancy'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Blacklist Check</span>
                    <span className="font-bold text-emerald-600 capitalize">
                      {selectedOrder.blacklistStatus || 'Clean'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Verification Engine</span>
                    <span className="font-medium text-gray-700">
                      {selectedOrder.verificationProvider || 'Camsik Local Engine'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Verified Timestamp</span>
                    <span className="font-medium text-gray-700">
                      {selectedOrder.verificationTimestamp
                        ? new Date(selectedOrder.verificationTimestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                        : 'Verified at Booking'}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setAdminVerificationReport({
                          verificationId: selectedOrder.deviceVerificationId || 'CAM-IMEI-VERIFIED',
                          status: selectedOrder.deviceVerificationStatus || 'verified',
                          source: 'local',
                          providerName: selectedOrder.verificationProvider || 'Camsik Local Engine',
                          timestamp: selectedOrder.verificationTimestamp || selectedOrder.createdAt,
                          device: {
                            brand: selectedOrder.deviceBrand || 'Brand',
                            model: selectedOrder.deviceModel || 'Model',
                            storage: selectedOrder.deviceStorage || 'Standard',
                            deviceType: 'Smartphone',
                          },
                          identifiers: {
                            imei1: selectedOrder.deviceImei || '353046101234567',
                            maskedImei: selectedOrder.imeiMasked || '35******12345',
                            tac: selectedOrder.deviceImei ? selectedOrder.deviceImei.slice(0, 8) : '35304610',
                            luhnValid: true,
                          },
                          matching: {
                            matched: selectedOrder.brandVerified !== false,
                            brandMatched: true,
                            modelMatched: true,
                            variantMatched: true,
                            selectedDevice: { brand: selectedOrder.deviceBrand || '', model: selectedOrder.deviceModel || '' },
                            detectedDevice: { brand: selectedOrder.deviceBrand || '', model: selectedOrder.deviceModel || '' },
                          },
                          security: {
                            blacklistStatus: (selectedOrder.blacklistStatus as any) || 'clean',
                            carrierLock: 'Unlocked',
                            activationStatus: 'Activated',
                          },
                          notes: ['Verified through Camsik Selling Flow Gate.'],
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold text-xs flex items-center gap-1 shadow-sm"
                    >
                      <span>Inspect Report</span>
                      <Eye size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-500 mb-1">Customer</p>
                  <p className="text-sm font-bold text-gray-900">{selectedOrder.customerName}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.customerPhone}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.customerAddress}</p>
                  <p className="text-xs text-gray-500">PIN: {selectedOrder.pinCode}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-500 mb-1">Device</p>
                  <p className="text-sm font-bold text-gray-900">{selectedOrder.deviceName}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.deviceColor}</p>
                  <p className="text-xs text-gray-500">Pickup: {selectedOrder.pickupDate}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.pickupSlot}</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-500 mb-2">Pricing</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quoted Price</span>
                  <span className="font-bold text-gray-900">₹{selectedOrder.quotedPrice.toLocaleString('en-IN')}</span>
                </div>
                {selectedOrder.finalPrice > 0 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Final Inspected Price</span>
                    <span className="font-bold text-green-700">₹{selectedOrder.finalPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* PARTNER STORE ALLOCATION SECTION */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-emerald-700" /> Partner Store Allocation
                  </p>
                  <div className="flex items-center gap-2">
                    {selectedOrder.partnerId && (
                      <button
                        type="button"
                        onClick={() => handleUnassignPartner(selectedOrder.id)}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                      >
                        Unassign
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setAssignModal(selectedOrder);
                        setSelectedPartner(selectedOrder.partnerId || '');
                      }}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-xs cursor-pointer"
                    >
                      {selectedOrder.partnerId ? 'Change Store →' : '+ Assign Partner'}
                    </button>
                  </div>
                </div>

                {selectedOrder.partnerName ? (
                  <div className="space-y-1 text-xs pt-0.5">
                    <p className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                      <span>🏬</span> {selectedOrder.partnerName}
                    </p>
                    <p className="text-emerald-800 text-[11px]">
                      Partner ID: <span className="font-mono font-bold">{selectedOrder.partnerId}</span> · Status: <span className="font-bold capitalize">{selectedOrder.status.replace(/_/g, ' ')}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-900/80">No partner store assigned yet. Click &quot;+ Assign Partner&quot; to allocate this order to an authorized franchise hub.</p>
                )}
              </div>

              {/* DELIVERY EXECUTIVE DISPATCH SECTION */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Truck size={14} className="text-blue-700" /> Delivery & Doorstep Executive
                  </p>
                  <div className="flex items-center gap-2">
                    {selectedOrder.deliveryAgentId && (
                      <button
                        type="button"
                        onClick={() => handleUnassignDelivery(selectedOrder.id)}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                      >
                        Unassign
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openAssignDeliveryModal(selectedOrder)}
                      className="text-xs font-bold text-blue-800 hover:text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-300 shadow-xs cursor-pointer"
                    >
                      {selectedOrder.deliveryAgentId ? 'Change Rider →' : '+ Assign Rider'}
                    </button>
                  </div>
                </div>

                {selectedOrder.deliveryAgentName ? (
                  <div className="space-y-1 text-xs pt-0.5">
                    <p className="text-sm font-black text-slate-900">{selectedOrder.deliveryAgentName}</p>
                    {selectedOrder.deliveryAgentPhone && (
                      <p className="text-slate-600 flex items-center gap-1">
                        <Phone size={11} className="text-blue-500" />
                        <a href={`tel:${selectedOrder.deliveryAgentPhone}`} className="hover:underline">{selectedOrder.deliveryAgentPhone}</a>
                      </p>
                    )}
                    <p className="text-slate-500 text-[11px]">
                      Slot: <strong>{selectedOrder.pickupDate || 'Today'} ({selectedOrder.pickupSlot || '10 AM - 1 PM'})</strong>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No delivery executive assigned yet. Click &quot;+ Assign Rider&quot; to dispatch an agent for doorstep inspection & collection.</p>
                )}
              </div>

              {selectedOrder.notes && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-500 mb-1">Notes & Diagnostic Remarks</p>
                  <p className="text-xs text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Bottom Modal Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  setAssignModal(selectedOrder);
                  setSelectedPartner(selectedOrder.partnerId || '');
                }}
                className="py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <UserCheck size={14} />
                <span>{selectedOrder.partnerId ? 'Change Partner' : 'Assign Partner'}</span>
              </button>
              <button
                type="button"
                onClick={() => openAssignDeliveryModal(selectedOrder)}
                className="py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Truck size={14} />
                <span>{selectedOrder.deliveryAgentId ? 'Reassign Rider' : 'Assign Rider'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Partner Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAssignModal(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-7 z-10 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <span className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={13} /> Location Matching
                </span>
                <h3 className="text-lg font-black text-gray-900">Assign Partner Store</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <span>Order: <strong>{assignModal.orderNumber}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 font-bold text-primary">
                    <MapPin size={11} /> PIN: {assignModal.pinCode}
                  </span>
                  {assignModal.city && <span className="text-gray-400 font-medium">({assignModal.city})</span>}
                </p>
              </div>
              <button onClick={() => setAssignModal(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Header info & toggle */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                📍 Nearest Partners for PIN {assignModal.pinCode}
              </span>
              {rankedPartners.some(p => p.rank > 3) && (
                <button
                  type="button"
                  onClick={() => setShowAllPartners(!showAllPartners)}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  {showAllPartners ? 'Show Nearest Only' : `Show All (${rankedPartners.length})`}
                </button>
              )}
            </div>

            <div className="space-y-2.5 mb-5 max-h-72 overflow-y-auto pr-1">
              {displayedPartners.length === 0 ? (
                <div className="text-center py-8 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <MapPin size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-bold text-gray-700">No Nearest Partner Found</p>
                  <p className="text-xs text-gray-500 mt-1">No active partner found matching PIN {assignModal.pinCode}.</p>
                  <button
                    type="button"
                    onClick={() => setShowAllPartners(true)}
                    className="mt-3 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    View All Active Partners
                  </button>
                </div>
              ) : (
                displayedPartners.map(({ partner, isExact, label, rank, bestPin }) => (
                  <button
                    key={partner.id}
                    type="button"
                    onClick={() => setSelectedPartner(partner.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      selectedPartner === partner.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <img
                      src={partner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
                      alt={partner.name}
                      className="w-11 h-11 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{partner.storeName}</p>
                        {isExact ? (
                          <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1 flex-shrink-0">
                            <CheckCircle size={11} /> Exact PIN Match
                          </span>
                        ) : rank <= 2 ? (
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg flex-shrink-0">
                            {label}
                          </span>
                        ) : rank <= 3 ? (
                          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg flex-shrink-0">
                            {label}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg flex-shrink-0">
                            Closest Available
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {partner.city} · ⭐ {partner.rating} · {partner.completedOrders} orders
                      </p>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
                        Serving PINs: {(partner.pinCodes || []).slice(0, 4).join(', ')}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAssignModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssign}
                disabled={!selectedPartner}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-md"
              >
                Confirm Partner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Delivery Person Modal */}
      {assignDeliveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAssignDeliveryModal(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-7 z-10 max-h-[92vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1">
                  <Truck size={13} /> Admin Dispatch Console
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
                <span className="text-xs font-bold text-emerald-700">₹{assignDeliveryModal.quotedPrice.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-sm font-black text-slate-900">{assignDeliveryModal.deviceName}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1"><MapPin size={11} className="text-primary" /> {assignDeliveryModal.city} (PIN: {assignDeliveryModal.pinCode})</span>
                <span>Customer: <strong>{assignDeliveryModal.customerName}</strong></span>
              </div>
            </div>

            {/* Auto-Inherited Customer Pickup Schedule */}
            <div className="bg-blue-50/80 rounded-2xl p-3 border border-blue-200/70 mb-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Customer Scheduled Date</span>
                <span className="font-black text-blue-900 text-sm">
                  📅 {assignDeliveryModal.pickupDate || 'Today'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Customer Pickup Slot</span>
                <span className="font-black text-blue-900 text-sm">
                  ⏰ {assignDeliveryModal.pickupSlot || '10:00 AM - 1:00 PM'}
                </span>
              </div>
            </div>

            {/* List of Delivery Agents - Admin Created Only */}
            <div className="space-y-2.5 mb-5 max-h-64 overflow-y-auto pr-1">
              <label className="text-xs font-black text-gray-800 block">Select Active Executive (Admin Fleet):</label>
              {adminEligibleRiders.length === 0 ? (
                <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <p className="text-xs font-bold text-gray-600">No Admin Delivery Executives found</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Partner riders cannot be dispatched directly by Admin. Please add Admin riders in Delivery Management.
                  </p>
                </div>
              ) : (
                adminEligibleRiders.map(agent => {
                  const isPinMatch = agent.pinCodes?.includes(assignDeliveryModal.pinCode);
                  const isSelected = selectedDeliveryAgentId === agent.id;

                  return (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedDeliveryAgentId(agent.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <img src={agent.avatar} alt={agent.name} className="w-11 h-11 rounded-2xl object-cover border border-gray-200 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
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
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                            Admin Fleet
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                          {agent.vehicle} ({agent.vehicleNumber}) · 📞 {agent.phone}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {agent.city} · ⭐ {agent.rating} · {agent.todayPickups || 0} pickups today
                        </p>
                      </div>
                    </div>
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
                onClick={handleAssignDelivery}
                disabled={!selectedDeliveryAgentId}
                className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Truck size={14} /> Dispatch & Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {adminVerificationReport && (
        <FullVerificationReportModal
          report={adminVerificationReport}
          onClose={() => setAdminVerificationReport(null)}
        />
      )}
    </div>
  );
}
