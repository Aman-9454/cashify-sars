import { ProjectTemplate } from './types';

export const AVAILABLE_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'template-modern-buyback',
    name: 'Modern ReCommerce Pro',
    description: 'Clean, trust-focused layout with crisp cards, structured category bars, and quick 3-step valuation workflow.',
    badge: 'Most Popular',
    previewColor: '#10B981',
    secondaryPreviewColor: '#0F172A',
    layoutStyle: 'modern-clean',
    recommendedFor: 'Independent ReCommerce retailers, multi-city buyback businesses',
    featuresIncluded: [
      'Instant AI Price Estimation',
      'Certified Refurbished Showcase',
      'Doorstep Pickup Booking',
      'Real-time Payout Tracking'
    ],
    defaultTheme: {
      primaryColor: '#10B981',
      secondaryColor: '#0F172A',
      accentColor: '#3B82F6',
    },
  },
  {
    id: 'template-dark-tech',
    name: 'CyberTech Dark Edition',
    description: 'Futuristic high-contrast dark theme with neon accents, dark glassmorphism, and sleek gadget trade-in UI.',
    badge: 'High Conversion',
    previewColor: '#06B6D4',
    secondaryPreviewColor: '#020617',
    layoutStyle: 'dark-tech',
    recommendedFor: 'Gaming rigs, premium Apple/Flagship resale, camera gear studios',
    featuresIncluded: [
      'Dark Glassmorphic UI Cards',
      'Specs & Condition Matrix',
      'Express VIP Pickup Option',
      'Camera & Lens Rental Module'
    ],
    defaultTheme: {
      primaryColor: '#06B6D4',
      secondaryColor: '#030712',
      accentColor: '#8B5CF6',
    },
  },
  {
    id: 'template-cashify-vibrant',
    name: 'Vibrant Marketplace Express',
    description: 'High-energy layout inspired by Cashify with prominent promotional banners, quick-action tiles, and urgent deal counters.',
    badge: 'Retail Favorite',
    previewColor: '#F97316',
    secondaryPreviewColor: '#1E293B',
    layoutStyle: 'vibrant-marketplace',
    recommendedFor: 'High-volume smartphone trade-in stores and franchise networks',
    featuresIncluded: [
      'Promotional Hero Carousel',
      'Quick Sell/Buy/Exchange Triad',
      'Dynamic Pincode Availability Checker',
      'Instant WhatsApp Diagnostic Integration'
    ],
    defaultTheme: {
      primaryColor: '#F97316',
      secondaryColor: '#18181B',
      accentColor: '#EAB308',
    },
  },
  {
    id: 'template-minimal-b2b',
    name: 'Enterprise Minimal Slate',
    description: 'Streamlined, distraction-free corporate trade-in interface optimized for corporate buyback & bulk IT asset disposition.',
    badge: 'Enterprise B2B',
    previewColor: '#2563EB',
    secondaryPreviewColor: '#F8FAFC',
    layoutStyle: 'enterprise-minimal',
    recommendedFor: 'Corporate IT liquidation, bulk laptop/MacBook buyback, franchise B2B',
    featuresIncluded: [
      '30-Second Express Valuation Widget',
      'Bulk Asset Upload (CSV/Excel)',
      'GST Invoice & Indemnity Certificate',
      'Direct Bank Account IMPS/NEFT Payout'
    ],
    defaultTheme: {
      primaryColor: '#2563EB',
      secondaryColor: '#0F172A',
      accentColor: '#64748B',
    },
  },
];

export function getTemplateById(id: string): ProjectTemplate {
  return AVAILABLE_TEMPLATES.find((t) => t.id === id) || AVAILABLE_TEMPLATES[0];
}

