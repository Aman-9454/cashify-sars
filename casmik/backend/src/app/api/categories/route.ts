import { NextResponse } from 'next/server';
import { categories } from '@/lib/casmikData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      categories: categories.filter((c) => c.active),
      total: categories.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
