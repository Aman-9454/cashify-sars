import { NextResponse } from 'next/server';
import { AVAILABLE_TEMPLATES } from '@/lib/templates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      templates: AVAILABLE_TEMPLATES,
      total: AVAILABLE_TEMPLATES.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

