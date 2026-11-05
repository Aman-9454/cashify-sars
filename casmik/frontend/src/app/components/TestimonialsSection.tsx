'use client';
import React, { useState } from 'react';
import { Star, Quote } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

// Backend integration point: fetch from /api/v1/cms/testimonials
const testimonials = [
{
  id: 'review-1',
  name: 'Priya Nair',
  city: 'Bengaluru',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14b3a32aa-1772054739413.png",
  avatarAlt: 'Young Indian woman smiling in professional attire',
  rating: 5,
  service: 'sell',
  review: 'Sold my iPhone 14 Pro Max and got ₹72,000 instantly. The pickup was on time and payment came within 20 minutes of inspection. Absolutely seamless experience!'
},
{
  id: 'review-2',
  name: 'Arjun Mehta',
  city: 'Mumbai',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_18162979e-1763294376572.png",
  avatarAlt: 'Young Indian man with glasses in casual wear',
  rating: 5,
  service: 'buy',
  review: 'Bought a refurbished MacBook Air M2 in Superb condition. It looks and works exactly like new — and I saved ₹25,000 compared to the Apple Store price.'
},
{
  id: 'review-3',
  name: 'Sneha Reddy',
  city: 'Hyderabad',
  avatar: "https://images.unsplash.com/photo-1678536517689-f9d11edd22ec",
  avatarAlt: 'South Indian woman in traditional attire smiling',
  rating: 5,
  service: 'exchange',
  review: 'Exchanged my old Samsung S22 for OnePlus 12. The exchange value was ₹3,000 more than what Samsung was offering. The whole process took under an hour!'
},
{
  id: 'review-4',
  name: 'Vikram Singh',
  city: 'Delhi',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b118c335-1781593537249.png",
  avatarAlt: 'North Indian man in blue shirt with short hair',
  rating: 4,
  service: 'repair',
  review: 'Screen replacement for my iPhone 15 was done in 3 hours with an original part. Got a 6-month warranty too. Will definitely use Casmik again.'
},
{
  id: 'review-5',
  name: 'Kavya Krishnamurthy',
  city: 'Chennai',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1002e31c0-1772801495747.png",
  avatarAlt: 'Tamil woman with long hair in casual clothing',
  rating: 5,
  service: 'sell',
  review: 'The price transparency is what I loved most. I could see exactly why ₹1,200 was deducted for the minor scratch. No surprises at all. Got ₹48,500 for my OnePlus.'
},
{
  id: 'review-6',
  name: 'Rohit Kapoor',
  city: 'Pune',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1feea5033-1763293177712.png",
  avatarAlt: 'Indian man in his 30s with beard in casual wear',
  rating: 5,
  service: 'buy',
  review: 'Bought a refurbished iPad Pro for my daughter. Came fully charged, with all accessories and a warranty card. Delivery in 2 days — couldn\'t be happier.'
}];


const serviceFilters = [
{ id: 'filter-all', label: 'All', value: 'all' },
{ id: 'filter-sell', label: 'Sell', value: 'sell' },
{ id: 'filter-buy', label: 'Buy', value: 'buy' },
{ id: 'filter-exchange', label: 'Exchange', value: 'exchange' },
{ id: 'filter-repair', label: 'Repair', value: 'repair' }];


export default function TestimonialsSection() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = activeFilter === 'all' ?
  testimonials :
  testimonials?.filter((t) => t?.service === activeFilter);

  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">What Our Customers Say</h2>
          <p className="text-muted-foreground mb-6">Real experiences from real people across India</p>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {serviceFilters?.map((filter) =>
            <button
              key={filter?.id}
              onClick={() => setActiveFilter(filter?.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 btn-press ${
              activeFilter === filter?.value ?
              'gradient-green text-white shadow-green' :
              'bg-muted text-muted-foreground hover:text-foreground'}`
              }>

                {filter?.label}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered?.map((review) =>
          <div
            key={review?.id}
            className="bg-white border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative">

              <Quote size={24} className="text-primary/20 absolute top-4 right-4" />
              <div className="flex items-center gap-3 mb-4">
                <AppImage
                src={review?.avatar}
                alt={review?.avatarAlt}
                width={44}
                height={44}
                className="rounded-full object-cover w-11 h-11 flex-shrink-0" />

                <div>
                  <p className="font-bold text-sm text-foreground">{review?.name}</p>
                  <p className="text-xs text-muted-foreground">{review?.city}</p>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {Array.from({ length: 5 })?.map((_, si) =>
                <Star
                  key={`star-${review?.id}-${si}`}
                  size={12}
                  className={si < review?.rating ? 'text-warning fill-warning' : 'text-border fill-border'} />

                )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review?.review}</p>
              <div className="mt-4 inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-50 text-xs font-semibold text-primary capitalize">
                {review?.service} Experience
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}