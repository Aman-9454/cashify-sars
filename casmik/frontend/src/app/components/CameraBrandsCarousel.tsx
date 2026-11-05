'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import { Camera, ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

interface CameraBrand {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  specialty: string;
  popularModels: string;
  category: string;
}

const cameraBrands: CameraBrand[] = [
  {
    id: 'apple',
    name: 'Apple',
    logo: '/assets/images/brands/apple.svg',
    tagline: 'iPhone, MacBook & iPad Series',
    specialty: 'iPhone 16 Pro, MacBook M3, iPad Pro M4',
    popularModels: '60+ Devices Supported',
    category: 'cat-smartphone',
  },
  {
    id: 'samsung',
    name: 'Samsung',
    logo: '/assets/images/brands/samsung.svg',
    tagline: 'Galaxy S, Z-Fold & Tab Series',
    specialty: 'S24 Ultra, Z Fold 5, Tab S9 Ultra',
    popularModels: '50+ Devices Supported',
    category: 'cat-smartphone',
  },
  {
    id: 'dell',
    name: 'Dell',
    logo: '/assets/images/brands/dell.svg',
    tagline: 'XPS, Alienware & Inspiron',
    specialty: 'XPS 15, XPS 13 Plus, Alienware m16',
    popularModels: '30+ Laptops Supported',
    category: 'cat-laptop',
  },
  {
    id: 'hp',
    name: 'HP',
    logo: '/assets/images/brands/hp.svg',
    tagline: 'Spectre, Envy & Omen Series',
    specialty: 'Spectre x360, Envy 16, Omen 16',
    popularModels: '28+ Laptops Supported',
    category: 'cat-laptop',
  },
  {
    id: 'lenovo',
    name: 'Lenovo',
    logo: '/assets/images/brands/lenovo.svg',
    tagline: 'ThinkPad, Legion & Yoga Series',
    specialty: 'ThinkPad X1, Legion Pro 7i, Tab P12',
    popularModels: '35+ Devices Supported',
    category: 'cat-laptop',
  },
  {
    id: 'canon',
    name: 'Canon',
    logo: 'https://camsik.com/img/productBrand/4bd0ce5a-6914-4263-9f81-6b0127bec025.png',
    tagline: 'EOS R & DSLR Series',
    specialty: 'EOS R5, R6 II, 5D IV, 90D',
    popularModels: '120+ Models Supported',
    category: 'cat-dslr',
  },
  {
    id: 'sony',
    name: 'Sony',
    logo: 'https://camsik.com/img/productBrand/bbd3f7f8-4909-43fd-85c9-7191a3b64dcd.png',
    tagline: 'Alpha Full-Frame & Cinema',
    specialty: 'A7 IV, A7R V, FX3, FX30, ZV-E10',
    popularModels: '95+ Models Supported',
    category: 'cat-dslr',
  },
  {
    id: 'nikon',
    name: 'Nikon',
    logo: 'https://camsik.com/img/productBrand/9f533d3d-4304-48e9-8a0d-a7c8fdd7318c.png',
    tagline: 'Z-Mount & D-Series',
    specialty: 'Z8, Z6 II, Z50, D850, D750',
    popularModels: '80+ Models Supported',
    category: 'cat-dslr',
  },
  {
    id: 'fujifilm',
    name: 'Fujifilm',
    logo: 'https://camsik.com/img/productBrand/ccd22eff-5208-4a76-9b0f-8d1a1bca00a2.png',
    tagline: 'X-Series & GFX Medium Format',
    specialty: 'X-T5, X-H2S, X100V, GFX 100S',
    popularModels: '45+ Models Supported',
    category: 'cat-dslr',
  },
  {
    id: 'lumix',
    name: 'Panasonic LUMIX',
    logo: 'https://camsik.com/img/productBrand/378fcf74-3103-45f4-b195-82c32e575075.png',
    tagline: 'S & GH Hybrid Series',
    specialty: 'S5 IIX, GH6, GH5 II, G9 II',
    popularModels: '35+ Models Supported',
    category: 'cat-dslr',
  },
  {
    id: 'sigma',
    name: 'Sigma',
    logo: 'https://camsik.com/img/productBrand/6a7e9cc4-ef20-4afd-8258-478d2f860f12.png',
    tagline: 'Art, Contemporary & Sport Lenses',
    specialty: '24-70mm Art, 85mm f/1.4, 18-50mm',
    popularModels: '70+ Lenses Supported',
    category: 'cat-lens',
  },
  {
    id: 'tamron',
    name: 'Tamron',
    logo: 'https://camsik.com/img/productBrand/8e522ebd-f7e0-407c-81dc-d19510321cae.png',
    tagline: 'Fast Di III Zooms & Primes',
    specialty: '28-75mm G2, 70-180mm, 35-150mm',
    popularModels: '50+ Lenses Supported',
    category: 'cat-lens',
  },
  {
    id: 'gopro',
    name: 'GoPro',
    logo: 'https://camsik.com/img/productBrand/17a259cc-2f9c-4bfe-82f9-8143df8cb30d.png',
    tagline: 'Hero & Max Action Cameras',
    specialty: 'Hero 13 Black, Hero 12, Hero 11, Max',
    popularModels: '25+ Action Models',
    category: 'cat-action-camera',
  },
  {
    id: 'dji',
    name: 'DJI',
    logo: 'https://camsik.com/img/productBrand/6e8121dd-49f6-4df5-b458-7990f5d11eae.png',
    tagline: 'Ronin Gimbals & Osmo Action',
    specialty: 'RS 3 Pro, RS 4, Osmo Pocket 3, Action 4',
    popularModels: '30+ Gimbals & Cameras',
    category: 'cat-gimbal',
  },
  {
    id: 'insta360',
    name: 'Insta360',
    logo: 'https://camsik.com/img/productBrand/2a349fb4-1de7-4f51-a2be-f4d60f909eaf.png',
    tagline: '360° & AI Action Cameras',
    specialty: 'X4 8K 360, Ace Pro, GO 3S, ONE RS',
    popularModels: '20+ Models Supported',
    category: 'cat-action-camera',
  },
  {
    id: 'zhiyun',
    name: 'Zhiyun Tech',
    logo: 'https://camsik.com/img/productBrand/1898d608-4b2f-4448-b9c8-72498f0ebf30.png',
    tagline: 'Crane & Weebill Pro Gimbals',
    specialty: 'Crane 4, Weebill 3S, Smooth 5S',
    popularModels: '18+ Stabilizers',
    category: 'cat-gimbal',
  },
];

export default function CameraBrandsCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-8 lg:py-10 bg-white border-y border-border/60 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Header with Badges */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles size={12} className="text-purple-600" />
              Supported Manufacturers
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Top Tech &amp; Camera Brands We Buy, Sell &amp; Exchange
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Guaranteed top valuations and certified inventory across Apple, Samsung, Dell, HP, Lenovo, Sony, Canon, and DJI.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-border bg-white text-foreground hover:bg-primary hover:text-white hover:border-primary flex items-center justify-center transition-all duration-200 shadow-sm btn-press"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-border bg-white text-foreground hover:bg-primary hover:text-white hover:border-primary flex items-center justify-center transition-all duration-200 shadow-sm btn-press"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Brand Cards Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cameraBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/sell-device-get-quote?category=${brand.category}&brand=${brand.id}`}
              className="group snap-start flex-shrink-0 w-64 sm:w-72 bg-gradient-to-b from-surface/50 to-surface rounded-2xl p-5 border border-border/80 hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-8 w-24 flex items-center justify-start">
                    <img
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      className="max-h-7 max-w-[85px] w-auto h-auto object-contain object-left group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-200">
                    <ArrowUpRight size={15} />
                  </div>
                </div>

                <h3 className="font-extrabold text-foreground text-base group-hover:text-primary transition-colors">
                  {brand.name}
                </h3>
                <p className="text-xs font-semibold text-primary/90 mt-0.5">
                  {brand.tagline}
                </p>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                  Popular: {brand.specialty}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-bold text-muted-foreground group-hover:text-foreground">
                <span className="inline-flex items-center gap-1">
                  <Camera size={12} className="text-primary" />
                  {brand.popularModels}
                </span>
                <span className="text-primary font-bold">Check Quote &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
