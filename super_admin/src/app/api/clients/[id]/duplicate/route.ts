import { NextResponse } from 'next/server';
import { getTenantBySlugOrId, createTenant } from '@/lib/tenantMaster';
import { provisionTenantDatabase } from '@/lib/tenantDb';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sourceTenant = await getTenantBySlugOrId(id);

    if (!sourceTenant) {
      return NextResponse.json({ success: false, message: 'Source client not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const newSlug = body.newSlug || `${sourceTenant.slug}-copy-${Math.floor(1000 + Math.random() * 9000)}`;
    const newName = body.newName || `${sourceTenant.name} (Copy)`;
    const newDbName = `casmik_tenant_${newSlug.replace(/-/g, '_')}`;

    const duplicatedTenant = await createTenant({
      name: newName,
      slug: newSlug,
      dbName: newDbName,
      templateId: sourceTenant.templateId,
      status: 'trial',
      branding: {
        ...sourceTenant.branding,
        brandName: newName,
      },
      features: { ...sourceTenant.features },
      subscription: {
        ...sourceTenant.subscription,
        plan: sourceTenant.subscription?.plan || 'growth',
        status: 'trial',
        validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
      },
    });

    const provisionResult = await provisionTenantDatabase(duplicatedTenant);

    return NextResponse.json({
      success: true,
      message: `Client duplicated as '${duplicatedTenant.name}' with database '${duplicatedTenant.dbName}'!`,
      client: duplicatedTenant,
      provisioning: provisionResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Duplication failed' },
      { status: 500 }
    );
  }
}

