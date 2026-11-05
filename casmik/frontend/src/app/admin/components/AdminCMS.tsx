'use client';
import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Layout, 
  Smartphone, 
  Truck, 
  Handshake, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Check, 
  RotateCcw, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Zap,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import ImageUploadField from '@/components/ui/ImageUploadField';

type CMSSection = 'website' | 'app' | 'partner' | 'delivery';
type CMSModule = 'logo' | 'banners' | 'hero' | 'stats' | 'why' | 'howItWorks' | 'testimonials' | 'faqs' | 'footer';

interface BannerItem {
  id: number;
  portal: CMSSection;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  image: string;
  category?: string;
  active: boolean;
}

interface HeroData {
  headline: string;
  subtext: string;
  primaryCta: string;
  primaryCtaLink: string;
  secondaryCta: string;
  secondaryCtaLink: string;
  badge: string;
  trustNote: string;
}

interface StatItem {
  key: string;
  label: string;
  value: string;
  subtext: string;
}

interface WhyItem {
  id: number;
  title: string;
  desc: string;
  badge: string;
  active: boolean;
}

interface HowItWorksItem {
  id: number;
  stepNumber: string;
  title: string;
  desc: string;
  highlight: string;
  active: boolean;
}

interface TestimonialItem {
  id: number;
  name: string;
  city: string;
  rating: number;
  device: string;
  service: 'Sell' | 'Buy' | 'Exchange' | 'Repair';
  review: string;
  active: boolean;
}

interface FAQItem {
  id: number;
  portal: CMSSection;
  category: string;
  q: string;
  a: string;
  active: boolean;
}

interface BrandingData {
  brandName: string;
  tagline: string;
  logoLetter: string;
  primaryColor: string;
  supportEmail: string;
  supportPhone: string;
}

interface FooterData {
  aboutText: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  copyright: string;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
}

const cmsModules: Record<CMSSection, { id: CMSModule; label: string; icon: string; description: string }[]> = {
  website: [
    { id: 'logo', label: 'Logo & Branding', icon: '🎨', description: 'Brand name, tagline, logo mark and support contacts' },
    { id: 'banners', label: 'Hero Banners', icon: '🖼️', description: 'Homepage carousel banners for all categories and promotions' },
    { id: 'hero', label: 'Hero Content', icon: '✨', description: 'Headline, subtext, badge and action buttons' },
    { id: 'stats', label: 'Trust Statistics', icon: '📊', description: 'Customer count, payout volume, ratings and service milestones' },
    { id: 'why', label: 'Why Camsik', icon: '💡', description: 'Trust cards, security guarantees and feature highlights' },
    { id: 'howItWorks', label: 'How It Works', icon: '🔄', description: '3-step simple selling, buying and exchange workflow' },
    { id: 'testimonials', label: 'Testimonials', icon: '⭐', description: 'Verified customer ratings, reviews and device feedback' },
    { id: 'faqs', label: 'FAQs', icon: '❓', description: 'Frequently asked customer questions and detailed answers' },
    { id: 'footer', label: 'Footer Content', icon: '📄', description: 'Company details, office address, copyright and social media links' },
  ],
  app: [
    { id: 'banners', label: 'App Banners', icon: '📱', description: 'Mobile app homepage slider banners and promotional offers' },
    { id: 'hero', label: 'App Welcome Hero', icon: '🚀', description: 'In-app greeting text, headline and immediate quick-actions' },
    { id: 'faqs', label: 'App FAQs', icon: '❓', description: 'In-app customer support and troubleshooting questions' },
  ],
  partner: [
    { id: 'logo', label: 'Partner Portal Logo', icon: '🏪', description: 'Branding and identity for verified partner dashboard' },
    { id: 'banners', label: 'Partner Banners', icon: '🖼️', description: 'Commission announcements and incentive banners' },
    { id: 'hero', label: 'Partner Welcome', icon: '👋', description: 'Store manager greeting and performance announcements' },
    { id: 'faqs', label: 'Partner FAQs', icon: '❓', description: 'Partner commission, payout and verification guidelines' },
  ],
  delivery: [
    { id: 'logo', label: 'Delivery App Logo', icon: '🚚', description: 'Branding and identity for field inspection executives' },
    { id: 'banners', label: 'Agent Banners', icon: '🖼️', description: 'Pickup incentives, safety protocols and bonus notices' },
    { id: 'hero', label: 'Agent Welcome', icon: '👋', description: 'Field executive instructions and daily task briefings' },
    { id: 'faqs', label: 'Delivery FAQs', icon: '❓', description: 'Doorstep 45-point testing, customer verification & safety FAQs' },
  ],
};

// Initial Real Data
const initialBanners: BannerItem[] = [
  {
    id: 1,
    portal: 'website',
    category: 'Smartphones',
    title: 'Sell Your Smartphone & iPhone',
    subtitle: 'Get up to ₹1,25,000 instant cash · Free doorstep pickup in 15 mins',
    cta: 'Sell Smartphone',
    ctaLink: '/sell-device-get-quote?cat=smartphones',
    image: '/assets/images/categories/smartphone-banner.png',
    active: true,
  },
  {
    id: 2,
    portal: 'website',
    category: 'Laptops',
    title: 'Top Resale for Laptops & MacBooks',
    subtitle: 'Apple MacBook, Dell XPS & Lenovo ThinkPad · Spot IMPS/UPI payment',
    cta: 'Sell Laptop',
    ctaLink: '/sell-device-get-quote?cat=laptops',
    image: '/assets/images/categories/laptop.png',
    active: true,
  },
  {
    id: 3,
    portal: 'website',
    category: 'Tablets',
    title: 'Instant Cash for iPads & Tablets',
    subtitle: 'Certified evaluation for iPad Pro, Air & Samsung Galaxy Tab',
    cta: 'Sell Tablet',
    ctaLink: '/sell-device-get-quote?cat=tablets',
    image: '/assets/images/categories/tablet.png',
    active: true,
  },
  {
    id: 4,
    portal: 'website',
    category: 'Cameras',
    title: 'Sell DSLR & Mirrorless Cameras',
    subtitle: 'Sony, Canon, Nikon & LUMIX gear for spot cash with shutter verification',
    cta: 'Sell Camera',
    ctaLink: '/sell-device-get-quote?cat=cat-dslr',
    image: 'https://camsik.com/img/Category/a44c5d48-0f22-4db2-bef9-f0edb0fb54f7.png',
    active: true,
  },
  {
    id: 5,
    portal: 'website',
    category: 'Refurbished',
    title: 'Buy Certified Refurbished Devices',
    subtitle: 'Up to 60% off with 12 months warranty & 7-day hassle-free replacement',
    cta: 'Shop Refurbished',
    ctaLink: '/buy-refurbished',
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80',
    active: true,
  },
  {
    id: 6,
    portal: 'website',
    category: 'Exchange',
    title: 'Exchange & Save More',
    subtitle: 'Trade your old tech & pay only the difference with guaranteed best trade-in value',
    cta: 'Exchange Now',
    ctaLink: '/exchange-device',
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&q=80',
    active: true,
  },
  // App banners
  {
    id: 101,
    portal: 'app',
    category: 'App Promotion',
    title: 'Extra ₹500 On First Mobile App Sale',
    subtitle: 'Use promo code APP500 during doorstep pickup booking',
    cta: 'Sell on App',
    ctaLink: '/sell-device-get-quote',
    image: '/assets/images/categories/smartphone.png',
    active: true,
  },
  {
    id: 102,
    portal: 'app',
    category: 'Live Tracking',
    title: 'Real-Time Pickup Agent Tracking',
    subtitle: 'Track your assigned evaluation technician live on GPS map',
    cta: 'Track Pickup',
    ctaLink: '/track-order',
    image: '/assets/images/categories/laptop.png',
    active: true,
  },
  // Partner banners
  {
    id: 201,
    portal: 'partner',
    category: 'Store Commissions',
    title: 'High Partner Commissions: Up to 8%',
    subtitle: 'Earn higher margins on every accepted smartphone, camera & laptop device',
    cta: 'View Rate Card',
    ctaLink: '/partner',
    image: '/assets/images/categories/laptop.png',
    active: true,
  },
  // Delivery banners
  {
    id: 301,
    portal: 'delivery',
    category: 'Safety Protocol',
    title: 'Strict 45-Point Physical Inspection Guide',
    subtitle: 'Verify screen, camera sensors, optical glass & battery health accurately',
    cta: 'View Checklist',
    ctaLink: '/delivery',
    image: '/assets/images/categories/smartphone.png',
    active: true,
  },
];

const initialHeroData: Record<CMSSection, HeroData> = {
  website: {
    headline: 'Turn Your Old Devices Into Instant Cash',
    subtext: 'Sell your Smartphone, Laptop, Tablet & Camera for the guaranteed best price. Free doorstep pickup & instant bank transfer in 15 minutes.',
    primaryCta: 'Sell My Device',
    primaryCtaLink: '/sell-device-get-quote',
    secondaryCta: 'Explore Refurbished',
    secondaryCtaLink: '/buy-refurbished',
    badge: 'India’s Most Trusted Re-Commerce Platform',
    trustNote: 'Zero pickup fees · 100% Data privacy guaranteed · Spot UPI/IMPS payment',
  },
  app: {
    headline: 'Sell Old Tech in 3 Simple Steps on App',
    subtext: 'Get an AI valuation in 60 seconds and schedule same-day doorstep pickup directly from your mobile.',
    primaryCta: 'Get Instant Quote',
    primaryCtaLink: '/sell-device-get-quote',
    secondaryCta: 'Browse Refurbished',
    secondaryCtaLink: '/buy-refurbished',
    badge: 'Download the CAMSIK App',
    trustNote: 'Available on Google Play Store & Apple App Store',
  },
  partner: {
    headline: 'Welcome to CAMSIK Partner Portal',
    subtext: 'Manage store orders, device inspections, inventory transfers and daily commission payouts seamlessly.',
    primaryCta: 'View Pending Orders',
    primaryCtaLink: '/partner',
    secondaryCta: 'Request Payout',
    secondaryCtaLink: '/partner',
    badge: 'Official Certified Partner Network',
    trustNote: 'Over 1,200+ active partner stores across India',
  },
  delivery: {
    headline: 'Executive Delivery & Diagnostics Portal',
    subtext: 'Conduct doorstep 45-point device inspection, shutter counts, optical tests and disburse instant customer payouts.',
    primaryCta: 'Today’s Task Queue',
    primaryCtaLink: '/delivery',
    secondaryCta: 'Agent Profile',
    secondaryCtaLink: '/delivery',
    badge: 'Field Inspection Executive',
    trustNote: 'Always carry your official CAMSIK ID badge & diagnostic testing kit',
  },
};

const initialStats: StatItem[] = [
  { key: 'customers', label: 'Happy Customers', value: '5,00,000+', subtext: 'Verified transactions completed' },
  { key: 'paid', label: 'Cash Paid Out', value: '₹150 Cr+', subtext: 'Disbursed directly via UPI & IMPS' },
  { key: 'rating', label: 'Customer Rating', value: '4.8 / 5', subtext: 'Over 28,000+ independent reviews' },
  { key: 'cities', label: 'Cities Covered', value: '200+', subtext: 'Pan-India doorstep pickup network' },
  { key: 'inspection', label: 'Diagnostic Check', value: '45-Point', subtext: 'Hardware & optical verification' },
  { key: 'partners', label: 'Partner Outlets', value: '1,200+', subtext: 'Stores & collection points' },
];

const initialWhyItems: WhyItem[] = [
  {
    id: 1,
    title: 'Objective AI Valuation',
    desc: 'Our dynamic pricing engine factors in current sensor condition, battery health, and market liquidity to give you up to 25% higher value than offline shops.',
    badge: 'Best Price Guarantee',
    active: true,
  },
  {
    id: 2,
    title: 'Instant Spot Bank Payout',
    desc: 'Receive funds directly into your bank account or UPI within 2 minutes of doorstep inspection — before handing over your device.',
    badge: 'Instant UPI / IMPS',
    active: true,
  },
  {
    id: 3,
    title: 'Free Doorstep Evaluation',
    desc: 'Trained camera and electronics technicians visit your home or studio across 200+ cities in India with zero pickup charges.',
    badge: '200+ Cities',
    active: true,
  },
  {
    id: 4,
    title: 'Certified Factory Data Wipe',
    desc: 'Complete digital wipe of memory buffers, storage drives and metadata to guarantee 100% privacy protection of your past data.',
    badge: '100% Privacy Safe',
    active: true,
  },
  {
    id: 5,
    title: 'Legal Bill of Sale & Release',
    desc: 'Receive an official purchase invoice and indemnity certificate relieving you of all future liability once the device is handed over.',
    badge: 'Full Legal Indemnity',
    active: true,
  },
  {
    id: 6,
    title: '7-Day Guaranteed Price Lock',
    desc: 'Lock in your device valuation online for up to 7 days while you finalize your schedule or arrange your new upgrade.',
    badge: '7-Day Price Lock',
    active: true,
  },
];

const initialHowItWorksItems: HowItWorksItem[] = [
  {
    id: 1,
    stepNumber: '01',
    title: 'Check Price Online',
    desc: 'Select your smartphone, laptop, tablet, or camera model and answer a few quick condition questions to get an instant AI valuation.',
    highlight: 'Instant AI Quote in 60s',
    active: true,
  },
  {
    id: 2,
    stepNumber: '02',
    title: 'Schedule Free Doorstep Pickup',
    desc: 'Choose your preferred date and time slot. Our certified evaluation specialist arrives at your home, office, or studio.',
    highlight: 'Zero Travel or Pickup Fees',
    active: true,
  },
  {
    id: 3,
    stepNumber: '03',
    title: 'Get Instant Spot Payment',
    desc: 'Quick 15-minute diagnostic test. Payment is transferred directly to your bank account or UPI on the spot before handover.',
    highlight: 'Instant Spot Bank Credit',
    active: true,
  },
];

const initialTestimonials: TestimonialItem[] = [
  {
    id: 1,
    name: 'Rahul Sharma',
    city: 'Bangalore',
    rating: 5,
    device: 'iPhone 15 Pro Max 256GB',
    service: 'Sell',
    review: 'Got an amazing quote of ₹84,500. The technician arrived on time in Koramangala, tested the device in 10 mins, and money was in my UPI before he left.',
    active: true,
  },
  {
    id: 2,
    name: 'Ananya Deshmukh',
    city: 'Mumbai',
    rating: 5,
    device: 'MacBook Air M2 16GB',
    service: 'Sell',
    review: 'Selling on local marketplaces is a headache with lowballers. Camsik gave me genuine resale value with zero haggling and picked it up from my apartment.',
    active: true,
  },
  {
    id: 3,
    name: 'Vikramaditya Rathore',
    city: 'Delhi NCR',
    rating: 5,
    device: 'Sony A7 IV + 24-70mm GM Lens',
    service: 'Sell',
    review: 'Very knowledgeable camera specialist. Tested the mechanical shutter count and sensor cleanly. Instant IMPS transfer right there.',
    active: true,
  },
  {
    id: 4,
    name: 'Pooja Sundaram',
    city: 'Chennai',
    rating: 5,
    device: 'Refurbished iPad Pro 11" M2',
    service: 'Buy',
    review: 'Looks and performs brand new! 100% battery health, original accessories, and came with a 12-month warranty certificate.',
    active: true,
  },
  {
    id: 5,
    name: 'Karan Malhotra',
    city: 'Hyderabad',
    rating: 4,
    device: 'Samsung Galaxy S22 Ultra',
    service: 'Exchange',
    review: 'Upgraded smoothly. Paid just the price difference. Doorstep exchange was completed in under 20 minutes.',
    active: true,
  },
];

const initialFAQs: FAQItem[] = [
  {
    id: 1,
    portal: 'website',
    category: 'Valuation & Pricing',
    q: 'How does Camsik calculate the price of my phone, laptop, or camera?',
    a: 'Our proprietary pricing engine analyzes live secondary market demand across India, hardware specifications, cosmetic grading, battery health, shutter actuations, and included original accessories to guarantee the highest market payout.',
    active: true,
  },
  {
    id: 2,
    portal: 'website',
    category: 'Doorstep Pickup',
    q: 'How long does doorstep pickup take after booking?',
    a: 'Our verified technician will visit your selected address within 24 to 48 hours, or at your chosen convenient time slot. Same-day pickup is available in major metro cities.',
    active: true,
  },
  {
    id: 3,
    portal: 'website',
    category: 'Payments',
    q: 'When and how will I receive payment for my device?',
    a: 'Payment is transferred on the spot before our technician leaves your doorstep. You can choose Instant UPI (GPay, PhonePe, Paytm) or direct IMPS bank transfer.',
    active: true,
  },
  {
    id: 4,
    portal: 'website',
    category: 'Documentation & KYC',
    q: 'What documents do I need to sell my device?',
    a: 'Just a valid government photo ID proof (Aadhaar Card, Driving License, or Voter ID). An original bill and box are helpful for a higher quote but are not mandatory.',
    active: true,
  },
  {
    id: 5,
    portal: 'website',
    category: 'Data Privacy',
    q: 'Is my personal data safe when I sell my device?',
    a: 'Yes, 100%. We ensure all devices undergo a certified factory data reset and cryptographic wipe right in front of you during pickup, guaranteeing zero residual personal data.',
    active: true,
  },
  // App FAQ
  {
    id: 101,
    portal: 'app',
    category: 'App Support',
    q: 'How do I track my assigned pickup agent in the app?',
    a: 'Open the Camsik app, go to "Track Order", and you will see your agent’s contact details and real-time live map location 1 hour prior to your scheduled slot.',
    active: true,
  },
  // Partner FAQ
  {
    id: 201,
    portal: 'partner',
    category: 'Partner Payouts',
    q: 'When are partner commissions settled?',
    a: 'All verified partner store submissions are settled within 24 hours directly into the registered partner bank account.',
    active: true,
  },
  // Delivery FAQ
  {
    id: 301,
    portal: 'delivery',
    category: 'Field Guidelines',
    q: 'What should I do if a customer device fails the optical test?',
    a: 'Log the issue in the diagnostic app with a photo. The app will calculate an adjusted quote instantly for the customer’s approval.',
    active: true,
  },
];

const initialBranding: BrandingData = {
  brandName: 'CAMSIK',
  tagline: 'Turn Your Old Devices Into Instant Cash',
  logoLetter: 'C',
  primaryColor: '#00c853',
  supportEmail: 'sellatcamsik@gmail.com',
  supportPhone: '+91 98765 43210',
};

const initialFooter: FooterData = {
  aboutText: 'Camsik is India’s leading trusted re-commerce platform for selling, buying, and exchanging smartphones, laptops, tablets, and professional camera equipment with instant spot payments and doorstep service.',
  address: 'Camsik Tech Hub, 4th Floor, 80 Feet Road, Koramangala 4th Block, Bengaluru, Karnataka 560034',
  phone: '+91 98765 43210',
  email: 'sellatcamsik@gmail.com',
  hours: 'Mon - Sun: 9:00 AM - 9:00 PM IST',
  copyright: '© 2026 Camsik Electronics Pvt. Ltd. All rights reserved.',
  facebook: 'https://facebook.com/camsik',
  twitter: 'https://twitter.com/camsik',
  instagram: 'https://instagram.com/camsik',
  youtube: 'https://youtube.com/camsik',
};

export default function AdminCMS() {
  const [activePanel, setActivePanel] = useState<CMSSection>('website');
  const [activeModule, setActiveModule] = useState<CMSModule>('banners');
  
  // Data States
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [heroData, setHeroData] = useState<Record<CMSSection, HeroData>>(initialHeroData);
  const [stats, setStats] = useState<StatItem[]>(initialStats);
  const [whyItems, setWhyItems] = useState<WhyItem[]>(initialWhyItems);
  const [howItWorksItems, setHowItWorksItems] = useState<HowItWorksItem[]>(initialHowItWorksItems);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialTestimonials);
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [branding, setBranding] = useState<BrandingData>(initialBranding);
  const [footer, setFooter] = useState<FooterData>(initialFooter);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals for Adding / Editing
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [bannerImage, setBannerImage] = useState('/assets/images/categories/smartphone.png');

  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [editingWhy, setEditingWhy] = useState<WhyItem | null>(null);

  const [howModalOpen, setHowModalOpen] = useState(false);
  const [editingHow, setEditingHow] = useState<HowItWorksItem | null>(null);

  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('casmik_cms_state_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.banners) setBanners(parsed.banners);
          if (parsed.heroData) setHeroData(parsed.heroData);
          if (parsed.stats) setStats(parsed.stats);
          if (parsed.whyItems) setWhyItems(parsed.whyItems);
          if (parsed.howItWorksItems) setHowItWorksItems(parsed.howItWorksItems);
          if (parsed.testimonials) setTestimonials(parsed.testimonials);
          if (parsed.faqs) setFaqs(parsed.faqs);
          if (parsed.branding) setBranding(parsed.branding);
          if (parsed.footer) setFooter(parsed.footer);
        }
      } catch (e) {
        console.error('Failed to parse CMS saved state', e);
      }
    }
  }, []);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Save full state to LocalStorage
  const persistState = (overrides?: Partial<{
    banners: BannerItem[];
    heroData: Record<CMSSection, HeroData>;
    stats: StatItem[];
    whyItems: WhyItem[];
    howItWorksItems: HowItWorksItem[];
    testimonials: TestimonialItem[];
    faqs: FAQItem[];
    branding: BrandingData;
    footer: FooterData;
  }>) => {
    if (typeof window !== 'undefined') {
      const payload = {
        banners: overrides?.banners || banners,
        heroData: overrides?.heroData || heroData,
        stats: overrides?.stats || stats,
        whyItems: overrides?.whyItems || whyItems,
        howItWorksItems: overrides?.howItWorksItems || howItWorksItems,
        testimonials: overrides?.testimonials || testimonials,
        faqs: overrides?.faqs || faqs,
        branding: overrides?.branding || branding,
        footer: overrides?.footer || footer,
      };
      localStorage.setItem('casmik_cms_state_v1', JSON.stringify(payload));
      showToast('CMS changes saved successfully!');
    }
  };

  // Reset to original data
  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all CMS content to original defaults?')) {
      setBanners(initialBanners);
      setHeroData(initialHeroData);
      setStats(initialStats);
      setWhyItems(initialWhyItems);
      setHowItWorksItems(initialHowItWorksItems);
      setTestimonials(initialTestimonials);
      setFaqs(initialFAQs);
      setBranding(initialBranding);
      setFooter(initialFooter);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('casmik_cms_state_v1');
      }
      showToast('All CMS modules restored to defaults.');
    }
  };

  const panelIcons: Record<CMSSection, React.ElementType> = {
    website: Layout,
    app: Smartphone,
    partner: Handshake,
    delivery: Truck,
  };

  // Filtered lists for current portal
  const currentBanners = banners.filter(b => b.portal === activePanel);
  const currentFaqs = faqs.filter(f => f.portal === activePanel);

  // ---------------- Banner Actions ----------------
  const handleSaveBanner = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingBanner?.id || Date.now();
    const newBanner: BannerItem = {
      id,
      portal: activePanel,
      category: (formData.get('category') as string) || 'General',
      title: formData.get('title') as string,
      subtitle: formData.get('subtitle') as string,
      cta: formData.get('cta') as string,
      ctaLink: formData.get('ctaLink') as string,
      image: (formData.get('image') as string) || '/assets/images/categories/smartphone.png',
      active: formData.get('active') === 'on',
    };

    let updated: BannerItem[];
    if (editingBanner) {
      updated = banners.map(b => b.id === id ? newBanner : b);
    } else {
      updated = [newBanner, ...banners];
    }
    setBanners(updated);
    persistState({ banners: updated });
    setBannerModalOpen(false);
    setEditingBanner(null);
  };

  const handleDeleteBanner = (id: number) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      const updated = banners.filter(b => b.id !== id);
      setBanners(updated);
      persistState({ banners: updated });
    }
  };

  const handleToggleBanner = (id: number) => {
    const updated = banners.map(b => b.id === id ? { ...b, active: !b.active } : b);
    setBanners(updated);
    persistState({ banners: updated });
  };

  // ---------------- Why Camsik Actions ----------------
  const handleSaveWhy = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingWhy?.id || Date.now();
    const newWhy: WhyItem = {
      id,
      title: formData.get('title') as string,
      desc: formData.get('desc') as string,
      badge: formData.get('badge') as string,
      active: formData.get('active') === 'on',
    };

    let updated: WhyItem[];
    if (editingWhy) {
      updated = whyItems.map(w => w.id === id ? newWhy : w);
    } else {
      updated = [...whyItems, newWhy];
    }
    setWhyItems(updated);
    persistState({ whyItems: updated });
    setWhyModalOpen(false);
    setEditingWhy(null);
  };

  const handleDeleteWhy = (id: number) => {
    if (confirm('Delete this Why Camsik highlight?')) {
      const updated = whyItems.filter(w => w.id !== id);
      setWhyItems(updated);
      persistState({ whyItems: updated });
    }
  };

  const handleToggleWhy = (id: number) => {
    const updated = whyItems.map(w => w.id === id ? { ...w, active: !w.active } : w);
    setWhyItems(updated);
    persistState({ whyItems: updated });
  };

  // ---------------- How It Works Actions ----------------
  const handleSaveHow = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingHow?.id || Date.now();
    const newHow: HowItWorksItem = {
      id,
      stepNumber: formData.get('stepNumber') as string,
      title: formData.get('title') as string,
      desc: formData.get('desc') as string,
      highlight: formData.get('highlight') as string,
      active: formData.get('active') === 'on',
    };

    let updated: HowItWorksItem[];
    if (editingHow) {
      updated = howItWorksItems.map(h => h.id === id ? newHow : h);
    } else {
      updated = [...howItWorksItems, newHow];
    }
    setHowItWorksItems(updated);
    persistState({ howItWorksItems: updated });
    setHowModalOpen(false);
    setEditingHow(null);
  };

  const handleDeleteHow = (id: number) => {
    if (confirm('Delete this process step?')) {
      const updated = howItWorksItems.filter(h => h.id !== id);
      setHowItWorksItems(updated);
      persistState({ howItWorksItems: updated });
    }
  };

  const handleToggleHow = (id: number) => {
    const updated = howItWorksItems.map(h => h.id === id ? { ...h, active: !h.active } : h);
    setHowItWorksItems(updated);
    persistState({ howItWorksItems: updated });
  };

  // ---------------- Testimonial Actions ----------------
  const handleSaveTestimonial = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingTestimonial?.id || Date.now();
    const newTestimonial: TestimonialItem = {
      id,
      name: formData.get('name') as string,
      city: formData.get('city') as string,
      rating: parseInt(formData.get('rating') as string, 10) || 5,
      device: formData.get('device') as string,
      service: (formData.get('service') as any) || 'Sell',
      review: formData.get('review') as string,
      active: formData.get('active') === 'on',
    };

    let updated: TestimonialItem[];
    if (editingTestimonial) {
      updated = testimonials.map(t => t.id === id ? newTestimonial : t);
    } else {
      updated = [newTestimonial, ...testimonials];
    }
    setTestimonials(updated);
    persistState({ testimonials: updated });
    setTestimonialModalOpen(false);
    setEditingTestimonial(null);
  };

  const handleDeleteTestimonial = (id: number) => {
    if (confirm('Delete this testimonial?')) {
      const updated = testimonials.filter(t => t.id !== id);
      setTestimonials(updated);
      persistState({ testimonials: updated });
    }
  };

  const handleToggleTestimonial = (id: number) => {
    const updated = testimonials.map(t => t.id === id ? { ...t, active: !t.active } : t);
    setTestimonials(updated);
    persistState({ testimonials: updated });
  };

  // ---------------- FAQ Actions ----------------
  const handleSaveFAQ = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingFaq?.id || Date.now();
    const newFaq: FAQItem = {
      id,
      portal: activePanel,
      category: (formData.get('category') as string) || 'General',
      q: formData.get('q') as string,
      a: formData.get('a') as string,
      active: formData.get('active') === 'on',
    };

    let updated: FAQItem[];
    if (editingFaq) {
      updated = faqs.map(f => f.id === id ? newFaq : f);
    } else {
      updated = [...faqs, newFaq];
    }
    setFaqs(updated);
    persistState({ faqs: updated });
    setFaqModalOpen(false);
    setEditingFaq(null);
  };

  const handleDeleteFAQ = (id: number) => {
    if (confirm('Delete this FAQ?')) {
      const updated = faqs.filter(f => f.id !== id);
      setFaqs(updated);
      persistState({ faqs: updated });
    }
  };

  const handleToggleFAQ = (id: number) => {
    const updated = faqs.map(f => f.id === id ? { ...f, active: !f.active } : f);
    setFaqs(updated);
    persistState({ faqs: updated });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-bounce">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
            <Check size={14} />
          </div>
          <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900">CMS Content Management</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase">
              Live & Editable
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time content management across Website, Mobile App, Partner Portal, and Field Delivery
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            title="Reset all content back to factory default values"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors"
          >
            <ExternalLink size={13} />
            <span>Preview Website</span>
          </a>
        </div>
      </div>

      {/* Panel Selector (Website, App, Partner, Delivery) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(cmsModules) as CMSSection[]).map((panel) => {
          const Icon = panelIcons[panel];
          const isActive = activePanel === panel;
          return (
            <button
              key={panel}
              onClick={() => {
                setActivePanel(panel);
                const available = cmsModules[panel];
                if (!available.some(m => m.id === activeModule)) {
                  setActiveModule(available[0].id);
                }
              }}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${
                isActive
                  ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10'
                  : 'border-gray-200/80 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <div className={`p-2 rounded-xl ${isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-bold capitalize leading-none">{panel} Portal</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {panel === 'website' ? 'Customer Website' : panel === 'app' ? 'Mobile App' : panel === 'partner' ? 'B2B Partners' : 'Field Agents'}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main CMS Layout: Left Submodules List + Right Content Editor */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Submodules List */}
        <div className="w-full lg:w-60 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-2 shadow-sm space-y-1">
          <p className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            {activePanel.toUpperCase()} SECTIONS
          </p>
          {cmsModules[activePanel].map((mod) => {
            const isCurrent = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isCurrent
                    ? 'bg-primary text-white font-bold shadow-sm shadow-primary/30'
                    : 'text-gray-700 hover:bg-gray-100 font-medium'
                }`}
              >
                <span className="text-base">{mod.icon}</span>
                <span className="text-xs truncate">{mod.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Editor Card */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* 1. HERO BANNERS MODULE */}
          {activeModule === 'banners' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span>Hero Banners</span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold">
                      {currentBanners.length} banners
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Promotional carousel slides shown on the {activePanel} front page
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingBanner(null);
                    setBannerImage('/assets/images/categories/smartphone.png');
                    setBannerModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30"
                >
                  <Plus size={14} /> Add New Banner
                </button>
              </div>

              <div className="space-y-3">
                {currentBanners.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 bg-gray-50/80 hover:bg-gray-50 rounded-2xl border border-gray-200/80 transition-all"
                  >
                    <div className="w-20 h-16 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center p-1.5 flex-shrink-0">
                      <img src={b.image} alt={b.title} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700">
                          {b.category || 'Banner'}
                        </span>
                        <p className="font-bold text-gray-900 text-sm truncate">{b.title}</p>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{b.subtitle}</p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                        <span>CTA: <strong className="text-gray-700 font-semibold">{b.cta}</strong></span>
                        <span>Link: <code className="text-primary">{b.ctaLink}</code></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                      <button
                        onClick={() => handleToggleBanner(b.id)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                          b.active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {b.active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingBanner(b);
                          setBannerImage(b.image || '/assets/images/categories/smartphone.png');
                          setBannerModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-600 transition-colors shadow-sm"
                        title="Edit Banner"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b.id)}
                        className="p-2 rounded-xl bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-400 transition-colors shadow-sm"
                        title="Delete Banner"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. LOGO & BRANDING MODULE */}
          {activeModule === 'logo' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Logo & Brand Identity</h3>
                <p className="text-xs text-gray-500 mt-0.5">Customize company name, tagline, brand color, and direct support contacts</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Visual Preview */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center flex flex-col items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-3 shadow-lg"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    {branding.logoLetter}
                  </div>
                  <h4 className="font-black text-gray-900 text-lg">{branding.brandName}</h4>
                  <p className="text-xs text-gray-500 max-w-[200px] mt-1">{branding.tagline}</p>
                  <span className="mt-3 text-[11px] font-bold px-3 py-1 bg-white border border-gray-200 rounded-full text-emerald-600">
                    Primary Brand Color: {branding.primaryColor}
                  </span>
                </div>

                {/* Form Controls */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">Brand Name</label>
                      <input
                        value={branding.brandName}
                        onChange={(e) => setBranding({ ...branding, brandName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">Logo Initial</label>
                      <input
                        maxLength={2}
                        value={branding.logoLetter}
                        onChange={(e) => setBranding({ ...branding, logoLetter: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Company Tagline</label>
                    <input
                      value={branding.tagline}
                      onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">Support Email</label>
                      <input
                        type="email"
                        value={branding.supportEmail}
                        onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">Support Helpline</label>
                      <input
                        value={branding.supportPhone}
                        onChange={(e) => setBranding({ ...branding, supportPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => persistState({ branding })}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm shadow-primary/30"
                  >
                    <Save size={14} /> Save Branding Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. HERO CONTENT MODULE */}
          {activeModule === 'hero' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 capitalize">
                  {activePanel} Hero Content & Call-to-Actions
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure main promotional headline, descriptive copy, and primary button redirects
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Hero Badge / Pill Text</label>
                  <input
                    value={heroData[activePanel].badge}
                    onChange={(e) =>
                      setHeroData({
                        ...heroData,
                        [activePanel]: { ...heroData[activePanel], badge: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Main Headline</label>
                  <input
                    value={heroData[activePanel].headline}
                    onChange={(e) =>
                      setHeroData({
                        ...heroData,
                        [activePanel]: { ...heroData[activePanel], headline: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Supporting Subtext</label>
                  <textarea
                    rows={3}
                    value={heroData[activePanel].subtext}
                    onChange={(e) =>
                      setHeroData({
                        ...heroData,
                        [activePanel]: { ...heroData[activePanel], subtext: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Primary Button Text</label>
                    <input
                      value={heroData[activePanel].primaryCta}
                      onChange={(e) =>
                        setHeroData({
                          ...heroData,
                          [activePanel]: { ...heroData[activePanel], primaryCta: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Primary Button URL</label>
                    <input
                      value={heroData[activePanel].primaryCtaLink}
                      onChange={(e) =>
                        setHeroData({
                          ...heroData,
                          [activePanel]: { ...heroData[activePanel], primaryCtaLink: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Secondary Button Text</label>
                    <input
                      value={heroData[activePanel].secondaryCta}
                      onChange={(e) =>
                        setHeroData({
                          ...heroData,
                          [activePanel]: { ...heroData[activePanel], secondaryCta: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Secondary Button URL</label>
                    <input
                      value={heroData[activePanel].secondaryCtaLink}
                      onChange={(e) =>
                        setHeroData({
                          ...heroData,
                          [activePanel]: { ...heroData[activePanel], secondaryCtaLink: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Trust Note / Guarantee</label>
                  <input
                    value={heroData[activePanel].trustNote}
                    onChange={(e) =>
                      setHeroData({
                        ...heroData,
                        [activePanel]: { ...heroData[activePanel], trustNote: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-gray-600"
                  />
                </div>

                <button
                  onClick={() => persistState({ heroData })}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm shadow-primary/30"
                >
                  <Save size={14} /> Save Hero Content
                </button>
              </div>
            </div>
          )}

          {/* 4. TRUST STATISTICS MODULE */}
          {activeModule === 'stats' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Trust Statistics & Milestones</h3>
                <p className="text-xs text-gray-500 mt-0.5">Showcase real verified metrics to boost customer confidence</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat, idx) => (
                  <div key={stat.key} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Metric #{idx + 1}
                      </span>
                      <input
                        value={stat.label}
                        onChange={(e) => {
                          const updated = stats.map((s, i) => i === idx ? { ...s, label: e.target.value } : s);
                          setStats(updated);
                        }}
                        className="w-full mt-1 font-bold text-gray-800 text-xs px-2.5 py-1.5 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Display Value</label>
                      <input
                        value={stat.value}
                        onChange={(e) => {
                          const updated = stats.map((s, i) => i === idx ? { ...s, value: e.target.value } : s);
                          setStats(updated);
                        }}
                        className="w-full text-base font-black text-primary px-2.5 py-1.5 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Subtext</label>
                      <input
                        value={stat.subtext}
                        onChange={(e) => {
                          const updated = stats.map((s, i) => i === idx ? { ...s, subtext: e.target.value } : s);
                          setStats(updated);
                        }}
                        className="w-full text-xs text-gray-600 px-2.5 py-1.5 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => persistState({ stats })}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm shadow-primary/30"
              >
                <Save size={14} /> Save Statistics
              </button>
            </div>
          )}

          {/* 5. WHY CAMSIK MODULE */}
          {activeModule === 'why' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span>Why Camsik Feature Cards</span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold">
                      {whyItems.length} items
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Trust factors, AI valuation advantages and guarantees</p>
                </div>
                <button
                  onClick={() => {
                    setEditingWhy(null);
                    setWhyModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30"
                >
                  <Plus size={14} /> Add Feature Card
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {whyItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-50/80 hover:bg-gray-50 rounded-2xl border border-gray-200/80 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.badge}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleWhy(item.id)}
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                              item.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {item.active ? 'Active' : 'Inactive'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingWhy(item);
                              setWhyModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600"
                            title="Edit Item"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteWhy(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                            title="Delete Item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. HOW IT WORKS MODULE */}
          {activeModule === 'howItWorks' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span>How It Works Steps</span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold">
                      {howItWorksItems.length} steps
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Simple 3-step customer journey for selling or purchasing</p>
                </div>
                <button
                  onClick={() => {
                    setEditingHow(null);
                    setHowModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30"
                >
                  <Plus size={14} /> Add Step
                </button>
              </div>

              <div className="space-y-3">
                {howItWorksItems.map((step) => (
                  <div
                    key={step.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50/80 hover:bg-gray-50 rounded-2xl border border-gray-200/80"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/30">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-sm">{step.title}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          {step.highlight}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{step.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleHow(step.id)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          step.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {step.active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingHow(step);
                          setHowModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-600 shadow-sm"
                        title="Edit Step"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteHow(step.id)}
                        className="p-2 rounded-xl bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-400 shadow-sm"
                        title="Delete Step"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. TESTIMONIALS MODULE */}
          {activeModule === 'testimonials' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span>Customer Testimonials & Reviews</span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold">
                      {testimonials.length} reviews
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Verified customer experiences from selling, buying & exchange</p>
                </div>
                <button
                  onClick={() => {
                    setEditingTestimonial(null);
                    setTestimonialModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30"
                >
                  <Plus size={14} /> Add Testimonial
                </button>
              </div>

              <div className="space-y-3">
                {testimonials.map((t) => (
                  <div key={t.id} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                          <span className="text-xs text-gray-400">· {t.city}</span>
                          <span className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-200">
                            {t.service}
                          </span>
                          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                            {t.device}
                          </span>
                        </div>
                        <div className="flex gap-0.5 mb-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed font-normal">"{t.review}"</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleTestimonial(t.id)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            t.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {t.active ? 'Active' : 'Hidden'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingTestimonial(t);
                            setTestimonialModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-600 shadow-sm"
                          title="Edit Review"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteTestimonial(t.id)}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-400 shadow-sm"
                          title="Delete Review"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. FAQS MODULE */}
          {activeModule === 'faqs' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span>{activePanel.toUpperCase()} FAQs</span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold">
                      {currentFaqs.length} questions
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Common questions and detailed guidance for customers</p>
                </div>
                <button
                  onClick={() => {
                    setEditingFaq(null);
                    setFaqModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30"
                >
                  <Plus size={14} /> Add FAQ
                </button>
              </div>

              <div className="space-y-3">
                {currentFaqs.map((faq) => (
                  <div key={faq.id} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 bg-primary/10 rounded-md">
                          {faq.category}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm mt-1.5">{faq.q}</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{faq.a}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleFAQ(faq.id)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            faq.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {faq.active ? 'Active' : 'Hidden'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingFaq(faq);
                            setFaqModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-600 shadow-sm"
                          title="Edit FAQ"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-400 shadow-sm"
                          title="Delete FAQ"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. FOOTER CONTENT MODULE */}
          {activeModule === 'footer' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Website Footer Content</h3>
                <p className="text-xs text-gray-500 mt-0.5">Edit company address, contact information, social links and legal text</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">About Company Blurb</label>
                  <textarea
                    rows={2}
                    value={footer.aboutText}
                    onChange={(e) => setFooter({ ...footer, aboutText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Physical Registered Office Address</label>
                  <input
                    value={footer.address}
                    onChange={(e) => setFooter({ ...footer, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Customer Support Phone</label>
                    <input
                      value={footer.phone}
                      onChange={(e) => setFooter({ ...footer, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Customer Support Email</label>
                    <input
                      type="email"
                      value={footer.email}
                      onChange={(e) => setFooter({ ...footer, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Working Support Hours</label>
                    <input
                      value={footer.hours}
                      onChange={(e) => setFooter({ ...footer, hours: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Facebook URL</label>
                    <input
                      value={footer.facebook}
                      onChange={(e) => setFooter({ ...footer, facebook: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Twitter / X URL</label>
                    <input
                      value={footer.twitter}
                      onChange={(e) => setFooter({ ...footer, twitter: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Instagram URL</label>
                    <input
                      value={footer.instagram}
                      onChange={(e) => setFooter({ ...footer, instagram: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">YouTube Channel URL</label>
                    <input
                      value={footer.youtube}
                      onChange={(e) => setFooter({ ...footer, youtube: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Copyright Line</label>
                  <input
                    value={footer.copyright}
                    onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-gray-600"
                  />
                </div>

                <button
                  onClick={() => persistState({ footer })}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm shadow-primary/30"
                >
                  <Save size={14} /> Save Footer Content
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================= MODALS ======================= */}

      {/* Banner Modal */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">
                {editingBanner ? 'Edit Hero Banner' : 'Create New Hero Banner'}
              </h3>
              <button
                onClick={() => {
                  setBannerModalOpen(false);
                  setEditingBanner(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Category / Device Group</label>
                <input
                  name="category"
                  defaultValue={editingBanner?.category || 'Smartphones'}
                  placeholder="e.g. Smartphones, Laptops, Cameras"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Banner Title</label>
                <input
                  name="title"
                  defaultValue={editingBanner?.title || ''}
                  placeholder="e.g. Sell Your Smartphone & iPhone"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Subtitle / Description</label>
                <input
                  name="subtitle"
                  defaultValue={editingBanner?.subtitle || ''}
                  placeholder="e.g. Get up to ₹1,25,000 instant cash · Free doorstep pickup"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">CTA Button Label</label>
                  <input
                    name="cta"
                    defaultValue={editingBanner?.cta || 'Sell Now'}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">CTA Target URL</label>
                  <input
                    name="ctaLink"
                    defaultValue={editingBanner?.ctaLink || '/sell-device-get-quote'}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <input type="hidden" name="image" value={bannerImage} />
              <ImageUploadField
                label="Image URL / Asset Path"
                value={bannerImage}
                onChange={setBannerImage}
                placeholder="/assets/images/categories/... or click Upload"
                folder="banners"
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="bannerActive"
                  name="active"
                  defaultChecked={editingBanner ? editingBanner.active : true}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="bannerActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Display this banner actively on the site
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setBannerModalOpen(false);
                    setEditingBanner(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-sm shadow-primary/30"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Why Camsik Modal */}
      {whyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">
                {editingWhy ? 'Edit Why Camsik Card' : 'Add Why Camsik Card'}
              </h3>
              <button
                onClick={() => {
                  setWhyModalOpen(false);
                  setEditingWhy(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWhy} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Feature Title</label>
                <input
                  name="title"
                  defaultValue={editingWhy?.title || ''}
                  placeholder="e.g. Objective AI Valuation"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Badge Tag</label>
                <input
                  name="badge"
                  defaultValue={editingWhy?.badge || 'Guaranteed'}
                  placeholder="e.g. Best Price, 100% Safe"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Description</label>
                <textarea
                  rows={3}
                  name="desc"
                  defaultValue={editingWhy?.desc || ''}
                  placeholder="Explain why customers should trust Camsik..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="whyActive"
                  name="active"
                  defaultChecked={editingWhy ? editingWhy.active : true}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="whyActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Feature active on live website
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setWhyModalOpen(false);
                    setEditingWhy(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-sm shadow-primary/30"
                >
                  Save Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* How It Works Modal */}
      {howModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">
                {editingHow ? 'Edit Process Step' : 'Add Process Step'}
              </h3>
              <button
                onClick={() => {
                  setHowModalOpen(false);
                  setEditingHow(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveHow} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Step Number</label>
                  <input
                    name="stepNumber"
                    defaultValue={editingHow?.stepNumber || '04'}
                    placeholder="01, 02..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Highlight Badge</label>
                  <input
                    name="highlight"
                    defaultValue={editingHow?.highlight || 'Instant Feature'}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Step Title</label>
                <input
                  name="title"
                  defaultValue={editingHow?.title || ''}
                  placeholder="e.g. Check Price Online"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Description</label>
                <textarea
                  rows={3}
                  name="desc"
                  defaultValue={editingHow?.desc || ''}
                  placeholder="Describe what the customer does in this step..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="howActive"
                  name="active"
                  defaultChecked={editingHow ? editingHow.active : true}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="howActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Step active in customer flow
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setHowModalOpen(false);
                    setEditingHow(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-sm shadow-primary/30"
                >
                  Save Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {testimonialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">
                {editingTestimonial ? 'Edit Customer Testimonial' : 'Add New Testimonial'}
              </h3>
              <button
                onClick={() => {
                  setTestimonialModalOpen(false);
                  setEditingTestimonial(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Customer Name</label>
                  <input
                    name="name"
                    defaultValue={editingTestimonial?.name || ''}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">City</label>
                  <input
                    name="city"
                    defaultValue={editingTestimonial?.city || 'Bengaluru'}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Rating (1-5)</label>
                  <select
                    name="rating"
                    defaultValue={editingTestimonial?.rating || 5}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Service Type</label>
                  <select
                    name="service"
                    defaultValue={editingTestimonial?.service || 'Sell'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
                  >
                    <option value="Sell">Sell Device</option>
                    <option value="Buy">Buy Refurbished</option>
                    <option value="Exchange">Exchange</option>
                    <option value="Repair">Repair</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Device Model</label>
                  <input
                    name="device"
                    defaultValue={editingTestimonial?.device || 'iPhone 15 Pro'}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Customer Feedback / Review</label>
                <textarea
                  rows={3}
                  name="review"
                  defaultValue={editingTestimonial?.review || ''}
                  placeholder="Share the customer review..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="testiActive"
                  name="active"
                  defaultChecked={editingTestimonial ? editingTestimonial.active : true}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="testiActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Display review publicly on website
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setTestimonialModalOpen(false);
                    setEditingTestimonial(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-sm shadow-primary/30"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">
                {editingFaq ? 'Edit FAQ Question' : 'Add FAQ Question'}
              </h3>
              <button
                onClick={() => {
                  setFaqModalOpen(false);
                  setEditingFaq(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFAQ} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Category</label>
                <input
                  name="category"
                  defaultValue={editingFaq?.category || 'Valuation & Pricing'}
                  placeholder="e.g. Valuation & Pricing, Doorstep Pickup, Payments"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Question</label>
                <input
                  name="q"
                  defaultValue={editingFaq?.q || ''}
                  placeholder="e.g. How does Camsik calculate the price?"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Detailed Answer</label>
                <textarea
                  rows={4}
                  name="a"
                  defaultValue={editingFaq?.a || ''}
                  placeholder="Provide a clear, reassuring answer for the customer..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="faqActive"
                  name="active"
                  defaultChecked={editingFaq ? editingFaq.active : true}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="faqActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Show question actively on FAQ section
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setFaqModalOpen(false);
                    setEditingFaq(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-sm shadow-primary/30"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}