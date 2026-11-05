import { NextResponse } from 'next/server';
import { getAuthenticationParameters, IMAGEKIT_CONFIG } from '@/lib/imagekit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authParams = getAuthenticationParameters();

    return NextResponse.json({
      success: true,
      ...authParams,
      publicKey: IMAGEKIT_CONFIG.publicKey,
      urlEndpoint: IMAGEKIT_CONFIG.urlEndpoint,
      folder: IMAGEKIT_CONFIG.folder,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to generate ImageKit authentication parameters',
      },
      { status: 500 }
    );
  }
}
