// CAMSIK Notification & Audio Alert Service
// Unified real-time notifications for Admin, Partner, and User across all tabs

export type NotificationType = 'new_booking' | 'status_update' | 'inspection' | 'payout' | 'partner' | 'general';
export type NotificationRole = 'all' | 'admin' | 'partner' | 'user' | 'delivery';

export interface CasmikNotification {
  id: string;
  type: NotificationType;
  targetRole: NotificationRole;
  title: string;
  shortDetails: string;
  orderId?: string;
  orderNumber?: string;
  deviceName?: string;
  customerName?: string;
  customerPhone?: string;
  partnerName?: string;
  price?: number;
  status?: string;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY = 'casmik_notifications_v1';
const SOUND_SETTING_KEY = 'casmik_notification_sound_enabled';
const BROADCAST_CHANNEL = 'casmik_notifications_channel';

// ─── AUDIO ENGINE (Web Audio API Synthesizer with Beep Alert) ─────────────────
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

// Automatically unlock audio on first user interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { passive: true, once: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
  window.addEventListener('keydown', unlockAudio, { passive: true, once: true });
}

export function playNotificationSound(force = false) {
  if (typeof window === 'undefined') return;

  try {
    const isMuted = localStorage.getItem(SOUND_SETTING_KEY) === 'false';
    if (isMuted && !force) return;
  } catch {}

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Distinctive two-pulse Camsik BEEP notification sound
    const playBeepPulse = (freq: number, start: number, duration: number, peakGain: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(peakGain, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration + 0.05);
    };

    // First beep: 880Hz (A5)
    playBeepPulse(880, now, 0.12, 0.35);
    // Second higher beep: 1175Hz (D6)
    playBeepPulse(1175, now + 0.14, 0.18, 0.4);

  } catch (e) {
    console.log('Audio chime note:', e);
  }
}

export const playNotificationBeep = playNotificationSound;

// ─── BROWSER DESKTOP NOTIFICATIONS ─────────────────────────────────────────────
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }
  return false;
}

export function showBrowserNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
      notif.onclick = () => {
        window.focus();
      };
    } catch {}
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        try {
          new Notification(title, { body, icon: '/favicon.ico' });
        } catch {}
      }
    }).catch(() => {});
  }
}

// ─── NOTIFICATION STORE & SEED DATA ───────────────────────────────────────────
// [STATIC DATA COMMENTED OUT - RUNNING ON DYNAMIC LIVE NOTIFICATIONS]
/*
const INITIAL_NOTIFICATIONS: CasmikNotification[] = [
  {
    id: 'notif-init-1',
    type: 'new_booking',
    targetRole: 'all',
    title: '🎉 New Booking Received',
    shortDetails: 'Order CSM-2024-001: iPhone 15 Pro Max 256GB by Rahul Sharma · Quoted ₹84,500',
    orderNumber: 'CSM-2024-001',
    deviceName: 'iPhone 15 Pro Max 256GB',
    customerName: 'Rahul Sharma',
    price: 84500,
    status: 'assigned',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'notif-init-2',
    type: 'inspection',
    targetRole: 'partner',
    title: '🔍 Device Inspection Pending',
    shortDetails: 'Order CSM-2024-013 (Dell XPS 15 9530) picked up and ready for checklist evaluation',
    orderNumber: 'CSM-2024-013',
    deviceName: 'Dell XPS 15 9530 i7',
    customerName: 'Arjun Singhania',
    price: 92000,
    status: 'picked_up',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'notif-init-3',
    type: 'payout',
    targetRole: 'admin',
    title: '💳 Spot Payout Finalized',
    shortDetails: 'Order CSM-2024-002 completed. ₹68,000 disbursed via Instant UPI to Ananya Deshmukh',
    orderNumber: 'CSM-2024-002',
    deviceName: 'MacBook Air M2 16GB',
    customerName: 'Ananya Deshmukh',
    price: 68000,
    status: 'completed',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'notif-init-4',
    type: 'status_update',
    targetRole: 'all',
    title: '🚚 Pickup Completed',
    shortDetails: 'Order CSM-2024-016 (Galaxy Z Fold 5) picked up by agent Suresh Nair',
    orderNumber: 'CSM-2024-016',
    deviceName: 'Galaxy Z Fold 5 256GB',
    customerName: 'Divya Bansal',
    price: 74000,
    status: 'picked_up',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    read: true,
  },
];
*/
const INITIAL_NOTIFICATIONS: CasmikNotification[] = [];

export function getStoredNotifications(role: NotificationRole = 'all'): CasmikNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: CasmikNotification[] = raw ? JSON.parse(raw) : [];
    if (Array.isArray(list)) {
      // Filter out legacy mock notifications
      const cleaned = list.filter(n => !n.id.startsWith('notif-init-'));
      if (cleaned.length !== list.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        list = cleaned;
      }
    } else {
      list = [];
    }
    if (role === 'all') return list;
    return list.filter(n => n.targetRole === 'all' || n.targetRole === role);
  } catch {
    return [];
  }
}

// ─── DISPATCH NOTIFICATION (PLAYS SOUND & BROADCASTS) ─────────────────────────
export function triggerNotification(
  payload: Omit<CasmikNotification, 'id' | 'timestamp' | 'read'>
): CasmikNotification {
  const newNotif: CasmikNotification = {
    ...payload,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };

  if (typeof window !== 'undefined') {
    // 1. Save to local storage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: CasmikNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
      const updated = [newNotif, ...list.filter(n => n.id !== newNotif.id)].slice(0, 80);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // 2. Play Web Audio Chime
    playNotificationSound();

    // 3. Show Native OS / Browser Notification
    showBrowserNotification(newNotif.title, newNotif.shortDetails);

    // 4. Broadcast across tabs
    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL);
        channel.postMessage(newNotif);
        channel.close();
      }
    } catch {}

    // 5. Dispatch CustomEvent for active window listeners
    window.dispatchEvent(new CustomEvent('casmik_notification_received', { detail: newNotif }));
  }

  return newNotif;
}

// ─── READ / DELETE HELPERS ───────────────────────────────────────────────────
export function markNotificationAsRead(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list: CasmikNotification[] = JSON.parse(raw);
    const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('casmik_notification_updated'));
  } catch {}
}

export function markNotificationAsUnread(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list: CasmikNotification[] = JSON.parse(raw);
    const updated = list.map(n => n.id === id ? { ...n, read: false } : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('casmik_notification_updated'));
  } catch {}
}

export const markNotificationUnread = markNotificationAsUnread;

export function markAllNotificationsAsRead(role: NotificationRole = 'all') {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list: CasmikNotification[] = JSON.parse(raw);
    const updated = list.map(n => {
      if (role === 'all' || n.targetRole === 'all' || n.targetRole === role) {
        return { ...n, read: true };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('casmik_notification_updated'));
  } catch {}
}

export function deleteNotification(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list: CasmikNotification[] = JSON.parse(raw);
    const updated = list.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('casmik_notification_updated'));
  } catch {}
}

export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SOUND_SETTING_KEY) === 'false';
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_SETTING_KEY, muted ? 'false' : 'true');
    window.dispatchEvent(new CustomEvent('casmik_sound_setting_changed'));
  } catch {}
}

export const markNotificationRead = markNotificationAsRead;
export const markAllNotificationsRead = markAllNotificationsAsRead;

export function clearAllNotifications() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('casmik_notification_updated'));
  } catch {}
}

export function addNotificationListener(callback: (n: CasmikNotification) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: any) => {
    if (e.detail) callback(e.detail);
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      window.dispatchEvent(new CustomEvent('casmik_notification_updated'));
    }
  };

  let bc: BroadcastChannel | null = null;
  try {
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel(BROADCAST_CHANNEL);
      bc.onmessage = (ev) => {
        if (ev.data) callback(ev.data);
      };
    }
  } catch {}

  window.addEventListener('casmik_notification_received', handleCustomEvent);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('casmik_notification_received', handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
    if (bc) {
      try {
        bc.close();
      } catch {}
    }
  };
}
