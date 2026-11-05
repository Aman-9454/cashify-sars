export type TenantStatus = 'active' | 'inactive' | 'trial' | 'suspended' | 'expired';

export type SubscriptionPlan = 'free_trial' | 'starter' | 'growth' | 'professional' | 'business' | 'enterprise' | 'custom';

export type PanelType = 
  | 'user_web'
  | 'user_android'
  | 'user_ios'
  | 'partner_web'
  | 'partner_android'
  | 'partner_ios'
  | 'delivery_web'
  | 'delivery_android'
  | 'delivery_ios'
  | 'admin_web'
  | 'admin_android'
  | 'admin_ios';

export type PanelKey = PanelType;

export interface ThemeDesignTokens {
  primaryColor: string;
  primaryLight: string;
  primaryDark: string;
  secondaryColor: string;
  secondaryLight: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  surfaceMuted: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderRadius: string; // e.g. '8px', '16px', '24px', '9999px'
  fontHeading: string;  // e.g. 'Plus Jakarta Sans', 'Inter', 'Outfit', 'Playfair Display'
  fontBody: string;
  cardVariant: 'flat' | 'elevated' | 'glassmorphism' | 'neumorphic' | 'bordered';
  buttonVariant: 'rounded-full' | 'rounded-xl' | 'sharp' | 'glow' | 'gradient';
  headerVariant: 'glass' | 'solid-dark' | 'clean-white' | 'floating' | 'minimal';
  shadowStyle: 'none' | 'subtle' | 'modern' | 'glow' | 'deep';
  isDarkTheme: boolean;
}

export interface PanelBrandingOverride {
  logoUrl?: string;
  appIconUrl?: string;
  splashScreenUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  headerTitle?: string;
  tagline?: string;
}

export interface TenantBranding {
  brandName: string;
  appName?: string;
  websiteTitle?: string;
  tagline?: string;
  logoUrl?: string;
  darkLogoUrl?: string;
  lightLogoUrl?: string;
  faviconUrl?: string;
  androidIconUrl?: string;
  iosIconUrl?: string;
  splashScreenUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber?: string;
  address?: string;
  currency?: string;
  currencySymbol?: string;
  timeZone?: string;
  country?: string;
  panelOverrides?: Partial<Record<PanelType, PanelBrandingOverride>>;
}

export interface TenantBusinessDetails {
  legalCompanyName: string;
  brandName: string;
  businessType: 'proprietorship' | 'partnership' | 'llp' | 'pvt_ltd' | 'individual';
  gstin?: string;
  panNumber?: string;
  supportEmail: string;
  supportPhone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  currency: string;
  currencySymbol: string;
  timeZone: string;
}

export interface TenantFeatures {
  buyback: boolean;
  refurbished: boolean;
  rentals: boolean;
  repairs: boolean;
  exchange: boolean;
  imeiVerification?: boolean;
  aiDiagnostics?: boolean;
  doorstepPickup?: boolean;
  partnerNetwork?: boolean;
  customDomains?: boolean;
  mobileApps?: boolean;
  apiAccess?: boolean;
}

export interface TenantSubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'past_due' | 'canceled' | 'trial';
  validUntil: string;
  trialEndsAt?: string;
  maxOrdersPerMonth: number;
  maxAdminAccounts?: number;
  maxPartners?: number;
  maxDeliveryAgents?: number;
  maxCustomDomains?: number;
  customDomainEnabled: boolean;
  androidBuildEnabled?: boolean;
  iosBuildEnabled?: boolean;
  priceMonthly: number;
  priceYearly?: number;
}

export interface TenantAdminUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'owner' | 'superadmin' | 'manager';
  status: 'active' | 'invited' | 'pending_setup';
  inviteToken?: string;
  inviteExpiresAt?: string;
  temporaryPassword?: string;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string;
}

export interface TenantDomainRecord {
  id: string;
  domain: string;
  isCustom: boolean;
  isPrimary: boolean;
  status: 'pending_dns' | 'verified' | 'active' | 'failed';
  sslStatus: 'pending' | 'active' | 'error';
  dnsRecords?: Array<{
    type: 'CNAME' | 'TXT' | 'A';
    host: string;
    value: string;
  }>;
  verifiedAt?: string;
}

export interface MobileBuildRecord {
  id: string;
  panelType: PanelType;
  platform: 'android' | 'ios';
  buildType: 'debug_apk' | 'release_apk' | 'aab' | 'ipa';
  versionName: string;
  versionCode: number;
  status: 'pending' | 'queued' | 'compiling' | 'completed' | 'failed';
  artifactUrl?: string;
  artifactSizeMb?: number;
  buildLogs: string[];
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface Tenant {
  id: string;                      // Unique UUID
  name: string;                    // Client/Company Name
  slug: string;                    // Unique slug for subdomain & URLs
  customDomain?: string;           // Primary custom domain
  domains?: TenantDomainRecord[];  // All registered domains
  dbName: string;                  // Dedicated MongoDB database name (e.g. casmik_tenant_<slug>)
  status: TenantStatus;            // Active, trial, suspended, etc.
  templateId: string;              // Assigned Theme ID (from 15 themes)
  businessDetails?: TenantBusinessDetails;
  branding: TenantBranding;        // Complete branding & 12-panel overrides
  features: TenantFeatures;        // Enabled business modules
  subscription: TenantSubscription;// Subscription & usage limits
  adminUser?: TenantAdminUser;     // Initial administrator account
  builds?: MobileBuildRecord[];    // Mobile compilation artifacts
  dbProvisioned: boolean;          // Whether the dedicated DB has been initialized
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  previewColor: string;
  secondaryPreviewColor: string;
  featuresIncluded: string[];
  recommendedFor: string;
  layoutStyle: string;
  tokens: ThemeDesignTokens;
  panelPreviews?: Partial<Record<PanelType, {
    layoutType: string;
    heroHeadline: string;
    primaryCtaText: string;
    accentHighlight: string;
  }>>;
}
