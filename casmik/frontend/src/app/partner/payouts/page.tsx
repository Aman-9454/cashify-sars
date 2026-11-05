'use client';

import React from 'react';
import PartnerLayout from '../components/PartnerLayout';
import PartnerPayouts from '../components/PartnerPayouts';

export default function PartnerPayoutsPage() {
  return (
    <PartnerLayout activeSection="payouts" onSectionChange={(s) => { window.location.href = `/partner/${s}`; }}>
      <PartnerPayouts />
    </PartnerLayout>
  );
}
