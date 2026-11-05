import { NextResponse } from 'next/server';
import { updateTenant } from '@/lib/tenantMaster';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedStatuses = ['active', 'inactive', 'suspended', 'trial'];
    if (!body.status || !allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, message: `Status must be one of: ${allowedStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await updateTenant(id, { status: body.status });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Tenant status updated to '${body.status}'`,
      client: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Status update failed' },
      { status: 500 }
    );
  }
}

