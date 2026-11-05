import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const startTime = Date.now();
    const db = await getDatabase();
    
    // Ping the database
    const pingResult = await db.command({ ping: 1 });
    const collections = await db.listCollections().toArray();
    const latency = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      status: 'connected',
      database: db.databaseName,
      latencyMs: latency,
      ping: pingResult,
      collectionsCount: collections.length,
      collections: collections.map((c) => c.name),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: error?.message || 'Failed to connect to MongoDB Atlas',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
