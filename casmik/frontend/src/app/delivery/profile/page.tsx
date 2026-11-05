'use client';

import React from 'react';
import DeliveryLayout from '../components/DeliveryLayout';
import DeliveryProfile from '../components/DeliveryProfile';

export default function DeliveryProfilePage() {
  return (
    <DeliveryLayout activeSection="profile" onSectionChange={(s) => { window.location.href = `/delivery/${s}`; }}>
      <DeliveryProfile />
    </DeliveryLayout>
  );
}
