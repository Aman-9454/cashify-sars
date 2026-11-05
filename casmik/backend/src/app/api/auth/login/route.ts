import { NextResponse } from 'next/server';
import { findUserByIdentifier } from '@/lib/userStore';
import { findPartnerByIdentifier } from '@/lib/partnerStore';
import { partners, deliveryAgents } from '@/lib/casmikData';

export const dynamic = 'force-dynamic';

const VALID_ADMIN_EMAILS = [
  'casmikadmin9967@gmail.com',
  'admin@casmik.com',
  'admin@camsik.com',
];
const ADMIN_PASSWORD = 'Casmik@9967';

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

    const identifier = (body.identifier || body.phone || body.email || '').trim();
    const rawDigits = identifier.replace(/\D/g, '');
    const cleanPhone = rawDigits.length >= 10 ? rawDigits.slice(-10) : '';
    const cleanEmail = identifier.toLowerCase();
    const password = (body.password || '').trim();
    const requestedRole = (body.role || '').toLowerCase().trim();

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Please enter your mobile number or email address' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Please enter your account password' },
        { status: 400 }
      );
    }

    // 1. ADMIN CHECK
    if (requestedRole === 'admin' || VALID_ADMIN_EMAILS.includes(cleanEmail)) {
      if (VALID_ADMIN_EMAILS.includes(cleanEmail) && password === ADMIN_PASSWORD) {
        return NextResponse.json({
          success: true,
          role: 'admin',
          message: 'Admin authenticated successfully',
          user: {
            id: 'admin-super-01',
            name: 'Camsik Super Admin',
            email: cleanEmail,
            role: 'admin',
            createdAt: new Date().toISOString(),
          },
        });
      }
      if (requestedRole === 'admin') {
        return NextResponse.json(
          { success: false, message: 'Invalid admin credentials' },
          { status: 401 }
        );
      }
    }

    // 2. PARTNER CHECK
    let partner = await findPartnerByIdentifier(identifier);
    const isExplicitPartnerEmail =
      cleanEmail === 'partner@camsik.com' ||
      cleanEmail === 'partner@casmik.com' ||
      cleanEmail === 'contact@camerahub.in';

    if (requestedRole === 'partner' || partner || isExplicitPartnerEmail) {
      if (!partner && isExplicitPartnerEmail) {
        partner = partners.find((p) => p.email.toLowerCase() === cleanEmail) || partners[0];
      }

      if (partner) {
        // Password verification (if set on partner)
        if (partner.password && partner.password !== password) {
          return NextResponse.json(
            { success: false, message: 'Incorrect password. Please enter the correct partner password.' },
            { status: 401 }
          );
        }

        // Status check: must be approved/active by Admin
        if (partner.status === 'pending') {
          return NextResponse.json(
            {
              success: false,
              status: 'pending',
              message: 'Your partner application is pending Super Admin approval. You will be able to access the portal once verified.',
              partner,
            },
            { status: 403 }
          );
        }

        if (partner.status === 'suspended' || partner.status === 'inactive') {
          return NextResponse.json(
            {
              success: false,
              status: partner.status,
              message: 'Your partner account has been suspended or rejected. Please contact support@camsik.com.',
            },
            { status: 403 }
          );
        }

        return NextResponse.json({
          success: true,
          role: 'partner',
          message: 'Partner authenticated successfully',
          partner,
          user: {
            id: partner.id,
            name: partner.name,
            storeName: partner.storeName,
            phone: partner.phone,
            email: partner.email,
            role: 'partner',
            city: partner.city,
            joinedAt: partner.joinedAt,
          },
        });
      }

      if (requestedRole === 'partner') {
        return NextResponse.json(
          { success: false, message: 'No registered partner account found with these credentials' },
          { status: 404 }
        );
      }
    }

    // 3. DELIVERY AGENT CHECK
    let deliveryAgentDoc: any = null;

    try {
      const { getDatabase } = await import('@/lib/mongodb');
      const db = await getDatabase();
      const orConditions: any[] = [];
      if (cleanEmail) {
        orConditions.push(
          { email: cleanEmail },
          { email: { $regex: `^${cleanEmail.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, $options: 'i' } }
        );
      }
      if (cleanPhone) {
        orConditions.push(
          { phone: cleanPhone },
          { phone: `+91${cleanPhone}` },
          { phone: `91${cleanPhone}` },
          { phone: { $regex: cleanPhone + '$' } }
        );
      }
      orConditions.push({ id: identifier.trim() });

      deliveryAgentDoc = await db.collection('delivery_agents').findOne({
        $or: orConditions,
      });
    } catch (dbErr) {
      console.warn('MongoDB query error for delivery agent in auth/login:', dbErr);
    }

    if (!deliveryAgentDoc) {
      const memoryAgent = deliveryAgents.find(
        (a) =>
          (cleanEmail && a.email?.toLowerCase() === cleanEmail) ||
          (cleanPhone && a.phone?.replace(/\D/g, '').slice(-10) === cleanPhone) ||
          a.id === identifier.trim()
      );
      if (memoryAgent) {
        deliveryAgentDoc = memoryAgent;
      }
    }

    if (requestedRole === 'delivery' || deliveryAgentDoc) {
      if (!deliveryAgentDoc) {
        return NextResponse.json(
          {
            success: false,
            message: 'No registered delivery agent found with these credentials. Please check your phone/email or contact Super Admin / Partner.',
          },
          { status: 404 }
        );
      }

      // Strict Password Verification
      if (!deliveryAgentDoc.password || deliveryAgentDoc.password !== password) {
        return NextResponse.json(
          {
            success: false,
            message: 'Incorrect password. Please enter the correct password set by your Super Admin or Partner.',
          },
          { status: 401 }
        );
      }

      // Status & Approval Verification
      if (deliveryAgentDoc.approvalStatus === 'pending') {
        return NextResponse.json(
          {
            success: false,
            message: 'Your delivery executive application is pending Super Admin verification. You will be able to access the app once approved.',
          },
          { status: 403 }
        );
      }

      if (
        deliveryAgentDoc.approvalStatus === 'rejected' ||
        deliveryAgentDoc.status === 'suspended' ||
        deliveryAgentDoc.status === 'inactive'
      ) {
        return NextResponse.json(
          {
            success: false,
            message: 'Your delivery executive account has been deactivated or suspended. Please contact support@camsik.com.',
          },
          { status: 403 }
        );
      }

      const activeAgent = {
        id: deliveryAgentDoc.id || deliveryAgentDoc._id.toString(),
        name: deliveryAgentDoc.name,
        phone: deliveryAgentDoc.phone,
        email: deliveryAgentDoc.email || `${cleanPhone}@camsik.in`,
        city: deliveryAgentDoc.city || 'Delhi NCR',
        vehicle: deliveryAgentDoc.vehicle || 'Bike',
        vehicleNumber: deliveryAgentDoc.vehicleNumber || '',
        rating: Number(deliveryAgentDoc.rating) || 5.0,
        status: deliveryAgentDoc.status || 'online',
        approvalStatus: deliveryAgentDoc.approvalStatus || 'approved',
        partnerId: deliveryAgentDoc.partnerId,
        partnerName: deliveryAgentDoc.partnerName,
        totalDeliveries: Number(deliveryAgentDoc.totalDeliveries) || 0,
        earnings: Number(deliveryAgentDoc.earnings) || 0,
      };

      return NextResponse.json({
        success: true,
        role: 'delivery',
        message: 'Delivery executive authenticated successfully',
        agent: activeAgent,
        user: {
          id: activeAgent.id,
          name: activeAgent.name,
          phone: activeAgent.phone,
          email: activeAgent.email,
          role: 'delivery',
          city: activeAgent.city,
          vehicle: activeAgent.vehicle,
          vehicleNumber: activeAgent.vehicleNumber,
        },
      });
    }

    // 4. CUSTOMER USER CHECK
    const user = await findUserByIdentifier(identifier);

    if (!user) {
      // Check if it's one of the seeded demo users
      if (cleanPhone === '9876543210' || cleanEmail === 'user@camsik.com') {
        return NextResponse.json({
          success: true,
          role: 'customer',
          message: 'Logged in successfully',
          user: {
            id: 'cust-demo-01',
            name: 'Rahul Sharma',
            phone: '9876543210',
            email: 'rahul@gmail.com',
            role: 'customer',
            createdAt: new Date().toISOString(),
          },
        });
      }

      return NextResponse.json(
        { success: false, message: 'Account not found. Please check your credentials or create a new account.' },
        { status: 404 }
      );
    }

    // Verify password strictly
    if (!user.passwordHash || user.passwordHash !== password) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password. Please enter the correct password.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      role: 'customer',
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name || 'Camsik Customer',
        phone: user.phone || cleanPhone,
        email: user.email || `${cleanPhone}@camsik.in`,
        role: 'customer',
        createdAt: user.createdAt || new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
