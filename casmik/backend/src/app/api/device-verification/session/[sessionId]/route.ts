import { NextResponse } from 'next/server';
import { getVerificationSession, completeVerificationSession } from '@/lib/deviceVerification/verificationStore';
import { getVerificationProvider } from '@/lib/deviceVerification/providers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await getVerificationSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Verification session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await getVerificationSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Verification session not found' },
        { status: 404 }
      );
    }

    if (session.status === 'expired') {
      return NextResponse.json(
        { success: false, message: 'Verification session has expired. Please generate a new session.' },
        { status: 410 }
      );
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { imei, imei2, deviceDetails } = body;

    if (!imei) {
      return NextResponse.json(
        { success: false, message: 'IMEI is required to complete verification' },
        { status: 400 }
      );
    }

    const provider = getVerificationProvider();
    const report = await provider.verifyDevice({
      imei,
      imei2,
      selectedBrand: session.selectedDevice.brand,
      selectedModel: session.selectedDevice.model,
      selectedVariant: session.selectedDevice.variant || session.selectedDevice.storage,
      source: 'qr-session',
      deviceDetailsFromApp: deviceDetails,
    });

    const updatedSession = await completeVerificationSession(sessionId, report);

    return NextResponse.json({
      success: true,
      session: updatedSession,
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to complete verification session' },
      { status: 500 }
    );
  }
}
