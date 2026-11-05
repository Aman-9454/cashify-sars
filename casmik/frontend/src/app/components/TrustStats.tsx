'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Users, DollarSign, Smartphone, MapPin, Star, Building } from 'lucide-react';

// Backend integration point: fetch these stats from /api/v1/cms/stats
const stats = [
  { id: 'stat-customers', icon: Users, value: '10L+', label: 'Happy Customers', color: 'text-primary' },
  { id: 'stat-paid', icon: DollarSign, value: '₹250Cr+', label: 'Paid to Customers', color: 'text-warning' },
  { id: 'stat-devices', icon: Smartphone, value: '1L+', label: 'Devices Sold', color: 'text-info' },
  { id: 'stat-cities', icon: MapPin, value: '100+', label: 'Cities Covered', color: 'text-purple-500' },
  { id: 'stat-centers', icon: Building, value: '200+', label: 'Service Centers', color: 'text-danger' },
  { id: 'stat-rating', icon: Star, value: '4.9/5', label: 'Average Rating', color: 'text-warning' },
];

export default function TrustStats() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref?.current) observer?.observe(ref?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-10 bg-white border-y border-border">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
          {stats?.map((stat, i) => (
            <div
              key={stat?.id}
              className={`flex items-center gap-3 py-2 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0`}>
                <stat.icon size={18} className={stat?.color} />
              </div>
              <div>
                <p className="stat-number text-foreground leading-none">{stat?.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{stat?.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}