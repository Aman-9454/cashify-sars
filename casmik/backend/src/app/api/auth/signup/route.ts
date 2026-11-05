import { NextResponse } from 'next/server';
import { findUserByIdentifier, saveLocalUser, StoredUser } from '@/lib/userStore';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      try {
        const text = await request.text();
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    const name = (body.name || '').trim();
    const phone = (body.phone || '').trim().replace(/\D/g, '').slice(-10);
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const existingUser = await findUserByIdentifier(phone);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Mobile number is already registered. Please sign in with your password.' },
        { status: 409 }
      );
    }

    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      name: name || `Camsik User ${phone.slice(-4)}`,
      phone,
      email: email || `${phone}@camsik.in`,
      passwordHash: password,
      createdAt: new Date().toISOString(),
    };

    // Save to local file store
    saveLocalUser(newUser);

    // Save to MongoDB asynchronously
    try {
      const db = await getDatabase();
      await db.collection('customers').insertOne({ ...newUser });
    } catch (dbErr) {
      console.warn('MongoDB insert warning in signup:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
