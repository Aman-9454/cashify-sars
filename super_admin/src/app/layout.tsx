import React from 'react';
import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'CAMSIK SaaS Super Admin — Multi-Tenant Platform & Database Manager',
  description: 'Enterprise ReCommerce Multi-Tenant Management Dashboard with Database-per-Tenant isolation & Dynamic Templates.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0D14] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

