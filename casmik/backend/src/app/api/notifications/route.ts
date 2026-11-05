import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'pickup' | 'offer' | 'payout' | 'general';
  phone?: string;
  orderId?: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to Camsik! 🎉',
    body: 'Sell old cameras, buy certified refurbished gear or rent DSLR/lenses at best rates.',
    type: 'general',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'notif-2',
    title: 'Instant Pickup Guaranteed 🚀',
    body: 'Doorstep inspection within 2 hours of order booking. Instant UPI payout on spot!',
    type: 'pickup',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Weekend Rental Offer 📸',
    body: 'Get 15% off on Sony A7 IV and Canon EOS R5 rentals this weekend. Use code CAMSIK15.',
    type: 'offer',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
];

const inMemoryNotifications: AppNotification[] = [...mockNotifications];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone')?.trim();

    let list = inMemoryNotifications;
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      list = list.filter((n) => !n.phone || n.phone.includes(cleanPhone));
    }

    return NextResponse.json({
      success: true,
      notifications: list,
      unreadCount: list.filter((n) => !n.read).length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    if (body.action === 'mark_read') {
      const id = body.id;
      const target = inMemoryNotifications.find((n) => n.id === id);
      if (target) target.read = true;
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: body.title || 'Camsik Alert',
      body: body.body || body.message || '',
      type: body.type || 'general',
      phone: body.phone,
      orderId: body.orderId,
      timestamp: new Date().toISOString(),
      read: false,
    };

    inMemoryNotifications.unshift(newNotif);

    return NextResponse.json({
      success: true,
      notification: newNotif,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to process notification' },
      { status: 500 }
    );
  }
}
