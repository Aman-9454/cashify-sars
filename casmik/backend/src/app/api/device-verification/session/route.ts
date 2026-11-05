import { NextResponse } from 'next/server';
import { createVerificationSession } from '@/lib/deviceVerification/verificationStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { selectedDevice, userId, sellFlowId } = body;

    if (!selectedDevice || !selectedDevice.brand || !selectedDevice.model) {
      return NextResponse.json(
        { success: false, message: 'selectedDevice with brand and model is required' },
        { status: 400 }
      );
    }

    const session = await createVerificationSession({
      userId,
      sellFlowId,
      selectedDevice,
    });

    const host = request.headers.get('host') || 'localhost:4028';
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const origin = `${proto}://${host}`;

    // App handoff link and web verification session URL
    const webVerificationUrl = `${origin}/verify-device/${session.sessionId}`;
    const appDeepLink = `camsik://verify-device/session/${session.sessionId}?token=${session.token}`;

    return NextResponse.json({
      success: true,
      session: {
        ...session,
        webVerificationUrl,
        appDeepLink,
      },
      message: 'Verification session created',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create verification session' },
      { status: 500 }
    );
  }
}
