import { MongoClient, Db } from 'mongodb';
import { getClientPromise } from '../mongodb';
import { Tenant } from './types';
import { AVAILABLE_TEMPLATES } from './templates';

const MASTER_DB_NAME = process.env.MONGODB_MASTER_DB || 'casmik_saas_platform';
const TENANTS_COLLECTION = 'tenants';

// Seed demo tenants for immediate out-of-the-box SaaS functionality
const DEFAULT_SEED_TENANTS: Tenant[] = [
  {
    id: 'tenant_recyclepro',
    name: 'ReCycle Pro India',
    slug: 'recyclepro',
    customDomain: 'trade.recyclepro.in',
    dbName: 'casmik_tenant_recyclepro',
    status: 'active',
    templateId: 'template-modern-buyback',
    branding: {
      brandName: 'ReCycle Pro',
      tagline: 'Instant Cash for Used Electronics at Your Doorstep',
      logoUrl: '/images/demo-logo-green.svg',
      primaryColor: '#10B981',
      secondaryColor: '#0F172A',
      accentColor: '#059669',
      supportEmail: 'care@recyclepro.in',
      supportPhone: '+91 98765 00001',
      address: 'DLF Cyber City, Tower 8C, Gurugram, HR',
    },
    features: {
      buyback: true,
      refurbished: true,
      rentals: false,
      repairs: true,
      exchange: true,
    },
    subscription: {
      plan: 'growth',
      status: 'active',
      validUntil: new Date(Date.now() + 180 * 86400000).toISOString(),
      maxOrdersPerMonth: 1500,
      customDomainEnabled: true,
      priceMonthly: 7999,
    },
    dbProvisioned: true,
    createdAt: new Date('2026-08-01T10:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tenant_gadgetcyber',
    name: 'CyberTech Gear Exchange',
    slug: 'cybertech',
    customDomain: 'gear.cybertech.io',
    dbName: 'casmik_tenant_cybertech',
    status: 'active',
    templateId: 'template-dark-tech',
    branding: {
      brandName: 'CyberTech Gear',
      tagline: 'Trade-in Flagships, DSLRs & Gaming Rigs at Market Highs',
      logoUrl: '/images/demo-logo-cyan.svg',
      primaryColor: '#06B6D4',
      secondaryColor: '#030712',
      accentColor: '#8B5CF6',
      supportEmail: 'support@cybertech.io',
      supportPhone: '+91 98765 00002',
      address: 'Indiranagar 100ft Road, Bengaluru, KA',
    },
    features: {
      buyback: true,
      refurbished: true,
      rentals: true,
      repairs: false,
      exchange: true,
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
      validUntil: new Date(Date.now() + 365 * 86400000).toISOString(),
      maxOrdersPerMonth: 5000,
      customDomainEnabled: true,
      priceMonthly: 14999,
    },
    dbProvisioned: true,
    createdAt: new Date('2026-09-15T12:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tenant_cashifydelhi',
    name: 'Vibrant TradeIn Hub',
    slug: 'vibrant-hub',
    customDomain: 'sell.vibranthub.com',
    dbName: 'casmik_tenant_vibranthub',
    status: 'active',
    templateId: 'template-cashify-vibrant',
    branding: {
      brandName: 'Vibrant TradeIn',
      tagline: 'Best ReCommerce Deals & Instant 30-Sec Valuation',
      logoUrl: '/images/demo-logo-orange.svg',
      primaryColor: '#F97316',
      secondaryColor: '#18181B',
      accentColor: '#EAB308',
      supportEmail: 'contact@vibranthub.com',
      supportPhone: '+91 98765 00003',
      address: 'Connaught Place, Block M, New Delhi, DL',
    },
    features: {
      buyback: true,
      refurbished: true,
      rentals: false,
      repairs: true,
      exchange: true,
    },
    subscription: {
      plan: 'starter',
      status: 'active',
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
      maxOrdersPerMonth: 500,
      customDomainEnabled: false,
      priceMonthly: 2999,
    },
    dbProvisioned: true,
    createdAt: new Date('2026-10-01T08:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tenant_enterpriseslate',
    name: 'Apex IT Asset Exchange',
    slug: 'apex-it',
    customDomain: 'tradein.apexassets.co',
    dbName: 'casmik_tenant_apex_it',
    status: 'active',
    templateId: 'template-minimal-b2b',
    branding: {
      brandName: 'Apex IT Asset Exchange',
      tagline: 'Enterprise Corporate Liquidation & Clean ReCommerce Solutions',
      logoUrl: '/images/demo-logo-blue.svg',
      primaryColor: '#2563EB',
      secondaryColor: '#0F172A',
      accentColor: '#64748B',
      supportEmail: 'corporate@apexassets.co',
      supportPhone: '+91 98765 00004',
      address: 'BKC Bandra, Tower 2, Mumbai, MH',
    },
    features: {
      buyback: true,
      refurbished: false,
      rentals: false,
      repairs: false,
      exchange: true,
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
      validUntil: new Date(Date.now() + 300 * 86400000).toISOString(),
      maxOrdersPerMonth: 10000,
      customDomainEnabled: true,
      priceMonthly: 24999,
    },
    dbProvisioned: true,
    createdAt: new Date('2026-10-10T14:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Fallback in-memory cache to guarantee ultra-fast response and zero-downtime
let inMemoryTenantsCache: Tenant[] = [...DEFAULT_SEED_TENANTS];

/**
 * Returns the Master Platform Database
 */
export async function getMasterDatabase(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(MASTER_DB_NAME);
}

/**
 * Ensures the tenants collection exists and is seeded in the master DB
 */
async function ensureTenantsSeeded(db: Db): Promise<void> {
  try {
    const col = db.collection<Tenant>(TENANTS_COLLECTION);
    const count = await col.countDocuments();
    if (count === 0) {
      await col.insertMany(DEFAULT_SEED_TENANTS as any);
      await col.createIndex({ slug: 1 }, { unique: true });
      await col.createIndex({ dbName: 1 }, { unique: true });
      await col.createIndex({ customDomain: 1 });
    }
  } catch (err) {
    // Silently continue if indexes already exist or running in dev
  }
}

/**
 * Get all tenants from the master database
 */
export async function getAllTenants(): Promise<Tenant[]> {
  try {
    const db = await getMasterDatabase();
    await ensureTenantsSeeded(db);
    const col = db.collection<Tenant>(TENANTS_COLLECTION);
    const tenants = await col.find({}).sort({ createdAt: -1 }).toArray();
    if (tenants.length > 0) {
      // Map ObjectId to clean string if needed
      inMemoryTenantsCache = tenants.map((t) => ({
        ...t,
        id: t.id || (t as any)._id?.toString(),
      }));
      return inMemoryTenantsCache;
    }
  } catch (error) {
    console.warn('[getAllTenants] Falling back to memory cache:', error);
  }
  return inMemoryTenantsCache;
}

/**
 * Get a single tenant by slug, id, or domain
 */
export async function getTenantBySlugOrId(slugOrIdOrDomain: string): Promise<Tenant | null> {
  const query = slugOrIdOrDomain.toLowerCase().trim();

  // Try DB first
  try {
    const db = await getMasterDatabase();
    const col = db.collection<Tenant>(TENANTS_COLLECTION);
    const found = await col.findOne({
      $or: [
        { slug: query },
        { id: query },
        { customDomain: query },
        { dbName: query },
      ],
    });
    if (found) {
      return {
        ...found,
        id: found.id || (found as any)._id?.toString(),
      };
    }
  } catch (error) {
    console.warn('[getTenantBySlugOrId] DB lookup error:', error);
  }

  // Fallback to in-memory cache
  return (
    inMemoryTenantsCache.find(
      (t) =>
        t.slug.toLowerCase() === query ||
        t.id === query ||
        (t.customDomain && t.customDomain.toLowerCase() === query) ||
        t.dbName.toLowerCase() === query
    ) || null
  );
}

/**
 * Create a new tenant in the master database
 */
export async function createTenant(tenantData: Partial<Tenant>): Promise<Tenant> {
  const slug = (tenantData.slug || tenantData.name || 'client')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 32);

  const cleanDbName =
    tenantData.dbName?.trim() ||
    `casmik_tenant_${slug.replace(/-/g, '_')}`;

  const newTenant: Tenant = {
    id: `tenant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: tenantData.name || 'New SaaS Client',
    slug,
    customDomain: tenantData.customDomain?.trim() || undefined,
    dbName: cleanDbName,
    status: tenantData.status || 'active',
    templateId: tenantData.templateId || AVAILABLE_TEMPLATES[0].id,
    branding: {
      brandName: tenantData.branding?.brandName || tenantData.name || 'Brand ReCommerce',
      tagline: tenantData.branding?.tagline || 'Sell & Exchange Used Electronics Instantly',
      logoUrl: tenantData.branding?.logoUrl || '/images/default-logo.svg',
      faviconUrl: tenantData.branding?.faviconUrl || '/favicon.ico',
      primaryColor: tenantData.branding?.primaryColor || '#10B981',
      secondaryColor: tenantData.branding?.secondaryColor || '#0F172A',
      accentColor: tenantData.branding?.accentColor || '#3B82F6',
      supportEmail: tenantData.branding?.supportEmail || 'support@client.com',
      supportPhone: tenantData.branding?.supportPhone || '+91 98000 00000',
      address: tenantData.branding?.address || 'India',
    },
    features: {
      buyback: tenantData.features?.buyback ?? true,
      refurbished: tenantData.features?.refurbished ?? true,
      rentals: tenantData.features?.rentals ?? false,
      repairs: tenantData.features?.repairs ?? true,
      exchange: tenantData.features?.exchange ?? true,
    },
    subscription: {
      plan: tenantData.subscription?.plan || 'starter',
      status: 'active',
      validUntil: tenantData.subscription?.validUntil || new Date(Date.now() + 30 * 86400000).toISOString(),
      maxOrdersPerMonth: tenantData.subscription?.maxOrdersPerMonth || 1000,
      customDomainEnabled: tenantData.subscription?.customDomainEnabled ?? false,
      priceMonthly: tenantData.subscription?.priceMonthly || 4999,
    },
    dbProvisioned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save to master DB
  try {
    const db = await getMasterDatabase();
    const col = db.collection<Tenant>(TENANTS_COLLECTION);
    await col.insertOne(newTenant as any);
  } catch (error) {
    console.warn('[createTenant] DB insert failed, using memory cache:', error);
  }

  // Update memory cache
  inMemoryTenantsCache = [newTenant, ...inMemoryTenantsCache];

  return newTenant;
}

/**
 * Update an existing tenant
 */
export async function updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | null> {
  const updatedTime = new Date().toISOString();
  try {
    const db = await getMasterDatabase();
    const col = db.collection<Tenant>(TENANTS_COLLECTION);
    await col.updateOne({ id }, { $set: { ...updates, updatedAt: updatedTime } });
  } catch (error) {
    console.warn('[updateTenant] DB update failed:', error);
  }

  const idx = inMemoryTenantsCache.findIndex((t) => t.id === id);
  if (idx !== -1) {
    inMemoryTenantsCache[idx] = {
      ...inMemoryTenantsCache[idx],
      ...updates,
      updatedAt: updatedTime,
    };
    return inMemoryTenantsCache[idx];
  }
  return null;
}

/**
 * Delete a tenant
 */
export async function deleteTenant(id: string): Promise<boolean> {
  try {
    const db = await getMasterDatabase();
    const col = db.collection<Tenant>(TENANTS_COLLECTION);
    await col.deleteOne({ id });
  } catch (error) {
    console.warn('[deleteTenant] DB delete failed:', error);
  }

  inMemoryTenantsCache = inMemoryTenantsCache.filter((t) => t.id !== id);
  return true;
}

