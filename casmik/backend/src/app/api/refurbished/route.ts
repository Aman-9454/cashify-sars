import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { defaultRefurbishedProducts, RefurbishedProduct } from '@/lib/refurbishedCatalog';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const condition = searchParams.get('condition');
    const modelId = searchParams.get('modelId');
    const search = searchParams.get('search')?.toLowerCase().trim();

    const col = await getCollection<RefurbishedProduct>('refurbished_products');
    let count = await col.countDocuments();

    // Auto-seed collection from defaultRefurbishedProducts if empty
    if (count === 0) {
      if (defaultRefurbishedProducts && defaultRefurbishedProducts.length > 0) {
        await col.insertMany(defaultRefurbishedProducts as any);
      }
    }

    const query: Record<string, any> = {};
    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    if (condition && condition !== 'all') {
      query.condition = { $regex: new RegExp(`^${condition}$`, 'i') };
    }
    if (modelId) {
      query.modelId = modelId;
    }
    if (search) {
      query.$or = [
        { model: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { specs: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await col.find(query).toArray();
    const cleanItems = items.map(({ _id, ...rest }: any) => rest);

    return NextResponse.json({
      success: true,
      products: cleanItems,
      total: cleanItems.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.warn('MongoDB refurbished query error, using default fallback:', error?.message);
    let fallback = [...defaultRefurbishedProducts];
    return NextResponse.json({
      success: true,
      products: fallback,
      total: fallback.length,
      fallback: true,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const col = await getCollection<RefurbishedProduct>('refurbished_products');

    // Handle Reset action
    if (body.action === 'reset') {
      await col.deleteMany({});
      await col.insertMany(defaultRefurbishedProducts as any);
      const items = await col.find({}).toArray();
      return NextResponse.json({
        success: true,
        message: 'Refurbished inventory reset to default catalog',
        products: items.map(({ _id, ...rest }: any) => rest),
      });
    }

    const { model, brand, category, condition, sellingPrice, id } = body;
    if (!model || !brand || !sellingPrice) {
      return NextResponse.json(
        { success: false, message: 'Model, brand, and sellingPrice are required' },
        { status: 400 }
      );
    }

    const newProduct: RefurbishedProduct = {
      id: id || `ref-${Date.now()}`,
      modelId: body.modelId || model.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand,
      model,
      category: category || 'Smartphones',
      condition: condition || 'Superb',
      conditionNote: body.conditionNote || 'Certified authentic, 45-point testing passed',
      storage: body.storage || '128GB',
      color: body.color || 'Standard',
      originalPrice: Number(body.originalPrice) || Number(sellingPrice),
      sellingPrice: Number(sellingPrice),
      discount: Number(body.discount) || 0,
      batteryHealth: body.batteryHealth || 98,
      warranty: body.warranty || '12 months',
      rating: Number(body.rating) || 4.9,
      reviews: Number(body.reviews) || 50,
      deliveryDays: Number(body.deliveryDays) || 2,
      image: body.image || '/assets/images/refurbished/iphone-15-pro.png',
      gallery: Array.isArray(body.gallery) && body.gallery.length > 0 ? body.gallery : [body.image || '/assets/images/refurbished/iphone-15-pro.png'],
      stock: Number(body.stock) || 1,
      status: body.status || 'available',
      specs: body.specs || '',
      inspectionReport: body.inspectionReport || {
        display: 'Passed',
        battery: 'Passed',
        camera: 'Passed',
        speakers: 'Passed',
        chargingPort: 'Passed',
        sensor: 'Passed',
      },
    };

    await col.insertOne(newProduct as any);

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required for update' },
        { status: 400 }
      );
    }

    const col = await getCollection<RefurbishedProduct>('refurbished_products');

    // Remove immutable fields if present
    delete (updates as any)._id;

    if (updates.sellingPrice !== undefined) updates.sellingPrice = Number(updates.sellingPrice);
    if (updates.originalPrice !== undefined) updates.originalPrice = Number(updates.originalPrice);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    if (updates.discount !== undefined) updates.discount = Number(updates.discount);

    const result = await col.updateOne(
      { id },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const updated = await col.findOne({ id });
    const cleanUpdated = updated ? (({ _id, ...rest }: any) => rest)(updated) : null;

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: cleanUpdated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required for deletion' },
        { status: 400 }
      );
    }

    const col = await getCollection<RefurbishedProduct>('refurbished_products');
    const result = await col.deleteOne({ id });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
