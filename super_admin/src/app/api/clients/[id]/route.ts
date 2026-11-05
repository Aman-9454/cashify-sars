import { NextResponse } from 'next/server';
import { getTenantBySlugOrId, updateTenant, deleteTenant } from '@/lib/tenantMaster';
import { getTenantDatabaseStatus } from '@/lib/tenantDb';

export const dynamic = 'force-dynamic';

export async function GET(
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

    const dbStatus = await getTenantDatabaseStatus(client);

    return NextResponse.json({
      success: true,
      client,
      database: dbStatus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateTenant(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Client not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Client updated successfully',
      client: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteTenant(id);

    return NextResponse.json({
      success,
      message: success ? 'Client deleted successfully' : 'Client deletion failed',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete client' },
      { status: 500 }
    );
  }
}

