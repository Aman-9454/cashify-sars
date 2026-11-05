export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  createdAt: string;
}

export interface CustomerOrderRecord {
  id: string;
  orderNumber: string;
  type: 'exchange' | 'buy' | 'sell' | 'repair' | 'rent';
  status: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  city: string;
  pincode: string;
  pickupDate?: string;
  pickupSlot?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'pay_on_delivery';
  
  // Exchange specific
  oldDevice?: {
    brand: string;
    model: string;
    image: string;
    category?: string;
    conditionSummary: string;
    valuation: number;
    exchangeBonus: number;
  };

  // Buy / Upgrade product specific
  newDevice?: {
    id: string;
    brand: string;
    model: string;
    storage: string;
    color: string;
    condition: string;
    price: number;
    originalPrice?: number;
    warranty: string;
    batteryHealth?: number | string;
    image: string;
  };

  // Pricing
  upgradePrice: number;
  tradeInCredit: number;
  exchangeBonus: number;
  couponCode?: string;
  couponDiscount: number;
  netPayable: number;
  balanceOwedToUser?: number;
  payoutDetails?: string;

  // Partner & Delivery Executive details
  partnerId?: string | null;
  partnerName?: string | null;
  partnerPhone?: string | null;
  deliveryAgentId?: string | null;
  deliveryAgentName?: string | null;
  deliveryAgentPhone?: string | null;
  inspectionScore?: number | null;
  finalPrice?: number | null;
  deviceCollected?: boolean;
  notes?: string | null;
}

const USER_STORAGE_KEY = 'camsik_customer_user';
const ORDERS_STORAGE_KEY = 'camsik_customer_orders';

export function getCurrentUser(): CustomerUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to get customer user:', err);
    return null;
  }
}

export function setCurrentUser(user: CustomerUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('casmik_auth_change', { detail: user }));
  } catch (err) {
    console.error('Failed to save customer user:', err);
  }
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('casmik_auth_change', { detail: null }));
  } catch (err) {
    console.error('Failed to logout:', err);
  }
}

export function saveCustomerOrder(order: CustomerOrderRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomerOrders();
    const updated = [order, ...existing.filter((o) => o.id !== order.id)];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('casmik_orders_updated', { detail: updated }));
  } catch (err) {
    console.error('Failed to save order:', err);
  }
}

function orderToCustomerRecord(o: any): CustomerOrderRecord {
  const amount = Number(o.finalPrice ?? o.final_price ?? o.quotedPrice ?? o.quoted_price ?? o.price ?? 0);
  return {
    id: o.id || `ord-${Date.now()}`,
    orderNumber: o.orderNumber || o.order_number || o.id,
    type: (o.type || o.order_type || 'sell') as any,
    status: o.status || 'created',
    createdAt: o.createdAt || o.created_at || new Date().toISOString(),
    customerName: o.customerName || o.customer_name || 'Customer',
    customerPhone: o.customerPhone || o.customer_phone || '',
    customerAddress: o.customerAddress || o.customer_address || o.address || '',
    city: o.city || '',
    pincode: o.pinCode || o.pin_code || o.pincode || '',
    pickupDate: o.pickupDate || o.pickup_date,
    pickupSlot: o.pickupSlot || o.pickup_slot,
    paymentMethod: o.paymentMethod || 'UPI / Instant Bank Transfer',
    paymentStatus: o.paymentStatus || o.payment_status || 'pending',
    oldDevice: (o.deviceName || o.device_name) ? {
      brand: o.deviceBrand || o.device_brand || '',
      model: o.deviceModel || o.device_model || o.deviceName || o.device_name || '',
      image: o.deviceImage || o.device_image || '',
      conditionSummary: o.condition || o.notes || 'Inspected Device',
      valuation: Number(o.quotedPrice || o.quoted_price || amount),
      exchangeBonus: 0,
    } : undefined,
    upgradePrice: 0,
    tradeInCredit: Number(o.quotedPrice || o.quoted_price || amount),
    exchangeBonus: 0,
    couponDiscount: 0,
    netPayable: amount,
    balanceOwedToUser: amount,
    partnerId: o.partnerId ?? o.partner_id ?? null,
    partnerName: o.partnerName ?? o.partner_name ?? null,
    partnerPhone: o.partnerPhone ?? o.partner_phone ?? null,
    deliveryAgentId: o.deliveryAgentId ?? o.delivery_agent_id ?? null,
    deliveryAgentName: o.deliveryAgentName ?? o.delivery_agent_name ?? null,
    deliveryAgentPhone: o.deliveryAgentPhone ?? o.delivery_agent_phone ?? null,
    inspectionScore: o.inspectionScore ?? o.inspection_score ?? null,
    finalPrice: o.finalPrice ?? o.final_price ?? null,
    deviceCollected: Boolean(o.deviceCollected ?? o.device_collected),
    notes: o.notes || null,
  };
}

export function getCustomerOrders(phone?: string, email?: string): CustomerOrderRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    let parsed: CustomerOrderRecord[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) parsed = [];

    const orderMap = new Map<string, CustomerOrderRecord>();
    // Seed with existing customer records
    parsed.forEach(o => {
      if (o && (o.id || o.orderNumber)) {
        orderMap.set(o.orderNumber || o.id, o);
      }
    });

    const cleanPhone = phone ? phone.trim().replace(/\D/g, '').slice(-10) : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    // Pull and cross-reference from unified casmik_orders_v1 and casmik_partner_orders_v1
    const storageKeys = ['casmik_orders_v1', 'casmik_partner_orders_v1'];
    storageKeys.forEach(key => {
      try {
        const rawOrders = localStorage.getItem(key);
        if (rawOrders) {
          const list: any[] = JSON.parse(rawOrders);
          if (Array.isArray(list)) {
            list.forEach(item => {
              const itemNum = item.orderNumber || item.order_number || item.id;
              if (!itemNum) return;

              const itemPhone = (item.customerPhone || item.customer_phone || '').replace(/\D/g, '').slice(-10);
              const itemEmail = (item.customerEmail || item.customer_email || '').trim().toLowerCase();

              const phoneMatches = Boolean(cleanPhone && itemPhone && itemPhone === cleanPhone);
              const emailMatches = Boolean(cleanEmail && itemEmail && itemEmail === cleanEmail);

              const existingRecord = orderMap.get(itemNum);

              if (existingRecord) {
                // Update with live status & fulfillment info
                orderMap.set(itemNum, {
                  ...existingRecord,
                  status: item.status || existingRecord.status,
                  paymentStatus: item.paymentStatus || existingRecord.paymentStatus,
                  partnerId: item.partnerId ?? existingRecord.partnerId,
                  partnerName: item.partnerName ?? existingRecord.partnerName,
                  partnerPhone: item.partnerPhone ?? existingRecord.partnerPhone,
                  deliveryAgentId: item.deliveryAgentId ?? existingRecord.deliveryAgentId,
                  deliveryAgentName: item.deliveryAgentName ?? existingRecord.deliveryAgentName,
                  deliveryAgentPhone: item.deliveryAgentPhone ?? existingRecord.deliveryAgentPhone,
                  inspectionScore: item.inspectionScore ?? existingRecord.inspectionScore,
                  finalPrice: item.finalPrice ?? existingRecord.finalPrice,
                  deviceCollected: item.deviceCollected ?? existingRecord.deviceCollected,
                  notes: item.notes ?? existingRecord.notes,
                });
              } else if (phoneMatches || emailMatches) {
                // Newly placed/completed order matching this user
                orderMap.set(itemNum, orderToCustomerRecord(item));
              }
            });
          }
        }
      } catch {}
    });

    const allRecords = Array.from(orderMap.values());
    // Save synchronized records back to camsik_customer_orders
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(allRecords));
    } catch {}

    const sorted = allRecords.sort((a, b) => {
      const timeA = Math.max(new Date(a.createdAt || 0).getTime(), new Date((a as any).updatedAt || 0).getTime());
      const timeB = Math.max(new Date(b.createdAt || 0).getTime(), new Date((b as any).updatedAt || 0).getTime());
      return timeB - timeA;
    });

    if (cleanPhone || cleanEmail) {
      return sorted.filter((o) => {
        const oPhone = (o.customerPhone || '').replace(/\D/g, '').slice(-10);
        const oEmail = ((o as any).customerEmail || '').trim().toLowerCase();
        if (cleanPhone && oPhone === cleanPhone) return true;
        if (cleanEmail && oEmail && oEmail === cleanEmail) return true;
        // In case order didn't have email saved on record, phone match takes precedence
        return false;
      });
    }

    return sorted;
  } catch (err) {
    console.error('Failed to read customer orders:', err);
    return [];
  }
}

// Credential-based Registered Users Database
const USERS_DB_KEY = 'camsik_registered_users_db';

export interface RegisteredUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  createdAt: string;
}

export function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function registerUser(user: { name: string; phone: string; email: string; password?: string }): CustomerUser {
  const existing = getRegisteredUsers();
  const cleanPhone = user.phone.trim().replace(/\D/g, '').slice(-10);
  const cleanEmail = user.email.trim().toLowerCase();

  const newUser: RegisteredUser = {
    id: 'user-' + Date.now(),
    name: user.name.trim(),
    phone: cleanPhone,
    email: cleanEmail,
    password: user.password || '',
    createdAt: new Date().toISOString(),
  };
  const updated = [...existing.filter((u) => u.email !== newUser.email && u.phone !== newUser.phone), newUser];
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(updated));
  }
  const customerUser: CustomerUser = {
    id: newUser.id,
    name: newUser.name,
    phone: newUser.phone,
    email: newUser.email,
    createdAt: newUser.createdAt,
  };
  setCurrentUser(customerUser);
  return customerUser;
}

export function authenticateUser(identifier: string, password?: string): CustomerUser {
  const users = getRegisteredUsers();
  const cleanId = identifier.trim().toLowerCase();
  const cleanPhone = identifier.trim().replace(/\D/g, '').slice(-10);

  const matched = users.find(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      u.phone.replace(/\D/g, '').slice(-10) === cleanPhone
  );

  if (matched) {
    if (password && matched.password && matched.password !== password.trim()) {
      throw new Error('Incorrect password. Please enter your valid password.');
    }
    const customerUser: CustomerUser = {
      id: matched.id,
      name: matched.name,
      phone: matched.phone,
      email: matched.email,
      createdAt: matched.createdAt,
    };
    setCurrentUser(customerUser);
    return customerUser;
  }

  // If no user found, throw error instead of auto-logging in with random credentials
  throw new Error('Account not found. Please create an account or verify your credentials.');
}

