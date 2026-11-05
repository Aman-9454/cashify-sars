export type TenantStatus = 'active' | 'inactive' | 'trial' | 'suspended';
export type SubscriptionPlan = 'starter' | 'growth' | 'enterprise';

export interface TenantBranding {
  brandName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl?: string;
  primaryColor: string;     // Hex code, e.g. #10B981
  secondaryColor: string;   // Hex code, e.g. #0F172A
  accentColor: string;      // Hex code, e.g. #3B82F6
  supportEmail: string;
  supportPhone: string;
  address?: string;
}

export interface TenantFeatures {
  buyback: boolean;
  refurbished: boolean;
  rentals: boolean;
  repairs: boolean;
  exchange: boolean;
}

export interface TenantSubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'past_due' | 'canceled';
  validUntil: string;
  maxOrdersPerMonth: number;
  customDomainEnabled: boolean;
  priceMonthly: number;
}

export interface Tenant {
  id: string;                      // Unique ID
  name: string;                    // Client/Company Name (e.g. "GadgetHub Express")
  slug: string;                    // Unique slug for subdomain & URLs (e.g. "gadgethub")
  customDomain?: string;           // Optional custom domain (e.g. "sell.gadgethub.in")
  dbName: string;                  // Dedicated MongoDB database name for this client (e.g. "casmik_tenant_gadgethub")
  status: TenantStatus;            // Current status
  templateId: string;              // Assigned template ID (e.g. "template-modern-buyback")
  branding: TenantBranding;        // Client's branding and color scheme
  features: TenantFeatures;        // Features turned on for this client
  subscription: TenantSubscription;// SaaS subscription tier
  dbProvisioned: boolean;          // Whether the client's DB has been initialized
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  previewColor: string;
  secondaryPreviewColor: string;
  featuresIncluded: string[];
  recommendedFor: string;
  layoutStyle: 'modern-clean' | 'dark-tech' | 'vibrant-marketplace' | 'enterprise-minimal';
  defaultTheme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

