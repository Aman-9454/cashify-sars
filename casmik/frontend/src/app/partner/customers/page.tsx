'use client';

import React from 'react';
import PartnerLayout from '../components/PartnerLayout';
import PartnerCustomers from '../components/PartnerCustomers';

export default function PartnerCustomersPage() {
  return (
    <PartnerLayout activeSection="customers" onSectionChange={(s) => { window.location.href = `/partner/${s}`; }}>
      <PartnerCustomers onNavigate={(s) => { window.location.href = `/partner/${s}`; }} />
    </PartnerLayout>
  );
}
