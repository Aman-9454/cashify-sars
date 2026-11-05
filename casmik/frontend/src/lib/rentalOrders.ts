import { Order, OrderStatus } from './casmikData';
import { CustomerOrderRecord, saveCustomerOrder } from './auth';
import { triggerNotification } from './notifications';
import { RentalCamera } from './rentalCatalog';

export interface RentalBookingInput {
  camera: RentalCamera;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  city: string;
  pincode: string;
  rentalDays: number;
  startDate: string;
  endDate: string;
  shootType?: string;
  idProofType?: string;
  idProofNumber?: string;
  deliveryMethod?: 'doorstep' | 'store_pickup';
  paymentMethod: 'UPI' | 'Card' | 'COD' | 'Advance20';
  notes?: string;
  dailyRate: number;
  discountAmount: number;
  rentalSubtotal: number;
  securityDeposit: number;
  grandTotal: number;
}

const RENTAL_ORDERS_STORAGE_KEY = 'casmik_rental_orders_v1';
const ALL_ORDERS_STORAGE_KEY = 'casmik_orders_v1';

export function getRentalOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RENTAL_ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    // Fallback: filter from all orders where type === 'rent'
    const allRaw = localStorage.getItem(ALL_ORDERS_STORAGE_KEY);
    if (allRaw) {
      const all = JSON.parse(allRaw);
      if (Array.isArray(all)) {
        return all.filter((o) => (o.type as string) === 'rent');
      }
    }
  } catch (e) {
    console.error('Error fetching rental orders:', e);
  }
  return [];
}

export function saveRentalOrder(input: RentalBookingInput): Order {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const orderNumber = `CAM-RNT-${randomSuffix}`;
  const orderId = `rnt-${Date.now()}-${randomSuffix}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    type: 'rent' as any,
    status: 'created',
    customerId: '',
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail || '',
    customerAddress: input.customerAddress,
    pinCode: input.pincode,
    city: input.city,
    deviceName: input.camera.model,
    deviceBrand: input.camera.brand,
    deviceModel: input.camera.model,
    deviceStorage: `${input.rentalDays} Days Rental`,
    deviceColor: input.camera.category,
    quotedPrice: input.grandTotal,
    finalPrice: input.grandTotal,
    partnerId: null,
    partnerName: null,
    deliveryAgentId: null,
    deliveryAgentName: null,
    pickupDate: input.startDate,
    pickupSlot: 'Morning (09:00 AM - 12:00 PM)',
    createdAt: now,
    updatedAt: now,
    paymentStatus: input.paymentMethod === 'COD' ? 'pending' : 'paid',
    inspectionScore: 100,
    notes: `[RENTAL CAMERA BOOKING]
Dates: ${input.startDate} to ${input.endDate} (${input.rentalDays} Days)
Daily Rate: ₹${input.dailyRate}/day | Deposit: ₹${input.securityDeposit}
Subtotal: ₹${input.rentalSubtotal} | Grand Total: ₹${input.grandTotal}
Shoot: ${input.shootType || 'Professional Shoot'} | ID Proof: ${input.idProofType || 'Aadhaar Card'}
Delivery: ${input.deliveryMethod === 'store_pickup' ? 'Studio Self Pickup' : 'Free Insured Doorstep Delivery'}
Payment: ${input.paymentMethod}
Kit Included: ${input.camera.includedKit.slice(0, 3).join(', ')}...`,
  };

  if (typeof window !== 'undefined') {
    // 1. Save to casmik_rental_orders_v1
    try {
      const existing = getRentalOrders();
      const updatedRentals = [newOrder, ...existing.filter((o) => o.id !== newOrder.id)];
      localStorage.setItem(RENTAL_ORDERS_STORAGE_KEY, JSON.stringify(updatedRentals));
    } catch (e) {
      console.error('Failed saving rental order:', e);
    }

    // 2. Save into unified casmik_orders_v1 so Admin Orders table & Live Tracker sees it immediately
    try {
      const rawAll = localStorage.getItem(ALL_ORDERS_STORAGE_KEY);
      let allOrders: Order[] = rawAll ? JSON.parse(rawAll) : [];
      if (!Array.isArray(allOrders)) allOrders = [];
      const updatedAll = [newOrder, ...allOrders.filter((o) => o.id !== newOrder.id)];
      localStorage.setItem(ALL_ORDERS_STORAGE_KEY, JSON.stringify(updatedAll));
    } catch (e) {
      console.error('Failed updating all orders with rental:', e);
    }

    // 3. Save into customer orders database so My Orders displays it
    try {
      const customerRecord: CustomerOrderRecord = {
        id: orderId,
        orderNumber,
        type: 'rent' as any,
        status: 'created',
        createdAt: now,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress,
        city: input.city,
        pincode: input.pincode,
        pickupDate: input.startDate,
        pickupSlot: 'Insured Delivery',
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === 'COD' ? 'pay_on_delivery' : 'paid',
        newDevice: {
          id: input.camera.id,
          brand: input.camera.brand,
          model: `${input.camera.model} (${input.rentalDays} Days Rental)`,
          storage: `${input.rentalDays} Days`,
          color: input.camera.category,
          condition: 'Certified Pro Fleet',
          price: input.grandTotal,
          originalPrice: input.dailyRate * input.rentalDays + input.securityDeposit,
          warranty: 'Comprehensive Damage & Sensor Cover',
          image: input.camera.image,
        },
        upgradePrice: input.grandTotal,
        tradeInCredit: 0,
        exchangeBonus: 0,
        couponDiscount: input.discountAmount,
        netPayable: input.grandTotal,
      };
      saveCustomerOrder(customerRecord);
    } catch (e) {
      console.error('Failed saving customer order record:', e);
    }

    // 4. Trigger Instant Audio & Notification Chime for Super Admin & User
    try {
      triggerNotification({
        type: 'new_booking',
        targetRole: 'all',
        title: '🎬 New Camera Rental Booking!',
        shortDetails: `${orderNumber}: ${input.camera.model} rented by ${input.customerName} for ${input.rentalDays} days · Total: ₹${input.grandTotal.toLocaleString('en-IN')}`,
        orderNumber,
        deviceName: input.camera.model,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        price: input.grandTotal,
        status: 'created',
      });
    } catch (e) {
      console.error('Failed triggering rental notification:', e);
    }

    // 5. Persist to MongoDB orders collection
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch((err) => console.error('Failed saving rental order to MongoDB:', err));
    } catch (e) {
      console.error('Failed dispatching order to MongoDB API:', e);
    }

    // 6. Broadcast custom events across tabs
    window.dispatchEvent(new CustomEvent('casmik_orders_updated', { detail: [newOrder] }));
    window.dispatchEvent(new CustomEvent('casmik_rental_orders_updated', { detail: newOrder }));
  }

  return newOrder;
}

export function updateRentalOrderStatus(orderId: string, status: OrderStatus): void {
  if (typeof window === 'undefined') return;

  try {
    const rawAll = localStorage.getItem(ALL_ORDERS_STORAGE_KEY);
    if (rawAll) {
      const all: Order[] = JSON.parse(rawAll);
      const updated = all.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
      localStorage.setItem(ALL_ORDERS_STORAGE_KEY, JSON.stringify(updated));
    }

    const rawRentals = localStorage.getItem(RENTAL_ORDERS_STORAGE_KEY);
    if (rawRentals) {
      const rentals: Order[] = JSON.parse(rawRentals);
      const updated = rentals.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
      localStorage.setItem(RENTAL_ORDERS_STORAGE_KEY, JSON.stringify(updated));
    }

    fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status }),
    }).catch((err) => console.error('Failed updating rental order in MongoDB:', err));

    window.dispatchEvent(new CustomEvent('casmik_orders_updated'));
    window.dispatchEvent(new CustomEvent('casmik_rental_orders_updated'));
  } catch (e) {
    console.error('Failed updating rental order status:', e);
  }
}

