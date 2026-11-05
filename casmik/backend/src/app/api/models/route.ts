import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { deviceModels, brands, DeviceModel } from '@/lib/casmikData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const brandId = searchParams.get('brandId');
    const search = searchParams.get('search')?.toLowerCase().trim();

    let allModels: DeviceModel[] = [];

    try {
      const col = await getCollection<DeviceModel>('device_models');
      const count = await col.countDocuments();
      if (count === 0 && deviceModels.length > 0) {
        await col.insertMany(deviceModels as any);
      }
      const dbItems = await col.find({}).toArray();
      allModels = dbItems.map(({ _id, ...rest }: any) => rest as DeviceModel);
    } catch (dbErr) {
      console.warn('MongoDB models fallback to in-memory deviceModels:', dbErr);
      allModels = [...deviceModels];
    }

    let filtered = allModels.filter((m) => m.active !== false);

    if (categoryId && categoryId !== 'all') {
      filtered = filtered.filter((m) => m.categoryId === categoryId);
    }

    if (brandId && brandId !== 'all') {
      filtered = filtered.filter((m) => m.brandId === brandId);
    }

    if (search) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(search) ||
        (m.slug && m.slug.toLowerCase().includes(search)) ||
        (m.alt && m.alt.toLowerCase().includes(search))
      );
    }

    // Associated brands enriched with accurate dynamic modelCount
    const rawBrands = categoryId && categoryId !== 'all'
      ? brands.filter((b) => b.categoryId === categoryId && b.active)
      : brands.filter((b) => b.active);

    const activeBrands = rawBrands.map((b) => {
      const count = allModels.filter(
        (m) =>
          m.brandId === b.id &&
          (!b.categoryId || b.categoryId === 'all' || m.categoryId === b.categoryId) &&
          m.active !== false
      ).length;
      return {
        ...b,
        modelCount: count,
      };
    });

    return NextResponse.json({
      success: true,
      models: filtered,
      brands: activeBrands,
      total: filtered.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch device models' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'reset') {
      try {
        const col = await getCollection<DeviceModel>('device_models');
        await col.deleteMany({});
        await col.insertMany(deviceModels as any);
      } catch {}
      return NextResponse.json({
        success: true,
        message: 'Device models reset to defaults',
        models: deviceModels,
      });
    }

    const { name, brandId, categoryId, basePrice } = body;
    if (!name || !brandId || !categoryId) {
      return NextResponse.json(
        { success: false, message: 'Name, brandId, and categoryId are required' },
        { status: 400 }
      );
    }

    const newModel: DeviceModel = {
      id: body.id || `mod-${Date.now()}`,
      brandId,
      categoryId,
      name,
      slug: body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      basePrice: Number(basePrice) || 0,
      image: body.image || '',
      alt: body.alt || name,
      storages: Array.isArray(body.storages) && body.storages.length ? body.storages : ['128GB', '256GB'],
      colors: Array.isArray(body.colors) && body.colors.length ? body.colors : ['Default'],
      active: body.active !== false,
      specs: body.specs || {},
    };

    try {
      const col = await getCollection<DeviceModel>('device_models');
      await col.insertOne({ ...newModel } as any);
    } catch (e) {
      console.warn('MongoDB model insert warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Model added successfully',
      model: newModel,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to add model' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Model id is required' },
        { status: 400 }
      );
    }

    const updateFields: any = { ...body };
    delete updateFields._id;
    delete updateFields.id;

    try {
      const col = await getCollection<DeviceModel>('device_models');
      await col.updateOne({ id }, { $set: updateFields });
    } catch (e) {
      console.warn('MongoDB model update warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Model updated successfully',
      model: body,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update model' },
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
        { success: false, message: 'Model id is required' },
        { status: 400 }
      );
    }

    try {
      const col = await getCollection<DeviceModel>('device_models');
      await col.deleteOne({ id });
    } catch (e) {
      console.warn('MongoDB model delete warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Model deleted successfully',
      id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete model' },
      { status: 500 }
    );
  }
}
