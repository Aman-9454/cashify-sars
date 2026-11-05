import { NextResponse } from 'next/server';
import { getVerificationReport } from '@/lib/deviceVerification/verificationStore';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ verificationId: string }> }
) {
  try {
    const { verificationId } = await params;
    const report = await getVerificationReport(verificationId);

    if (!report) {
      return NextResponse.json(
        { success: false, message: 'Verification report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch verification report' },
      { status: 500 }
    );
  }
}
