import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export interface StoredOrderMessage {
  id: string;
  orderId: string;
  orderNumber: string;
  senderRole: 'delivery' | 'partner' | 'user' | 'admin';
  senderName: string;
  senderPhone?: string;
  recipientRole: 'delivery' | 'partner' | 'user' | 'all';
  text: string;
  timestamp: string;
  read?: boolean;
}

// Fallback in-memory messages store seeded with realistic initial context
const messagesCache: StoredOrderMessage[] = [
  {
    id: 'msg-seed-1',
    orderId: 'ord-1',
    orderNumber: 'CSM-2024-001',
    senderRole: 'partner',
    senderName: 'Pixel Pro Tech Hub',
    senderPhone: '9845067890',
    recipientRole: 'delivery',
    text: 'Assigned customer Rahul Sharma for iPhone 15 Pro Max pickup. Please verify battery health and screen condition.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
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
    text: 'Noted partner. On the way to customer location right now.',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
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
    text: 'Hello Rahul! I am your Camsik field executive. I will reach your doorstep in about 15 minutes for camera/device pickup.',
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
    text: 'Great, thanks Sameer. The device and original charger are ready.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read: true,
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId')?.trim();
    const orderNumber = searchParams.get('orderNumber')?.trim();

    if (!orderId && !orderNumber) {
      return NextResponse.json({
        success: true,
        messages: messagesCache,
      });
    }

    try {
      const db = await getDatabase();
      const collection = db.collection('order_messages');
      const query: any = {};
      if (orderId && orderNumber) {
        query.$or = [{ orderId }, { orderNumber }];
      } else if (orderId) {
        query.orderId = orderId;
      } else {
        query.orderNumber = orderNumber;
      }

      const dbMsgs = await collection.find(query).sort({ timestamp: 1 }).toArray();
      if (dbMsgs && dbMsgs.length > 0) {
        return NextResponse.json({
          success: true,
          messages: dbMsgs,
          source: 'mongodb',
        });
      }
    } catch (dbErr) {
      console.warn('MongoDB messages fetch notice:', dbErr);
    }

    const filtered = messagesCache.filter(
      (m) => (orderId && m.orderId === orderId) || (orderNumber && m.orderNumber === orderNumber)
    );

    return NextResponse.json({
      success: true,
      messages: filtered,
      source: 'cache',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch messages' },
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

    const { orderId, orderNumber, senderRole, senderName, senderPhone, recipientRole, text } = body;

    if (!orderId || !text || !senderRole) {
      return NextResponse.json(
        { success: false, message: 'orderId, senderRole, and text are required' },
        { status: 400 }
      );
    }

    const newMsg: StoredOrderMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      orderId,
      orderNumber: orderNumber || orderId,
      senderRole: senderRole || 'delivery',
      senderName: senderName || 'Camsik User',
      senderPhone: senderPhone || '',
      recipientRole: recipientRole || 'all',
      text: text.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    messagesCache.push(newMsg);

    try {
      const db = await getDatabase();
      await db.collection('order_messages').insertOne({ ...newMsg });
    } catch (mongoErr) {
      console.warn('MongoDB message insert notice:', mongoErr);
    }

    return NextResponse.json({
      success: true,
      message: newMsg,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
