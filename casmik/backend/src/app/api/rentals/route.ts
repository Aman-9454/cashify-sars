import { NextResponse } from 'next/server';
import { defaultRentalCameras, RentalCamera } from '@/lib/rentalCatalog';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search')?.toLowerCase().trim();

    let cameras: any[] = [];

    try {
      const db = await getDatabase();
      const collection = db.collection('rental_cameras');
      let dbCameras = await collection.find({}).toArray();

      // Auto-seed if collection is empty
      if (!dbCameras || dbCameras.length === 0) {
        const seedData = defaultRentalCameras.map((cam) => ({
          ...cam,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        await collection.insertMany(seedData);
        dbCameras = await collection.find({}).toArray();
      }

      cameras = dbCameras.map((doc: any) => {
        const { _id, ...rest } = doc;
        return {
          id: rest.id || _id?.toString(),
          ...rest,
        };
      });
    } catch (e: any) {
      console.error('MongoDB rentals fetch error, falling back to catalog:', e?.message);
      cameras = [...defaultRentalCameras];
    }

    if (category && category !== 'all') {
      cameras = cameras.filter(
        (c) => c.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (brand && brand !== 'all') {
      cameras = cameras.filter(
        (c) => c.brand?.toLowerCase() === brand.toLowerCase()
      );
    }

    if (search) {
      cameras = cameras.filter(
        (c) =>
          c.model?.toLowerCase().includes(search) ||
          c.brand?.toLowerCase().includes(search) ||
          c.specs?.toLowerCase().includes(search) ||
          c.category?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      count: cameras.length,
      cameras,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch rentals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.model || !body.brand) {
      return NextResponse.json(
        { success: false, message: 'Model and Brand are required fields' },
        { status: 400 }
      );
    }

    const id = body.id || `rent-${body.brand.toLowerCase()}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const newCamera: RentalCamera = {
      id,
      modelId: body.modelId || id,
      brand: body.brand,
      model: body.model,
      category: body.category || 'Cinema Cameras',
      sensor: body.sensor || 'Full-Frame CMOS',
      mount: body.mount || 'Universal Mount',
      videoRes: body.videoRes || '4K 60p',
      dailyPrice: Number(body.dailyPrice) || 1999,
      weeklyPrice: Number(body.weeklyPrice) || (Number(body.dailyPrice) || 1999) * 6,
      securityDeposit: Number(body.securityDeposit) || 5000,
      rating: Number(body.rating) || 5.0,
      reviewsCount: Number(body.reviewsCount) || 1,
      image: body.image || '/assets/images/refurbished/sony-a7.jpg',
      gallery: Array.isArray(body.gallery) && body.gallery.length > 0 ? body.gallery : [body.image || '/assets/images/refurbished/sony-a7.jpg'],
      includedKit: Array.isArray(body.includedKit) ? body.includedKit : (body.includedKit ? [body.includedKit] : ['2x Batteries', 'Fast Charger', 'Hard Case']),
      specs: body.specs || 'Professional gear with 4K video recording, high dynamic range and active stabilization',
      features: Array.isArray(body.features) ? body.features : ['Fast Autofocus', 'Weather Sealed Body', 'Dual Card Slots'],
      stock: Number(body.stock) || 1,
      status: body.status || 'available',
      popular: Boolean(body.popular),
      minDays: Number(body.minDays) || 1,
    };

    const db = await getDatabase();
    await db.collection('rental_cameras').updateOne(
      { id: newCamera.id },
      { $set: { ...newCamera, createdAt: now, updatedAt: now } },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Rental camera added to fleet successfully',
      camera: newCamera,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to add rental camera' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Camera ID is required to update' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const updateData: any = { ...body, updatedAt: new Date().toISOString() };
    delete updateData._id;

    const result = await db.collection('rental_cameras').updateOne(
      { id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: `Rental camera with id ${id} not found` },
        { status: 404 }
      );
    }

    const updated = await db.collection('rental_cameras').findOne({ id });
    const { _id, ...cleanUpdated } = updated as any;

    return NextResponse.json({
      success: true,
      message: 'Rental camera updated successfully',
      camera: cleanUpdated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update rental camera' },
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
        { success: false, message: 'Camera ID is required to delete' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db.collection('rental_cameras').deleteOne({ id });

    return NextResponse.json({
      success: true,
      message: 'Rental camera removed from fleet successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete rental camera' },
      { status: 500 }
    );
  }
}
