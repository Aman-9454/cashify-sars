import React from 'react';

// Backend integration point: fetch from /api/v1/cms/popular-brands
const brands = [
{ id: 'brand-apple', name: 'Apple', logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1ff4d4470-1787485874919.png", alt: 'Apple logo in black' },
{ id: 'brand-samsung', name: 'Samsung', logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1a8a4292b-1787485872533.png", alt: 'Samsung wordmark logo in blue' },
{ id: 'brand-oneplus', name: 'OnePlus', logo: "https://img.rocket.new/generatedImages/rocket_gen_img_12b42f3b3-1773054280340.png", alt: 'OnePlus wordmark logo in red' },
{ id: 'brand-google', name: 'Google', logo: "https://img.rocket.new/generatedImages/rocket_gen_img_19c4d3904-1787485872707.png", alt: 'Google colorful wordmark logo' },
{ id: 'brand-xiaomi', name: 'Xiaomi', logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1200d17ca-1787485873407.png", alt: 'Xiaomi MI logo in orange' },
{ id: 'brand-dell', name: 'Dell', logo: "https://img.rocket.new/generatedImages/rocket_gen_img_17848ad10-1787485873568.png", alt: 'Dell wordmark logo in blue' },
{ id: 'brand-hp', name: 'HP', logo: "https://img.rocket.new/generatedImages/rocket_gen_img_152ce8897-1787485873872.png", alt: 'HP logo in blue circle' },
{ id: 'brand-sony', name: 'Sony', logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1f2fda134-1787485874444.png", alt: 'Sony wordmark logo in black' }];


export default function PopularBrands() {
  return (
    <section className="py-12 bg-surface border-y border-border">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10">
        <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
          We support all major brands
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
          {brands?.map((brand) =>
          <div
            key={brand?.id}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-150 cursor-pointer">

              <div className="w-10 h-10 flex items-center justify-center">
                <img src={brand?.logo} alt={brand?.alt} className="max-w-full max-h-full object-contain" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{brand?.name}</span>
            </div>
          )}
        </div>
      </div>
    </section>);

}