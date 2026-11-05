'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getOrderStatusLabel, getOrderStatusColor } from '@/lib/casmikData';
import type { Order } from '@/lib/casmikData';
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  Upload, 
  ClipboardCheck, 
  ArrowLeft, 
  SlidersHorizontal,
  DollarSign,
  Eye,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Zap,
  CheckCircle2,
  X,
  Maximize2,
  Lock
} from 'lucide-react';
import { triggerNotification } from '@/lib/notifications';

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
  { id: 'front', label: 'Front Display (Screen On)', desc: 'Display with white background' },
  { id: 'back', label: 'Back Panel & Housing', desc: 'Back glass or aluminum body' },
  { id: 'left', label: 'Left Side & Frame', desc: 'Left edge & volume buttons' },
  { id: 'right', label: 'Right Side & Frame', desc: 'Right edge & power button' },
  { id: 'ports', label: 'Top / Bottom Ports', desc: 'Charging port & speaker grilles' },
  { id: 'camera_lens', label: 'Camera Lens & Optics', desc: 'Close-up of camera cluster' },
  { id: 'imei_label', label: 'IMEI / Serial Screen', desc: 'Settings > About screen' },
  { id: 'defect', label: 'Scratch / Defect Close-up', desc: 'Any cosmetic blemish' },
];
export type DeviceCategoryType = 'dslr' | 'lens' | 'laptop' | 'tablet' | 'action_cam' | 'smartphone';

export function getInspectionCategory(order?: Order | null): {
  type: DeviceCategoryType;
  label: string;
  badgeColor: string;
  idLabel: string;
  idPlaceholder: string;
  items: InspectionCheckItem[];
  photoAngles: { id: string; label: string; desc: string }[];
} {
  const name = `${order?.deviceName || ''} ${order?.deviceBrand || ''} ${order?.deviceModel || ''}`.toLowerCase();
  
  if (name.includes('lens') || name.includes('f/') || name.includes('mm') || name.includes('zoom') || name.includes('prime') || name.includes('telephoto')) {
    return {
      type: 'lens',
      label: 'Camera Lens',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      idLabel: 'Lens Serial Number (S/N)',
      idPlaceholder: 'e.g. 21004892 (Check rear metal mount / barrel)',
      items: [
        { id: 'front_glass', label: 'Front Glass & Anti-Reflective Coating', subtext: 'Scratch-free, pristine front optical element with no fungus or haze', deductionPct: 20 },
        { id: 'rear_element', label: 'Rear Element & Metal Bayonet Mount', subtext: 'Flawless rear optical glass and undamaged metal mount flange', deductionPct: 15 },
        { id: 'internal_optics', label: 'Internal Elements (Zero Fungus/Haze)', subtext: 'No internal mold, haze, moisture condensation, or heavy dust', deductionPct: 20 },
        { id: 'af_motor', label: 'AF Autofocus Motor (USM/STM/Linear)', subtext: 'Silent, instant auto-focus lock with zero grinding or hesitation', deductionPct: 15 },
        { id: 'aperture_blades', label: 'Aperture Blades & Diaphragm Action', subtext: 'Clean oil-free blades with instant snappy opening & closing', deductionPct: 10 },
        { id: 'zoom_focus_rings', label: 'Zoom & Manual Focus Rubber Rings', subtext: 'Smooth ring rotation without stickiness, slipping, or rubber swelling', deductionPct: 8 },
        { id: 'ois', label: 'Optical Image Stabilization (IS/VR/OIS)', subtext: 'Smooth optical stabilizer engagement without vibration or rattling', deductionPct: 8 },
        { id: 'weather_seal', label: 'Rubber Weather-Sealing Gasket', subtext: 'Intact rubber gasket seal on mount without tears or dry rot', deductionPct: 4 },
      ],
      photoAngles: [
        { id: 'front_element', label: 'Front Glass Element', desc: 'Direct view into front glass under light' },
        { id: 'rear_mount', label: 'Rear Mount & Contacts', desc: 'Metal bayonet flange & gold pins' },
        { id: 'aperture', label: 'Aperture Blades Open', desc: 'Looking through internal barrel' },
        { id: 'zoom_ring', label: 'Zoom & Focus Rings', desc: 'Rubber grip condition & markings' },
        { id: 'side_barrel', label: 'Full Side Profile', desc: 'Switches (AF/MF, Stabilizer)' },
        { id: 'serial_plate', label: 'Lens Serial Number S/N', desc: 'Base or barrel engraved S/N' },
      ],
    };
  }

  if (name.includes('dslr') || name.includes('eos') || name.includes('alpha') || name.includes('lumix') || name.includes('fujifilm') || name.includes('nikon z') || name.includes('mirrorless') || name.includes('camera') || name.includes('fx3') || name.includes('a7')) {
    return {
      type: 'dslr',
      label: 'DSLR / Mirrorless Camera',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      idLabel: 'Camera Serial Number (S/N)',
      idPlaceholder: 'e.g. 042021008741 (Check baseplate)',
      items: [
        { id: 'sensor', label: 'Full-Frame/APS-C CMOS Sensor', subtext: 'Clean sensor filter, zero scratch, no dead/stuck hot pixels', deductionPct: 25 },
        { id: 'shutter', label: 'Mechanical & Electronic Shutter', subtext: 'Clean curtain, verified shutter count < 50k clicks, high-speed burst', deductionPct: 15 },
        { id: 'mount_contacts', label: 'Lens Mount & Electronic Pins', subtext: 'Solid bayonet lock, gold electronic contacts communicating properly', deductionPct: 12 },
        { id: 'evf_lcd', label: 'EVF Viewfinder & Swivel LCD Screen', subtext: 'Crisp OLED viewfinder, fully articulating touchscreen, no dead pixels', deductionPct: 12 },
        { id: 'dials_buttons', label: 'Mode Dials, Joy-Stick & Shutter Button', subtext: 'Tactile clicks, scroll wheels, responsive two-stage shutter release', deductionPct: 8 },
        { id: 'card_slots', label: 'Dual Card Slots (CFexpress / SD UHS-II)', subtext: 'Smooth spring ejection, fast continuous write speeds without read errors', deductionPct: 8 },
        { id: 'battery_chamber', label: 'Battery Chamber & Weather-Sealed Door', subtext: 'Clean terminal pins, secure latch lock without corrosion', deductionPct: 6 },
        { id: 'ports_hdmi', label: 'Full-Size HDMI, Type-C & Mic Ports', subtext: 'Clean unbent ports with rubber weather covers intact', deductionPct: 6 },
        { id: 'ibis', label: 'In-Body Image Stabilization (IBIS 5-Axis)', subtext: 'Sensor floats smoothly with zero mechanical grinding on pan/tilt', deductionPct: 8 },
      ],
      photoAngles: [
        { id: 'sensor_exposed', label: 'Sensor Exposed (Cap Off)', desc: 'Sensor filter showing zero dust/scratches' },
        { id: 'rear_lcd', label: 'Rear LCD Lit Screen', desc: 'Display on showing menu & live-view' },
        { id: 'evf_viewfinder', label: 'EVF & Top Mode Dials', desc: 'Top deck, shutter button, PASM dial' },
        { id: 'battery_door', label: 'Battery Door & Chamber', desc: 'Open battery door & terminal pins' },
        { id: 'ports_bay', label: 'Side Connectivity Ports', desc: 'HDMI, USB-C, Headphone & Mic jacks' },
        { id: 'serial_plate', label: 'Bottom Serial Plate S/N', desc: 'Model name & serial number sticker' },
      ],
    };
  }

  if (name.includes('macbook') || name.includes('laptop') || name.includes('dell') || name.includes('thinkpad') || name.includes('hp ') || name.includes('lenovo') || name.includes('notebook')) {
    return {
      type: 'laptop',
      label: 'Laptop / MacBook',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      idLabel: 'Laptop Serial Number (S/N)',
      idPlaceholder: 'e.g. C02G41ABMD6M (Check bottom case / About Mac)',
      items: [
        { id: 'screen_hinge', label: 'Retina Screen & Hinge Tension', subtext: 'Zero anti-reflective delamination, no dead pixels, smooth hinge movement', deductionPct: 25 },
        { id: 'keyboard_keys', label: 'Keyboard & Individual Key Travel', subtext: 'All keys click evenly with functional backlight & zero sticky keys', deductionPct: 15 },
        { id: 'trackpad', label: 'Precision Force Touch Trackpad', subtext: 'Accurate haptic click, gesture tracking, no surface cracks', deductionPct: 10 },
        { id: 'battery_cycles', label: 'Battery Health & Cycle Count', subtext: 'Battery health > 80%, low cycle count, no swollen chassis', deductionPct: 15 },
        { id: 'cooling_thermals', label: 'Motherboard & Dual Cooling Fans', subtext: 'Silent fans under load, zero thermal throttling, fast boot', deductionPct: 12 },
        { id: 'thunderbolt_ports', label: 'Thunderbolt / USB-C & MagSafe Ports', subtext: 'High-speed data transfer, video output & fast charging verified', deductionPct: 10 },
        { id: 'speakers_webcam', label: 'Studio Speakers & HD Webcam', subtext: 'Deep stereo bass with no crackling, clear camera & mic pickup', deductionPct: 8 },
        { id: 'chassis_shell', label: 'Aluminum Shell & Corner Edges', subtext: 'No corner drops, dents, bent chassis, rubber feet intact', deductionPct: 8 },
      ],
      photoAngles: [
        { id: 'screen_on', label: 'Display Screen On', desc: 'White screen showing brightness & uniformity' },
        { id: 'keyboard', label: 'Keyboard & Trackpad', desc: 'Keycaps, palm rests, and trackpad' },
        { id: 'top_lid', label: 'Top Clamshell Lid', desc: 'Apple logo / brand lid surface' },
        { id: 'bottom_base', label: 'Bottom Base Plate', desc: 'Serial number engraving & rubber feet' },
        { id: 'ports_left_right', label: 'Left & Right Ports', desc: 'USB-C / MagSafe / HDMI ports' },
        { id: 'power_brick', label: 'Charger & Original Cable', desc: 'Power adapter & braided cable' },
      ],
    };
  }

  if (name.includes('ipad') || name.includes('tablet') || name.includes('galaxy tab')) {
    return {
      type: 'tablet',
      label: 'Tablet / iPad',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      idLabel: 'Tablet Serial / IMEI Number',
      idPlaceholder: 'e.g. DMQX429XNR (Settings > General > About)',
      items: [
        { id: 'touch_digitizer', label: 'Display Digitizer & Stylus Pressure', subtext: 'Smooth touch across entire screen with accurate stylus pressure tracking', deductionPct: 25 },
        { id: 'frame_straightness', label: 'Frame Straightness (Zero Bend)', subtext: 'Body is 100% straight and flat when placed on a flat desk', deductionPct: 15 },
        { id: 'battery_health', label: 'Battery Health & Standby Backup', subtext: 'Holds strong charge with no rapid battery drops', deductionPct: 12 },
        { id: 'face_touch_id', label: 'Face ID / Touch ID Biometrics', subtext: 'Instant biometric unlocking in landscape and portrait orientation', deductionPct: 12 },
        { id: 'quad_speakers', label: 'Quad Stereo Speakers & Microphones', subtext: 'Crisp audio from all speaker grills with no distortion', deductionPct: 8 },
        { id: 'smart_connector', label: 'Smart Connector & Magnetic Rails', subtext: 'Keyboard connection pins and stylus magnetic charging work instantly', deductionPct: 8 },
        { id: 'cameras_lidar', label: 'Front, Rear & LiDAR Depth Cameras', subtext: 'Center Stage front camera, flash, and rear camera focus', deductionPct: 8 },
      ],
      photoAngles: [
        { id: 'front_screen', label: 'Front Display Lit', desc: 'Screen on showing home screen' },
        { id: 'back_panel', label: 'Back Metal Panel', desc: 'Camera bump & magnetic rail' },
        { id: 'edge_straight', label: 'Frame Flatness Edge', desc: 'Side edge showing zero bend' },
        { id: 'charging_port', label: 'USB-C Charging Port', desc: 'Bottom port & speaker grills' },
        { id: 'stylus_rail', label: 'Stylus Charging Strip', desc: 'Magnetic edge for Apple Pencil' },
        { id: 'serial_about', label: 'Settings > About Screen', desc: 'Model name & serial number' },
      ],
    };
  }

  // Default: Smartphone
  return {
    type: 'smartphone',
    label: 'Smartphone',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    idLabel: '15-Digit IMEI Number',
    idPlaceholder: 'e.g. 354892091827402 (Dial *#06#)',
    items: [
      { id: 'display', label: 'OLED / Display & Touchscreen', subtext: 'Zero cracks, dead pixels, lines, or ghost touch', deductionPct: 25 },
      { id: 'body', label: 'Body & Frame Condition', subtext: 'No dents, deep scratches, bent frame, or back glass crack', deductionPct: 12 },
      { id: 'camera', label: 'Front & Multi Rear Cameras', subtext: 'Crisp autofocus, optical zoom, clean lens covers', deductionPct: 15 },
      { id: 'battery', label: 'Battery Health & Fast Charging', subtext: 'Battery health percentage > 80%, fast charging detected', deductionPct: 10 },
      { id: 'faceid', label: 'Biometrics (Face ID / Fingerprint)', subtext: 'Face ID or In-display fingerprint sensor responsiveness', deductionPct: 12 },
      { id: 'charging', label: 'Charging & USB-C Port', subtext: 'Tight connector fit, data sync and OTG support', deductionPct: 8 },
      { id: 'speaker', label: 'Stereo Speakers & Earpiece', subtext: 'Clear calling volume, noise cancellation mics', deductionPct: 6 },
      { id: 'wireless', label: '5G Wi-Fi, Bluetooth & NFC', subtext: 'Instant pairing, contactless payment NFC antenna', deductionPct: 6 },
      { id: 'network', label: 'Cellular SIM & Antennas', subtext: 'Strong 5G reception on both SIM slots', deductionPct: 10 },
      { id: 'water', label: 'Liquid Damage Check (LDI)', subtext: 'White moisture sticker, no water ingress corrosion', deductionPct: 20 },
    ],
    photoAngles: [
      { id: 'front', label: 'Front Display (Screen On)', desc: 'Display with white background' },
      { id: 'back', label: 'Back Panel & Cameras', desc: 'Back glass & camera island' },
      { id: 'left', label: 'Left Side & SIM Tray', desc: 'Left edge & volume buttons' },
      { id: 'right', label: 'Right Side & Power', desc: 'Right edge & power button' },
      { id: 'ports', label: 'Bottom Port & Speakers', desc: 'Charging port & speaker grilles' },
      { id: 'imei_label', label: 'IMEI / Serial Screen', desc: 'Settings > About screen or *#06#' },
    ],
  };
}

const getInspectionOrders = (partnerId?: string): Order[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('casmik_partner_orders_v1') || localStorage.getItem('casmik_orders_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((o: Order) => !partnerId || o.partnerId === partnerId || o.assignedPartnerId === partnerId);
        }
      }
    } catch {}
  }
  return [];
};

interface PartnerInspectionProps {
  initialOrderId?: string | null;
  onBackToOrders?: () => void;
  partner?: any;
}

export default function PartnerInspection({ initialOrderId, onBackToOrders, partner }: PartnerInspectionProps) {
  const currentPartnerId = partner?.id || '';
  const [ordersList, setOrdersList] = useState<Order[]>(() => getInspectionOrders(currentPartnerId));
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [inspectionResults, setInspectionResults] = useState<Record<string, 'pass' | 'fail' | 'na'>>({});
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [activePhotoModal, setActivePhotoModal] = useState<{ label: string; url: string } | null>(null);
  const [customPriceOverride, setCustomPriceOverride] = useState<string>('');
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [imei, setImei] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const multiFileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Category QA Config
  const categoryConfig = React.useMemo(() => getInspectionCategory(selectedOrder), [selectedOrder]);

  // Fetch real orders from API
  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?partnerId=${currentPartnerId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders) && isMounted) {
            const matched = data.orders.filter((o: Order) => 
              !currentPartnerId || o.partnerId === currentPartnerId || o.assignedPartnerId === currentPartnerId
            );
            setOrdersList(matched);

            const targetId = initialOrderId || (typeof window !== 'undefined' ? localStorage.getItem('casmik_active_inspection_id') : null);
            if (targetId) {
              const match = matched.find((o: Order) => o.id === targetId || o.orderNumber === targetId);
              if (match) {
                setSelectedOrder(match);
                return;
              }
            }
            if (!selectedOrder && matched.length > 0) {
              setSelectedOrder(matched[0]);
            }
          }
        }
      } catch (err) {
        console.warn('Inspection orders fetch error:', err);
      }
    };

    fetchOrders();

    window.addEventListener('casmik_orders_updated', fetchOrders);
    window.addEventListener('casmik_partner_orders_updated', fetchOrders);

    return () => {
      isMounted = false;
      window.removeEventListener('casmik_orders_updated', fetchOrders);
      window.removeEventListener('casmik_partner_orders_updated', fetchOrders);
    };
  }, [currentPartnerId, initialOrderId]);

  // Handle image capture / upload for a specific angle
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

  // Handle bulk multi-photo upload
  const handleMultiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const angles = categoryConfig.photoAngles;
    Array.from(files).forEach((file, idx) => {
      const unassignedAngle = angles.find(a => !photos[a.id]) || angles[idx % angles.length];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(prev => ({
            ...prev,
            [unassignedAngle.id]: event.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (angleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos(prev => {
      const copy = { ...prev };
      delete copy[angleId];
      return copy;
    });
  };

  // Checklist handler
  const handleResult = (itemId: string, result: 'pass' | 'fail' | 'na') => {
    setInspectionResults(prev => ({ ...prev, [itemId]: result }));
  };

  // Scoring and dynamic price calculations
  const total = categoryConfig.items.length;
  const passedCount = Object.values(inspectionResults).filter(v => v === 'pass').length;
  const failedCount = Object.values(inspectionResults).filter(v => v === 'fail').length;
  const scorePercent = total > 0 ? Math.round((passedCount / total) * 100) : 100;

  const quotedPrice = selectedOrder?.quotedPrice || 0;

  // Calculate deductions based on failed checklist items
  const failedItems = categoryConfig.items.filter(item => inspectionResults[item.id] === 'fail');
  const totalDeductionPct = Math.min(
    failedItems.reduce((acc, item) => acc + item.deductionPct, 0),
    75 // Cap max deduction at 75% so scrap floor is 25%
  );

  const totalDeductionAmount = Math.round(quotedPrice * (totalDeductionPct / 100));
  const calculatedExactPayout = Math.max(
    Math.round(quotedPrice - totalDeductionAmount),
    Math.round(quotedPrice * 0.25)
  );

  const finalPayoutToUser = isCustomPrice && customPriceOverride
    ? parseInt(customPriceOverride, 10) || calculatedExactPayout
    : calculatedExactPayout;

  const [payoutDisbursed, setPayoutDisbursed] = useState(false);
  const isAllocatedToRider = Boolean(selectedOrder?.deliveryAgentId);

  const handleSubmit = async () => {
    if (!selectedOrder) return;
    if (selectedOrder.deliveryAgentId) {
      alert(`Diagnostics Locked: Order ${selectedOrder.orderNumber} is assigned to Delivery Executive ${selectedOrder.deliveryAgentName || 'Rider'}. Only the delivery executive can perform diagnostics.`);
      return;
    }
    const updatedOrder: Order = {
      ...selectedOrder,
      finalPrice: finalPayoutToUser,
      inspectionScore: scorePercent,
      deviceImei: imei.trim() || selectedOrder.deviceImei || null,
      status: 'inspection', // Ready for payout: updated inspection price will appear on order page
      paymentStatus: 'pending',
      notes: notes || selectedOrder.notes,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        const partnerOrders = localStorage.getItem('casmik_partner_orders_v1');
        if (partnerOrders) {
          const list = JSON.parse(partnerOrders);
          if (Array.isArray(list)) {
            const updated = list.map((o: Order) => o.id === selectedOrder.id ? updatedOrder : o);
            localStorage.setItem('casmik_partner_orders_v1', JSON.stringify(updated));
          }
        }
        const globalOrders = localStorage.getItem('casmik_orders_v1');
        if (globalOrders) {
          const list = JSON.parse(globalOrders);
          if (Array.isArray(list)) {
            const updated = list.map((o: Order) => o.id === selectedOrder.id ? updatedOrder : o);
            localStorage.setItem('casmik_orders_v1', JSON.stringify(updated));
          }
        }
        window.dispatchEvent(new Event('casmik_orders_updated'));
        window.dispatchEvent(new Event('casmik_partner_orders_updated'));
      } catch {}
    }

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOrder.id,
          orderNumber: selectedOrder.orderNumber,
          status: 'inspection',
          finalPrice: finalPayoutToUser,
          inspectionScore: scorePercent,
          deviceImei: imei.trim() || undefined,
          notes: updatedOrder.notes
        })
      });
    } catch {}

    triggerNotification({
      type: 'status_update',
      targetRole: 'all',
      title: '🔍 Device Inspected by Partner',
      shortDetails: `Partner finalized 12-point inspection score (${scorePercent}%) for ${selectedOrder.orderNumber}. Price: ₹${finalPayoutToUser.toLocaleString('en-IN')}`,
      orderId: selectedOrder.id,
      orderNumber: selectedOrder.orderNumber,
      deviceName: selectedOrder.deviceName,
      customerName: selectedOrder.customerName,
      status: 'inspection'
    });

    setSubmitted(true);
    setPayoutDisbursed(false);
  };

  const handleInstantPayout = async () => {
    if (!selectedOrder) return;
    if (selectedOrder.deliveryAgentId) {
      alert(`Diagnostics & Payout Locked: Order ${selectedOrder.orderNumber} is assigned to Delivery Executive ${selectedOrder.deliveryAgentName || 'Rider'}.`);
      return;
    }
    const completedOrder: Order = {
      ...selectedOrder,
      finalPrice: finalPayoutToUser,
      inspectionScore: scorePercent,
      deviceImei: imei.trim() || selectedOrder.deviceImei || null,
      status: 'completed', // Shifts to completed after payout
      paymentStatus: 'paid',
      notes: `${notes || selectedOrder.notes || ''} [Partner Spot Payout Disbursed: ₹${finalPayoutToUser.toLocaleString('en-IN')}]`.trim(),
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        const partnerOrders = localStorage.getItem('casmik_partner_orders_v1');
        if (partnerOrders) {
          const list = JSON.parse(partnerOrders);
          if (Array.isArray(list)) {
            const updated = list.map((o: Order) => o.id === selectedOrder.id ? completedOrder : o);
            localStorage.setItem('casmik_partner_orders_v1', JSON.stringify(updated));
          }
        }
        const globalOrders = localStorage.getItem('casmik_orders_v1');
        if (globalOrders) {
          const list = JSON.parse(globalOrders);
          if (Array.isArray(list)) {
            const updated = list.map((o: Order) => o.id === selectedOrder.id ? completedOrder : o);
            localStorage.setItem('casmik_orders_v1', JSON.stringify(updated));
          }
        }
        window.dispatchEvent(new Event('casmik_orders_updated'));
        window.dispatchEvent(new Event('casmik_partner_orders_updated'));
      } catch {}
    }

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOrder.id,
          orderNumber: selectedOrder.orderNumber,
          status: 'completed',
          paymentStatus: 'paid',
          finalPrice: finalPayoutToUser,
          inspectionScore: scorePercent,
          notes: completedOrder.notes
        })
      });
    } catch {}

    triggerNotification({
      type: 'status_update',
      targetRole: 'all',
      title: '✅ Partner Payout Disbursed & Order Completed',
      shortDetails: `Partner completed order ${selectedOrder.orderNumber} (${selectedOrder.deviceName}) & disbursed spot payout ₹${finalPayoutToUser.toLocaleString('en-IN')}.`,
      orderId: selectedOrder.id,
      orderNumber: selectedOrder.orderNumber,
      deviceName: selectedOrder.deviceName,
      customerName: selectedOrder.customerName,
      status: 'completed'
    });

    setPayoutDisbursed(true);
  };

  // Orders available for inspection
  const displayOrders = ordersList.filter(o =>
    ['inspection', 'accepted', 'picked_up'].includes(o.status) || o.id === selectedOrder?.id
  );
  const ordersToShow = displayOrders.length > 0 ? displayOrders : ordersList;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-xl mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-sm font-sans">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner ${
          payoutDisbursed ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
        }`}>
          <CheckCircle size={44} />
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 ${
          payoutDisbursed ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {payoutDisbursed ? 'Order Completed & Locked' : 'Inspection Completed · Price Locked'}
        </span>
        <h2 className="text-2xl font-black text-gray-900 mb-1">
          {payoutDisbursed ? 'Payout Complete & Order Finalized!' : 'Inspection Report Generated!'}
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Device: <strong>{selectedOrder?.deviceName}</strong> ({selectedOrder?.orderNumber})
        </p>

        {/* Payout Card */}
        <div className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-5 mb-5 text-left shadow-lg">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-emerald-200 uppercase font-bold tracking-wider">
              {payoutDisbursed ? 'Disbursed Payout' : 'Exact Payout to Customer'}
            </span>
            <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-md">Score: {scorePercent}%</span>
          </div>
          <p className="text-3xl font-black">₹{finalPayoutToUser.toLocaleString('en-IN')}</p>
          <div className="mt-3 pt-2.5 border-t border-white/20 text-xs flex justify-between text-emerald-100">
            <span>Original Quote: ₹{quotedPrice.toLocaleString('en-IN')}</span>
            <span>Total Deductions: -₹{totalDeductionAmount.toLocaleString('en-IN')} ({totalDeductionPct}%)</span>
          </div>
        </div>

        {payoutDisbursed ? (
          <div className="w-full p-4 bg-emerald-50 border border-emerald-300 rounded-2xl mb-6 text-left">
            <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
              Order Shifted to Completed (Permanently Locked)
            </p>
            <p className="text-xs text-emerald-800 mt-1">
              The payout of ₹{finalPayoutToUser.toLocaleString('en-IN')} has been disbursed and verified. This order cannot be reverted or changed.
            </p>
          </div>
        ) : (
          <div className="w-full space-y-3 mb-6">
            <button
              onClick={handleInstantPayout}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              💳 Disburse Spot Payout Now (₹{finalPayoutToUser.toLocaleString('en-IN')}) &amp; Complete Order
            </button>
            <p className="text-xs text-gray-500">
              Or return to Orders to disburse payout later. The updated price is now active on the order card.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 w-full">
          {onBackToOrders && (
            <button
              onClick={onBackToOrders}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              &larr; Back to Orders Management
            </button>
          )}
          <button
            onClick={() => {
              setSubmitted(false);
              setPayoutDisbursed(false);
              setInspectionResults({});
              setPhotos({});
              setIsCustomPrice(false);
              setCustomPriceOverride('');
            }}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Inspect Next Device
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto font-sans">
      {/* Page Title & Device Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            Device Inspection Hub
            {selectedOrder && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                {selectedOrder.orderNumber}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Evaluate device condition, capture mandatory photos, and calculate exact live customer payout.
          </p>
        </div>

        {onBackToOrders && (
          <button
            onClick={onBackToOrders}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm transition-all self-start sm:self-auto"
          >
            <ArrowLeft size={14} /> Back to Orders
          </button>
        )}
      </div>

      {/* Device Picker Bar */}
      {ordersToShow.length > 0 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
          {ordersToShow.map((order) => {
            const isSelected = selectedOrder?.id === order.id;
            return (
              <button
                key={order.id}
                onClick={() => {
                  setSelectedOrder(order);
                  setInspectionResults({});
                  setPhotos({});
                  setIsCustomPrice(false);
                }}
                className={`p-3 rounded-2xl text-left border flex-shrink-0 transition-all min-w-[210px] ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-gray-500">{order.orderNumber}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${getOrderStatusColor(order.status)}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-900 truncate">{order.deviceName}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Quote: ₹{order.quotedPrice.toLocaleString('en-IN')}</p>
              </button>
            );
          })}
        </div>
      )}

      {selectedOrder && isAllocatedToRider && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center flex-shrink-0">
              <Lock size={20} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-black text-amber-950">
                  Diagnostics &amp; Status Locked (Assigned to Delivery Rider)
                </h3>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 uppercase tracking-wider">
                  Managed by Rider
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1.5 leading-relaxed">
                You have allocated this order to Delivery Executive <strong>{selectedOrder.deliveryAgentName || 'Rider'}</strong> ({selectedOrder.deliveryAgentPhone || 'Rider'}).
                Per company policy, doorstep diagnostic, 12-point hardware checklist, and order status updates are restricted to the delivery rider. Any inspection score and status updates made by the rider will sync here in real time.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-amber-900">
                <span className="px-2.5 py-1 bg-white/80 rounded-lg border border-amber-200">
                  Current Status: <strong className="capitalize text-slate-900">{selectedOrder.status.replace(/_/g, ' ')}</strong>
                </span>
                {selectedOrder.inspectionScore != null && (
                  <span className="px-2.5 py-1 bg-white/80 rounded-lg border border-amber-200">
                    Rider Score: <strong className="text-emerald-700">{selectedOrder.inspectionScore}%</strong>
                  </span>
                )}
                {selectedOrder.finalPrice ? (
                  <span className="px-2.5 py-1 bg-white/80 rounded-lg border border-amber-200">
                    Rider Payout: <strong className="text-emerald-700">₹{selectedOrder.finalPrice.toLocaleString('en-IN')}</strong>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (Checklist & Condition) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Device Info & Live Score */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className={`inline-block text-[11px] font-black px-2.5 py-0.5 rounded-lg border uppercase tracking-wider mb-1 ${categoryConfig.badgeColor}`}>
                    {categoryConfig.label}
                  </span>
                  <p className="text-base font-black text-gray-900">{selectedOrder.deviceName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Customer: <strong>{selectedOrder.customerName}</strong> ({selectedOrder.customerPhone})</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase">Condition Score</p>
                  <p className={`text-2xl font-black ${
                    scorePercent >= 80 ? 'text-emerald-600' : scorePercent >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {scorePercent}%
                  </p>
                </div>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    scorePercent >= 80 ? 'bg-emerald-500' : scorePercent >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
            </div>

            {/* Category Identification / IMEI / Serial Input */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                {categoryConfig.idLabel} *
              </label>
              <input
                value={imei}
                onChange={e => setImei(e.target.value)}
                placeholder={categoryConfig.idPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
              />
            </div>

            {/* Inspection Checklist Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{categoryConfig.label} QA Checklist</h3>
                  <p className="text-[11px] text-gray-400">Select Pass or Fail. Failed items automatically deduct value.</p>
                </div>
                <span className="text-xs font-bold text-gray-500">
                  {passedCount} Passed &bull; {failedCount} Failed
                </span>
              </div>

              <div className="divide-y divide-gray-50">
                {categoryConfig.items.map((item) => {
                  const result = inspectionResults[item.id];
                  const isFailed = result === 'fail';
                  const deductionAmt = Math.round(quotedPrice * (item.deductionPct / 100));

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 transition-colors ${
                        isFailed ? 'bg-red-50/40' : result === 'pass' ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <div className="pr-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-gray-900">{item.label}</p>
                          {isFailed && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                              -{item.deductionPct}% (-₹{deductionAmt.toLocaleString('en-IN')})
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.subtext}</p>
                      </div>

                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleResult(item.id, 'pass')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            result === 'pass'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700'
                          }`}
                        >
                          <CheckCircle size={13} /> Pass
                        </button>
                        <button
                          onClick={() => handleResult(item.id, 'fail')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            result === 'fail'
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                          }`}
                        >
                          <XCircle size={13} /> Fail
                        </button>
                        <button
                          onClick={() => handleResult(item.id, 'na')}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            result === 'na'
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Technician / Inspection Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Mention screen scratches, battery health %, or customer conversation details..."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Right Column (Photos & Dynamic Payout Card) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* EXACT LIVE PAYOUT CARD (Calculated according to answers) */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-[#0a101f] text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> Live Valuation Payout
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold">
                  {failedCount === 0 ? 'Pristine 100%' : `${failedCount} Deductions`}
                </span>
              </div>

              {/* Exact Price Highlight */}
              <div className="my-4 relative z-10">
                <p className="text-xs text-slate-400 font-semibold">Exact Payout to User:</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl sm:text-4xl font-black text-white">
                    ₹{finalPayoutToUser.toLocaleString('en-IN')}
                  </p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Calculated
                  </span>
                </div>
              </div>

              {/* Deduction Breakdown */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs relative z-10">
                <div className="flex justify-between text-slate-300">
                  <span>Initial Estimated Quote:</span>
                  <span className="font-bold text-white">₹{quotedPrice.toLocaleString('en-IN')}</span>
                </div>

                {failedItems.length > 0 ? (
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <p className="text-[11px] font-bold text-red-400 uppercase">Condition Deductions ({totalDeductionPct}%):</p>
                    {failedItems.map(item => (
                      <div key={item.id} className="flex justify-between text-[11px] text-slate-400">
                        <span>&bull; {item.label}:</span>
                        <span className="text-red-400 font-bold">
                          -₹{Math.round(quotedPrice * (item.deductionPct / 100)).toLocaleString('en-IN')} ({item.deductionPct}%)
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-bold text-red-300 pt-1 border-t border-white/10">
                      <span>Total Deduction Amount:</span>
                      <span>-₹{totalDeductionAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-400 font-bold pt-1">
                    ✓ All tests passed! Customer receives full 100% quoted payout.
                  </p>
                )}
              </div>

              {/* Custom Override Option */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs relative z-10">
                <button
                  type="button"
                  onClick={() => setIsCustomPrice(!isCustomPrice)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mb-2"
                >
                  <SlidersHorizontal size={12} />
                  {isCustomPrice ? 'Use Algorithm Calculated Price' : 'Override with Custom Negotiated Payout'}
                </button>

                {isCustomPrice && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-slate-400">₹</span>
                    <input
                      type="number"
                      value={customPriceOverride}
                      onChange={(e) => setCustomPriceOverride(e.target.value)}
                      placeholder={calculatedExactPayout.toString()}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Device Photos Upload Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Device Inspection Photos</h3>
                  <p className="text-[11px] text-gray-400">Click any box to take a photo or upload from device</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {Object.keys(photos).length} / {categoryConfig.photoAngles.length} Photos
                </span>
              </div>

              {/* Hidden file input for multi-upload */}
              <input
                type="file"
                ref={multiFileInputRef}
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleMultiUpload}
              />

              {/* Photos Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {categoryConfig.photoAngles.map((angle) => {
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
                      className={`relative aspect-square rounded-2xl border-2 transition-all cursor-pointer overflow-hidden group flex flex-col items-center justify-center p-2 text-center ${
                        hasPhoto
                          ? 'border-emerald-500 bg-black/5 shadow-sm'
                          : 'border-dashed border-gray-200 hover:border-primary hover:bg-primary/5'
                      }`}
                      title={hasPhoto ? 'Click to inspect photo' : `Click to take or upload ${angle.label}`}
                    >
                      {/* Hidden individual file input with camera capture */}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        ref={el => { fileInputRefs.current[angle.id] = el; }}
                        onChange={(e) => handlePhotoCapture(angle.id, e)}
                      />

                      {hasPhoto ? (
                        <>
                          <img
                            src={photos[angle.id]}
                            alt={angle.label}
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePhotoModal({ label: angle.label, url: photos[angle.id] });
                              }}
                              className="w-8 h-8 rounded-lg bg-white/90 text-gray-900 flex items-center justify-center hover:scale-110 shadow-sm transition-transform"
                              title="Zoom Preview"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRefs.current[angle.id]?.click();
                              }}
                              className="w-8 h-8 rounded-lg bg-white/90 text-primary flex items-center justify-center hover:scale-110 shadow-sm transition-transform"
                              title="Retake Photo"
                            >
                              <RefreshCw size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleRemovePhoto(angle.id, e)}
                              className="w-8 h-8 rounded-lg bg-white/90 text-red-600 flex items-center justify-center hover:scale-110 shadow-sm transition-transform"
                              title="Remove Photo"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <span className="absolute top-2 right-2 text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow">
                            <CheckCircle2 size={10} /> Captured
                          </span>
                          <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded truncate backdrop-blur-xs">
                            {angle.label}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-primary/10 group-hover:text-primary text-gray-400 flex items-center justify-center transition-colors mb-1">
                            <Camera size={20} />
                          </div>
                          <span className="text-[11px] font-bold text-gray-700 group-hover:text-primary transition-colors leading-tight">
                            {angle.label}
                          </span>
                          <span className="text-[9px] text-gray-400 mt-0.5">Tap to Capture</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Multi-Photo Upload Button */}
              <button
                type="button"
                onClick={() => multiFileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors shadow-sm"
              >
                <Upload size={14} /> Upload Multiple Photos at Once
              </button>
            </div>

            {/* Final Submission Button */}
            <button
              onClick={handleSubmit}
              disabled={isAllocatedToRider || Object.keys(inspectionResults).length < 4}
              className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
                isAllocatedToRider
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300 shadow-none'
                  : 'bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-primary/25 hover:scale-[1.01]'
              }`}
            >
              {isAllocatedToRider ? <Lock size={18} /> : <Zap size={18} />}
              <span>{isAllocatedToRider ? 'Locked: Diagnostics Handled by Delivery Rider' : `Confirm & Lock Payout (₹${finalPayoutToUser.toLocaleString('en-IN')})`}</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              {isAllocatedToRider 
                ? 'This order is assigned to delivery personnel. Inspection scoring and completion must be carried out by the rider.'
                : 'Completing inspection locks the payout and updates order status for instant spot IMPS/UPI transfer.'}
            </p>
          </div>

        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <ClipboardCheck size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-700 font-bold text-base">No device selected for inspection</p>
          <p className="text-xs text-gray-400 mt-1">Please select an assigned order from above or from the orders list</p>
        </div>
      )}

      {/* Photo Preview Lightbox Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h4 className="font-bold text-sm text-gray-900">{activePhotoModal.label}</h4>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={activePhotoModal.url}
                alt={activePhotoModal.label}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>
            <div className="p-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setActivePhotoModal(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
