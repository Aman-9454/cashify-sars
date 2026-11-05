'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Search, 
  Smartphone, 
  Laptop, 
  Camera, 
  Tablet, 
  RefreshCw, 
  Truck, 
  ShieldCheck, 
  FileText, 
  ExternalLink, 
  ChevronRight,
  UserCheck,
  Building2,
  HelpCircle,
  Phone,
  Layers,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';

interface SitemapCategory {
  title: string;
  icon: React.ReactNode;
  description: string;
  links: {
    label: string;
    path: string;
    desc: string;
    badge?: string;
  }[];
}

const sitemapData: SitemapCategory[] = [
  {
    title: 'Core & About Camsik',
    icon: <Building2 className="w-5 h-5 text-purple-400" />,
    description: 'Main landing pages, company philosophy, and operating models',
    links: [
      { label: 'Home Page', path: '/', desc: 'Live recommerce marketplace, instant quote engine, and certified refurbished deals' },
      { label: 'Why Camsik', path: '/why-camsik', desc: 'Trust pillars, 45-point testing, DoD data wiping, and comparison chart', badge: 'Core' },
      { label: 'How It Works', path: '/how-it-works', desc: 'Step-by-step walkthrough for selling, buying, and free doorstep pickup' },
      { label: 'FAQ', path: '/faq', desc: 'Answers to frequently asked questions on payouts, grading, and warranty' },
      { label: 'Contact Us', path: '/contact-us', desc: 'Mumbai headquarters address, WhatsApp support, phone, and inquiry forms' },
    ],
  },
  {
    title: 'Sell Tech & Camera Gear',
    icon: <Smartphone className="w-5 h-5 text-emerald-400" />,
    description: 'Instant algorithmic valuation and free doorstep pickup across India',
    links: [
      { label: 'Sell Smartphones & iPhones', path: '/sell-device-get-quote?cat=cat-smartphone', desc: 'Top market price for Apple iPhones, Samsung Galaxy, OnePlus, and Android flagships', badge: 'Popular' },
      { label: 'Sell Laptops & MacBooks', path: '/sell-device-get-quote?cat=cat-laptop', desc: 'Sell Apple M1/M2/M3 MacBooks, Dell XPS, ThinkPads, and gaming laptops', badge: 'Top Value' },
      { label: 'Sell DSLR & Mirrorless Cameras', path: '/sell-device-get-quote?cat=cat-dslr', desc: 'Sell Sony Alpha, Canon EOS, Nikon Z, Fujifilm & cinema camera bodies' },
      { label: 'Sell Tablets & iPads', path: '/sell-device-get-quote?cat=cat-tablet', desc: 'Instant quote for Apple iPad Pro, Air, Mini, and Samsung Galaxy Tabs' },
      { label: 'Sell Camera Lenses', path: '/sell-device-get-quote?cat=cat-lens', desc: 'Sell prime, zoom, telephoto, and cinema lenses from Sony, Canon, Sigma & Tamron' },
      { label: 'Sell Action Cameras & Gimbals', path: '/sell-device-get-quote?cat=cat-action-camera', desc: 'Sell GoPro Hero, DJI Osmo, Pocket, and motorized camera stabilizers' },
    ],
  },
  {
    title: 'Buy Certified Refurbished',
    icon: <Camera className="w-5 h-5 text-blue-400" />,
    description: '45-point inspected pre-owned tech with certified warranty',
    links: [
      { label: 'All Refurbished Gear', path: '/buy-refurbished', desc: 'Browse the complete catalogue of certified pre-owned tech with warranty', badge: 'Store' },
      { label: 'Refurbished iPhones & Smartphones', path: '/buy-refurbished?category=Smartphones', desc: 'Certified iPhones and Android devices with 100% genuine components' },
      { label: 'Refurbished MacBooks & Laptops', path: '/buy-refurbished?category=Laptops', desc: 'Thoroughly tested MacBooks and laptops ready for work and creativity' },
      { label: 'Pre-Owned Cameras & Bodies', path: '/buy-refurbished?category=Cameras', desc: 'Clean sensor DSLR and mirrorless bodies with verified shutter counts' },
      { label: 'Pre-Owned Camera Lenses', path: '/buy-refurbished?category=Lenses', desc: 'Fungus-free certified zoom and prime lenses with crisp autofocus optics' },
    ],
  },
  {
    title: 'Trade-In, Orders & Services',
    icon: <RefreshCw className="w-5 h-5 text-amber-400" />,
    description: 'Device upgrade exchanges, order tracking, and repair diagnostics',
    links: [
      { label: '1-Step Device Exchange', path: '/exchange-device', desc: 'Trade in your old smartphone or camera and apply instant credit to an upgrade', badge: 'Save Extra' },
      { label: 'Live Order Tracking', path: '/track-order', desc: 'Real-time status tracking for pickup, diagnostic testing, and delivery dispatch' },
      { label: 'Customer Order History', path: '/my-orders', desc: 'View past selling receipts, refurbished purchases, and invoice downloads' },
      { label: 'Device Repair Diagnostic Service', path: '/repair-device', desc: 'OEM screen replacement, battery service, and camera sensor cleaning' },
    ],
  },
  {
    title: 'Ecosystem & Portal Hubs',
    icon: <Layers className="w-5 h-5 text-indigo-400" />,
    description: 'Dedicated portals for customers, partners, executives, and administrators',
    links: [
      { label: 'Customer Sign In / Register', path: '/login', desc: 'Sign in to track orders, manage addresses, and view bank payout history' },
      { label: 'User Dashboard & Profile', path: '/user', desc: 'Customer account settings, saved quotes, and notification preferences' },
      { label: 'Partner & Merchant Portal', path: '/partner', desc: 'B2B portal for certified retail partner shops and electronics liquidators', badge: 'B2B' },
      { label: 'Delivery Executive Portal', path: '/delivery', desc: 'Field diagnostic executive app for route planning, doorstep testing, and payouts', badge: 'Staff' },
      { label: 'Platform Administration', path: '/admin', desc: 'Operations control center for catalog management, order fulfillment, and audits' },
    ],
  },
  {
    title: 'Legal, Trust & Compliance',
    icon: <ShieldCheck className="w-5 h-5 text-rose-400" />,
    description: 'Statutory disclosures, privacy policies, data wipe standards, and terms',
    links: [
      { label: 'Privacy Policy & Data Protection', path: '/privacy', desc: 'DoD 5220.22-M certified data wipe, DPDP Act 2023 compliance, and zero data sale pledge', badge: 'Important' },
      { label: 'Terms of Service', path: '/terms', desc: 'User agreement, ownership warranty, anti-theft policy, and refurbished warranty terms', badge: 'Legal' },
      { label: 'Valuation Disclaimer', path: '/disclaimer', desc: 'Algorithmic valuation methodology, 45-point testing, and zero-pressure cancellation', badge: 'Fair Trade' },
      { label: 'Sitemap & Directory', path: '/sitemap', desc: 'Comprehensive list of all indexed pages, services, and category navigation' },
    ],
  },
];

export default function SitemapPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return sitemapData;
    const q = searchQuery.toLowerCase();

    return sitemapData
      .map((cat) => {
        const matchingLinks = cat.links.filter(
          (link) =>
            link.label.toLowerCase().includes(q) ||
            link.desc.toLowerCase().includes(q) ||
            link.path.toLowerCase().includes(q)
        );
        return {
          ...cat,
          links: matchingLinks,
        };
      })
      .filter((cat) => cat.links.length > 0);
  }, [searchQuery]);

  const totalLinks = useMemo(() => {
    return sitemapData.reduce((acc, cat) => acc + cat.links.length, 0);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <CustomerHeader />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80 py-10 sm:py-14">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={13} />
            <span className="text-purple-400 font-bold">Sitemap</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
                <Compass size={14} className="text-purple-400" />
                EXPLORE ALL CAMSIK PLATFORM ROUTES
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                Platform Sitemap
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Complete structured directory of all pages, selling categories, refurbished collections, portals, and legal disclosures on the Camsik ReCommerce platform.
              </p>
            </div>

            {/* Search Input Box */}
            <div className="w-full md:w-80">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search pages, gadgets, policies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2 text-right">
                Showing {filteredCategories.reduce((acc, c) => acc + c.links.length, 0)} of {totalLinks} total routes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Categories */}
      <section className="py-12 sm:py-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-2xl bg-slate-900/40 border border-slate-800">
              <Compass size={36} className="text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No Matching Pages Found</h3>
              <p className="text-xs text-slate-400 mb-4">
                No routes match &quot;{searchQuery}&quot;. Try searching for &quot;sell&quot;, &quot;privacy&quot;, &quot;iphone&quot;, or &quot;partner&quot;.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <div
                  key={category.title}
                  className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-5 flex flex-col justify-between hover:border-purple-500/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        {category.icon}
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white">{category.title}</h2>
                        <span className="text-[11px] text-slate-400 block">{category.links.length} pages</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      {category.description}
                    </p>

                    <ul className="space-y-2.5">
                      {category.links.map((link) => (
                        <li key={link.path}>
                          <Link
                            href={link.path}
                            className="group block p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-purple-500/50 hover:bg-slate-900/80 transition-all"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 transition-colors">
                                {link.label}
                              </span>
                              {link.badge && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  {link.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                              {link.desc}
                            </p>
                            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                              <span>{link.path}</span>
                              <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CustomerFooter />
    </main>
  );
}
