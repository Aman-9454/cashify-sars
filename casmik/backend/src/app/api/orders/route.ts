import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { orders as defaultOrders } from '@/lib/casmikData';
import { notifyPartnerOrder } from '@/lib/partnerEvents';
import { notifyDeliveryOrder } from '@/lib/deliveryEvents';

export const dynamic = 'force-dynamic';

// Seeded in-memory store so real orders are ALWAYS immediately available
const ordersCache: any[] = [...defaultOrders];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone')?.trim();
    const orderId = searchParams.get('orderId')?.trim();
    const partnerId = searchParams.get('partnerId')?.trim();
    const deliveryAgentId = searchParams.get('deliveryAgentId')?.trim();
    const status = searchParams.get('status')?.trim();
    const type = searchParams.get('type')?.trim();
    const search = searchParams.get('search')?.toLowerCase().trim();

    try {
      const db = await getDatabase();
      const collection = db.collection('orders');

      const conditions: any[] = [];
      if (phone) {
        const clean = phone.replace(/\D/g, '').slice(-10);
        conditions.push({
          $or: [
            { customerPhone: { $regex: clean } },
            { phone: { $regex: clean } },
          ],
        });
      }
      if (orderId) {
        conditions.push({ $or: [{ id: orderId }, { orderNumber: orderId }] });
      }
      if (partnerId && partnerId !== 'all') {
        conditions.push({
          $or: [{ partnerId: partnerId }, { assignedPartnerId: partnerId }],
        });
      }
      if (deliveryAgentId && deliveryAgentId !== 'all') {
        conditions.push({
          $or: [{ deliveryAgentId: deliveryAgentId }, { assignedRiderId: deliveryAgentId }],
        });
      }
      if (status && status !== 'all') {
        conditions.push({ status });
      }
      if (type && type !== 'all') {
        conditions.push({ type });
      }

      const query = conditions.length > 0 ? { $and: conditions } : {};

      const dbOrders = await collection.find(query).sort({ createdAt: -1 }).limit(100).toArray();
      let results = dbOrders || [];
      if (search) {
        results = results.filter(
          (o: any) =>
            (o.orderNumber && o.orderNumber.toLowerCase().includes(search)) ||
            (o.customerName && o.customerName.toLowerCase().includes(search)) ||
            (o.customerPhone && o.customerPhone.includes(search)) ||
            (o.deviceName && o.deviceName.toLowerCase().includes(search))
        );
      }

      return NextResponse.json({
        success: true,
        orders: results,
        source: 'mongodb',
        total: results.length,
      });
    } catch (dbErr) {
      console.warn('MongoDB query warning, using seeded memory store:', dbErr);
    }

    // Fallback in-memory store
    let filtered = [...ordersCache];
    if (phone) {
      const clean = phone.replace(/\D/g, '').slice(-10);
      filtered = filtered.filter(
        (o) =>
          (o.customerPhone && o.customerPhone.replace(/\D/g, '').slice(-10) === clean) ||
          (o.phone && o.phone.replace(/\D/g, '').slice(-10) === clean)
      );
    }
    if (orderId) {
      filtered = filtered.filter((o) => o.id === orderId || o.orderNumber === orderId);
    }
    if (partnerId && partnerId !== 'all') {
      filtered = filtered.filter(
        (o) => o.partnerId === partnerId || o.assignedPartnerId === partnerId
      );
    }
    if (deliveryAgentId && deliveryAgentId !== 'all') {
      filtered = filtered.filter(
        (o) => o.deliveryAgentId === deliveryAgentId || o.assignedRiderId === deliveryAgentId
      );
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((o) => o.status === status);
    }
    if (type && type !== 'all') {
      filtered = filtered.filter((o) => o.type === type);
    }
    if (search) {
      filtered = filtered.filter(
        (o) =>
          (o.orderNumber && o.orderNumber.toLowerCase().includes(search)) ||
          (o.customerName && o.customerName.toLowerCase().includes(search)) ||
          (o.customerPhone && o.customerPhone.includes(search)) ||
          (o.deviceName && o.deviceName.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      orders: filtered,
      source: 'cache',
      total: filtered.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch orders' },
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

    if (!body || (!body.customerPhone && !body.phone)) {
      return NextResponse.json(
        { success: false, message: 'Customer phone is required' },
        { status: 400 }
      );
    }

    const orderNumber =
      body.orderNumber ||
      `CSM-${body.type === 'buy' ? 'BUY' : body.type === 'exchange' ? 'EXC' : body.type === 'rent' ? 'RNT' : 'SELL'}-${Math.floor(
        100000 + Math.random() * 900000
      )}`;

    const newOrder = {
      id: body.id || `ord-${Date.now()}`,
      orderNumber,
      type: body.type || 'sell',
      status: body.status || 'created',
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: body.customerName || body.name || 'Valued Customer',
      customerPhone: body.customerPhone || body.phone || '',
      customerEmail: body.customerEmail || body.email || '',
      customerAddress: body.customerAddress || body.address || '',
      city: body.city || 'Mumbai',
      pinCode: body.pincode || body.pinCode || '401107',
      pickupDate: body.pickupDate || 'Tomorrow',
      pickupSlot: body.pickupSlot || '11:00 AM – 1:00 PM',
      paymentMethod: body.paymentMethod || 'UPI / Instant Bank Transfer',
      paymentStatus: body.paymentStatus || 'pending',
      quotedPrice: body.quotedPrice || body.amount || 0,
      finalPrice: body.finalPrice || body.quotedPrice || body.amount || 0,
      deviceName: body.deviceName || body.device || 'Tech Device',
      deviceBrand: body.deviceBrand || '',
      deviceModel: body.deviceModel || '',
      deviceStorage: body.deviceStorage || '',
      deviceColor: body.deviceColor || '',
      partnerId: body.partnerId || null,
      partnerName: body.partnerName || null,
      deliveryAgentId: body.deliveryAgentId || null,
      deliveryAgentName: body.deliveryAgentName || null,
      deviceVerificationId: body.deviceVerificationId || null,
      deviceVerificationStatus: body.deviceVerificationStatus || null,
      imeiMasked: body.imeiMasked || (body.deviceImei ? `${body.deviceImei.slice(0, 2)}******${body.deviceImei.slice(-5)}` : null),
      brandVerified: body.brandVerified ?? null,
      modelVerified: body.modelVerified ?? null,
      variantVerified: body.variantVerified ?? null,
      blacklistStatus: body.blacklistStatus || null,
      verificationProvider: body.verificationProvider || null,
      verificationTimestamp: body.verificationTimestamp || null,
      inspectionScore: body.inspectionScore || null,
      otp: body.otp || `${Math.floor(1000 + Math.random() * 9000)}`,
      notes: body.notes || '',
      ...body,
    };

    ordersCache.unshift(newOrder);

    try {
      const db = await getDatabase();
      await db.collection('orders').insertOne({ ...newOrder });
    } catch (mongoErr) {
      console.warn('MongoDB insert warning, saved in memory cache:', mongoErr);
    }

    if (newOrder.partnerId) {
      notifyPartnerOrder(newOrder.partnerId, newOrder);
    }
    const newRiderId = newOrder.deliveryAgentId || newOrder.assignedRiderId;
    if (newRiderId) {
      notifyDeliveryOrder(newRiderId, newOrder);
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: 'Order created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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

    const orderId = (body.orderId || body.id || '').trim();
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'orderId is required for update' },
        { status: 400 }
      );
    }

    // Bidirectional harmonization between partner & rider fields across admin, partner, and delivery systems
    if (body.assignedPartnerId && !body.partnerId) {
      body.partnerId = body.assignedPartnerId;
    }
    if (body.partnerId && !body.assignedPartnerId) {
      body.assignedPartnerId = body.partnerId;
    }
    if (body.assignedPartnerName && !body.partnerName) {
      body.partnerName = body.assignedPartnerName;
    }
    if (body.partnerName && !body.assignedPartnerName) {
      body.assignedPartnerName = body.partnerName;
    }
    if (body.assignedRiderId && !body.deliveryAgentId) {
      body.deliveryAgentId = body.assignedRiderId;
    }
    if (body.deliveryAgentId && !body.assignedRiderId) {
      body.assignedRiderId = body.deliveryAgentId;
    }
    if (body.assignedRiderName && !body.deliveryAgentName) {
      body.deliveryAgentName = body.assignedRiderName;
    }
    if (body.deliveryAgentName && !body.assignedRiderName) {
      body.assignedRiderName = body.deliveryAgentName;
    }

    // Reject reassignment if order is already completed or paid
    const existingCached = ordersCache.find((o) => o.id === orderId || o.orderNumber === orderId);
    let existingStatus = existingCached?.status;
    let existingAgentId = existingCached?.deliveryAgentId;

    try {
      const db = await getDatabase();
      const existingDoc = await db.collection('orders').findOne({
        $or: [{ id: orderId }, { orderNumber: orderId }],
      });
      if (existingDoc) {
        existingStatus = existingDoc.status || existingStatus;
        existingAgentId = existingDoc.deliveryAgentId || existingAgentId;
      }
    } catch (_) {}

    if (existingStatus === 'completed' || existingStatus === 'paid') {
      if (
        (body.deliveryAgentId && body.deliveryAgentId !== existingAgentId) ||
        (body.status && body.status !== 'completed' && body.status !== 'paid')
      ) {
        return NextResponse.json(
          { success: false, message: 'Order is already completed and cannot be reassigned.' },
          { status: 400 }
        );
      }
    }

    // Find in memory cache
    const index = ordersCache.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    let updatedOrder: any = null;

    if (index !== -1) {
      ordersCache[index] = {
        ...ordersCache[index],
        ...body,
        updatedAt: new Date().toISOString(),
      };
      updatedOrder = ordersCache[index];
    }

    // Also persist to MongoDB
    try {
      const db = await getDatabase();
      const collection = db.collection('orders');
      const updateData = { ...body, updatedAt: new Date().toISOString() };
      delete updateData._id;
      delete updateData.orderId;

      await collection.updateOne(
        { $or: [{ id: orderId }, { orderNumber: orderId }] },
        { $set: updateData },
        { upsert: false }
      );

      if (!updatedOrder) {
        updatedOrder = await collection.findOne({
          $or: [{ id: orderId }, { orderNumber: orderId }],
        });
      }
    } catch (mongoErr) {
      console.warn('MongoDB update warning:', mongoErr);
    }

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    if (updatedOrder.partnerId) {
      notifyPartnerOrder(updatedOrder.partnerId, updatedOrder);
    }
    const updatedRiderId = updatedOrder.deliveryAgentId || updatedOrder.assignedRiderId;
    if (updatedRiderId) {
      notifyDeliveryOrder(updatedRiderId, updatedOrder);
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}
