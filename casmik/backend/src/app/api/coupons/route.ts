import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export interface CouponItem {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
}

const defaultCoupons: CouponItem[] = [
  {
    id: 'cpn-1',
    code: 'CAMSIK15',
    description: '15% Off on DSLR & Cinema Rentals',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 2000,
    maxDiscount: 1500,
    expiryDate: '2026-12-31',
    usageLimit: 500,
    usedCount: 142,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cpn-2',
    code: 'FIRSTBONUS',
    description: '₹500 Flat Bonus on First Camera Buyback',
    discountType: 'fixed',
    discountValue: 500,
    minOrderValue: 10000,
    maxDiscount: 500,
    expiryDate: '2026-11-30',
    usageLimit: 200,
    usedCount: 88,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cpn-3',
    code: 'FESTIVE2026',
    description: 'Festive Flash Discount ₹1,000 Off',
    discountType: 'fixed',
    discountValue: 1000,
    minOrderValue: 25000,
    maxDiscount: 1000,
    expiryDate: '2026-10-31',
    usageLimit: 100,
    usedCount: 97,
    active: false,
    createdAt: new Date().toISOString(),
  },
];

let inMemoryCoupons = [...defaultCoupons];

async function getOrSeedCoupons(): Promise<CouponItem[]> {
  try {
    const col = await getCollection<CouponItem>('admin_coupons');
    let items = await col.find({}).sort({ createdAt: -1 }).toArray();

    if (!items || items.length === 0) {
      for (const c of defaultCoupons) {
        await col.updateOne({ id: c.id }, { $set: c }, { upsert: true });
      }
      items = await col.find({}).sort({ createdAt: -1 }).toArray();
    }

    const sanitized = items.map(({ _id, ...rest }: any) => rest);
    inMemoryCoupons = sanitized;
    return sanitized;
  } catch (err: any) {
    console.warn('MongoDB coupons fallback:', err?.message);
    return inMemoryCoupons;
  }
}

export async function GET() {
  try {
    const all = await getOrSeedCoupons();
    return NextResponse.json({
      success: true,
      coupons: all,
      total: all.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCoupon: CouponItem = {
      id: body.id || `cpn-${Date.now()}`,
      code: (body.code || '').toUpperCase().trim(),
      description: body.description || '',
      discountType: body.discountType || 'fixed',
      discountValue: Number(body.discountValue || 0),
      minOrderValue: Number(body.minOrderValue || 0),
      maxDiscount: Number(body.maxDiscount || body.discountValue || 0),
      expiryDate: body.expiryDate || '2026-12-31',
      usageLimit: Number(body.usageLimit || 100),
      usedCount: 0,
      active: body.active !== false,
      createdAt: new Date().toISOString(),
    };

    if (!newCoupon.code) {
      return NextResponse.json({ success: false, message: 'Coupon code is required' }, { status: 400 });
    }

    try {
      const col = await getCollection<CouponItem>('admin_coupons');
      await col.insertOne(newCoupon as any);
    } catch (e) {
      console.warn('MongoDB insert coupon fallback:', e);
    }

    inMemoryCoupons.unshift(newCoupon);

    return NextResponse.json({
      success: true,
      coupon: newCoupon,
      message: 'Coupon created successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, active, discountValue, description } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Coupon id is required' }, { status: 400 });
    }

    const updates: Partial<CouponItem> = {};
    if (active !== undefined) updates.active = active;
    if (discountValue !== undefined) updates.discountValue = Number(discountValue);
    if (description !== undefined) updates.description = description;

    try {
      const col = await getCollection<CouponItem>('admin_coupons');
      await col.updateOne({ id }, { $set: updates });
    } catch (e) {
      console.warn('MongoDB update coupon fallback:', e);
    }

    const idx = inMemoryCoupons.findIndex((c) => c.id === id);
    if (idx !== -1) {
      inMemoryCoupons[idx] = { ...inMemoryCoupons[idx], ...updates };
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon: idx !== -1 ? inMemoryCoupons[idx] : { id, ...updates },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Coupon id is required' }, { status: 400 });
    }

    try {
      const col = await getCollection<CouponItem>('admin_coupons');
      await col.deleteOne({ id });
    } catch (e) {
      console.warn('MongoDB delete coupon fallback:', e);
    }

    inMemoryCoupons = inMemoryCoupons.filter((c) => c.id !== id);

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
