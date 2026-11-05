import React from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, Phone, MessageCircle, ArrowRight } from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';
import CamsikFaqSection from '@/app/components/CamsikFaqSection';

export const metadata = {
  title: 'Frequently Asked Questions (FAQ) — Camsik Device ReCommerce & Warranty',
  description: 'Find answers to common questions about selling your smartphone, MacBook, laptop, tablet, or DSLR camera, 45-point inspection, refurbished warranty, and doorstep payouts on Camsik.',
};

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col justify-between">
      <CustomerHeader />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white py-8 sm:py-10 border-b border-slate-800">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={13} />
            <span className="text-purple-400 font-bold">Frequently Asked Questions</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-4 border border-purple-500/30">
              <Sparkles size={13} />
              HELP &amp; SUPPORT CENTER
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Have questions about how we value your phone, inspect laptops and MacBooks, perform certified data wipe, or conduct doorstep exchange? Explore our comprehensive FAQ or connect with our specialists directly.
            </p>
          </div>
        </div>
      </section>

      {/* Main Full-Width & Responsive FAQ Component */}
      <div className="flex-1">
        <CamsikFaqSection />
      </div>

      {/* Direct Contact Options */}
      <section className="py-8 sm:py-10 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              Still have questions about your device or order?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-8">
              Our gadget specialists are available 7 days a week (9:00 AM – 9:00 PM IST) to guide you through valuations, refurbished warranties, and trade-in orders.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:+918976000010"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 transition-all btn-press"
              >
                <Phone size={16} />
                <span>Call +91 8976000010</span>
              </a>

              <a
                href="https://wa.me/918976000010?text=Hi%20Camsik%20team,%20I%20have%20a%20question%20about%20my%20device"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all btn-press"
              >
                <MessageCircle size={16} />
                <span>Chat on WhatsApp</span>
              </a>

              <Link
                href="/contact-us"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all"
              >
                <span>Visit Contact Page</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </main>
  );
}
