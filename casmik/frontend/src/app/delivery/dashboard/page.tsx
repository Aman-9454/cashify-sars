'use client';

import React from 'react';
import DeliveryLayout from '../components/DeliveryLayout';
import DeliveryDashboard from '../components/DeliveryDashboard';

export default function DeliveryDashboardPage() {
  return (
    <DeliveryLayout activeSection="dashboard" onSectionChange={(s) => { window.location.href = `/delivery/${s}`; }}>
      <DeliveryDashboard />
    </DeliveryLayout>
  );
}
