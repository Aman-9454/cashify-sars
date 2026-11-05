import React from 'react';
import { TrendingUp, Zap, Truck, CheckCircle, Shield, Ban, Wrench, Star, Headphones } from 'lucide-react';

// Backend integration point: fetch from /api/v1/cms/why-casmik
const reasons = [
  { id: 'why-price', icon: TrendingUp, title: 'Best Price Guaranteed', desc: 'Get up to 20% more than market price for your old device.', color: 'bg-primary/10 text-primary' },
  { id: 'why-payment', icon: Zap, title: 'Instant Payment', desc: 'Receive payment within 30 minutes of inspection via UPI or bank transfer.', color: 'bg-warning/10 text-warning' },
  { id: 'why-pickup', icon: Truck, title: 'Free Doorstep Pickup', desc: 'We come to you — free pickup from anywhere across 100+ cities.', color: 'bg-info/10 text-info' },
  { id: 'why-inspection', icon: CheckCircle, title: 'Certified Inspection', desc: '45+ quality checks conducted by trained experts at every step.', color: 'bg-primary/10 text-primary' },
  { id: 'why-data', icon: Shield, title: 'Secure Data Wipe', desc: 'Military-grade data erasure before any device is resold or recycled.', color: 'bg-purple-100 text-purple-600' },
  { id: 'why-hidden', icon: Ban, title: 'No Hidden Charges', desc: '100% transparent pricing. What you see is what you get.', color: 'bg-danger/10 text-danger' },
  { id: 'why-parts', icon: Wrench, title: 'Genuine Parts', desc: 'Only OEM or certified parts used in all repair jobs.', color: 'bg-warning/10 text-warning' },
  { id: 'why-rating', icon: Star, title: '4.9/5 Rating', desc: 'Consistently rated among India\'s top device platforms on Google & Trustpilot.', color: 'bg-warning/10 text-warning' },
  { id: 'why-support', icon: Headphones, title: '24/7 Live Support', desc: 'Real humans available round the clock — chat, call, or email.', color: 'bg-info/10 text-info' },
];

export default function WhyCasmik() {
  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Why Thousands Trust{' '}
            <span className="text-primary">Casmik</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Experience the smartest way to sell your devices — transparent, fast, and completely secure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {reasons?.map((reason) => (
            <div
              key={reason?.id}
              className="flex items-start gap-4 p-5 rounded-2xl border border-border hover:shadow-md transition-all duration-200 hover:border-primary/30 bg-white group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${reason?.color} transition-transform duration-200 group-hover:scale-110`}>
                <reason.icon size={22} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm mb-1">{reason?.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{reason?.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}