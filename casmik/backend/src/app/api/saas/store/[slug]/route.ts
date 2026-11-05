import { NextResponse } from 'next/server';
import { getTenantBySlugOrId } from '@/lib/saas/tenantMaster';
import { getTemplateById } from '@/lib/saas/templates';
import { getTenantDatabase } from '@/lib/saas/tenantDb';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const client = await getTenantBySlugOrId(slug);

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Store not found' },
        { status: 404 }
      );
    }

    if (client.status === 'suspended' || client.status === 'inactive') {
      return NextResponse.json(
        { success: false, message: 'This storefront is currently unavailable' },
        { status: 403 }
      );
    }

    const template = getTemplateById(client.templateId);

    // Query the client's dedicated MongoDB database
    let categories: any[] = [];
    let brands: any[] = [];
    try {
      const db = await getTenantDatabase(client.dbName);
      categories = await db.collection('categories').find({}).limit(12).toArray();
      brands = await db.collection('brands').find({}).limit(12).toArray();
    } catch (dbErr) {
      console.warn(`[storefront API] Could not read from tenant DB ${client.dbName}:`, dbErr);
    }

    return NextResponse.json({
      success: true,
      store: {
        id: client.id,
        name: client.name,
        slug: client.slug,
        branding: client.branding,
        features: client.features,
        template,
        database: {
          name: client.dbName,
          status: 'connected',
        },
        catalog: {
          categoriesCount: categories.length,
          categories,
          brandsCount: brands.length,
          brands,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to load storefront data' },
      { status: 500 }
    );
  }
}

