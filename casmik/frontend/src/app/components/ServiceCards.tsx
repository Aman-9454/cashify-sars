import React from 'react';
import Link from 'next/link';
import { ArrowRight, Smartphone, ShoppingBag, RefreshCw, Wrench } from 'lucide-react';

const services = [
{
  id: 'service-sell',
  icon: Smartphone,
  title: 'Sell Your Device',
  description: 'Get the highest price for your old smartphones, tablets, laptops & more in just a few minutes.',
  cta: 'Sell Now',
  href: '/sell-device-get-quote',
  accent: '#16a34a',
  bgClass: 'bg-primary/10',
  iconBg: 'bg-primary',
  imageSrc: "https://images.unsplash.com/photo-1605574931378-0be0786247c0",
  imageAlt: 'Green iPhone held in hand against white background'
},
{
  id: 'service-buy',
  icon: ShoppingBag,
  title: 'Buy Refurbished',
  description: 'Certified refurbished devices with warranty at best prices. Like new, at a fraction of cost.',
  cta: 'Shop Now',
  href: '/buy-refurbished',
  accent: '#3b82f6',
  bgClass: 'bg-info/10',
  iconBg: 'bg-info',
  imageSrc: "https://images.unsplash.com/photo-1457617485418-2f9ab9aeca17",
  imageAlt: 'Blue Samsung Galaxy smartphone on white surface'
},
{
  id: 'service-exchange',
  icon: RefreshCw,
  title: 'Exchange Device',
  description: 'Upgrade your device and pay only the difference. Get the best exchange value instantly.',
  cta: 'Exchange Now',
  href: '/exchange-device',
  accent: '#8b5cf6',
  bgClass: 'bg-purple-50',
  iconBg: 'bg-purple-500',
  imageSrc: "https://img.rocket.new/generatedImages/rocket_gen_img_1b9fad2ae-1767051195970.png",
  imageAlt: 'Two smartphones side by side showing exchange concept'
},
{
  id: 'service-repair',
  icon: Wrench,
  title: 'Repair Your Device',
  description: 'Professional repair with genuine parts and warranty. Expert technicians at your doorstep.',
  cta: 'Book Repair',
  href: '/repair-device',
  accent: '#f59e0b',
  bgClass: 'bg-warning/10',
  iconBg: 'bg-warning',
  imageSrc: "https://images.unsplash.com/photo-1540566232928-01cb3eb6e35e",
  imageAlt: 'Cracked smartphone screen being repaired by technician'
}];


export default function ServiceCards() {
  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          {services?.map((service) =>
          <Link
            key={service?.id}
            href={service?.href}
            className="group relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col">

              <div className="p-5 flex-1">
                <div className={`w-11 h-11 rounded-xl ${service?.iconBg} flex items-center justify-center mb-4`}>
                  <service.icon size={20} className="text-white" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{service?.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service?.description}</p>
              </div>

              {/* Bottom row with CTA + image */}
              <div className="flex items-end justify-between px-5 pb-4 mt-2">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all duration-150">
                  {service?.cta}
                  <ArrowRight size={14} />
                </div>
                <div className="w-20 h-16 rounded-xl overflow-hidden opacity-90">
                  <img
                  src={service?.imageSrc}
                  alt={service?.imageAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );



}