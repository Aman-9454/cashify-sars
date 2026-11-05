import { NextResponse } from 'next/server';
import { getMasterDatabase } from '@/lib/tenantMaster';
import { getTenantBySlugOrId, updateTenant } from '@/lib/tenantMaster';
import { TenantDomainRecord } from '@/lib/types';
import dns from 'dns';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    const db = await getMasterDatabase();
    const query = tenantId ? { tenantId } : {};
    const domains = await db.collection('domains').find(query).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ success: true, domains, total: domains.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to fetch domains' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, domain } = body;

    if (!tenantId || !domain) {
      return NextResponse.json({ success: false, message: 'tenantId and domain are required' }, { status: 400 });
    }

    const tenant = await getTenantBySlugOrId(tenantId);
    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Tenant not found' }, { status: 404 });
    }

    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const challengeKey = `camsik-verify-${tenant.slug}-${Math.random().toString(36).substring(2, 8)}`;

    const domainRecord: TenantDomainRecord & { tenantId: string; tenantSlug: string; createdAt: string } = {
      id: `dom_${Math.random().toString(36).substring(2, 10)}`,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      domain: cleanDomain,
      isCustom: true,
      isPrimary: false,
      status: 'pending_dns',
      sslStatus: 'pending',
      dnsRecords: [
        {
          type: 'CNAME',
          host: cleanDomain,
          value: 'camsik-proxy.camsik.com',
        },
        {
          type: 'TXT',
          host: `_camsik-challenge.${cleanDomain}`,
          value: challengeKey,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const db = await getMasterDatabase();
    await db.collection('domains').insertOne(domainRecord as any);

    return NextResponse.json({
      success: true,
      message: `Domain '${cleanDomain}' registered! Please configure DNS records.`,
      domain: domainRecord,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Domain registration failed' }, { status: 500 });
  }
}

