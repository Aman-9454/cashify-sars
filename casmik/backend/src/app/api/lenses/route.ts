import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export interface CameraLensItem {
  id: string;
  name: string;
  type: string;
  price: number;
  icon?: string;
  active: boolean;
  sortOrder?: number;
  updatedAt?: string;
}

const DEFAULT_LENSES: CameraLensItem[] = [
  { id: 'lens-kit', name: '18-55mm / 16-50mm Standard Kit Lens', type: 'Kit Lens', price: 4500, icon: '📷', active: true, sortOrder: 1 },
  { id: 'lens-prime', name: '50mm f/1.8 Prime Portrait Lens', type: 'Prime Lens', price: 7500, icon: '🔍', active: true, sortOrder: 2 },
  { id: 'lens-telephoto', name: '55-250mm / 70-300mm Telephoto Zoom', type: 'Telephoto Zoom', price: 9500, icon: '🔭', active: true, sortOrder: 3 },
  { id: 'lens-pro-zoom', name: '24-70mm f/2.8 Pro Standard Zoom', type: 'Professional Zoom', price: 26000, icon: '💎', active: true, sortOrder: 4 },
  { id: 'lens-wide', name: '10-18mm / 16-35mm Ultra-Wide Angle', type: 'Wide Angle', price: 14000, icon: '🌄', active: true, sortOrder: 5 },
  { id: 'lens-flagship-tele', name: '70-200mm f/2.8 Flagship Telephoto', type: 'Pro Telephoto', price: 36000, icon: '⚡', active: true, sortOrder: 6 },
];

export async function GET() {
  try {
    const col = await getCollection<CameraLensItem>('camera_lenses');
    let items = await col.find({}).sort({ sortOrder: 1 }).toArray();

    // Seed default lenses if collection is empty
    if (!items || items.length === 0) {
      await col.insertMany(DEFAULT_LENSES as any);
      items = await col.find({}).sort({ sortOrder: 1 }).toArray();
    }

    return NextResponse.json({
      success: true,
      lenses: items.map(({ _id, ...rest }: any) => rest),
      total: items.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.warn('MongoDB lenses query error, using default fallback:', error?.message);
    return NextResponse.json({
      success: true,
      lenses: DEFAULT_LENSES,
      total: DEFAULT_LENSES.length,
      fallback: true,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, price, icon } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, message: 'Name and price are required' },
        { status: 400 }
      );
    }

    const id = body.id || `lens-custom-${Date.now()}`;
    const newLens: CameraLensItem = {
      id,
      name: name.trim(),
      type: (type || 'Custom Lens').trim(),
      price: Number(price) || 0,
      icon: icon || '📷',
      active: true,
      sortOrder: Date.now(),
      updatedAt: new Date().toISOString(),
    };

    const col = await getCollection<CameraLensItem>('camera_lenses');
    await col.updateOne({ id }, { $set: newLens }, { upsert: true });

    return NextResponse.json({
      success: true,
      lens: newLens,
      message: 'Camera lens created successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create camera lens' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, type, price, icon, active, sortOrder } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Lens ID is required' },
        { status: 400 }
      );
    }

    const updateFields: Partial<CameraLensItem> = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateFields.name = name.trim();
    if (type !== undefined) updateFields.type = type.trim();
    if (price !== undefined) updateFields.price = Number(price);
    if (icon !== undefined) updateFields.icon = icon;
    if (active !== undefined) updateFields.active = Boolean(active);
    if (sortOrder !== undefined) updateFields.sortOrder = Number(sortOrder);

    const col = await getCollection<CameraLensItem>('camera_lenses');
    const result = await col.updateOne({ id }, { $set: updateFields });

    if (result.matchedCount === 0) {
      // If not found in DB yet, upsert it
      await col.updateOne({ id }, { $set: { ...body, updatedAt: new Date().toISOString() } }, { upsert: true });
    }

    return NextResponse.json({
      success: true,
      message: 'Camera lens updated successfully',
      updated: { id, ...updateFields },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update camera lens' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Lens ID is required' },
        { status: 400 }
      );
    }

    const col = await getCollection<CameraLensItem>('camera_lenses');
    await col.deleteOne({ id });

    return NextResponse.json({
      success: true,
      message: 'Camera lens removed successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete camera lens' },
      { status: 500 }
    );
  }
}
