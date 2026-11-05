import React from 'react';
import { notFound } from 'next/navigation';
import { getTenantBySlugOrId } from '@/lib/saas/tenantMaster';
import { getTenantDatabase } from '@/lib/saas/tenantDb';
import TemplateModernClean from '../components/TemplateModernClean';
import TemplateDarkTech from '../components/TemplateDarkTech';
import TemplateVibrantMarketplace from '../components/TemplateVibrantMarketplace';
import TemplateEnterpriseMinimal from '../components/TemplateEnterpriseMinimal';

export const dynamic = 'force-dynamic';

export default async function TenantStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlugOrId(slug);

  if (!tenant) {
    notFound();
  }

  // Load live catalog directly from THIS client's dedicated MongoDB database
  let categories: any[] = [];
  let brands: any[] = [];
  try {
    const db = await getTenantDatabase(tenant.dbName);
    categories = await db.collection('categories').find({}).limit(12).toArray();
    brands = await db.collection('brands').find({}).limit(12).toArray();
  } catch (err) {
    console.warn(`[Storefront] Error loading from tenant DB ${tenant.dbName}:`, err);
  }

  const catalog = { categories, brands };

  // Render client-wise template
  switch (tenant.templateId) {
    case 'template-dark-tech':
      return <TemplateDarkTech tenant={tenant} catalog={catalog} />;
    case 'template-cashify-vibrant':
      return <TemplateVibrantMarketplace tenant={tenant} catalog={catalog} />;
    case 'template-minimal-b2b':
      return <TemplateEnterpriseMinimal tenant={tenant} catalog={catalog} />;
    case 'template-modern-buyback':
    default:
      return <TemplateModernClean tenant={tenant} catalog={catalog} />;
  }
}

