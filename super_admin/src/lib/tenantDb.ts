import { Db, Collection, Document } from 'mongodb';
import { getClientPromise } from './mongodb';
import { Tenant } from './types';
import { getTenantBySlugOrId, updateTenant } from './tenantMaster';
import {
  categories as defaultCategories,
  brands as defaultBrands,
  deviceModels as defaultModels,
  questions as defaultQuestions,
} from './casmikData';
import { THEMES_REGISTRY } from './themesRegistry';

/**
 * Returns the dedicated MongoDB database instance for a specific tenant.
 * Uses the tenant's configured `dbName`.
 */
export async function getTenantDatabase(tenantSlugOrDbName: string): Promise<Db> {
  let dbName = tenantSlugOrDbName;

  if (!tenantSlugOrDbName.startsWith('casmik_tenant_')) {
    const tenant = await getTenantBySlugOrId(tenantSlugOrDbName);
    if (tenant && tenant.dbName) {
      dbName = tenant.dbName;
    }
  }

  const client = await getClientPromise();
  return client.db(dbName);
}

/**
 * Returns a typed collection from the tenant's dedicated database.
 */
export async function getTenantCollection<T extends Document = Document>(
  collectionName: string,
  tenantSlugOrDbName: string
): Promise<Collection<T>> {
  const db = await getTenantDatabase(tenantSlugOrDbName);
  return db.collection<T>(collectionName);
}

/**
 * Auto-provisions and seeds a client's dedicated MongoDB database.
 * Completely isolates the client with their own catalog, valuation tree,
 * RBAC roles, initial admin credentials, CMS sections, and operational tables.
 */
export async function provisionTenantDatabase(
  tenant: Tenant,
  adminDetails?: { email: string; name?: string; passwordHash?: string; inviteToken?: string }
): Promise<{
  success: boolean;
  message: string;
  seeded: Record<string, number>;
}> {
  try {
    const client = await getClientPromise();
    const db = client.db(tenant.dbName);

    const theme = THEMES_REGISTRY.find((t) => t.id === tenant.templateId) || THEMES_REGISTRY[0];

    // 1. Settings Collection
    const settingsCol = db.collection('settings');
    await settingsCol.deleteMany({});
    await settingsCol.insertOne({
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      templateId: tenant.templateId,
      branding: tenant.branding,
      themeTokens: theme.tokens,
      panelOverrides: tenant.branding?.panelOverrides || {},
      features: tenant.features,
      subscription: tenant.subscription,
      currency: tenant.branding?.currency || 'INR',
      currencySymbol: tenant.branding?.currencySymbol || '₹',
      timeZone: tenant.branding?.timeZone || 'Asia/Kolkata',
      country: tenant.branding?.country || 'India',
      taxSettings: {
        gstEnabled: true,
        gstRate: 18,
        hsnCode: '8517',
      },
      payoutSettings: {
        autoApproveBelow: 10000,
        instantUpiEnabled: true,
        partnerCommissionRate: 5.0,
      },
      provisionedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 2. Categories Collection
    const categoriesCol = db.collection('categories');
    const existingCatCount = await categoriesCol.countDocuments();
    let seededCategoriesCount = existingCatCount;
    if (existingCatCount === 0 && defaultCategories?.length > 0) {
      const tenantCategories = defaultCategories.map((c) => ({
        ...c,
        tenantId: tenant.id,
        createdAt: new Date().toISOString(),
      }));
      await categoriesCol.insertMany(tenantCategories as any);
      seededCategoriesCount = tenantCategories.length;
    }

    // 3. Brands Collection
    const brandsCol = db.collection('brands');
    const existingBrandsCount = await brandsCol.countDocuments();
    let seededBrandsCount = existingBrandsCount;
    if (existingBrandsCount === 0 && defaultBrands?.length > 0) {
      const tenantBrands = defaultBrands.map((b) => ({
        ...b,
        tenantId: tenant.id,
        createdAt: new Date().toISOString(),
      }));
      await brandsCol.insertMany(tenantBrands as any);
      seededBrandsCount = tenantBrands.length;
    }

    // 4. Device Models Collection (Seed popular models with baseline prices)
    const modelsCol = db.collection('models');
    const existingModelsCount = await modelsCol.countDocuments();
    let seededModelsCount = existingModelsCount;
    if (existingModelsCount === 0 && defaultModels?.length > 0) {
      const tenantModels = defaultModels.slice(0, 100).map((m) => ({
        ...m,
        tenantId: tenant.id,
        createdAt: new Date().toISOString(),
      }));
      await modelsCol.insertMany(tenantModels as any);
      seededModelsCount = tenantModels.length;
    }

    // 5. Questions Collection (Device Diagnostic & Valuation Tree)
    const questionsCol = db.collection('questions');
    const existingQuestionsCount = await questionsCol.countDocuments();
    let seededQuestionsCount = existingQuestionsCount;
    if (existingQuestionsCount === 0 && defaultQuestions?.length > 0) {
      const tenantQuestions = defaultQuestions.map((q) => ({
        ...q,
        tenantId: tenant.id,
        createdAt: new Date().toISOString(),
      }));
      await questionsCol.insertMany(tenantQuestions as any);
      seededQuestionsCount = tenantQuestions.length;
    }

    // 6. RBAC Roles Collection
    const rolesCol = db.collection('roles');
    const existingRolesCount = await rolesCol.countDocuments();
    let seededRolesCount = existingRolesCount;
    if (existingRolesCount === 0) {
      const defaultRoles = [
        {
          id: 'role-owner',
          name: 'Owner',
          description: 'Full unconstrained platform & financial authority',
          permissions: ['*'],
          tenantId: tenant.id,
          isSystem: true,
        },
        {
          id: 'role-admin',
          name: 'Administrator',
          description: 'Day-to-day operations, pricing, catalog and partner governance',
          permissions: ['orders.*', 'catalog.*', 'pricing.*', 'partners.*', 'delivery.*', 'reports.*'],
          tenantId: tenant.id,
          isSystem: true,
        },
        {
          id: 'role-ops-manager',
          name: 'Operations Manager',
          description: 'Doorstep pickup assignment, fleet routing, and inspection QA',
          permissions: ['orders.read', 'orders.update', 'orders.assign', 'delivery.*'],
          tenantId: tenant.id,
          isSystem: false,
        },
        {
          id: 'role-finance',
          name: 'Finance & Accounts',
          description: 'Payout reconciliations, partner commissions, and tax reports',
          permissions: ['payouts.*', 'reports.financial', 'orders.read'],
          tenantId: tenant.id,
          isSystem: false,
        },
        {
          id: 'role-support',
          name: 'Customer Support',
          description: 'Customer ticket resolution, pickup rescheduling, and order tracking',
          permissions: ['orders.read', 'orders.notes', 'customers.read'],
          tenantId: tenant.id,
          isSystem: false,
        },
      ];
      await rolesCol.insertMany(defaultRoles as any);
      seededRolesCount = defaultRoles.length;
    }

    // 7. Users Collection (Initial Tenant Administrator)
    const usersCol = db.collection('users');
    const existingUsersCount = await usersCol.countDocuments();
    let seededUsersCount = existingUsersCount;
    if (existingUsersCount === 0) {
      const adminEmail = adminDetails?.email || tenant.branding?.supportEmail || `admin@${tenant.slug}.com`;
      const initialAdmin = {
        id: `usr-${tenant.slug}-admin-01`,
        name: adminDetails?.name || `${tenant.name} Administrator`,
        email: adminEmail,
        phone: tenant.branding?.supportPhone || '+91 98000 00000',
        role: 'owner',
        status: 'active',
        tenantId: tenant.id,
        inviteToken: adminDetails?.inviteToken || null,
        passwordHash: adminDetails?.passwordHash || null, // Will trigger setup wizard if null
        emailVerified: Boolean(adminDetails?.passwordHash),
        createdAt: new Date().toISOString(),
      };
      await usersCol.insertOne(initialAdmin as any);
      seededUsersCount = 1;
    }

    // 8. CMS Sections Collection (Home banners, value props, FAQs)
    const cmsCol = db.collection('cms_sections');
    const existingCmsCount = await cmsCol.countDocuments();
    let seededCmsCount = existingCmsCount;
    if (existingCmsCount === 0) {
      const defaultSections = [
        {
          sectionId: 'hero_banner',
          title: 'Sell Used Electronics at Best Value',
          subtitle: tenant.branding?.tagline || 'Instant doorstep cash and free pickup within 2 hours',
          primaryCtaText: 'Sell Phone Now',
          primaryCtaLink: '/sell',
          secondaryCtaText: 'Buy Certified',
          secondaryCtaLink: '/certified-store',
          active: true,
          tenantId: tenant.id,
        },
        {
          sectionId: 'trust_badges',
          badges: [
            { icon: 'shield-check', title: 'DoD Data Wipe', desc: '100% Secure Data Erasure' },
            { icon: 'zap', title: 'Instant Payout', desc: 'Direct UPI or Bank Transfer' },
            { icon: 'truck', title: 'Free Doorstep Pickup', desc: 'No hidden transit charges' },
            { icon: 'award', title: 'Best Price Guarantee', desc: 'AI-driven fair market quotes' },
          ],
          active: true,
          tenantId: tenant.id,
        },
        {
          sectionId: 'faqs',
          faqs: [
            { q: 'How does doorstep device pickup work?', a: 'Our certified executive visits your location, completes a 45-point hardware inspection in 10 minutes, and transfers payment instantly to your UPI or Bank Account.' },
            { q: 'Is my personal data safe?', a: 'Yes, every collected device undergoes military-grade DoD 5220.22-M certified data erasure with an automated tamper-proof certificate provided to you.' },
            { q: 'What devices do you buy back?', a: 'We accept smartphones, laptops, tablets, DSLR/mirrorless cameras, optical lenses, smartwatches, and gaming consoles across all major brands.' },
          ],
          active: true,
          tenantId: tenant.id,
        },
      ];
      await cmsCol.insertMany(defaultSections as any);
      seededCmsCount = defaultSections.length;
    }

    // 9. Orders Collection Indexes
    const ordersCol = db.collection('orders');
    await ordersCol.createIndex({ orderNumber: 1 }, { unique: true, sparse: true });
    await ordersCol.createIndex({ customerPhone: 1 });
    await ordersCol.createIndex({ status: 1 });
    await ordersCol.createIndex({ createdAt: -1 });
    await ordersCol.createIndex({ assignedPartnerId: 1 });
    await ordersCol.createIndex({ assignedRiderId: 1 });

    // 10. Partners & Riders Collection Indexes
    const partnersCol = db.collection('partners');
    await partnersCol.createIndex({ partnerCode: 1 }, { unique: true, sparse: true });
    await partnersCol.createIndex({ phone: 1 });
    await partnersCol.createIndex({ status: 1 });

    const ridersCol = db.collection('delivery_agents');
    await ridersCol.createIndex({ agentId: 1 }, { unique: true, sparse: true });
    await ridersCol.createIndex({ phone: 1 });
    await ridersCol.createIndex({ status: 1 });

    // Mark as provisioned in master tenant registry
    await updateTenant(tenant.id, { dbProvisioned: true });

    return {
      success: true,
      message: `Dedicated MongoDB '${tenant.dbName}' successfully provisioned with ReCommerce ecosystem!`,
      seeded: {
        settings: 1,
        categories: seededCategoriesCount,
        brands: seededBrandsCount,
        models: seededModelsCount,
        questions: seededQuestionsCount,
        roles: seededRolesCount,
        users: seededUsersCount,
        cms_sections: seededCmsCount,
      },
    };
  } catch (error: any) {
    console.error(`[provisionTenantDatabase] Failed for ${tenant.dbName}:`, error);
    return {
      success: false,
      message: error?.message || 'Provisioning failed',
      seeded: {},
    };
  }
}

/**
 * Checks the real-time status and health of a tenant's dedicated database.
 */
export async function getTenantDatabaseStatus(tenant: Tenant): Promise<{
  connected: boolean;
  dbName: string;
  collections: { name: string; count: number }[];
  totalDocuments: number;
  error?: string;
}> {
  try {
    const client = await getClientPromise();
    const db = client.db(tenant.dbName);

    // Ping command
    await db.command({ ping: 1 });

    const collections = await db.listCollections().toArray();
    const stats: { name: string; count: number }[] = [];
    let totalDocs = 0;

    for (const col of collections) {
      try {
        const count = await db.collection(col.name).countDocuments();
        stats.push({ name: col.name, count });
        totalDocs += count;
      } catch {
        stats.push({ name: col.name, count: 0 });
      }
    }

    return {
      connected: true,
      dbName: tenant.dbName,
      collections: stats,
      totalDocuments: totalDocs,
    };
  } catch (error: any) {
    return {
      connected: false,
      dbName: tenant.dbName,
      collections: [],
      totalDocuments: 0,
      error: error?.message || 'Database connection error',
    };
  }
}
