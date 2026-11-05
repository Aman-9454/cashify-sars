'use client';

import React from 'react';
import AdminPanelLayout from '../components/AdminPanelLayout';
import AdminPricing from '../components/AdminPricing';

export default function AdminPricingPage() {
  return (
    <AdminPanelLayout activeSection="pricing" onSectionChange={(s) => { window.location.href = `/admin/${s}`; }}>
      <AdminPricing />
    </AdminPanelLayout>
  );
}
