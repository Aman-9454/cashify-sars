import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Camsik — Buy, Sell & Exchange Used Smartphones, Laptops, MacBooks, Tablets & Cameras | Instant Cash & Free Doorstep Pickup',
  description: "India's leading ReCommerce platform. Sell, buy certified refurbished, or exchange old smartphones, iPhones, MacBooks, laptops, iPads, tablets, DSLRs, mirrorless cameras & lenses with instant AI valuation, free doorstep pickup, 45-point testing & certified warranty.",
  keywords: 'sell old phone, sell used iphone, sell laptop, sell macbook, sell used tablet, sell dslr camera, buy refurbished iphone, buy refurbished macbook, 1-step device exchange, camsik recommerce, apple, samsung, sony, canon, dell',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}