import React from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowRight, Flame } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

const devices = [
  { id: 'device-iphone15pro', image: "https://img.rocket.new/generatedImages/rocket_gen_img_17b82fb7a-1772960574407.png", alt: 'Apple iPhone 15 Pro Max in black titanium color on white background', brand: 'Apple', model: 'iPhone 15 Pro Max', upTo: '₹1,05,000', trend: '+18% this week', trendUp: true, href: '/sell-device-get-quote' },
  { id: 'device-s24ultra', image: "https://img.rocket.new/generatedImages/rocket_gen_img_13122971f-1772616864168.png", alt: 'Samsung Galaxy S24 Ultra in titanium gray on white background', brand: 'Samsung', model: 'Galaxy S24 Ultra', upTo: '₹62,000', trend: '+15% this week', trendUp: true, href: '/sell-device-get-quote' },
  { id: 'device-oneplus12', image: "https://img.rocket.new/generatedImages/rocket_gen_img_16bb0e8da-1784565830868.png", alt: 'OnePlus 12 smartphone in silky black on white surface', brand: 'OnePlus', model: 'OnePlus 12', upTo: '₹45,000', trend: '+12% this week', trendUp: true, href: '/sell-device-get-quote' },
  { id: 'device-macbookm3', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1230ca14e-1772228321576.png", alt: 'MacBook Air M3 laptop open on wooden desk', brand: 'Apple', model: 'MacBook Air M3', upTo: '₹78,000', trend: '+10% this week', trendUp: true, href: '/sell-device-get-quote' },
  { id: 'device-pixel9pro', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e439c8ea-1772089098053.png", alt: 'Google Pixel 9 Pro smartphone in hazel color', brand: 'Google', model: 'Pixel 9 Pro', upTo: '₹52,000', trend: '+8% this week', trendUp: true, href: '/sell-device-get-quote' },
  { id: 'device-ipad', image: "https://images.unsplash.com/photo-1716153994283-c5b9bc0e4632", alt: 'Apple iPad Pro M4 with Apple Pencil on white background', brand: 'Apple', model: 'iPad Pro M4', upTo: '₹68,000', trend: '+6% this week', trendUp: true, href: '/sell-device-get-quote' },
  { id: 'device-watch', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1dd51548c-1764641911784.png", alt: 'Apple Watch Series 9 with black sport band', brand: 'Apple', model: 'Watch Series 9', upTo: '₹22,000', trend: '+5% this week', trendUp: true, href: '/sell-device-get-quote' },
  { id: 'device-nothing', image: "https://img.rocket.new/generatedImages/rocket_gen_img_14a2c7e61-1779885422795.png", alt: 'Nothing Phone 2a with transparent back design on white surface', brand: 'Nothing', model: 'Phone 2a', upTo: '₹18,000', trend: '-2% this week', trendUp: false, href: '/sell-device-get-quote' },
];

export default function TopValueDevices() {
  return (
    <section className="py-14 lg:py-16 bg-surface">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-foreground">Most Quoted Devices Today</h2>
              <Flame size={22} className="text-warning" />
            </div>
            <p className="text-sm text-muted-foreground">People are getting top value for these devices</p>
          </div>
          <Link href="/sell-device-get-quote" className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
          {devices?.map(device => (
            <Link key={device?.id} href={device?.href}
              className="group bg-white rounded-2xl border border-border p-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden mb-3 bg-muted">
                <AppImage src={device?.image} alt={device?.alt} width={64} height={64} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="text-xs text-muted-foreground font-medium mb-0.5">{device?.brand}</p>
              <p className="text-xs font-bold text-foreground leading-tight mb-2">{device?.model}</p>
              <p className="text-xs text-muted-foreground">Up to</p>
              <p className="text-sm font-bold text-foreground font-tabular">{device?.upTo}</p>
              <div className={`flex items-center gap-0.5 mt-1.5 text-xs font-semibold ${device?.trendUp ? 'text-primary' : 'text-danger'}`}>
                <TrendingUp size={10} className={device?.trendUp ? '' : 'rotate-180'} />
                <span>{device?.trend}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}