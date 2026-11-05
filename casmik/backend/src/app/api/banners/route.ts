import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface BannerSlide {
  id: string;
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix?: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  categoryFilter: string;
  bgGradient: string;
  accentColor: string;
  image: string;
  imageAlt: string;
  stats: { label: string; value: string }[];
}

const defaultBanners: BannerSlide[] = [
  {
    id: 'slide-smartphone',
    badge: '📱 #1 SMARTPHONE & IPHONE BUYBACK',
    titlePrefix: 'Sell Used ',
    titleHighlight: 'Smartphones & iPhones',
    titleSuffix: ' for Peak Cash',
    description:
      'Get guaranteed highest resale payout for Apple iPhone 16/15 Pro, Samsung Galaxy S24, Google Pixel & OnePlus. AI instant quote, free doorstep pickup & spot UPI payment within 15 minutes.',
    ctaText: 'Check Phone Price',
    ctaLink: '/sell-device-get-quote?cat=cat-smartphone',
    categoryFilter: 'cat-smartphone',
    bgGradient: 'from-blue-950 via-slate-900 to-indigo-950',
    accentColor: '#3b82f6',
    image: '/assets/images/categories/smartphone-banner.png',
    imageAlt: 'Sell Used Smartphones and iPhones on Camsik',
    stats: [
      { label: 'Smartphones Sold', value: '3,20,000+' },
      { label: 'Payment Speed', value: 'Instant UPI / Bank' },
      { label: 'Data Wipe', value: '100% Certified' },
    ],
  },
  {
    id: 'slide-laptop',
    badge: '💻 MAX VALUE FOR LAPTOPS & MACBOOKS',
    titlePrefix: 'Turn Old ',
    titleHighlight: 'MacBook & Laptops',
    titleSuffix: ' Into Big Money',
    description:
      'Selling Apple MacBook Pro / Air M3, Dell XPS, HP Spectre, Lenovo ThinkPad or gaming laptops? Fair evaluation, zero hidden deductions & free doorstep inspection.',
    ctaText: 'Sell Old Laptop',
    ctaLink: '/sell-device-get-quote?cat=cat-laptop',
    categoryFilter: 'cat-laptop',
    bgGradient: 'from-violet-950 via-slate-900 to-purple-950',
    accentColor: '#8b5cf6',
    image: '/assets/images/categories/laptop.png',
    imageAlt: 'Sell Laptops and MacBooks on Camsik',
    stats: [
      { label: 'Laptops Liquidated', value: '95,000+' },
      { label: 'Doorstep Pickup', value: '100% Free' },
      { label: 'Turnaround Time', value: '15 Minutes' },
    ],
  },
  {
    id: 'slide-tablet',
    badge: '📟 INSTANT CASH FOR IPADS & TABLETS',
    titlePrefix: 'Upgrade Your ',
    titleHighlight: 'iPads & Tablets',
    titleSuffix: ' Today',
    description:
      'Instant AI-driven valuation for Apple iPad Pro M4, iPad Air, Samsung Galaxy Tab S9 & Lenovo tablets. Doorstep testing, hassle-free handover and instant bank transfer.',
    ctaText: 'Sell iPad / Tablet',
    ctaLink: '/sell-device-get-quote?cat=cat-tablet',
    categoryFilter: 'cat-tablet',
    bgGradient: 'from-cyan-950 via-slate-900 to-teal-950',
    accentColor: '#06b6d4',
    image: '/assets/images/categories/tablet.png',
    imageAlt: 'Sell Apple iPad and Android Tablets on Camsik',
    stats: [
      { label: 'Tablets Purchased', value: '62,000+' },
      { label: 'Best Price Match', value: 'Guaranteed' },
      { label: 'Happy Customers', value: '99.4%' },
    ],
  },
  {
    id: 'slide-dslr',
    badge: '★ #1 CAMERA BUYBACK PLATFORM IN INDIA',
    titlePrefix: 'Sell Used ',
    titleHighlight: 'DSLR & Mirrorless',
    titleSuffix: ' Cameras for Instant Cash',
    description:
      'Get guaranteed top market value for Canon, Nikon, Sony, LUMIX and Fujifilm cameras. AI-calculated valuation, free doorstep pickup & instant payment within minutes.',
    ctaText: 'Check Camera Price',
    ctaLink: '/sell-device-get-quote?cat=cat-dslr',
    categoryFilter: 'cat-dslr',
    bgGradient: 'from-purple-950 via-slate-900 to-indigo-950',
    accentColor: '#9333ea',
    image: 'https://camsik.com/img/Category/a44c5d48-0f22-4db2-bef9-f0edb0fb54f7.png',
    imageAlt: 'Sell Used DSLR & Mirrorless Camera on Camsik',
    stats: [
      { label: 'Happy Sellers', value: '1,85,000+' },
      { label: 'Google Rating', value: '4.8 / 5.0' },
      { label: 'Doorstep Pickup', value: '100% Free' },
    ],
  },
  {
    id: 'slide-lens',
    badge: '🔍 TOP VALUATION FOR ALL MOUNTS',
    titlePrefix: 'Turn Old ',
    titleHighlight: 'Camera Lenses',
    titleSuffix: ' Into Instant Money',
    description:
      'Selling Sony G Master, Canon RF/EF, Nikon Z, Sigma Art, or Tamron lenses? Get objective valuation without last-minute deductions.',
    ctaText: 'Sell Camera Lens',
    ctaLink: '/sell-device-get-quote?cat=cat-lens',
    categoryFilter: 'cat-lens',
    bgGradient: 'from-blue-950 via-slate-900 to-indigo-950',
    accentColor: '#3b82f6',
    image: 'https://camsik.com/img/Category/808ecde1-f8e7-45b3-ab62-8ec69183b2b7.png',
    imageAlt: 'Sell Camera Lenses on Camsik',
    stats: [
      { label: 'Lenses Purchased', value: '45,000+' },
      { label: 'Payment Speed', value: 'Spot UPI / Bank' },
      { label: 'Hidden Charges', value: '₹0 Zero' },
    ],
  },
  {
    id: 'slide-action-video',
    badge: '🎥 ACTION & 4K CAMCORDERS',
    titlePrefix: 'Sell 4K Video Cameras, ',
    titleHighlight: 'GoPro & Gimbals',
    titleSuffix: '',
    description:
      'Trade in your GoPro Hero, DJI Osmo Pocket, Insta360 X3, Canon XA Camcorders & 3-Axis Gimbals. Fast inspection and certified factory data wipe.',
    ctaText: 'Sell Video / Action Gear',
    ctaLink: '/sell-device-get-quote?cat=cat-action-camera',
    categoryFilter: 'cat-action-camera',
    bgGradient: 'from-emerald-950 via-slate-900 to-teal-950',
    accentColor: '#10b981',
    image: 'https://camsik.com/img/Category/209c7dc4-2916-40fe-b812-723f5c0b6a0b.png',
    imageAlt: 'Sell Video Cameras and Action Cameras on Camsik',
    stats: [
      { label: 'Action Gear Resold', value: '28,000+' },
      { label: 'Inspection Time', value: '15 Minutes' },
      { label: 'Data Privacy', value: '100% Guaranteed' },
    ],
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    banners: defaultBanners,
    total: defaultBanners.length,
    timestamp: new Date().toISOString(),
  });
}
