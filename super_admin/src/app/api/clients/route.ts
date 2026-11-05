import { NextResponse } from 'next/server';
import { getAllTenants, createTenant } from '@/lib/tenantMaster';
import { provisionTenantDatabase } from '@/lib/tenantDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const clients = await getAllTenants();
    return NextResponse.json({
      success: true,
      clients,
      total: clients.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch SaaS clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, message: 'Client name and slug are required' },
        { status: 400 }
      );
    }

    const newTenant = await createTenant(body);

    let provisioningResult = null;
    if (body.autoProvision !== false) {
      provisioningResult = await provisionTenantDatabase(newTenant, body.adminDetails);
    }

    return NextResponse.json({
      success: true,
      message: `Client '${newTenant.name}' created with dedicated database '${newTenant.dbName}'!`,
      client: newTenant,
      provisioning: provisioningResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create SaaS client' },
      { status: 500 }
    );
  }
}
