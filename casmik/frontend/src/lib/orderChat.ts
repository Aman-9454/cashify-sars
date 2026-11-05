// CAMSIK Live Order Chat Service
// Supports seamless, real-time messaging between:
// - Delivery Executive <-> Partner
// - Delivery Executive <-> Customer / User
// - Partner <-> Customer / User

import { playNotificationSound, triggerNotification } from './notifications';

export type ChatRole = 'delivery' | 'partner' | 'user' | 'admin';

export interface OrderChatMessage {
  id: string;
  orderId: string;
  orderNumber: string;
  senderRole: ChatRole;
  senderName: string;
  senderPhone?: string;
  recipientRole: 'delivery' | 'partner' | 'user' | 'all';
  text: string;
  timestamp: string;
  read?: boolean;
}

const STORAGE_KEY = 'casmik_order_messages_v1';
const CHAT_CHANNEL = 'casmik_order_chat_channel';

// Fallback seed messages so chat starts with immediate historical context
const INITIAL_MESSAGES: OrderChatMessage[] = [
  {
    id: 'msg-seed-1',
    orderId: 'ord-1',
    orderNumber: 'CSM-2024-001',
    senderRole: 'partner',
    senderName: 'Pixel Pro Tech Hub',
    senderPhone: '9845067890',
    recipientRole: 'delivery',
    text: 'Assigned customer Rahul Sharma for iPhone 15 Pro Max pickup. Please verify battery health and screen condition.',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-seed-2',
    orderId: 'ord-1',
    orderNumber: 'CSM-2024-001',
    senderRole: 'delivery',
    senderName: 'Sameer Khan (Field Executive)',
    senderPhone: '9820123456',
    recipientRole: 'partner',
    text: 'Received! Heading out to customer location right away.',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-seed-3',
    orderId: 'ord-1',
    orderNumber: 'CSM-2024-001',
    senderRole: 'delivery',
    senderName: 'Sameer Khan (Field Executive)',
    senderPhone: '9820123456',
    recipientRole: 'user',
    text: 'Hello Rahul! I am your Camsik field executive. Reaching your doorstep in 15 minutes for device pickup.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-seed-4',
    orderId: 'ord-1',
    orderNumber: 'CSM-2024-001',
    senderRole: 'user',
    senderName: 'Rahul Sharma (Customer)',
    senderPhone: '9876543210',
    recipientRole: 'delivery',
    text: 'Hello Sameer, device and original charger are ready. Let me know when you arrive downstairs.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read: true,
  },
];

export function getLocalChatMessages(orderId: string, orderNumber?: string): OrderChatMessage[] {
  if (typeof window === 'undefined') return INITIAL_MESSAGES.filter(m => m.orderId === orderId || (orderNumber && m.orderNumber === orderNumber));
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: OrderChatMessage[] = raw ? JSON.parse(raw) : [];
    if (!list || list.length === 0) {
      list = INITIAL_MESSAGES;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
    return list.filter(m => m.orderId === orderId || (orderNumber && m.orderNumber === orderNumber));
  } catch {
    return INITIAL_MESSAGES.filter(m => m.orderId === orderId || (orderNumber && m.orderNumber === orderNumber));
  }
}

export async function fetchOrderChatMessages(orderId: string, orderNumber?: string): Promise<OrderChatMessage[]> {
  try {
    const params = new URLSearchParams();
    if (orderId) params.append('orderId', orderId);
    if (orderNumber) params.append('orderNumber', orderNumber);

    const res = await fetch(`/api/orders/messages?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
        // Merge into local storage
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const local: OrderChatMessage[] = raw ? JSON.parse(raw) : INITIAL_MESSAGES;
            const existingIds = new Set(local.map(m => m.id));
            const merged = [...local];
            data.messages.forEach((remoteMsg: OrderChatMessage) => {
              if (!existingIds.has(remoteMsg.id)) {
                merged.push(remoteMsg);
                existingIds.add(remoteMsg.id);
              }
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {}
        }
        return data.messages;
      }
    }
  } catch (err) {
    console.warn('Chat fetch fallback to local:', err);
  }
  return getLocalChatMessages(orderId, orderNumber);
}

export async function sendOrderChatMessage(payload: {
  orderId: string;
  orderNumber: string;
  senderRole: ChatRole;
  senderName: string;
  senderPhone?: string;
  recipientRole: 'delivery' | 'partner' | 'user' | 'all';
  text: string;
}): Promise<OrderChatMessage> {
  const newMsg: OrderChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    orderId: payload.orderId,
    orderNumber: payload.orderNumber,
    senderRole: payload.senderRole,
    senderName: payload.senderName,
    senderPhone: payload.senderPhone || '',
    recipientRole: payload.recipientRole,
    text: payload.text.trim(),
    timestamp: new Date().toISOString(),
    read: false,
  };

  // 1. Optimistic Local Save
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: OrderChatMessage[] = raw ? JSON.parse(raw) : INITIAL_MESSAGES;
      list.push(newMsg);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}

    // 2. Play Notification Beep Sound
    playNotificationSound();

    // 3. Broadcast across tabs
    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(CHAT_CHANNEL);
        bc.postMessage(newMsg);
        bc.close();
      }
    } catch {}

    // 4. Dispatch DOM custom event
    window.dispatchEvent(new CustomEvent('casmik_order_chat_received', { detail: newMsg }));
  }

  // 5. Trigger notification alert
  const recipientLabel = payload.recipientRole === 'delivery' 
    ? 'Delivery Executive' 
    : payload.recipientRole === 'partner' 
    ? 'Partner Hub' 
    : 'Customer';

  triggerNotification({
    type: 'general',
    targetRole: payload.recipientRole,
    title: `💬 New Message for Order #${payload.orderNumber}`,
    shortDetails: `${payload.senderName} (${payload.senderRole}): "${payload.text.length > 50 ? payload.text.substring(0, 47) + '...' : payload.text}"`,
    orderId: payload.orderId,
    orderNumber: payload.orderNumber,
  });

  // 6. Asynchronously persist to API & MongoDB
  try {
    fetch('/api/orders/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    }).catch(() => {});
  } catch {}

  return newMsg;
}

export function addOrderChatListener(
  orderId: string,
  callback: (msg: OrderChatMessage) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: any) => {
    if (e.detail && (e.detail.orderId === orderId || e.detail.orderNumber === orderId)) {
      callback(e.detail);
    }
  };

  let bc: BroadcastChannel | null = null;
  try {
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel(CHAT_CHANNEL);
      bc.onmessage = (ev) => {
        if (ev.data && (ev.data.orderId === orderId || ev.data.orderNumber === orderId)) {
          callback(ev.data);
        }
      };
    }
  } catch {}

  window.addEventListener('casmik_order_chat_received', handleCustomEvent);

  return () => {
    window.removeEventListener('casmik_order_chat_received', handleCustomEvent);
    if (bc) {
      try {
        bc.close();
      } catch {}
    }
  };
}
