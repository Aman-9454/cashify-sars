import React from 'react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';
import HeroBannerCarousel from '@/app/components/HeroBannerCarousel';
import QuickActionHub from '@/app/components/QuickActionHub';
import CameraCategoryBar from '@/app/components/CameraCategoryBar';
import TopDealsShowcase from '@/app/components/TopDealsShowcase';
import RentalShowcaseSection from '@/app/components/RentalShowcaseSection';
import DeviceEcosystemShowcase from '@/app/components/DeviceEcosystemShowcase';
import CamsikTrustScore from '@/app/components/CamsikTrustScore';
import WhyCamsik from '@/app/components/WhyCamsik';
import HowItWorks from '@/app/components/HowItWorks';
import CustomerVideoReviewsCarousel from '@/app/components/CustomerVideoReviewsCarousel';
import SafeAndReliableSection from '@/app/components/SafeAndReliableSection';
import CameraBrandsCarousel from '@/app/components/CameraBrandsCarousel';
import CompetitiveComparisonTable from '@/app/components/CompetitiveComparisonTable';
import CamsikFaqSection from '@/app/components/CamsikFaqSection';
import AppDownloadCTA from '@/app/components/AppDownloadCTA';

export default function CustomerHomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col overflow-x-hidden w-full max-w-full">
      <CustomerHeader />
      
      {/* 1. Hero Banner Promo Carousel with search & live navigation */}
      <HeroBannerCarousel />

      {/* 2. Three Action Hub: Sell, Buy, Exchange (Prominent world-class boxes below banners) */}
      <QuickActionHub />

      {/* 3. Explore All 8 Device Categories Bar (Phones, Laptops, Tablets, Cameras, etc.) */}
      <CameraCategoryBar />

      {/* 4. Top Deals Showcase: Top Selling, Top Buying (Refurbished) & Top Exchange with Category Filters */}
      <TopDealsShowcase />

      {/* 4.5. Pro Rental Camera & Cinema Gear Showcase */}
      <RentalShowcaseSection />

      {/* 5. Complete Device Ecosystem (Smartphones, MacBooks, DSLRs, iPads with Sell/Buy/Exchange tags) */}
      <DeviceEcosystemShowcase />

      {/* 6. Live Trust & ReCommerce Stats (₹18,400+ Cr disbursed, 3.4L+ devices handled) */}
      <CamsikTrustScore />

      {/* 7. 3-Step Process for Selling, Buying Refurbished & 1-Step Doorstep Exchange */}
      <HowItWorks />

      {/* 8. Why Camsik: 9 Value Propositions covering all tech (DoD data wipe, 45-pt QA, instant payout) */}
      <WhyCamsik />

      {/* 9. Customer Video Reviews & Stories (iPhones, MacBooks, DSLRs, Tablets & Exchange) */}
      <CustomerVideoReviewsCarousel />

      {/* 10. Safe & Reliable Section: 4 Pillars of Protection (Diagnostics, DoD wipe, Indemnity, Payout) */}
      <SafeAndReliableSection />

      {/* 11. Top Tech & Camera Brands Carousel (Apple, Samsung, Dell, HP, Sony, Canon, DJI) */}
      <CameraBrandsCarousel />

      {/* 12. Market Comparison Table: Camsik vs Offline Shops vs Classifieds */}
      <CompetitiveComparisonTable />

      {/* 13. Comprehensive FAQs on Selling, Refurbished Warranties & Exchange */}
      <CamsikFaqSection />

      {/* 14. Official Camsik App Download Banner */}
      <AppDownloadCTA />

      <CustomerFooter />
    </main>
  );
}