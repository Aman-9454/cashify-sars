import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export interface TicketReply {
  id: string;
  author: string;
  authorType: 'admin' | 'user' | 'partner' | 'delivery';
  message: string;
  createdAt: string;
}

export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  userName: string;
  userPhone: string;
  userRole: 'customer' | 'partner' | 'rider';
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  lastMessage: string;
  replies?: TicketReply[];
}

const defaultTickets: SupportTicketItem[] = [
  {
    id: 'tkt-101',
    ticketNumber: 'TCK-2026-091',
    userName: 'Aman Kumar',
    userPhone: '9868689565',
    userRole: 'customer',
    subject: 'Delay in pickup rider arrival',
    category: 'Order Pickup',
    priority: 'high',
    status: 'open',
    createdAt: '2026-10-25T15:40:00.000Z',
    lastMessage: 'Rider has not arrived yet for order CSM-2024-735. Please check.',
    replies: [],
  },
  {
    id: 'tkt-102',
    ticketNumber: 'TCK-2026-088',
    userName: 'Camera Hub Mumbai',
    userPhone: '9967853364',
    userRole: 'partner',
    subject: 'Commission discrepancy for October cycle',
    category: 'Payouts',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2026-10-24T18:20:00.000Z',
    lastMessage: 'We noticed a 1% deduction difference in last payout statement.',
    replies: [
      {
        id: 'rep-1',
        author: 'Admin Support',
        authorType: 'admin',
        message: 'Auditing ledger transaction logs with finance desk.',
        createdAt: '2026-10-25T10:00:00.000Z',
      },
    ],
  },
  {
    id: 'tkt-100',
    ticketNumber: 'TCK-2026-080',
    userName: 'Rahul Verma',
    userPhone: '9811223344',
    userRole: 'customer',
    subject: 'Lens compatibility query for Sony FX3 rental',
    category: 'Rental Inquiry',
    priority: 'low',
    status: 'resolved',
    createdAt: '2026-10-22T10:15:00.000Z',
    lastMessage: 'Resolved: Advised client to use native Sony E-Mount 24-70mm G-Master.',
    replies: [],
  },
];

let inMemoryTickets = [...defaultTickets];

async function getOrSeedTickets(): Promise<SupportTicketItem[]> {
  try {
    const col = await getCollection<SupportTicketItem>('admin_support_tickets');
    let items = await col.find({}).sort({ createdAt: -1 }).toArray();

    if (!items || items.length === 0) {
      for (const t of defaultTickets) {
        await col.updateOne({ id: t.id }, { $set: t }, { upsert: true });
      }
      items = await col.find({}).sort({ createdAt: -1 }).toArray();
    }

    const sanitized = items.map(({ _id, ...rest }: any) => rest);
    inMemoryTickets = sanitized;
    return sanitized;
  } catch (err: any) {
    console.warn('MongoDB tickets fallback:', err?.message);
    return inMemoryTickets;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let all = await getOrSeedTickets();
    if (status && status !== 'all') {
      all = all.filter((t) => t.status === status);
    }

    return NextResponse.json({
      success: true,
      tickets: all,
      total: all.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, replyMessage, author } = body;

    // If adding reply to an existing ticket
    if (ticketId && replyMessage) {
      const reply: TicketReply = {
        id: `rep-${Date.now()}`,
        author: author || 'Super Admin',
        authorType: 'admin',
        message: replyMessage,
        createdAt: new Date().toISOString(),
      };

      try {
        const col = await getCollection<SupportTicketItem>('admin_support_tickets');
        await col.updateOne(
          { id: ticketId },
          {
            $push: { replies: reply } as any,
            $set: { lastMessage: replyMessage },
          }
        );
      } catch (e) {
        console.warn('MongoDB push reply fallback:', e);
      }

      const tIdx = inMemoryTickets.findIndex((t) => t.id === ticketId);
      if (tIdx !== -1) {
        inMemoryTickets[tIdx].replies = inMemoryTickets[tIdx].replies || [];
        inMemoryTickets[tIdx].replies!.push(reply);
        inMemoryTickets[tIdx].lastMessage = replyMessage;
      }

      return NextResponse.json({
        success: true,
        reply,
        message: 'Reply sent successfully',
      });
    }

    // Creating new support ticket
    const newTicket: SupportTicketItem = {
      id: body.id || `tkt-${Date.now()}`,
      ticketNumber: `TCK-${Date.now().toString().slice(-6)}`,
      userName: body.userName || 'Customer',
      userPhone: body.userPhone || '',
      userRole: body.userRole || 'customer',
      subject: body.subject || 'Support Ticket',
      category: body.category || 'General',
      priority: body.priority || 'medium',
      status: 'open',
      createdAt: new Date().toISOString(),
      lastMessage: body.message || body.subject || '',
      replies: [],
    };

    try {
      const col = await getCollection<SupportTicketItem>('admin_support_tickets');
      await col.insertOne(newTicket as any);
    } catch (e) {
      console.warn('MongoDB insert ticket fallback:', e);
    }

    inMemoryTickets.unshift(newTicket);

    return NextResponse.json({
      success: true,
      ticket: newTicket,
      message: 'Support ticket registered',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to process ticket' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, priority } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Ticket id is required' }, { status: 400 });
    }

    const updates: Partial<SupportTicketItem> = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;

    try {
      const col = await getCollection<SupportTicketItem>('admin_support_tickets');
      await col.updateOne({ id }, { $set: updates });
    } catch (e) {
      console.warn('MongoDB update ticket fallback:', e);
    }

    const idx = inMemoryTickets.findIndex((t) => t.id === id);
    if (idx !== -1) {
      inMemoryTickets[idx] = { ...inMemoryTickets[idx], ...updates };
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket status updated',
      ticket: idx !== -1 ? inMemoryTickets[idx] : { id, ...updates },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
