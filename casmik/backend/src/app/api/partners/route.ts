import { NextResponse } from 'next/server';
import { Partner } from '@/lib/casmikData';
import {
  getAllPartners,
  savePartner,
  updatePartner,
  findPartnerByIdentifier,
} from '@/lib/partnerStore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const city = searchParams.get('city')?.toLowerCase();
    const search = searchParams.get('search')?.toLowerCase().trim();

    const partners = await getAllPartners();
    let filtered = [...partners];

    if (id) {
      filtered = filtered.filter((p) => p.id === id);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((p) => p.status === status);
    }
    if (city && city !== 'all') {
      filtered = filtered.filter((p) => (p.city || '').toLowerCase() === city);
    }
    if (search) {
      filtered = filtered.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(search) ||
          (p.storeName || '').toLowerCase().includes(search) ||
          (p.phone || '').includes(search) ||
          (p.city || '').toLowerCase().includes(search) ||
          (p.email || '').toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      partners: filtered,
      total: filtered.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch partners' },
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
    const phone = (body.phone || '').trim().replace(/\D/g, '').slice(-10);
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();
    const storeName = (body.storeName || '').trim();
    const city = (body.city || '').trim();
    const state = (body.state || 'Maharashtra').trim();
    const address = (body.address || '').trim();
    const pinCode = (body.pinCode || body.pincode || '').toString().trim();
    const panNumber = (body.panNumber || body.pan || '').toString().trim().toUpperCase();
    const gstNumber = (body.gstNumber || body.gst || '').toString().trim().toUpperCase();
    const accountNumber = (body.accountNumber || body.accountNo || '').toString().trim();
    const ifscCode = (body.ifscCode || body.ifsc || '').toString().trim().toUpperCase();
    const bankName = (body.bankName || 'Partner Bank').trim();

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Please provide full partner contact name' },
        { status: 400 }
      );
    }

    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!storeName) {
      return NextResponse.json(
        { success: false, message: 'Store / business name is required' },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        { success: false, message: 'City is required' },
        { status: 400 }
      );
    }

    // Check duplicate
    const existing = await findPartnerByIdentifier(phone);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A partner with this phone number is already registered' },
        { status: 409 }
      );
    }

    const existingEmail = await findPartnerByIdentifier(email);
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'A partner with this email is already registered' },
        { status: 409 }
      );
    }

    const pinCodesList = pinCode
      ? [pinCode]
      : Array.isArray(body.pinCodes) && body.pinCodes.length > 0
      ? body.pinCodes
      : ['560001'];

    const newPartner: Partner = {
      id: `partner-${Date.now().toString().slice(-5)}`,
      name,
      storeName,
      phone,
      email,
      city,
      state,
      address,
      pinCodes: pinCodesList,
      categories: Array.isArray(body.categories) && body.categories.length > 0
        ? body.categories
        : ['cat-dslr', 'cat-lens', 'cat-video-camera'],
      status: 'pending', // Requires Super Admin approval!
      rating: 5.0,
      totalOrders: 0,
      completedOrders: 0,
      totalEarnings: 0,
      pendingPayout: 0,
      availableBalance: 0,
      joinedAt: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      commission: 5.0,
      commissionType: 'percentage',
      password,
      documents: {
        pan: !!panNumber,
        panNumber,
        gst: !!gstNumber,
        gstNumber,
        bankProof: !!accountNumber,
        accountNumber,
        ifscCode,
        verified: false,
      },
    };

    const saved = await savePartner(newPartner);

    return NextResponse.json({
      success: true,
      message: 'Partner registered successfully. Your application is under review by Super Admin.',
      partner: saved,
      status: 'pending',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Partner registration failed' },
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

    const partnerId = (body.id || body.partnerId || '').trim();
    if (!partnerId) {
      return NextResponse.json(
        { success: false, message: 'partnerId is required' },
        { status: 400 }
      );
    }

    const updated = await updatePartner(partnerId, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      partner: updated,
      message: `Partner status updated to ${updated.status || 'updated'} successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update partner' },
      { status: 500 }
    );
  }
}
