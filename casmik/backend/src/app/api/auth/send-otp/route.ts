import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory OTP storage for phone verification
const otpStore: Map<string, { otp: string; expiresAt: number }> =
  (globalThis as any)._camsikOtpStore || new Map();
(globalThis as any)._camsikOtpStore = otpStore;

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const phone = (body.phone || body.identifier || '').trim().replace(/\D/g, '').slice(-10);
    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    // Generate 4-digit OTP (for testing/demo: standard or random)
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    otpStore.set(phone, { otp: generatedOtp, expiresAt });

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to +91 ${phone}`,
      otp: generatedOtp, // Included for instant sandbox testing
      expiresIn: 300,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
