'use client';

import React from 'react';
import DeliveryLayout from '../components/DeliveryLayout';
import DeliveryInspection from '../components/DeliveryInspection';

export default function DeliveryInspectionPage() {
  return (
    <DeliveryLayout activeSection="inspection" onSectionChange={(s) => { window.location.href = `/delivery/${s}`; }}>
      <DeliveryInspection onBackToTasks={() => { window.location.href = '/delivery/tasks'; }} />
    </DeliveryLayout>
  );
}
