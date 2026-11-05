import { NextResponse } from 'next/server';
import { findUserByIdentifier, updateUser } from '@/lib/userStore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = (searchParams.get('identifier') || searchParams.get('phone') || '').trim();

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Identifier or phone number is required' },
        { status: 400 }
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
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const identifier = (body.phone || body.identifier || body.email || '').trim();
    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Phone number or identifier is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.email !== undefined) updates.email = body.email.trim();
    if (body.address !== undefined) updates.address = body.address.trim();
    if (body.upiId !== undefined) updates.upiId = body.upiId.trim();
    if (body.bankAccount !== undefined) updates.bankAccount = body.bankAccount.trim();

    const updatedUser = await updateUser(identifier, updates);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser || {
        phone: identifier,
        ...updates,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
