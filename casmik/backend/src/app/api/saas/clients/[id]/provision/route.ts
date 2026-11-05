import { NextResponse } from 'next/server';
import { getTenantBySlugOrId } from '@/lib/saas/tenantMaster';
import { provisionTenantDatabase, getTenantDatabaseStatus } from '@/lib/saas/tenantDb';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getTenantBySlugOrId(id);

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Client not found' },
        { status: 404 }
      );
    }

    const result = await provisionTenantDatabase(client);
    const dbStatus = await getTenantDatabaseStatus(client);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      seeded: result.seeded,
      database: dbStatus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Database provisioning failed' },
      { status: 500 }
    );
  }
}

