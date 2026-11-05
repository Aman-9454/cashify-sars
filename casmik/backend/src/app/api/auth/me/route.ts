import { NextResponse } from 'next/server';
import { findUserByIdentifier } from '@/lib/userStore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone') || searchParams.get('identifier');
    const authHeader = request.headers.get('authorization');

    let identifier = phone;
    if (!identifier && authHeader && authHeader.startsWith('Bearer ')) {
      // In demo/test tokens, sometimes the token or decoded token contains phone
      const token = authHeader.replace('Bearer ', '').trim();
      identifier = token;
    }

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized or missing user identifier' },
        { status: 401 }
      );
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address || '',
        upiId: user.upiId || '',
        bankAccount: user.bankAccount || '',
        role: 'user',
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error retrieving user' },
      { status: 500 }
    );
  }
}
