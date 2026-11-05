import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { deliveryAgents as defaultAgents, DeliveryAgent } from '@/lib/casmikData';

export const dynamic = 'force-dynamic';

const agentsStore: DeliveryAgent[] = [...defaultAgents];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const partnerId = searchParams.get('partnerId')?.trim();
    const status = searchParams.get('status');
    const city = searchParams.get('city')?.toLowerCase();
    const search = searchParams.get('search')?.toLowerCase().trim();

    let dbAgents: DeliveryAgent[] = [];
    try {
      const db = await getDatabase();
      const agentsCol = db.collection('delivery_agents');
      const cursor = await agentsCol.find({}).toArray();
      dbAgents = cursor.map((doc: any) => ({
        id: doc.id || doc._id.toString(),
        name: doc.name,
        phone: doc.phone,
        email: doc.email || '',
        password: doc.password || '',
        city: doc.city || 'Mumbai',
        pinCodes: Array.isArray(doc.pinCodes) ? doc.pinCodes : (doc.pinCodes || '').split(',').map((p: string) => p.trim()),
        status: doc.status || 'online',
        rating: Number(doc.rating) || 5.0,
        todayPickups: Number(doc.todayPickups) || 0,
        todayDeliveries: Number(doc.todayDeliveries) || 0,
        totalDeliveries: Number(doc.totalDeliveries) || 0,
        earnings: Number(doc.earnings) || 0,
        avatar: doc.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80',
        joinedAt: doc.joinedAt || new Date().toISOString().split('T')[0],
        partnerId: doc.partnerId,
        partnerName: doc.partnerName,
        vehicle: doc.vehicle || 'Bike',
        vehicleNumber: doc.vehicleNumber || '',
        approvalStatus: doc.approvalStatus || 'approved',
        createdBy: doc.createdBy || (doc.partnerId && doc.partnerId !== 'admin' ? 'partner' : 'admin'),
        commission: doc.commission,
        commissionType: doc.commissionType,
        documents: doc.documents || {},
      }));
    } catch (dbErr) {
      console.warn('MongoDB query warning in delivery-agents GET:', dbErr);
    }

    // Combine dbAgents and in-memory agentsStore (avoiding duplicate IDs)
    const combinedMap = new Map<string, DeliveryAgent>();
    agentsStore.forEach((a) => {
      combinedMap.set(a.id, {
        ...a,
        createdBy: a.createdBy || (a.partnerId && a.partnerId !== 'admin' ? 'partner' : 'admin'),
      });
    });
    dbAgents.forEach((a) => combinedMap.set(a.id, a));

    let filtered = Array.from(combinedMap.values());

    if (id) {
      filtered = filtered.filter((a) => a.id === id);
    }

    // Strict Partner vs Admin isolation:
    if (partnerId && partnerId !== 'all' && partnerId !== 'admin') {
      filtered = filtered.filter((a) => a.partnerId === partnerId);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (city && city !== 'all') {
      filtered = filtered.filter((a) => a.city.toLowerCase() === city);
    }
    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(search) ||
          a.phone.includes(search) ||
          a.city.toLowerCase().includes(search) ||
          (a.vehicleNumber && a.vehicleNumber.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      agents: filtered,
      total: filtered.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch delivery agents' },
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

    const agentId = (body.id || body.agentId || '').trim();
    if (!agentId) {
      return NextResponse.json(
        { success: false, message: 'agentId is required' },
        { status: 400 }
      );
    }

    const index = agentsStore.findIndex((a) => a.id === agentId);
    if (index !== -1) {
      agentsStore[index] = {
        ...agentsStore[index],
        ...body,
      };
    }

    try {
      const db = await getDatabase();
      const updateFields: any = { ...body, updatedAt: new Date().toISOString() };
      delete updateFields._id;
      delete updateFields.id;
      delete updateFields.agentId;

      await db.collection('delivery_agents').updateOne(
        { $or: [{ id: agentId }, { _id: agentId }] },
        { $set: updateFields }
      );
    } catch (e) {
      console.warn('MongoDB update warning for delivery agent:', e);
    }

    return NextResponse.json({
      success: true,
      agent: index !== -1 ? agentsStore[index] : body,
      message: 'Delivery agent updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update delivery agent' },
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

    const name = (body.name || '').trim();
    const phone = (body.phone || '').trim();
    const password = (body.password || '').trim();
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: 'Rider name and phone are required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Rider login password is required' },
        { status: 400 }
      );
    }

    const targetPartnerId = (body.partnerId || 'partner-001').trim();
    const createdBy = body.createdBy || (targetPartnerId === 'admin' ? 'admin' : 'partner');

    const newAgent: DeliveryAgent = {
      id: `agent-${Date.now().toString().slice(-6)}`,
      name,
      phone,
      email: body.email || `${phone.replace(/\D/g, '').slice(-10)}@camsik.in`,
      password,
      city: body.city || 'Delhi NCR',
      pinCodes: Array.isArray(body.pinCodes)
        ? body.pinCodes
        : (body.pinCodes || '110001, 110016').split(',').map((p: string) => p.trim()),
      status: body.status || 'online',
      rating: 5.0,
      todayPickups: 0,
      todayDeliveries: 0,
      totalDeliveries: Number(body.totalDeliveries) || 0,
      earnings: Number(body.earnings) || 0,
      avatar: body.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80',
      joinedAt: body.joinedAt || new Date().toISOString().split('T')[0],
      partnerId: targetPartnerId,
      partnerName: body.partnerName,
      vehicle: body.vehicle || 'Bike',
      vehicleNumber: body.vehicleNumber || 'DL01AB1234',
      approvalStatus: body.approvalStatus || 'approved',
      createdBy,
      commission: body.commission,
      commissionType: body.commissionType,
      documents: body.documents || {},
    };

    agentsStore.unshift(newAgent);

    try {
      const db = await getDatabase();
      await db.collection('delivery_agents').insertOne({
        ...newAgent,
        password,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (e) {
      console.warn('MongoDB insert warning for delivery agent:', e);
    }

    return NextResponse.json({
      success: true,
      agent: newAgent,
      message: 'Delivery rider added successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create delivery agent' },
      { status: 500 }
    );
  }
}
