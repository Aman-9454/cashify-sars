import React, { Suspense } from 'react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';
import SellDeviceWorkflow from '@/app/sell-device-get-quote/components/SellDeviceWorkflow';

export default function SellDevicePage() {
  return (
    <main className="min-h-screen bg-surface">
      <CustomerHeader />
      <Suspense fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-muted-foreground">Loading device valuation workflow...</p>
        </div>
      }>
        <SellDeviceWorkflow />
      </Suspense>
      <CustomerFooter />
    </main>
  );
}