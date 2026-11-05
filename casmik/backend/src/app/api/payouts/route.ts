import { NextResponse } from 'next/server';
import { getCollection, getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export interface PayoutItem {
  id: string;
  requesterName: string;
  requesterType: 'partner' | 'rider' | 'customer';
  requesterId: string;
  amount: number;
  paymentMethod: string;
  accountDetails: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  transactionRef?: string;
  requestedAt: string;
  notes?: string;
}

const defaultPayouts: PayoutItem[] = [
  {
    id: 'pay-801',
    requesterName: 'Adarsh Camera Store',
    requesterType: 'partner',
    requesterId: 'partner-46819',
    amount: 45000,
    paymentMethod: 'Bank Transfer (IMPS)',
    accountDetails: 'HDFC Bank - A/C 5010048291039, IFSC: HDFC0000128',
    status: 'pending',
    transactionRef: '',
    requestedAt: '2026-10-25T14:30:00.000Z',
  },
  {
    id: 'pay-802',
    requesterName: 'Rohan Sharma (Fleet Rider)',
    requesterType: 'rider',
    requesterId: 'agent-760782',
    amount: 6200,
    paymentMethod: 'UPI',
    accountDetails: 'rohan.fleet@okhdfcbank',
    status: 'pending',
    transactionRef: '',
    requestedAt: '2026-10-25T18:00:00.000Z',
  },
  {
    id: 'pay-799',
    requesterName: 'Sony Center CP',
    requesterType: 'partner',
    requesterId: 'partner-202',
    amount: 112000,
    paymentMethod: 'NEFT',
    accountDetails: 'ICICI Bank - A/C 000201594839',
    status: 'approved',
    transactionRef: 'CMSK-TXN-984712',
    requestedAt: '2026-10-24T11:20:00.000Z',
  },
];

let inMemoryPayouts = [...defaultPayouts];

async function getOrSeedPayouts(): Promise<PayoutItem[]> {
  try {
    const col = await getCollection<PayoutItem>('admin_payouts');
    let items = await col.find({}).sort({ requestedAt: -1 }).toArray();

    if (!items || items.length === 0) {
      for (const p of defaultPayouts) {
        await col.updateOne({ id: p.id }, { $set: p }, { upsert: true });
      }
      items = await col.find({}).sort({ requestedAt: -1 }).toArray();
    }

    const sanitized = items.map(({ _id, ...rest }: any) => rest);
    inMemoryPayouts = sanitized;
    return sanitized;
  } catch (err: any) {
    console.warn('MongoDB payouts fallback:', err?.message);
    return inMemoryPayouts;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let all = await getOrSeedPayouts();
    if (status && status !== 'all') {
      all = all.filter((p) => p.status === status);
    }

    return NextResponse.json({
      success: true,
      payouts: all,
      total: all.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPayout: PayoutItem = {
      id: body.id || `pay-${Date.now()}`,
      requesterName: body.requesterName || 'Partner Store',
      requesterType: body.requesterType || 'partner',
      requesterId: body.requesterId || `req-${Date.now()}`,
      amount: Number(body.amount || 0),
      paymentMethod: body.paymentMethod || 'UPI',
      accountDetails: body.accountDetails || '',
      status: 'pending',
      transactionRef: '',
      requestedAt: new Date().toISOString(),
      notes: body.notes || '',
    };

    try {
      const col = await getCollection<PayoutItem>('admin_payouts');
      await col.insertOne(newPayout as any);
    } catch (e) {
      console.warn('MongoDB insert payout fallback:', e);
    }

    inMemoryPayouts.unshift(newPayout);

    return NextResponse.json({
      success: true,
      payout: newPayout,
      message: 'Payout request created successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to create payout' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, transactionRef, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Payout id is required' }, { status: 400 });
    }

    const updates: Partial<PayoutItem> = {};
    if (status) updates.status = status;
    if (transactionRef !== undefined) updates.transactionRef = transactionRef;
    if (notes !== undefined) updates.notes = notes;

    try {
      const col = await getCollection<PayoutItem>('admin_payouts');
      await col.updateOne({ id }, { $set: updates });
    } catch (e) {
      console.warn('MongoDB update payout fallback:', e);
    }

    const idx = inMemoryPayouts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      inMemoryPayouts[idx] = { ...inMemoryPayouts[idx], ...updates };
    }

    return NextResponse.json({
      success: true,
      message: `Payout ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'} successfully`,
      payout: idx !== -1 ? inMemoryPayouts[idx] : { id, ...updates },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update payout' },
      { status: 500 }
    );
  }
}
