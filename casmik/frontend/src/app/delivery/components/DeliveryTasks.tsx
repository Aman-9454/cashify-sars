'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Order, OrderStatus } from '@/lib/casmikData';
import { 
  MapPin, 
  Phone, 
  CheckCircle, 
  Camera, 
  X, 
  Navigation, 
  Package, 
  Truck, 
  Wifi, 
  WifiOff, 
  Eye, 
  Search, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  UploadCloud,
  ClipboardCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  KeyRound,
  XCircle,
  RefreshCw,
  Upload,
  Trash2,
  MessageSquare,
  IndianRupee,
  Store,
  DollarSign
} from 'lucide-react';
import LiveOrderTracker from '@/components/LiveOrderTracker';
import { orders, getOrderStatusLabel, getOrderStatusColor } from '@/lib/casmikData';
import { triggerNotification } from '@/lib/notifications';
import { checkPartnerBalance, deductPartnerBalance } from '@/lib/partnerWallet';
import OrderChatModal from '@/components/OrderChatModal';
import OrderCallModal from '@/components/OrderCallModal';

const DELIVERY_AGENT_ID = 'delivery-001';

const DELIVERY_PROGRESSION: Record<string, number> = {
  assigned: 1,
  pickup_scheduled: 2,
  inspection: 3,
  picked_up: 4,
  completed: 5,
  cancelled: 99,
};

interface InspectionCheckItem {
  id: string;
  label: string;
  subtext: string;
  deductionPct: number;
}

const inspectionItems: InspectionCheckItem[] = [
  { id: 'display', label: 'Display & Touchscreen', subtext: 'Cracks, dead pixels, lines, touch responsiveness', deductionPct: 25 },
  { id: 'body', label: 'Body & Frame Condition', subtext: 'Dents, heavy scratches, bent frame, discoloration', deductionPct: 12 },
  { id: 'camera', label: 'Camera & Optics', subtext: 'Front & rear camera focus, lens glass, sensor dust', deductionPct: 15 },
  { id: 'battery', label: 'Battery Health & Endurance', subtext: 'Battery health degradation, rapid discharge, swelling', deductionPct: 10 },
  { id: 'faceid', label: 'Biometrics (Face ID / Fingerprint)', subtext: 'Face ID, Touch ID, or fingerprint sensor failure', deductionPct: 12 },
  { id: 'charging', label: 'Charging & USB Port', subtext: 'Loose port, slow charging, or no PC data sync', deductionPct: 8 },
  { id: 'speaker', label: 'Speakers & Microphones', subtext: 'Cracking sound, low earpiece volume, mic distortion', deductionPct: 6 },
  { id: 'wifi', label: 'Wireless (Wi-Fi, Bluetooth, NFC)', subtext: 'Wi-Fi drop, Bluetooth pairing failure, GPS glitch', deductionPct: 6 },
  { id: 'network', label: 'Cellular SIM & Antennas', subtext: 'No service, baseband issue, damaged SIM slot', deductionPct: 10 },
  { id: 'buttons', label: 'Physical Buttons & Haptics', subtext: 'Stuck volume rocker, power key, faulty vibration', deductionPct: 5 },
  { id: 'water', label: 'Liquid Damage Check (LDI)', subtext: 'Internal moisture indicator triggered or corrosion', deductionPct: 20 },
  { id: 'accessories', label: 'Original Box & Accessories', subtext: 'Missing original box, authentic cable, or adapter', deductionPct: 5 },
];

const photoAngles = [
  { id: 'front', label: 'Front Display (Screen On)' },
  { id: 'back', label: 'Back Panel & Housing' },
  { id: 'left', label: 'Left Side & Frame' },
  { id: 'right', label: 'Right Side & Frame' },
  { id: 'ports', label: 'Top / Bottom Ports' },
  { id: 'camera_lens', label: 'Camera Lens & Optics' },
  { id: 'imei_label', label: 'IMEI / Serial Screen' },
  { id: 'defect', label: 'Scratch / Defect Close-up' },
];

interface DBOrder {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  pin_code: string;
  city: string;
  device_name: string;
  quoted_price: number;
  partner_name: string | null;
  pickup_date: string | null;
  pickup_slot: string | null;
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
    customerEmail: '',
    customerAddress: o.customer_address || '',
    pinCode: o.pin_code || '',
    city: o.city || '',
    deviceName: o.device_name,
    deviceBrand: '',
    deviceModel: '',
    deviceStorage: '',
    deviceColor: '',
    quotedPrice: o.quoted_price || 0,
    finalPrice: 0,
    partnerId: null,
    partnerName: o.partner_name,
    deliveryAgentId: DELIVERY_AGENT_ID,
    deliveryAgentName: 'Raghu Sharma',
    pickupDate: o.pickup_date || '',
    pickupSlot: o.pickup_slot || '',
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    paymentStatus: 'pending',
    inspectionScore: null,
    notes: '',
  };
}

function getStoredDeliveryTasks(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    let agentId = DELIVERY_AGENT_ID;
    const session = localStorage.getItem('casmik_delivery_session');
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed.id) agentId = parsed.id;
    }
    const raw = localStorage.getItem('casmik_orders_v1') || localStorage.getItem('casmik_partner_orders_v1');
    const all: Order[] = raw ? JSON.parse(raw) : orders;
    return all.filter(o => 
      Boolean(o.deliveryAgentId) && (
        o.deliveryAgentId === agentId || 
        o.deliveryAgentId === DELIVERY_AGENT_ID || 
        o.deliveryAgentId === 'agent-101'
      )
    );
  } catch {
    return orders.filter(o => Boolean(o.deliveryAgentId) && (o.deliveryAgentId === DELIVERY_AGENT_ID || o.deliveryAgentId === 'agent-101'));
  }
}

function saveLocalTasks(tasks: Order[]) {
  if (typeof window === 'undefined') return;
  try {
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    ['casmik_orders_v1', 'casmik_partner_orders_v1'].forEach(key => {
      const raw = localStorage.getItem(key);
      const all: Order[] = raw ? JSON.parse(raw) : orders;
      const updated = all.map(o => taskMap.has(o.id) ? { ...o, ...taskMap.get(o.id) } : o);
      localStorage.setItem(key, JSON.stringify(updated));
    });
    window.dispatchEvent(new Event('casmik_orders_updated'));
    window.dispatchEvent(new Event('casmik_partner_orders_updated'));
  } catch {}
}

interface DeliveryTasksProps {
  onOpenInspection?: (orderId: string) => void;
}

export default function DeliveryTasks({ onOpenInspection }: DeliveryTasksProps) {
  const [taskList, setTaskList] = useState<Order[]>(getStoredDeliveryTasks);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTask, setActiveTask] = useState<Order | null>(null);
  const [selectedTask, setSelectedTask] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'live'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price_desc' | 'slot'>('default');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 12-point inspection modal state
  const [inspectionStep, setInspectionStep] = useState<'diagnostics' | 'photos' | 'handover'>('diagnostics');
  const [inspectionResults, setInspectionResults] = useState<Record<string, 'pass' | 'fail' | 'na'>>({});
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [activePhotoModal, setActivePhotoModal] = useState<{ label: string; url: string } | null>(null);
  const [customPriceOverride, setCustomPriceOverride] = useState<string>('');
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [imei, setImei] = useState('');
  const [notes, setNotes] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat, Call, and Step 3 Payout modal states
  const [chatModalOrder, setChatModalOrder] = useState<Order | null>(null);
  const [callModalTarget, setCallModalTarget] = useState<{ name: string; phone: string; role: string; orderNumber?: string } | null>(null);
  const [payoutModalTask, setPayoutModalTask] = useState<Order | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'cash' | 'imps'>('upi');
  const [payoutRef, setPayoutRef] = useState('');
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [insufficientPartnerBalanceWarning, setInsufficientPartnerBalanceWarning] = useState<{
    required: number;
    available: number;
    shortfall: number;
    partnerName: string;
  } | null>(null);

  let currentAgentName = 'Sameer Khan';
  let currentAgentPhone = '9820123456';
  if (typeof window !== 'undefined') {
    try {
      const sess = localStorage.getItem('casmik_delivery_session');
      if (sess) {
        const parsed = JSON.parse(sess);
        if (parsed.name) currentAgentName = parsed.name;
        if (parsed.phone) currentAgentPhone = parsed.phone;
      }
    } catch {}
  }

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_agent_id', DELIVERY_AGENT_ID)
        .order('created_at', { ascending: false });
      if (error) {
        if (error.code?.startsWith('42')) throw error;
        setTaskList(getStoredDeliveryTasks());
        return;
      }
      if (data && data.length > 0) {
        setTaskList(data.map(dbToOrder));
      } else {
        setTaskList(getStoredDeliveryTasks());
      }
    } catch {
      setTaskList(getStoredDeliveryTasks());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();

    const handleSync = () => {
      setTaskList(getStoredDeliveryTasks());
    };
    window.addEventListener('casmik_orders_updated', handleSync);
    window.addEventListener('casmik_partner_orders_updated', handleSync);

    const channel = supabase
      .channel('delivery-tasks-realtime')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'orders',
        filter: `delivery_agent_id=eq.${DELIVERY_AGENT_ID}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTaskList(prev => [dbToOrder(payload.new as DBOrder), ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTaskList(prev => prev.map(t => t.id === (payload.new as DBOrder).id ? dbToOrder(payload.new as DBOrder) : t));
        } else if (payload.eventType === 'DELETE') {
          setTaskList(prev => prev.filter(t => t.id !== (payload.old as any).id));
        }
      })
      .subscribe(status => setIsConnected(status === 'SUBSCRIBED'));

    return () => { 
      supabase.removeChannel(channel); 
      window.removeEventListener('casmik_orders_updated', handleSync);
      window.removeEventListener('casmik_partner_orders_updated', handleSync);
    };
  }, [fetchTasks]);

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleUpdateOrderStatus = async (
    task: Order, 
    newStatus: OrderStatus, 
    extraData?: Partial<Order>,
    notificationMsg?: { title: string; details: string }
  ) => {
    if (task.status === 'completed') {
      alert('⚠️ This task is completed and locked. No further modifications can be made.');
      return;
    }

    const curRank = DELIVERY_PROGRESSION[task.status] || 1;
    const nextRank = DELIVERY_PROGRESSION[newStatus] || 1;
    if (newStatus !== 'cancelled' && nextRank < curRank) {
      alert('⚠️ Task progression is forward-only. You cannot move back to a previous stage.');
      return;
    }

    const updatedTask: Order = {
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      ...(extraData || {})
    };

    const updatedList = taskList.map(t => t.id === task.id ? updatedTask : t);
    setTaskList(updatedList);
    saveLocalTasks(updatedList);

    if (selectedTask?.id === task.id) {
      setSelectedTask(updatedTask);
    }

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          orderNumber: task.orderNumber,
          status: newStatus,
          ...extraData
        })
      });
    } catch {}

    triggerNotification({
      type: 'status_update',
      targetRole: 'all',
      title: notificationMsg?.title || `🚚 Status Changed: ${getOrderStatusLabel(newStatus)}`,
      shortDetails: notificationMsg?.details || `Executive updated #${task.orderNumber} (${task.deviceName}) to "${getOrderStatusLabel(newStatus)}". Synced across Partner, User & Admin.`,
      orderId: task.id,
      orderNumber: task.orderNumber,
      deviceName: task.deviceName,
      customerName: task.customerName,
      status: newStatus
    });
  };

  // Step 1: On the way to collect the device
  const handleStepOnTheWay = async (task: Order) => {
    await handleUpdateOrderStatus(
      task,
      'pickup_scheduled',
      { pickupDate: task.pickupDate || 'Today' },
      {
        title: '🚚 Executive On The Way To Collect Device',
        details: `Delivery Executive is en route to collect ${task.deviceName} from ${task.customerName}. Live tracking enabled.`
      }
    );
  };

  const handleStartPickup = handleStepOnTheWay;

  // Step 2: Diagnostic (Doorstep 12-point inspection)
  const handleStepDiagnostic = (task: Order) => {
    openInspectionModal(task);
  };

  // Step 3: Amount Paid (Doorstep spot payout with partner wallet balance gate)
  const handleOpenPayoutModal = (task: Order) => {
    if (task.status === 'completed') {
      alert('⚠️ This task is already completed and locked.');
      return;
    }
    const amount = task.finalPrice || task.quotedPrice;
    const partnerId = task.partnerId || 'partner-001';
    const check = checkPartnerBalance(partnerId, amount);

    if (!check.hasSufficientBalance) {
      setInsufficientPartnerBalanceWarning({
        required: amount,
        available: check.availableBalance,
        shortfall: check.shortfall,
        partnerName: check.partner.storeName || check.partner.name || 'Assigned Partner Store',
      });
      return;
    }

    setPayoutModalTask(task);
    setPayoutMethod('upi');
    setPayoutRef('');
  };

  const handleConfirmAmountPaid = async () => {
    if (!payoutModalTask) return;
    const amount = payoutModalTask.finalPrice || payoutModalTask.quotedPrice;
    const partnerId = payoutModalTask.partnerId || 'partner-001';

    // Strict Partner Wallet Check
    const check = checkPartnerBalance(partnerId, amount);
    if (!check.hasSufficientBalance) {
      setPayoutModalTask(null);
      setInsufficientPartnerBalanceWarning({
        required: amount,
        available: check.availableBalance,
        shortfall: check.shortfall,
        partnerName: check.partner.storeName || check.partner.name || 'Assigned Partner Store',
      });
      return;
    }

    setIsProcessingPayout(true);

    // Deduct from assigned partner wallet balance!
    const deductRes = deductPartnerBalance(partnerId, amount, payoutModalTask.orderNumber, payoutModalTask.customerName);
    if (!deductRes.success) {
      setIsProcessingPayout(false);
      setPayoutModalTask(null);
      setInsufficientPartnerBalanceWarning({
        required: amount,
        available: deductRes.newBalance,
        shortfall: amount - deductRes.newBalance,
        partnerName: check.partner.storeName || check.partner.name || 'Assigned Partner Store',
      });
      return;
    }

    const noteEntry = `[Doorstep Amount Paid: ₹${amount.toLocaleString('en-IN')} via ${payoutMethod.toUpperCase()}${payoutRef ? ` UTR:${payoutRef}` : ''}]`;
    const updatedNotes = payoutModalTask.notes ? `${payoutModalTask.notes} | ${noteEntry}` : noteEntry;

    await handleUpdateOrderStatus(
      payoutModalTask,
      payoutModalTask.status === 'completed' ? 'completed' : 'picked_up',
      {
        paymentStatus: 'paid',
        notes: updatedNotes
      },
      {
        title: '💰 Doorstep Amount Paid to Customer',
        details: `Delivery executive disbursed ₹${amount.toLocaleString('en-IN')} via ${payoutMethod.toUpperCase()} to ${payoutModalTask.customerName}. Partner wallet debited.`
      }
    );

    setIsProcessingPayout(false);
    setPayoutModalTask(null);
  };

  // Step 4: Complete Order
  const handleCompleteOrder = async (task: Order) => {
    await handleUpdateOrderStatus(
      task,
      'completed',
      {
        paymentStatus: 'paid',
        deviceCollected: true,
        notes: `${task.notes ? task.notes + ' | ' : ''}Order finalized & deposited to partner hub.`
      },
      {
        title: '✅ Order Completed by Delivery Executive',
        details: `Order #${task.orderNumber} (${task.deviceName}) is fully completed and deposited to partner hub. All portals synchronized.`
      }
    );
  };

  // 12-point inspection calculations
  const totalChecks = inspectionItems.length;
  const passedCount = Object.values(inspectionResults).filter(v => v === 'pass').length;
  const failedCount = Object.values(inspectionResults).filter(v => v === 'fail').length;
  const scorePercent = totalChecks > 0 ? Math.round((passedCount / totalChecks) * 100) : 100;

  const currentQuotedPrice = activeTask?.quotedPrice || 0;
  const failedItems = inspectionItems.filter(item => inspectionResults[item.id] === 'fail');
  const totalDeductionPct = Math.min(
    failedItems.reduce((acc, item) => acc + item.deductionPct, 0),
    75
  );
  const totalDeductionAmount = Math.round(currentQuotedPrice * (totalDeductionPct / 100));
  const calculatedExactPayout = Math.max(
    Math.round(currentQuotedPrice - totalDeductionAmount),
    Math.round(currentQuotedPrice * 0.25)
  );

  const finalPayoutToUser = isCustomPrice && customPriceOverride
    ? parseInt(customPriceOverride, 10) || calculatedExactPayout
    : calculatedExactPayout;

  const handlePhotoCapture = (angleId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotos(prev => ({
          ...prev,
          [angleId]: event.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (angleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos(prev => {
      const copy = { ...prev };
      delete copy[angleId];
      return copy;
    });
  };

  const openInspectionModal = (task: Order) => {
    setActiveTask(task);
    setOtpInput('');
    setOtpVerified(false);
    setInspectionStep('diagnostics');
    setInspectionResults({});
    setPhotos({});
    setIsCustomPrice(false);
    setCustomPriceOverride('');
    setImei(task.deviceImei || '');
    setNotes(task.notes || '');
  };

  // Complete 12-point doorstep inspection & verify OTP & collect device
  const handleFinalizeInspectionAndCollect = async () => {
    if (!activeTask) return;
    if (otpInput !== '1234' && otpInput.length < 4) {
      alert('Please enter valid 4-digit pickup OTP (demo: 1234)');
      return;
    }

    setIsSubmitting(true);
    const handoverTimestamp = new Date().toISOString();

    const updatedTask: Order = {
      ...activeTask,
      status: 'picked_up',
      deviceCollected: true,
      collectedAt: handoverTimestamp,
      finalPrice: finalPayoutToUser,
      inspectionScore: scorePercent,
      deviceImei: imei.trim() || activeTask.deviceImei || null,
      notes: `${notes ? notes + ' | ' : ''}Doorstep Inspected & Collected by ${activeTask.deliveryAgentName || 'Rider'} (Score: ${scorePercent}%, Final Price: ₹${finalPayoutToUser.toLocaleString('en-IN')})`,
      updatedAt: handoverTimestamp,
    };

    const updatedList = taskList.map(t => t.id === activeTask.id ? updatedTask : t);
    setTaskList(updatedList);
    saveLocalTasks(updatedList);

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeTask.id,
          orderNumber: activeTask.orderNumber,
          status: 'picked_up',
          deviceCollected: true,
          collectedAt: handoverTimestamp,
          finalPrice: finalPayoutToUser,
          inspectionScore: scorePercent,
          deviceImei: imei.trim() || null,
          notes: updatedTask.notes
        })
      });
    } catch {}

    triggerNotification({
      type: 'status_update',
      targetRole: 'all',
      title: '📦 Device Inspected & Collected at Doorstep',
      shortDetails: `${activeTask.orderNumber} (${activeTask.deviceName}) inspected (Score: ${scorePercent}%) and collected by rider. Synced to Admin & Partner portals.`,
      orderId: activeTask.id,
      orderNumber: activeTask.orderNumber,
      deviceName: activeTask.deviceName,
      customerName: activeTask.customerName,
      status: 'picked_up'
    });

    setOtpVerified(true);
    setIsSubmitting(false);
  };

  const handleCompleteHubDeposit = async (task: Order) => {
    const updated = taskList.map(t => t.id === task.id ? { ...t, status: 'completed' as OrderStatus } : t);
    setTaskList(updated);
    saveLocalTasks(updated);

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: 'completed' })
      });
    } catch {}

    triggerNotification({
      type: 'status_update',
      targetRole: 'all',
      title: '✅ Delivery & Handover Complete',
      shortDetails: `Order ${task.orderNumber} successfully deposited at partner hub. Payout incentive unlocked!`,
      orderId: task.id,
      orderNumber: task.orderNumber,
      deviceName: task.deviceName,
      customerName: task.customerName,
      status: 'completed'
    });
    setSelectedTask(null);
  };

  // Filter and search
  const filtered = useMemo(() => {
    return taskList.filter(t => {
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'assigned' && (t.status === 'assigned' || t.status === 'accepted')) ||
        (filterStatus === 'pickup_scheduled' && t.status === 'pickup_scheduled') ||
        (filterStatus === 'picked_up' && t.status === 'picked_up') ||
        (filterStatus === 'completed' && t.status === 'completed');

      if (!matchesFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.orderNumber?.toLowerCase().includes(q) ||
        t.deviceName?.toLowerCase().includes(q) ||
        t.customerName?.toLowerCase().includes(q) ||
        t.customerPhone?.toLowerCase().includes(q) ||
        t.city?.toLowerCase().includes(q) ||
        t.pinCode?.includes(q)
      );
    }).sort((a, b) => {
      if (sortBy === 'price_desc') return (b.quotedPrice || 0) - (a.quotedPrice || 0);
      if (sortBy === 'slot') return (a.pickupSlot || '').localeCompare(b.pickupSlot || '');
      return 0;
    });
  }, [taskList, filterStatus, searchQuery, sortBy]);

  // Operational metrics
  const stats = useMemo(() => {
    const assigned = taskList.filter(t => ['assigned', 'accepted'].includes(t.status)).length;
    const scheduled = taskList.filter(t => t.status === 'pickup_scheduled').length;
    const pickedUp = taskList.filter(t => t.status === 'picked_up').length;
    const completed = taskList.filter(t => t.status === 'completed').length;
    return { assigned, scheduled, pickedUp, completed, total: taskList.length };
  }, [taskList]);

  const tabs = [
    { id: 'all', label: 'All Tasks', count: stats.total },
    { id: 'assigned', label: 'Assigned', count: stats.assigned },
    { id: 'pickup_scheduled', label: 'En Route', count: stats.scheduled },
    { id: 'picked_up', label: 'In Transit', count: stats.pickedUp },
    { id: 'completed', label: 'Completed', count: stats.completed },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold">Synchronizing task queue...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ─── TOP CONTROL BAR ────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Executive Task Queue</h2>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {isConnected ? <Wifi size={12} className="text-emerald-600" /> : <WifiOff size={12} />}
                {isConnected ? 'Real-Time Sync' : 'Live Buffer'}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Doorstep customer pickups, 12-point device diagnostics, OTP verification, and instant partner sync.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Package size={15} /> Task Grid ({taskList.length})
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Live Route Radar
            </button>
          </div>
        </div>

        {/* ─── 4-METRIC OPS SUMMARY CARDS ───────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500">Ready Pickups</span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.assigned}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Assigned to your vehicle</p>
          </div>

          <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100/70">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-700">En Route</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <p className="text-2xl font-black text-amber-900">{stats.scheduled}</p>
            <p className="text-[11px] text-amber-700/70 mt-0.5">Trips in progress</p>
          </div>

          <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100/70">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-indigo-700">In Transit</span>
              <Package size={14} className="text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-indigo-900">{stats.pickedUp}</p>
            <p className="text-[11px] text-indigo-700/70 mt-0.5">Collected devices on bike</p>
          </div>

          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100/70">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-700">Completed</span>
              <CheckCircle size={14} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-900">{stats.completed}</p>
            <p className="text-[11px] text-emerald-700/70 mt-0.5">Deposited to partner</p>
          </div>
        </div>
      </div>

      {activeTab === 'live' ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <LiveOrderTracker panel="delivery" deliveryAgentId={DELIVERY_AGENT_ID} title="Real-Time Fleet & Pickup Tracker" />
        </div>
      ) : (
        <>
          {/* ─── FILTERS & SEARCH ROW ────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === tab.id
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-primary/40 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search device, customer, PIN..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                    <X size={13} />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                aria-label="Sort task list"
                className="bg-white border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="default">Sort: Default</option>
                <option value="price_desc">Value: High to Low</option>
                <option value="slot">Slot: Time Window</option>
              </select>
            </div>
          </div>

          {/* ─── FULL WIDTH 3-COLUMN TASK GRID ───────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(task => {
              const isAssigned = task.status === 'assigned' || task.status === 'accepted';
              const isEnRoute = task.status === 'pickup_scheduled';
              const isPickedUp = task.status === 'picked_up';
              const isDone = task.status === 'completed';

              const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                (task.customerAddress || '') + ' ' + (task.city || '') + ' ' + (task.pinCode || '')
              )}`;

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">
                            {task.orderNumber}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(task.orderNumber, task.id);
                            }}
                            className="text-slate-400 hover:text-slate-700 transition-colors"
                            title="Copy Order ID"
                          >
                            {copiedId === task.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <h3 className="text-base font-black text-slate-900 group-hover:text-primary transition-colors mt-0.5 line-clamp-1">
                          {task.deviceName}
                        </h3>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <span className="text-base font-black text-emerald-700">
                          ₹{(task.finalPrice || task.quotedPrice)?.toLocaleString('en-IN')}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                          task.type === 'sell' ? 'bg-emerald-100 text-emerald-800' :
                          task.type === 'buy' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {task.type}
                        </span>
                      </div>
                    </div>

                    {/* Doorstep Collection Banner if Already Collected */}
                    {task.deviceCollected && (
                      <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-2.5 flex items-center justify-between text-xs">
                        <span className="text-emerald-800 font-black flex items-center gap-1.5">
                          <CheckCircle size={14} className="text-emerald-600" />
                          <span>Device Collected ({task.inspectionScore || 100}%)</span>
                        </span>
                        <span className="text-emerald-700 font-mono text-[11px] font-bold">
                          {task.deviceImei ? `IMEI: ${task.deviceImei.slice(-6)}` : 'Verified'}
                        </span>
                      </div>
                    )}

                    {/* Status & Schedule Bar */}
                    <div className="flex items-center justify-between text-xs bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                        <Calendar size={13} className="text-primary" />
                        <span>{task.pickupDate || 'Today'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                        <Clock size={13} className="text-primary" />
                        <span>{task.pickupSlot || '10:00 AM - 1:00 PM'}</span>
                      </div>
                    </div>

                    {/* Customer & Location Card */}
                    <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-100/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <span>{task.customerName}</span>
                          <ShieldCheck size={13} className="text-emerald-600" />
                        </p>
                        <span className="text-[11px] font-mono font-semibold text-slate-500">
                          PIN: {task.pinCode || '400050'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-slate-600">
                        <MapPin size={14} className="text-primary flex-shrink-0 mt-0.5" />
                        <p className="line-clamp-2 leading-relaxed">
                          {task.customerAddress ? `${task.customerAddress}, ${task.city}` : 'Customer residential address'}
                        </p>
                      </div>
                    </div>

                    {/* 4-Step Doorstep Execution Stepper */}
                    <div className="bg-slate-50/90 rounded-2xl p-2.5 space-y-2 border border-slate-200/70">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500">
                        <span>4-Step Doorstep Pipeline</span>
                        <span className="text-primary font-mono lowercase">live sync</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {/* Step 1: On The Way */}
                        <button
                          type="button"
                          disabled={task.status === 'pickup_scheduled' || Boolean(task.deviceCollected) || task.status === 'picked_up' || task.status === 'completed'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStepOnTheWay(task);
                          }}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all ${
                            task.status === 'pickup_scheduled' || Boolean(task.deviceCollected) || task.status === 'picked_up' || task.status === 'completed'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 opacity-90 cursor-not-allowed'
                              : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200 shadow-sm cursor-pointer'
                          }`}
                          title={task.status === 'pickup_scheduled' ? 'Already En Route' : 'Step 1: Mark On the way to collect device'}
                        >
                          <Truck size={11} className={task.status === 'pickup_scheduled' ? 'animate-bounce text-amber-600' : ''} />
                          <span>1. On The Way</span>
                        </button>

                        {/* Step 2: Diagnostic */}
                        <button
                          type="button"
                          disabled={Boolean(task.deviceCollected) || task.paymentStatus === 'paid' || task.status === 'completed'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStepDiagnostic(task);
                          }}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all ${
                            Boolean(task.deviceCollected) || task.paymentStatus === 'paid' || task.status === 'completed'
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 opacity-90 cursor-not-allowed'
                              : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200 shadow-sm cursor-pointer'
                          }`}
                          title="Step 2: 12-Point Doorstep Diagnostic"
                        >
                          <ClipboardCheck size={11} className="text-indigo-600" />
                          <span>2. Diagnostic</span>
                        </button>

                        {/* Step 3: Amount Paid */}
                        <button
                          type="button"
                          disabled={task.paymentStatus === 'paid' || task.status === 'completed'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPayoutModal(task);
                          }}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all ${
                            task.paymentStatus === 'paid' || task.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 opacity-90 cursor-not-allowed'
                              : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200 shadow-sm cursor-pointer'
                          }`}
                          title="Step 3: Disburse Doorstep Instant Payout"
                        >
                          <IndianRupee size={11} className={task.paymentStatus === 'paid' ? 'text-emerald-600' : ''} />
                          <span>3. Amount Paid</span>
                        </button>

                        {/* Step 4: Order Completed */}
                        <button
                          type="button"
                          disabled={task.status === 'completed'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteOrder(task);
                          }}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all ${
                            task.status === 'completed'
                              ? 'bg-teal-100 text-teal-900 border border-teal-300 opacity-90 cursor-not-allowed'
                              : 'bg-white text-slate-700 hover:bg-teal-50 border border-slate-200 shadow-sm cursor-pointer'
                          }`}
                          title="Step 4: Complete and deposit to partner hub"
                        >
                          <CheckCircle2 size={11} className="text-teal-600" />
                          <span>{task.status === 'completed' ? '4. Completed 🔒' : '4. Completed'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Status Changer & Transferred Partner Info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                        <Store size={12} className="text-amber-600" />
                        <span>Partner: <strong className="text-slate-700">{task.partnerName || 'Pixel Pro Tech Hub'}</strong></span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400">Status:</span>
                        <select
                          value={task.status}
                          disabled={task.status === 'completed'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleUpdateOrderStatus(task, e.target.value as OrderStatus);
                          }}
                          className={`text-[11px] font-bold py-1 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${task.status === 'completed' ? 'opacity-80 cursor-not-allowed bg-emerald-50 text-emerald-800' : 'cursor-pointer'}`}
                        >
                          {[
                            { value: 'assigned', label: 'Assigned' },
                            { value: 'pickup_scheduled', label: 'On the way (En Route)' },
                            { value: 'inspection', label: 'Diagnostic (Inspection)' },
                            { value: 'picked_up', label: 'Device Collected' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'cancelled', label: 'Cancelled' },
                          ].map(opt => {
                            const curRank = DELIVERY_PROGRESSION[task.status] || 1;
                            const optRank = DELIVERY_PROGRESSION[opt.value] || 1;
                            const isPast = optRank < curRank && opt.value !== 'cancelled';
                            return (
                              <option key={opt.value} value={opt.value} disabled={isPast} className={isPast ? "text-gray-400 bg-gray-100 italic" : ""}>
                                {opt.label} {isPast ? '(Completed)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ─── ACTION BUTTONS BAR ───────────────────────────── */}
                  <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Chat Button (Opens Chat Modal with Customer & Partner tabs) */}
                      <button
                        type="button"
                        onClick={() => setChatModalOrder(task)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
                        title="Chat with Customer or Partner"
                      >
                        <MessageSquare size={13} />
                        <span>Chat</span>
                      </button>

                      {/* Call Customer */}
                      <button
                        type="button"
                        onClick={() => setCallModalTarget({
                          name: task.customerName,
                          phone: task.customerPhone,
                          role: 'Customer',
                          orderNumber: task.orderNumber
                        })}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
                        title={`Call Customer: ${task.customerPhone}`}
                      >
                        <Phone size={13} />
                        <span>User</span>
                      </button>

                      {/* Call Partner */}
                      <button
                        type="button"
                        onClick={() => setCallModalTarget({
                          name: task.partnerName || 'Pixel Pro Tech Hub',
                          phone: task.partnerPhone || '9845067890',
                          role: 'Order Transfer Partner',
                          orderNumber: task.orderNumber
                        })}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-amber-700 hover:bg-amber-50 hover:border-amber-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
                        title={`Call Partner: ${task.partnerPhone || '9845067890'}`}
                      >
                        <Store size={13} />
                        <span>Partner</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                        title="Open GPS Navigation"
                      >
                        <Navigation size={13} />
                      </a>
                      <button
                        type="button"
                        onClick={() => setSelectedTask(task)}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400">
              <Package size={48} className="mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="text-lg font-black text-slate-700">No matching orders found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                There are no tasks matching the selected filters or search keyword. Try clearing your search or switching categories.
              </p>
              <button
                onClick={() => { setFilterStatus('all'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </>
      )}

      {/* ─── MODAL 1: 12-POINT DOORSTEP INSPECTION & DEVICE COLLECTION STUDIO ──────────────────────── */}
      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveTask(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md p-5 border-b border-slate-100 flex items-center justify-between z-20">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-primary">{activeTask.orderNumber}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Doorstep Inspection
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{activeTask.deviceName}</h3>
              </div>
              <button
                onClick={() => setActiveTask(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {!otpVerified ? (
              <div className="p-5 sm:p-6 space-y-5">
                
                {/* 3 Steps Navigation Tab */}
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setInspectionStep('diagnostics')}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                      inspectionStep === 'diagnostics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    1. Diagnostics ({passedCount + failedCount}/{totalChecks})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectionStep('photos')}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                      inspectionStep === 'photos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    2. Photos &amp; IMEI ({Object.keys(photos).length}/8)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectionStep('handover')}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                      inspectionStep === 'handover' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    3. OTP &amp; Collect
                  </button>
                </div>

                {/* Score & Payout Preview Widget */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      Live Valuation Handover
                    </span>
                    <p className="text-2xl font-black text-white mt-0.5">₹{finalPayoutToUser.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] text-slate-400">
                      Original: ₹{currentQuotedPrice.toLocaleString('en-IN')} &bull; Deductions: -{totalDeductionPct}%
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Score</span>
                    <p className={`text-2xl font-black ${
                      scorePercent >= 80 ? 'text-emerald-400' : scorePercent >= 60 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {scorePercent}%
                    </p>
                  </div>
                </div>

                {/* STEP 1: 12-POINT DIAGNOSTICS */}
                {inspectionStep === 'diagnostics' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">12-Point Hardware Checks</h4>
                      <span className="text-xs font-bold text-slate-500">{passedCount} Passed &bull; {failedCount} Failed</span>
                    </div>

                    <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                      {inspectionItems.map(item => {
                        const result = inspectionResults[item.id];
                        const isFailed = result === 'fail';
                        const deductionAmt = Math.round(currentQuotedPrice * (item.deductionPct / 100));

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                              isFailed ? 'bg-red-50/60 border-red-200' : result === 'pass' ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-slate-200/80'
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-black text-slate-900">{item.label}</p>
                                {isFailed && (
                                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                    -{item.deductionPct}% (-₹{deductionAmt.toLocaleString('en-IN')})
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">{item.subtext}</p>
                            </div>

                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => setInspectionResults(prev => ({ ...prev, [item.id]: 'pass' }))}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  result === 'pass' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50'
                                }`}
                              >
                                Pass
                              </button>
                              <button
                                type="button"
                                onClick={() => setInspectionResults(prev => ({ ...prev, [item.id]: 'fail' }))}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  result === 'fail' ? 'bg-red-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-red-50'
                                }`}
                              >
                                Fail
                              </button>
                              <button
                                type="button"
                                onClick={() => setInspectionResults(prev => ({ ...prev, [item.id]: 'na' }))}
                                className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  result === 'na' ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-400'
                                }`}
                              >
                                N/A
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setInspectionStep('photos')}
                      className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Proceed to Photos &amp; IMEI</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                {/* STEP 2: PHOTOS & IMEI */}
                {inspectionStep === 'photos' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                        Physical IMEI / Serial Number *
                      </label>
                      <input
                        value={imei}
                        onChange={e => setImei(e.target.value)}
                        placeholder="Dial *#06# on customer phone or check SIM tray"
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                          Doorstep Camera Proof ({Object.keys(photos).length}/{photoAngles.length})
                        </label>
                        <span className="text-[11px] text-slate-400">Tap box to capture</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {photoAngles.map(angle => {
                          const hasPhoto = !!photos[angle.id];
                          return (
                            <div
                              key={angle.id}
                              onClick={() => {
                                if (!hasPhoto) {
                                  fileInputRefs.current[angle.id]?.click();
                                } else {
                                  setActivePhotoModal({ label: angle.label, url: photos[angle.id] });
                                }
                              }}
                              className={`relative aspect-square rounded-2xl border-2 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-1.5 text-center ${
                                hasPhoto ? 'border-emerald-500 bg-black/5' : 'border-dashed border-slate-200 hover:border-primary hover:bg-primary/5'
                              }`}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                ref={el => { fileInputRefs.current[angle.id] = el; }}
                                onChange={e => handlePhotoCapture(angle.id, e)}
                              />
                              {hasPhoto ? (
                                <>
                                  <img src={photos[angle.id]} alt={angle.label} className="w-full h-full object-cover rounded-xl" />
                                  <span className="absolute bottom-1 left-1 right-1 text-[8px] font-black text-white bg-black/70 px-1 py-0.5 rounded truncate">
                                    {angle.label}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Camera size={16} className="text-slate-400 mb-0.5" />
                                  <span className="text-[9px] font-bold text-slate-600 line-clamp-1">{angle.label}</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                        Executive Observations / Condition Notes
                      </label>
                      <input
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="e.g. Minor scratches on bezel, battery healthy"
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectionStep('diagnostics')}
                        className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectionStep('handover')}
                        className="flex-1 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Proceed to Customer OTP</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: CUSTOMER OTP & FINAL COLLECTION */}
                {inspectionStep === 'handover' && (
                  <div className="space-y-4">
                    {/* Valuation Override Toggle */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-bold">Calculated Payout:</span>
                        <span className="font-black text-slate-900 text-sm">₹{calculatedExactPayout.toLocaleString('en-IN')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCustomPrice(!isCustomPrice)}
                        className="text-[11px] font-bold text-primary hover:underline mt-1 block"
                      >
                        {isCustomPrice ? 'Use standard formula price' : 'Negotiate / Override final amount'}
                      </button>
                      {isCustomPrice && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-slate-400">₹</span>
                          <input
                            type="number"
                            value={customPriceOverride}
                            onChange={e => setCustomPriceOverride(e.target.value)}
                            placeholder={calculatedExactPayout.toString()}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Customer OTP Box */}
                    <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl p-4 border border-blue-200 space-y-2">
                      <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
                        <KeyRound size={15} /> Customer Pickup OTP Verification
                      </div>
                      <p className="text-xs text-slate-600">
                        Ask <strong>{activeTask.customerName}</strong> ({activeTask.customerPhone}) for their 4-digit pickup code:
                      </p>
                      <input
                        type="text"
                        maxLength={4}
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="• • • •"
                        className="w-full py-3 px-4 text-center font-mono text-2xl font-black tracking-[0.8em] bg-white border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-primary text-slate-900 shadow-inner"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Demo OTP: <strong className="text-primary font-mono">1234</strong></span>
                        <span>SMS / WhatsApp verified</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-3 border border-slate-200 text-xs text-slate-600 space-y-1">
                      <p className="font-bold text-slate-800 flex items-center gap-1">
                        <ShieldCheck size={14} className="text-emerald-600" /> Handover Confirmation:
                      </p>
                      <p>✓ Device physically placed in anti-shock security pouch</p>
                      <p>✓ Instant live sync to Admin Order &amp; Partner Order consoles</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectionStep('photos')}
                        className="py-3 px-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleFinalizeInspectionAndCollect}
                        disabled={isSubmitting || otpInput.length < 4}
                        className="flex-1 py-3.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-2xl font-black text-xs hover:opacity-95 shadow-lg shadow-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>Updating consoles...</span>
                          </>
                        ) : (
                          <>
                            <Zap size={15} />
                            <span>Collect Device &amp; Finalize Pickup (₹{finalPayoutToUser.toLocaleString('en-IN')})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Success State */
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle size={36} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">Device Inspected &amp; Secured!</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {activeTask.deviceName} ({activeTask.orderNumber}) is marked picked up with condition score of {scorePercent}% and payout ₹{finalPayoutToUser.toLocaleString('en-IN')}.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2 max-w-sm mx-auto">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Handover Status:</span>
                    <span className="font-bold text-emerald-700">Collected in Transit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inspection Score:</span>
                    <span className="font-bold text-slate-800">{scorePercent}%</span>
                  </div>
                  {imei && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recorded IMEI:</span>
                      <span className="font-mono font-bold text-primary">{imei}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consoles Updated:</span>
                    <span className="font-bold text-slate-800">Admin + Partner + Customer</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const current = activeTask;
                      setActiveTask(null);
                      setOtpVerified(false);
                      setOtpInput('');
                      if (current) handleOpenPayoutModal(current);
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-xs hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    <IndianRupee size={15} />
                    <span>Proceed to Step 3: Disburse Payout (₹{finalPayoutToUser.toLocaleString('en-IN')})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTask(null);
                      setOtpVerified(false);
                      setOtpInput('');
                    }}
                    className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Return to Task Queue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL 2: FULL TASK DETAILS & ESCALATION ────────────────────── */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl p-6 sm:p-7 z-10 max-h-[90vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400">Order Manifest Information</span>
                <h3 className="text-xl font-black text-slate-900">{selectedTask.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* If Device Collected: Show Details Banner */}
            {selectedTask.deviceCollected && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle size={15} className="text-emerald-600" />
                    Device Collected &amp; Inspected at Doorstep
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Score: {selectedTask.inspectionScore || 100}%
                  </span>
                </div>
                <p className="text-emerald-700">
                  Collected on: {new Date(selectedTask.collectedAt || selectedTask.updatedAt).toLocaleString()}
                </p>
                {selectedTask.deviceImei && (
                  <p className="font-mono text-emerald-800">IMEI: {selectedTask.deviceImei}</p>
                )}
              </div>
            )}

            {/* Device Block */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quoted Device</span>
                <h4 className="text-base font-black text-slate-900 mt-0.5">{selectedTask.deviceName}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedTask.deviceColor || 'Standard'} · {selectedTask.deviceStorage || 'Original'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payout</span>
                <p className="text-xl font-black text-emerald-700">
                  ₹{(selectedTask.finalPrice || selectedTask.quotedPrice)?.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Transferred Partner Card */}
            <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Order Transfer Partner</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedTask.partnerName || 'Pixel Pro Tech Hub'}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setChatModalOrder(selectedTask)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <MessageSquare size={13} /> Chat Partner
                  </button>
                  <button
                    type="button"
                    onClick={() => setCallModalTarget({
                      name: selectedTask.partnerName || 'Pixel Pro Tech Hub',
                      phone: selectedTask.partnerPhone || '9845067890',
                      role: 'Order Transfer Partner',
                      orderNumber: selectedTask.orderNumber
                    })}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer"
                  >
                    <Phone size={13} /> Call Partner
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-amber-800">
                Partner Phone: <strong>{selectedTask.partnerPhone || '9845067890'}</strong> &bull; Partner assigned this order for doorstep execution.
              </p>
            </div>

            {/* Customer & Location */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedTask.customerName}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setChatModalOrder(selectedTask)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    <MessageSquare size={13} /> Chat User
                  </button>
                  <button
                    type="button"
                    onClick={() => setCallModalTarget({
                      name: selectedTask.customerName,
                      phone: selectedTask.customerPhone,
                      role: 'Customer',
                      orderNumber: selectedTask.orderNumber
                    })}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-200 transition-colors cursor-pointer"
                  >
                    <Phone size={13} /> Call User
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pickup Address</span>
                <p className="text-xs font-medium text-slate-700 mt-1 leading-relaxed">
                  📍 {selectedTask.customerAddress || 'Address on file'}, {selectedTask.city} - {selectedTask.pinCode}
                </p>
              </div>
            </div>

            {/* 4-Step Pipeline Actions Inside Modal */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-700 uppercase tracking-wider text-[10px]">
                  4-Step Workflow Actions
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded capitalize ${getOrderStatusColor(selectedTask.status)}`}>
                  {selectedTask.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={selectedTask.status === 'pickup_scheduled' || Boolean(selectedTask.deviceCollected) || selectedTask.status === 'picked_up' || selectedTask.status === 'completed'}
                  onClick={() => handleStepOnTheWay(selectedTask)}
                  className={`p-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                    selectedTask.status === 'pickup_scheduled' || Boolean(selectedTask.deviceCollected) || selectedTask.status === 'picked_up' || selectedTask.status === 'completed'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 opacity-90 cursor-not-allowed'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 cursor-pointer'
                  }`}
                >
                  <Truck size={14} className="text-amber-600" />
                  <span>1. On The Way</span>
                </button>

                <button
                  type="button"
                  disabled={Boolean(selectedTask.deviceCollected) || selectedTask.paymentStatus === 'paid' || selectedTask.status === 'completed'}
                  onClick={() => {
                    const target = selectedTask;
                    setSelectedTask(null);
                    openInspectionModal(target);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                    Boolean(selectedTask.deviceCollected) || selectedTask.paymentStatus === 'paid' || selectedTask.status === 'completed'
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 opacity-90 cursor-not-allowed'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 cursor-pointer'
                  }`}
                >
                  <ClipboardCheck size={14} className="text-indigo-600" />
                  <span>2. 12-Pt Diagnostic</span>
                </button>

                <button
                  type="button"
                  disabled={selectedTask.paymentStatus === 'paid' || selectedTask.status === 'completed'}
                  onClick={() => handleOpenPayoutModal(selectedTask)}
                  className={`p-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                    selectedTask.paymentStatus === 'paid' || selectedTask.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 opacity-90 cursor-not-allowed'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 cursor-pointer'
                  }`}
                >
                  <IndianRupee size={14} className="text-emerald-600" />
                  <span>3. Amount Paid</span>
                </button>

                <button
                  type="button"
                  disabled={selectedTask.status === 'completed'}
                  onClick={() => handleCompleteOrder(selectedTask)}
                  className={`p-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                    selectedTask.status === 'completed'
                      ? 'bg-teal-100 text-teal-900 border border-teal-300 opacity-90 cursor-not-allowed'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-teal-50 cursor-pointer'
                  }`}
                >
                  <CheckCircle2 size={14} className="text-teal-600" />
                  <span>{selectedTask.status === 'completed' ? '4. Completed 🔒' : '4. Complete Order'}</span>
                </button>
              </div>

              {/* Status Select inside modal */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <span className="font-bold text-slate-500">Manual Status Change:</span>
                <select
                  value={selectedTask.status}
                  disabled={selectedTask.status === 'completed'}
                  onChange={(e) => handleUpdateOrderStatus(selectedTask, e.target.value as OrderStatus)}
                  className={`font-bold py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${selectedTask.status === 'completed' ? 'opacity-80 cursor-not-allowed bg-emerald-50 text-emerald-800' : 'cursor-pointer'}`}
                >
                  {[
                    { value: 'assigned', label: 'Assigned' },
                    { value: 'pickup_scheduled', label: 'On the way (En Route)' },
                    { value: 'inspection', label: 'Diagnostic (Inspection)' },
                    { value: 'picked_up', label: 'Device Collected' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ].map(opt => {
                    const curRank = DELIVERY_PROGRESSION[selectedTask.status] || 1;
                    const optRank = DELIVERY_PROGRESSION[opt.value] || 1;
                    const isPast = optRank < curRank && opt.value !== 'cancelled';
                    return (
                      <option key={opt.value} value={opt.value} disabled={isPast} className={isPast ? "text-gray-400 bg-gray-100 italic" : ""}>
                        {opt.label} {isPast ? '(Completed)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  (selectedTask.customerAddress || '') + ' ' + (selectedTask.city || '') + ' ' + (selectedTask.pinCode || '')
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl text-xs font-black text-center hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                <Navigation size={14} /> Open Maps
              </a>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="py-3.5 px-5 bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: DOORSTEP SPOT AMOUNT PAID (STEP 3) ────────────────── */}
      {payoutModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPayoutModalTask(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Doorstep Payout (Step 3)</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{payoutModalTask.orderNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setPayoutModalTask(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X size={15} />
              </button>
            </div>

            {/* Payout Summary */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">Amount To Disburse</span>
              <p className="text-3xl font-black mt-0.5">
                ₹{(payoutModalTask.finalPrice || payoutModalTask.quotedPrice).toLocaleString('en-IN')}
              </p>
              <div className="mt-2 pt-2 border-t border-white/20 text-xs flex justify-between text-emerald-100">
                <span>Customer: <strong>{payoutModalTask.customerName}</strong></span>
                <span>{payoutModalTask.customerPhone}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Select Payout Mode *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', label: 'UPI / QR', desc: 'GPay/PhonePe' },
                  { id: 'imps', label: 'IMPS Bank', desc: 'Direct Transfer' },
                  { id: 'cash', label: 'Cash Spot', desc: 'Physical Cash' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPayoutMethod(mode.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      payoutMethod === mode.id
                        ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-black">{mode.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional UTR / Reference */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Transaction Reference / UTR Number (Optional)
              </label>
              <input
                type="text"
                value={payoutRef}
                onChange={(e) => setPayoutRef(e.target.value)}
                placeholder="e.g. 402819284910 or Cash Receipt #"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayoutModalTask(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAmountPaid}
                disabled={isProcessingPayout}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayout ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                <span>Confirm Amount Paid</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: ORDER CHAT (PARTNER & USER) ────────────────────────── */}
      <OrderChatModal
        isOpen={Boolean(chatModalOrder)}
        onClose={() => setChatModalOrder(null)}
        order={chatModalOrder}
        currentRole="delivery"
        currentUserName={currentAgentName}
        currentUserPhone={currentAgentPhone}
        onOpenCall={(target) => {
          setCallModalTarget({
            name: target.name,
            phone: target.phone,
            role: target.role,
            orderNumber: chatModalOrder?.orderNumber
          });
        }}
      />

      {/* ─── MODAL 5: ORDER CALL (PARTNER & USER) ────────────────────────── */}
      {callModalTarget && (
        <OrderCallModal
          isOpen={Boolean(callModalTarget)}
          onClose={() => setCallModalTarget(null)}
          contactName={callModalTarget.name}
          contactPhone={callModalTarget.phone}
          contactRole={callModalTarget.role}
          orderNumber={callModalTarget.orderNumber}
        />
      )}

      {/* Lightbox for Photos */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col border border-slate-100">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="font-bold text-xs text-slate-900">{activePhotoModal.label}</h4>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-4 bg-black flex items-center justify-center max-h-[60vh] overflow-hidden">
              <img
                src={activePhotoModal.url}
                alt={activePhotoModal.label}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>
            <div className="p-3 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActivePhotoModal(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── INSUFFICIENT PARTNER WALLET BALANCE WARNING MODAL ───────────── */}
      {insufficientPartnerBalanceWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 font-black text-2xl shadow-sm">
              ⚠️
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Payment Blocked: Partner Wallet Balance Low</h3>
            <p className="text-xs text-slate-600 mb-4 font-medium leading-relaxed">
              Please mention your partner (<strong className="text-slate-900">{insufficientPartnerBalanceWarning.partnerName}</strong>) to add balance in his wallet to make a payment.
            </p>
            <div className="bg-red-50/70 rounded-2xl p-4 space-y-2 text-xs mb-5 border border-red-100 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Required Payout Amount:</span>
                <span className="font-bold text-slate-900">₹{insufficientPartnerBalanceWarning.required.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Partner Available Balance:</span>
                <span className="font-bold text-red-600">₹{insufficientPartnerBalanceWarning.available.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-red-200/60 pt-2 font-black">
                <span className="text-red-700">Shortfall:</span>
                <span className="text-red-600">₹{insufficientPartnerBalanceWarning.shortfall.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button
              onClick={() => setInsufficientPartnerBalanceWarning(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all hover:scale-[1.01]"
            >
              I Will Mention Partner To Add Balance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
