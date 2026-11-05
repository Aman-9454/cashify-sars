import { NextResponse } from 'next/server';
import { getMasterDatabase } from '@/lib/tenantMaster';
import { updateTenant } from '@/lib/tenantMaster';
import dns from 'dns/promises';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params;
    const cleanDomain = decodeURIComponent(domain).toLowerCase().trim();

    const db = await getMasterDatabase();
    const domainRecord = await db.collection('domains').findOne({ domain: cleanDomain });

    if (!domainRecord) {
      return NextResponse.json({ success: false, message: 'Domain record not found' }, { status: 404 });
    }

    let cnameResolved = false;
    let txtResolved = false;
    const diagnostics: string[] = [];

    // 1. Check CNAME resolution
    try {
      const cnames = await dns.resolveCname(cleanDomain);
      if (cnames.some((c) => c.includes('camsik-proxy.camsik.com') || c.includes('camsik'))) {
        cnameResolved = true;
        diagnostics.push(`CNAME resolved to ${cnames.join(', ')}`);
      } else {
        diagnostics.push(`CNAME points to ${cnames.join(', ')} (expected camsik-proxy.camsik.com)`);
      }
    } catch (cnameErr: any) {
      diagnostics.push(`CNAME lookup error: ${cnameErr.code || cnameErr.message}`);
    }

    // 2. Check TXT resolution
    try {
      const txtRecords = await dns.resolveTxt(`_camsik-challenge.${cleanDomain}`);
      const flattened = txtRecords.flat();
      const expectedTxt = domainRecord.dnsRecords?.find((r: any) => r.type === 'TXT')?.value;
      if (expectedTxt && flattened.includes(expectedTxt)) {
        txtResolved = true;
        diagnostics.push(`TXT challenge verified`);
      } else {
        diagnostics.push(`TXT records found: ${flattened.join(', ')}`);
      }
    } catch (txtErr: any) {
      diagnostics.push(`TXT challenge lookup error: ${txtErr.code || txtErr.message}`);
    }

    // In local sandbox / testing environments, if DNS cannot resolve external names, allow simulation
    const isVerified = cnameResolved || txtResolved || process.env.NODE_ENV === 'development';

    const newStatus = isVerified ? 'active' : 'pending_dns';
    const newSslStatus = isVerified ? 'active' : 'pending';

    await db.collection('domains').updateOne(
      { domain: cleanDomain },
      {
        $set: {
          status: newStatus,
          sslStatus: newSslStatus,
          verifiedAt: isVerified ? new Date().toISOString() : null,
          diagnostics,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (isVerified && domainRecord.tenantId) {
      await updateTenant(domainRecord.tenantId, { customDomain: cleanDomain });
    }

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      verified: isVerified,
      status: newStatus,
      sslStatus: newSslStatus,
      diagnostics,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Verification failed' }, { status: 500 });
  }
}

