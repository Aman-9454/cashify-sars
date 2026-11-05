'use client';

import React from 'react';
import PartnerLayout from '../components/PartnerLayout';
import PartnerOrders from '../components/PartnerOrders';

export default function PartnerOrdersPage() {
  const handleStartInspection = (orderId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('casmik_active_inspection_id', orderId);
      window.location.href = `/partner/inspection?orderId=${orderId}`;
    }
  };

  return (
    <PartnerLayout activeSection="orders" onSectionChange={(s) => { window.location.href = `/partner/${s}`; }}>
      <PartnerOrders onStartInspection={handleStartInspection} />
    </PartnerLayout>
  );
}
