import { NextResponse } from 'next/server';
import { brands, deviceModels } from '@/lib/casmikData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search')?.toLowerCase().trim();

    let filtered = brands.filter((b) => b.active);

    if (categoryId && categoryId !== 'all') {
      filtered = filtered.filter((b) => b.categoryId === categoryId);
    }

    if (search) {
      filtered = filtered.filter((b) =>
        b.name.toLowerCase().includes(search) ||
        b.slug.toLowerCase().includes(search)
      );
    }

    // Enrich with dynamic model count strictly matching active models
    const enriched = filtered.map((b) => {
      const matchingModels = deviceModels.filter(
        (m) =>
          m.brandId === b.id &&
          (!b.categoryId || b.categoryId === 'all' || m.categoryId === b.categoryId) &&
          m.active
      );
      return {
        ...b,
        modelCount: matchingModels.length,
      };
    });

    return NextResponse.json({
      success: true,
      brands: enriched,
      total: enriched.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}
