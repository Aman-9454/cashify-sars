import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Previous verification cleared. New verification required.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to recheck' },
      { status: 500 }
    );
  }
}
