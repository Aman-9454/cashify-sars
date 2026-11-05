'use client';

import React, { useState, useEffect } from 'react';
import PartnerLayout from '../components/PartnerLayout';
import PartnerInspection from '../components/PartnerInspection';

export default function PartnerInspectionPage() {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paramId = params.get('orderId');
      const savedId = localStorage.getItem('casmik_active_inspection_id');
      setOrderId(paramId || savedId || null);
    }
  }, []);

  return (
    <PartnerLayout activeSection="inspection" onSectionChange={(s) => { window.location.href = `/partner/${s}`; }}>
      <PartnerInspection
        initialOrderId={orderId}
        onBackToOrders={() => { window.location.href = '/partner/orders'; }}
      />
    </PartnerLayout>
  );
}
