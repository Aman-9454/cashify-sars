'use client';

import React from 'react';
import DeliveryLayout from '../components/DeliveryLayout';
import DeliveryEarnings from '../components/DeliveryEarnings';

export default function DeliveryEarningsPage() {
  return (
    <DeliveryLayout activeSection="earnings" onSectionChange={(s) => { window.location.href = `/delivery/${s}`; }}>
      <DeliveryEarnings />
    </DeliveryLayout>
  );
}
