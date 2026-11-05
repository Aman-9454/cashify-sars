import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { partners as defaultPartners, Partner } from '@/lib/casmikData';

export const dynamic = 'force-dynamic';

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
        .sort({ createdAt: -1 })
        .toArray();
    } catch (dbErr) {
      console.warn('MongoDB query warning in dashboard route:', dbErr);
    }

    if (!partner) {
      partner = defaultPartners.find((p) => p.id === partnerId) || null;
    }

    const completedOrders = partnerOrders.filter(
      (o) => o.status === 'completed' || o.status === 'paid'
    );
    const activePipelineOrders = partnerOrders.filter(
      (o) =>
        o.status !== 'completed' &&
        o.status !== 'paid' &&
        o.status !== 'cancelled' &&
        o.status !== 'rejected'
    );

    const storeTradeVolume = partnerOrders.reduce(
      (sum, o) => sum + Number(o.finalPrice || o.amount || o.quotedPrice || 0),
      0
    );

    const commissionRate = Number(partner?.commission ?? 5.0);
    const totalCommissionEarned = (storeTradeVolume * commissionRate) / 100;

    const momGrowth = partnerOrders.length > 0
      ? `+${((completedOrders.length / partnerOrders.length) * 100).toFixed(1)}% MoM`
      : '+0.0% MoM';

    return NextResponse.json({
      success: true,
      dashboard: {
        partnerId: partner?.id || partnerId,
        partnerName: partner?.name || 'Partner',
        storeName: partner?.storeName || 'Camsik Store Hub',
        rating: partner?.rating ?? 4.9,
        storeTradeVolume,
        momGrowth,
        totalOrdersCount: partnerOrders.length,
        completedOrdersCount: completedOrders.length,
        activePipelineCount: activePipelineOrders.length,
        commissionRate,
        totalCommissionEarned,
        availableFloatBalance: partner?.availableBalance ?? 0,
        pendingPayout: partner?.pendingPayout ?? 0,
        recentOrders: partnerOrders.slice(0, 5),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch partner dashboard stats' },
      { status: 500 }
    );
  }
}
