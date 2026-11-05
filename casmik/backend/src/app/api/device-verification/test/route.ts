import { NextResponse } from 'next/server';
import { runTestSuites } from '@/lib/deviceVerification/runVerificationTests';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const results = await runTestSuites();
    const allPassed = results.every(r => r.passed);
    return NextResponse.json({
      success: allPassed,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
