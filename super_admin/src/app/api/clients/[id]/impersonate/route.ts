import { NextResponse } from 'next/server';
import { getTenantBySlugOrId } from '@/lib/tenantMaster';
import { getMasterDatabase } from '@/lib/tenantMaster';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getTenantBySlugOrId(id);

    if (!client) {
      return NextResponse.json({ success: false, message: 'Client not found' }, { status: 404 });
    }

    const sessionToken = `imp_${client.id}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = new Date(Date.now() + 2 * 3600000).toISOString(); // 2 hours valid

    // Write SaaS Audit Log in Master Database
    const masterDb = await getMasterDatabase();
    await masterDb.collection('saas_audit_logs').insertOne({
      action: 'TENANT_IMPERSONATION',
      tenantId: client.id,
      tenantSlug: client.slug,
      tenantName: client.name,
      impersonatedBy: 'Super Admin',
      sessionToken,
      expiresAt,
      createdAt: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    const tenantAdminUrl = `http://localhost:3000/admin?tenant=${client.slug}&token=${sessionToken}`;

    return NextResponse.json({
      success: true,
      message: `Impersonation session established for '${client.name}'`,
      client,
      sessionToken,
      expiresAt,
      portalUrl: tenantAdminUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Impersonation failed' },
      { status: 500 }
    );
  }
}

