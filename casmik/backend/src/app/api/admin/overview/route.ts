import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getAllPartners } from '@/lib/partnerStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let orders: any[] = [];
    let partners: any[] = [];
    let deliveryAgents: any[] = [];
    let modelsCount = 0;
    let brandsCount = 0;
    let payoutsTotal = 0;

    try {
      const db = await getDatabase();
      const ordersCol = db.collection('orders');
      orders = await ordersCol.find({}).sort({ createdAt: -1 }).toArray();

      const agentsCol = db.collection('delivery_agents');
      deliveryAgents = await agentsCol.find({}).toArray();

      const modelsCol = db.collection('device_models');
      modelsCount = await modelsCol.countDocuments();

      const brandsCol = db.collection('device_brands');
      brandsCount = await brandsCol.countDocuments();

      const payoutsCol = db.collection('payouts');
      const pendingPayoutsList = await payoutsCol.find({ status: { $in: ['pending', 'processing'] } }).toArray();
      payoutsTotal = pendingPayoutsList.reduce((acc, p: any) => acc + (p.amount || 0), 0);
    } catch (dbErr) {
      console.warn('MongoDB overview fetch warning:', dbErr);
    }

    // Fallback partners store
    try {
      partners = await getAllPartners();
    } catch {}

    // Exclude mock orders if any
    const isMockOrder = (o: any) => {
      if (!o) return false;
      const num = String(o.orderNumber || '');
      const id = String(o.id || '');
      if (id.startsWith('ord-100') || id.startsWith('ord-101') || id.startsWith('ord-102')) return true;
      if (num.startsWith('CSM-2024-00') || num.startsWith('CSM-2024-01') || num.startsWith('CSM-2024-02') || num.startsWith('CSM-2024-03')) return true;
      return false;
    };
    orders = orders.filter((o) => !isMockOrder(o));

    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.status === 'completed' || o.paymentStatus === 'paid'
    ).length;
    const pendingOrders = orders.filter(
      (o) => ['created', 'assigned', 'accepted', 'pickup_scheduled', 'picked_up', 'in_transit', 'inspection', 'out_for_pickup'].includes(o.status)
    ).length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled' || o.status === 'rejected').length;

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid' || o.status === 'completed')
      .reduce((sum, o) => sum + (o.finalPrice || o.quotedPrice || 0), 0);

    const activePartners = partners.filter((p) => p.status === 'active').length;
    const pendingPartners = partners.filter((p) => p.status === 'pending').length;
    const totalPartners = partners.length;

    const onlineAgents = deliveryAgents.filter((a) => a.status === 'online' || a.status !== 'offline').length;
    const totalDeliveryAgents = deliveryAgents.length;

    // Unique customers by phone
    const customerPhones = new Set(orders.map((o) => o.customerPhone).filter(Boolean));
    const totalCustomers = customerPhones.size;

    // Weekly revenue throughput (Mon - Sun)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayMap: Record<string, { revenue: number; orders: number }> = {
      Mon: { revenue: 0, orders: 0 },
      Tue: { revenue: 0, orders: 0 },
      Wed: { revenue: 0, orders: 0 },
      Thu: { revenue: 0, orders: 0 },
      Fri: { revenue: 0, orders: 0 },
      Sat: { revenue: 0, orders: 0 },
      Sun: { revenue: 0, orders: 0 },
    };

    orders.forEach((o) => {
      const d = o.createdAt ? new Date(o.createdAt) : null;
      if (d && !isNaN(d.getTime())) {
        const dayName = days[(d.getDay() + 6) % 7];
        if (dayMap[dayName]) {
          dayMap[dayName].revenue += (o.finalPrice || o.quotedPrice || 0);
          dayMap[dayName].orders += 1;
        }
      }
    });

    const weeklyRevenue = days.map((day) => ({
      day,
      revenue: dayMap[day].revenue,
      orders: dayMap[day].orders,
    }));

    // Top Categories Breakdown
    const catMap: Record<string, number> = {};
    orders.forEach((o) => {
      let cat = 'Cameras & Devices';
      const name = (o.deviceName || '').toLowerCase();
      if (o.type === 'rent') cat = 'Rental Fleet';
      else if (name.includes('macbook') || name.includes('laptop') || name.includes('dell')) cat = 'Laptops';
      else if (name.includes('iphone') || name.includes('phone') || name.includes('s23') || name.includes('s24') || name.includes('oneplus')) cat = 'Smartphones';
      else if (name.includes('sony') || name.includes('canon') || name.includes('nikon') || name.includes('lens')) cat = 'Cameras & Lenses';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const totalCategoryItems = orders.length || 1;
    const topCategories = Object.entries(catMap).map(([name, count]) => ({
      name,
      value: Math.round((count / totalCategoryItems) * 100),
      count,
    }));

    // Recent orders (up to 8, cleaned for serialization)
    const recentOrders = orders.slice(0, 8).map((o) => ({
      ...o,
      _id: o._id ? o._id.toString() : undefined,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        completedOrders,
        pendingOrders,
        activeOrders: pendingOrders,
        cancelledOrders,
        totalPartners,
        activePartners,
        pendingPartners,
        totalDeliveryAgents,
        activeDeliveryAgents: onlineAgents,
        onlineAgents,
        totalCustomers,
        pendingPayouts: payoutsTotal,
        totalModels: modelsCount || 24,
        totalBrands: brandsCount || 8,
      },
      weeklyRevenue,
      topCategories,
      recentOrders,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to calculate admin overview' },
      { status: 500 }
    );
  }
}
