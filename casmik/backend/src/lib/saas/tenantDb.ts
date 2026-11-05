import { Db, Collection, Document } from 'mongodb';
import { getClientPromise } from '../mongodb';
import { Tenant } from './types';
import { getTenantBySlugOrId, updateTenant } from './tenantMaster';
import {
  categories as defaultCategories,
  brands as defaultBrands,
  deviceModels as defaultModels,
  questions as defaultQuestions,
} from '../casmikData';
import { THEMES_REGISTRY } from './themesRegistry';

/**
 * Returns the dedicated MongoDB database instance for a specific tenant.
 * Uses the tenant's configured `dbName`.
 */
export async function getTenantDatabase(tenantSlugOrDbName: string): Promise<Db> {
  let dbName = tenantSlugOrDbName;

  // If passed a slug or ID, look up the tenant's actual dbName
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
 * Sets up collections: settings, categories, brands, models, questions, roles, users, cms_sections, orders.
 */
export async function provisionTenantDatabase(
  tenant: Tenant,
  adminDetails?: { email: string; name?: string; passwordHash?: string; inviteToken?: string }
): Promise<{ success: boolean; message: string; seeded: any }> {
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
    if (existingCatCount === 0 && defaultCategories && defaultCategories.length > 0) {
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
    if (existingBrandsCount === 0 && defaultBrands && defaultBrands.length > 0) {
      const tenantBrands = defaultBrands.map((b) => ({
        ...b,
        tenantId: tenant.id,
        createdAt: new Date().toISOString(),
      }));
      await brandsCol.insertMany(tenantBrands as any);
      seededBrandsCount = tenantBrands.length;
    }

    // 4. Device Models Collection
    const modelsCol = db.collection('models');
    const existingModelsCount = await modelsCol.countDocuments();
    let seededModelsCount = existingModelsCount;
    if (existingModelsCount === 0 && defaultModels && defaultModels.length > 0) {
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
    if (existingQuestionsCount === 0 && defaultQuestions && defaultQuestions.length > 0) {
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
          description: 'Full unconstrained platform authority',
          permissions: ['*'],
          tenantId: tenant.id,
          isSystem: true,
        },
        {
          id: 'role-admin',
          name: 'Administrator',
          description: 'Day-to-day operations and governance',
          permissions: ['orders.*', 'catalog.*', 'pricing.*', 'partners.*', 'delivery.*', 'reports.*'],
          tenantId: tenant.id,
          isSystem: true,
        },
        {
          id: 'role-ops-manager',
          name: 'Operations Manager',
          description: 'Doorstep dispatch and fleet routing',
          permissions: ['orders.read', 'orders.update', 'orders.assign', 'delivery.*'],
          tenantId: tenant.id,
          isSystem: false,
        },
      ];
      await rolesCol.insertMany(defaultRoles as any);
      seededRolesCount = defaultRoles.length;
    }

    // 7. Initial Admin User
    const usersCol = db.collection('users');
    const existingUsersCount = await usersCol.countDocuments();
    let seededUsersCount = existingUsersCount;
    if (existingUsersCount === 0) {
      const adminEmail = adminDetails?.email || tenant.branding?.supportEmail || `admin@${tenant.slug}.com`;
      await usersCol.insertOne({
        id: `usr-${tenant.slug}-admin-01`,
        name: adminDetails?.name || `${tenant.name} Administrator`,
        email: adminEmail,
        phone: tenant.branding?.supportPhone || '+91 98000 00000',
        role: 'owner',
        status: 'active',
        tenantId: tenant.id,
        inviteToken: adminDetails?.inviteToken || null,
        passwordHash: adminDetails?.passwordHash || null,
        emailVerified: Boolean(adminDetails?.passwordHash),
        createdAt: new Date().toISOString(),
      } as any);
      seededUsersCount = 1;
    }

    // 8. Orders Collection Indexes
    const ordersCol = db.collection('orders');
    await ordersCol.createIndex({ orderNumber: 1 });
    await ordersCol.createIndex({ customerPhone: 1 });
    await ordersCol.createIndex({ status: 1 });
    await ordersCol.createIndex({ createdAt: -1 });

    // Mark as provisioned in master tenant store
    await updateTenant(tenant.id, { dbProvisioned: true });

    return {
      success: true,
      message: `Database '${tenant.dbName}' successfully provisioned!`,
      seeded: {
        categories: seededCategoriesCount,
        brands: seededBrandsCount,
        models: seededModelsCount,
        questions: seededQuestionsCount,
        roles: seededRolesCount,
        users: seededUsersCount,
        settings: 1,
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

    // Ping test
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
      error: error?.message || 'Connection failed',
    };
  }
}

/**
 * Resolves the tenant from incoming Next.js Request (Headers, Query params, Host header)
 */
export async function resolveTenantFromRequest(request: Request): Promise<Tenant | null> {
  const url = new URL(request.url);

  // 1. Check explicit query param: ?tenant=recyclepro
  const queryTenant = url.searchParams.get('tenant') || url.searchParams.get('tenantId');
  if (queryTenant) {
    const found = await getTenantBySlugOrId(queryTenant);
    if (found) return found;
  }

  // 2. Check HTTP headers: x-tenant-id or x-tenant-slug
  const headerTenant = request.headers.get('x-tenant-id') || request.headers.get('x-tenant-slug');
  if (headerTenant) {
    const found = await getTenantBySlugOrId(headerTenant);
    if (found) return found;
  }

  // 3. Check Host header (Subdomains & Custom Domains)
  const host = request.headers.get('host') || '';
  if (host) {
    // Custom domain check (e.g. sell.gadgethub.in)
    const byCustomDomain = await getTenantBySlugOrId(host);
    if (byCustomDomain) return byCustomDomain;

    // Subdomain check (e.g. gadgethub.camsik.com)
    const hostParts = host.split('.');
    if (hostParts.length > 2) {
      const subdomain = hostParts[0];
      if (subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'api') {
        const bySubdomain = await getTenantBySlugOrId(subdomain);
        if (bySubdomain) return bySubdomain;
      }
    }
  }

  return null;
}
