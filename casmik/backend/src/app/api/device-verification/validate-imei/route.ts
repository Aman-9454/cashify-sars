import { NextResponse } from 'next/server';
import { getVerificationProvider } from '@/lib/deviceVerification/providers';
import { saveVerificationReport } from '@/lib/deviceVerification/verificationStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { imei, imei2, selectedBrand, selectedModel, selectedVariant, source, deviceDetailsFromApp } = body;

    if (!imei) {
      return NextResponse.json(
        { success: false, message: 'IMEI number is required' },
        { status: 400 }
      );
    }

    if (!selectedBrand || !selectedModel) {
      return NextResponse.json(
        { success: false, message: 'Selected brand and model are required for device matching' },
        { status: 400 }
      );
    }

    const provider = getVerificationProvider();
    const report = await provider.verifyDevice({
      imei,
      imei2,
      selectedBrand,
      selectedModel,
      selectedVariant,
      source: source || 'website-manual',
      deviceDetailsFromApp,
    });

    await saveVerificationReport(report);

    return NextResponse.json({
      success: true,
      report,
      provider: provider.name,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
