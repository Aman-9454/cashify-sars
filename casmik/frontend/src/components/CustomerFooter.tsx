import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Camera, ShieldCheck, Truck, RefreshCw, Zap } from 'lucide-react';

const FacebookIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const InstagramIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
  </svg>
);

const footerLinks = {
  'Sell Tech & Gear': [
    { label: 'Sell Smartphones & iPhones', href: '/sell-device-get-quote?cat=cat-smartphone' },
    { label: 'Sell Laptops & MacBooks', href: '/sell-device-get-quote?cat=cat-laptop' },
    { label: 'Sell DSLR & Mirrorless', href: '/sell-device-get-quote?cat=cat-dslr' },
    { label: 'Sell Tablets & iPads', href: '/sell-device-get-quote?cat=cat-tablet' },
    { label: 'Sell Camera Lenses', href: '/sell-device-get-quote?cat=cat-lens' },
    { label: 'Sell Action Cameras & Gimbals', href: '/sell-device-get-quote?cat=cat-action-camera' },
  ],
  'Buy & Exchange': [
    { label: 'Rent Cinema & DSLR Cameras', href: '/rental-cameras' },
    { label: 'Buy Refurbished iPhones', href: '/buy-refurbished?category=Smartphones' },
    { label: 'Buy Refurbished MacBooks', href: '/buy-refurbished?category=Laptops' },
    { label: 'Buy Pre-Owned Cameras', href: '/buy-refurbished?category=Cameras' },
    { label: '1-Step Device Exchange', href: '/exchange-device' },
    { label: 'Track Order Status', href: '/track-order' },
    { label: 'Customer Order History', href: '/my-orders' },
  ],
  'Company & Trust': [
    { label: 'About Camsik ReCommerce', href: '/why-camsik' },
    { label: 'How Camsik Works', href: '/how-it-works' },
    { label: 'Why People Choose Camsik', href: '/why-camsik' },
    { label: 'Customer Video Reviews', href: '/#testimonials' },
    { label: 'Frequently Asked Questions', href: '/faq' },
  ],
  'Support & Policies': [
    { label: 'Contact Us', href: '/contact-us' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'Doorstep Pickup Policy', href: '/how-it-works' },
    { label: 'DoD Certified Data Wipe', href: '/privacy#data-wipe' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Valuation Disclaimer', href: '/disclaimer' },
    { label: 'Partner Program & Privacy', href: '/partner/privacy' },
    { label: 'Delivery Fleet Privacy', href: '/delivery/privacy' },
    { label: 'Partner Login', href: '/partner/login' },
    { label: 'Delivery Executive Portal', href: '/delivery/login' },
  ],
};

const popularCities = [
  'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune',
  'Kolkata', 'Ahmedabad', 'Jaipur', 'Chandigarh', 'Lucknow', 'Indore',
  'Surat', 'Kochi', 'Bhopal', 'Nagpur', 'Coimbatore', 'Visakhapatnam'
];

export default function CustomerFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Feature Strip */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 py-5 sm:py-6">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex items-center gap-3.5 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Instant Spot Payment</p>
                <p className="text-xs text-slate-400">UPI or Bank Transfer on the spot</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Free Doorstep Pickup</p>
                <p className="text-xs text-slate-400">Across 200+ cities in India</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Factory Grade Data Wipe</p>
                <p className="text-xs text-slate-400">100% Data privacy guaranteed</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <RefreshCw size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Best Market Valuation</p>
                <p className="text-xs text-slate-400">Objective AI tech & gadget pricing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/25">
                <Camera size={22} />
              </div>
              <div>
                <span className="font-black text-2xl text-white tracking-tight">CAMSIK</span>
                <span className="block text-[10px] font-semibold text-purple-400 uppercase tracking-widest -mt-1">
                  Tech &amp; Cameras ReCommerce
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              India&apos;s leading tech ReCommerce platform. Buy, sell, or exchange smartphones, iPhones, MacBooks, laptops, tablets, DSLRs, mirrorless cameras &amp; creator gear with instant bank payout, 45-point testing &amp; certified warranty.
            </p>

            <div className="space-y-2.5 text-xs text-slate-400 mb-6">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <span>A-315, Shanti Shopping Center, Near Mira Road Station, Mumbai, Maharashtra - 401107</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-purple-400 flex-shrink-0" />
                <a href="tel:+918976000010" className="hover:text-white transition-colors">
                  +91 8976000010 (Mon–Sun 9 AM – 9 PM)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-purple-400 flex-shrink-0" />
                <a href="mailto:sellatcamsik@gmail.com" className="hover:text-white transition-colors">
                  sellatcamsik@gmail.com
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              <a href="https://facebook.com/camsik" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-purple-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors" aria-label="Facebook">
                <FacebookIcon size={14} />
              </a>
              <a href="https://twitter.com/camsik" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-purple-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors" aria-label="Twitter">
                <TwitterIcon size={14} />
              </a>
              <a href="https://instagram.com/camsik" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-purple-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors" aria-label="Instagram">
                <InstagramIcon size={14} />
              </a>
              <a href="https://youtube.com/camsik" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-purple-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors" aria-label="YouTube">
                <YoutubeIcon size={14} />
              </a>
            </div>
          </div>

          {/* Dynamic Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 border-b border-slate-800/80 pb-2">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-400 hover:text-purple-400 transition-colors block leading-relaxed"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Operating Cities Tag Cloud */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Popular Cities for Free Doorstep Pickup & Certified Delivery:
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            {popularCities.map((city) => (
              <span
                key={city}
                className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:text-white transition-colors cursor-default"
              >
                {city}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Camsik Electronics Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-slate-300 transition-colors">Valuation Disclaimer</Link>
            <Link href="/sitemap" className="hover:text-slate-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}