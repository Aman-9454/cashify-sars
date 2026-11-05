import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { partners as defaultPartners, Partner } from '@/lib/casmikData';
import { notifyPartnerOrder } from '@/lib/partnerEvents';

export const dynamic = 'force-dynamic';

export interface PayoutTransaction {
  id: string;
  partnerId: string;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  type: 'withdrawal' | 'commission' | 'spot_credit' | 'spot_payout' | 'float_topup' | 'add_funds';
  status: 'completed' | 'processing' | 'pending';
  method: 'bank_transfer' | 'instant_upi' | 'cash';
  referenceId: string;
  accountDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    holderName: string;
  };
  notes?: string;
  createdAt: string;
}

const payoutsStore: PayoutTransaction[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId')?.trim();

    if (!partnerId) {
      return NextResponse.json(
        { success: false, message: 'partnerId is required' },
        { status: 400 }
      );
    }

    let partner: any = null;
    let partnerOrders: any[] = [];
    let dbPayouts: PayoutTransaction[] = [];

    try {
      const db = await getDatabase();
      const partnersCol = db.collection('partners');
      partner = await partnersCol.findOne({
        $or: [{ id: partnerId }, { email: partnerId }, { phone: partnerId }],
      });

      const ordersCol = db.collection('orders');
      partnerOrders = await ordersCol
        .find({
          $or: [
            { partnerId: partnerId },
            { assignedPartnerId: partnerId },
            ...(partner?.id ? [{ partnerId: partner.id }, { assignedPartnerId: partner.id }] : []),
          ],
        })
        .toArray();

      const payoutsCol = db.collection('payouts');
      const cursor = await payoutsCol
        .find({
          $or: [
            { partnerId: partnerId },
            ...(partner?.id ? [{ partnerId: partner.id }] : []),
          ],
        })
        .sort({ createdAt: -1 })
        .toArray();

      dbPayouts = cursor.map((doc: any) => ({
        id: doc.id || doc._id.toString(),
        partnerId: doc.partnerId,
        orderId: doc.orderId,
        orderNumber: doc.orderNumber,
        amount: doc.amount,
        type: doc.type || 'withdrawal',
        status: doc.status || 'completed',
        method: doc.method || 'instant_upi',
        referenceId: doc.referenceId || `TXN-${doc._id.toString().slice(-6)}`,
        accountDetails: doc.accountDetails || {
          bankName: 'Verified Account',
          accountNumber: '••••',
          ifscCode: '',
          holderName: partner?.name || 'Partner',
        },
        notes: doc.notes || '',
        createdAt: doc.createdAt || new Date().toISOString(),
      }));
    } catch (dbErr) {
      console.warn('MongoDB query warning in payouts GET:', dbErr);
    }

    if (!partner) {
      partner = defaultPartners.find((p) => p.id === partnerId) || null;
    }

    const completedOrders = partnerOrders.filter(
      (o) => o.status === 'completed' || o.status === 'paid'
    );
    const totalLiquidated = completedOrders.reduce(
      (sum, o) => sum + Number(o.finalPrice || o.amount || o.quotedPrice || 0),
      0
    );

    // Deduplicate merged payouts by id, referenceId, and orderNumber/orderId
    const seenTxnIds = new Set<string>();
    const seenRefIds = new Set<string>();
    const seenOrderKeys = new Set<string>();
    const deduplicatedPayouts: PayoutTransaction[] = [];

    // Prioritize DB payouts first, then in-memory store
    const candidatePayouts = [...dbPayouts, ...payoutsStore.filter((p) => p.partnerId === partner?.id)];

    for (const p of candidatePayouts) {
      const idKey = (p.id || '').trim();
      const refKey = (p.referenceId || '').trim();
      const ordKey = (p.orderNumber || p.orderId || '').trim();

      if (idKey && seenTxnIds.has(idKey)) continue;
      if (refKey && seenRefIds.has(refKey)) continue;
      // If it's a spot payout for an order, don't duplicate spot payouts for the same order
      if (p.type === 'spot_payout' && ordKey && seenOrderKeys.has(ordKey)) continue;

      if (idKey) seenTxnIds.add(idKey);
      if (refKey) seenRefIds.add(refKey);
      if (ordKey && p.type === 'spot_payout') seenOrderKeys.add(ordKey);

      deduplicatedPayouts.push(p);
    }

    const commissionRate = Number(partner?.commission ?? 5.0);
    const earnedCommission = Math.round((totalLiquidated * commissionRate) / 100);
    const totalTopups = deduplicatedPayouts
      .filter((p) => (p.type === 'float_topup' || p.type === 'add_funds') && p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const completedWithdrawals = deduplicatedPayouts
      .filter((p) => p.type === 'withdrawal' && p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const pendingWithdrawals = deduplicatedPayouts
      .filter((p) => p.type === 'withdrawal' && p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const computedAvailableBalance =
      typeof partner?.availableBalance === 'number'
        ? partner.availableBalance
        : Math.max(0, (partner?.floatBalance ?? 0) + totalTopups - completedWithdrawals);

    // Build combined transaction history: explicitly logged payouts + completed order disbursements
    const orderPayouts: PayoutTransaction[] = [];
    for (const o of completedOrders) {
      const oId = (o.id || o._id?.toString() || '').trim();
      const oNum = (o.orderNumber || '').trim();

      // Check if this order already has a spot payout in deduplicatedPayouts
      const alreadyHasPayout = deduplicatedPayouts.some((p) => {
        const pOrdId = (p.orderId || '').trim();
        const pOrdNum = (p.orderNumber || '').trim();
        return (
          (oNum && (pOrdNum === oNum || pOrdId === oNum)) ||
          (oId && (pOrdId === oId || pOrdNum === oId))
        );
      });

      if (alreadyHasPayout) continue;
      if (oNum && seenOrderKeys.has(oNum)) continue;
      if (oId && seenOrderKeys.has(oId)) continue;

      const orderNum = oNum || oId || 'ORDER';
      const amount = Number(o.finalPrice || o.amount || o.quotedPrice || 0);
      const refId = o.payoutReferenceId || `IMPS${(orderNum.replace(/\D/g, '') || '961448').padStart(8, '0')}`;
      const txnId = `pay-ord-${oId || orderNum}`;

      if (seenTxnIds.has(txnId) || seenRefIds.has(refId)) continue;

      seenTxnIds.add(txnId);
      seenRefIds.add(refId);
      if (oNum) seenOrderKeys.add(oNum);
      if (oId) seenOrderKeys.add(oId);

      orderPayouts.push({
        id: txnId,
        partnerId: partner?.id || partnerId,
        orderId: oId,
        orderNumber: orderNum,
        amount,
        type: 'spot_payout',
        status: 'completed',
        method: (o.payoutMethod || 'instant_upi') as any,
        referenceId: refId,
        accountDetails: {
          bankName: o.bankName || 'Verified Customer Account',
          accountNumber: o.accountNumber || (o.upiId ? o.upiId : '•••• 9468'),
          ifscCode: o.ifscCode || 'PUNB0001234',
          holderName: o.customerName || 'Customer',
        },
        notes: `Instant spot payout disbursed to ${o.customerName || 'customer'} for ${o.modelName || 'device'}`,
        createdAt: o.paidAt || o.updatedAt || o.createdAt || new Date().toISOString(),
      });
    }

    const allTransactions = [...deduplicatedPayouts, ...orderPayouts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const bankDetails = {
      bankName: partner?.documents?.bankName || partner?.bankName || 'Verified Bank Account',
      accountNumber: partner?.documents?.accountNumber
        ? `•••• ${partner.documents.accountNumber.slice(-4)}`
        : (partner?.accountNumber ? `•••• ${partner.accountNumber.slice(-4)}` : '•••• 4892'),
      ifscCode: partner?.documents?.ifscCode || partner?.ifscCode || 'HDFC0001234',
      accountHolderName: partner?.name || 'Authorized Partner',
      isVerified: partner?.documents?.verified ?? true,
    };

    return NextResponse.json({
      success: true,
      wallet: {
        partnerId: partner?.id || partnerId,
        partnerName: partner?.name,
        storeName: partner?.storeName,
        availableBalance: computedAvailableBalance,
        totalEarnings: totalLiquidated,
        totalCommissionEarned: earnedCommission,
        commissionRate,
        pendingPayout: pendingWithdrawals,
        bankDetails,
      },
      payouts: allTransactions,
      stats: {
        totalLiquidated,
        commissionEarned: earnedCommission,
        spotPayoutsCount: completedOrders.length,
        pendingApprovalCount: allTransactions.filter((p) => p.status === 'pending').length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch partner payouts' },
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
      try {
        const text = await request.text();
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    const partnerId = (body.partnerId || '').trim();
    if (!partnerId) {
      return NextResponse.json(
        { success: false, message: 'partnerId is required' },
        { status: 400 }
      );
    }
    const orderId = body.orderId?.toString().trim();
    const orderNumber = body.orderNumber?.toString().trim();
    const amount = Number(body.amount);
    const isTopUp =
      body.type === 'float_topup' ||
      body.type === 'add_funds' ||
      body.type === 'topup' ||
      body.type === 'credit' ||
      body.action === 'topup' ||
      body.action === 'add_funds' ||
      body.action === 'add_float' ||
      body.action === 'credit';
    const isSpotPayout =
      !isTopUp &&
      Boolean(
        orderId ||
        body.type === 'spot_payout' ||
        body.type === 'spot_credit' ||
        body.action === 'spot_payout'
      );
    const isWithdrawal =
      !isTopUp &&
      !isSpotPayout &&
      (body.type === 'withdrawal' ||
        body.action === 'withdraw' ||
        body.action === 'withdrawal' ||
        body.type === 'debit' ||
        (!body.type && !body.action));
    const method = body.method === 'instant_upi'
      ? 'instant_upi'
      : (body.method === 'cash' ? 'cash' : 'bank_transfer');
    const notes = body.notes || (isTopUp
      ? `Float top-up added to payout wallet`
      : isSpotPayout
      ? `Spot payout for Order #${orderNumber || orderId}`
      : 'Float withdrawal to verified bank');

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid payout amount' },
        { status: 400 }
      );
    }

    let partner: any = null;
    let db: any = null;

    try {
      db = await getDatabase();
      const partnersCol = db.collection('partners');
      partner = await partnersCol.findOne({
        $or: [{ id: partnerId }, { email: partnerId }, { phone: partnerId }],
      });
    } catch (dbErr) {
      console.warn('MongoDB partner lookup note:', dbErr);
    }

    if (!partner) {
      partner = defaultPartners.find((p) => p.id === partnerId) || null;
    }

    if (!partner) {
      return NextResponse.json(
        { success: false, message: 'Partner not found' },
        { status: 404 }
      );
    }

    const currentBal = Number(partner.availableBalance ?? 0);

    // ── WALLET BALANCE CHECK BEFORE SPOT PAYOUT OR WITHDRAWAL ──
    if (isSpotPayout && currentBal < amount) {
      return NextResponse.json(
        {
          success: false,
          insufficientBalance: true,
          message: `Insufficient payout wallet balance (₹${currentBal.toLocaleString('en-IN')}). Required: ₹${amount.toLocaleString('en-IN')}. Please add funds to wallet first.`,
          deficit: amount - currentBal,
          currentBalance: currentBal,
          requiredAmount: amount,
        },
        { status: 400 }
      );
    }

    if (isWithdrawal && currentBal < amount) {
      return NextResponse.json(
        { success: false, message: 'Insufficient balance to withdraw' },
        { status: 400 }
      );
    }

    // ── UPDATE PARTNER BALANCE IN MONGODB ──
    let newBal = currentBal;
    if (isTopUp) {
      newBal = currentBal + amount;
    } else if (isSpotPayout || isWithdrawal) {
      newBal = Math.max(0, currentBal - amount);
    }
    partner.availableBalance = newBal;

    const inMemPartner = defaultPartners.find((p) => p.id === (partner.id || partnerId));
    if (inMemPartner) {
      inMemPartner.availableBalance = newBal;
    }

    if (db && partner?.id) {
      try {
        await db.collection('partners').updateOne(
          { $or: [{ id: partner.id }, { _id: partner._id }] },
          { $set: { availableBalance: newBal, updatedAt: new Date().toISOString() } }
        );
      } catch (err) {
        console.warn('Error updating partner availableBalance in MongoDB:', err);
      }
    }

    const refId = body.referenceId || `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const newTxn: PayoutTransaction = {
      id: `pay-${Date.now().toString().slice(-6)}`,
      partnerId: partner.id || partnerId,
      orderId,
      orderNumber,
      amount,
      type: isTopUp ? 'float_topup' : isSpotPayout ? 'spot_payout' : 'withdrawal',
      status: 'completed',
      method,
      referenceId: refId,
      accountDetails: {
        bankName: body.bankName || partner.bankName || 'Verified Account',
        accountNumber: body.accountNumber || '••••',
        ifscCode: body.ifscCode || partner.ifscCode || '',
        holderName: body.customerName || partner.name || 'Payee',
      },
      notes,
      createdAt: new Date().toISOString(),
    };

    const existingIdx = payoutsStore.findIndex(
      (p) => (p.id && p.id === newTxn.id) || (p.referenceId && p.referenceId === refId)
    );
    if (existingIdx >= 0) {
      payoutsStore[existingIdx] = newTxn;
    } else {
      payoutsStore.unshift(newTxn);
    }

    // If orderId is provided, mark order as completed & paid in MongoDB
    if (orderId && db) {
      try {
        const ordersCol = db.collection('orders');
        await ordersCol.updateOne(
          { $or: [{ id: orderId }, { orderNumber: orderId }, { orderNumber: orderNumber }] },
          {
            $set: {
              status: 'completed',
              paymentStatus: 'paid',
              finalPrice: amount,
              paidAt: new Date().toISOString(),
              payoutReferenceId: refId,
              payoutMethod: method,
              updatedAt: new Date().toISOString(),
            },
          }
        );

        const updatedOrder = await ordersCol.findOne({
          $or: [{ id: orderId }, { orderNumber: orderId }, { orderNumber: orderNumber }],
        });

        if (updatedOrder && partner.id) {
          notifyPartnerOrder(partner.id, updatedOrder);
        }
      } catch (orderUpdateErr) {
        console.warn('Error updating order on spot payout:', orderUpdateErr);
      }
    }

    // Save payout to MongoDB
    if (db) {
      try {
        const payoutsCol = db.collection('payouts');
        await payoutsCol.insertOne({ ...newTxn, createdAt: new Date() });
      } catch (payoutInsertErr) {
        console.warn('Error saving payout to MongoDB:', payoutInsertErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: isTopUp
        ? `₹${amount.toLocaleString('en-IN')} added to payout wallet successfully!`
        : isSpotPayout
        ? `Spot payout of ₹${amount.toLocaleString('en-IN')} disbursed successfully! Order moved to Completed.`
        : `Withdrawal request for ₹${amount.toLocaleString('en-IN')} confirmed!`,
      payout: newTxn,
      wallet: {
        availableBalance: newBal,
        totalEarnings: (partner.totalEarnings ?? 0) + (isSpotPayout ? amount : 0),
        pendingPayout: partner.pendingPayout ?? 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to process payout' },
      { status: 500 }
    );
  }
}
