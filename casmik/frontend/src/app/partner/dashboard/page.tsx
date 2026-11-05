'use client';

import React from 'react';
import PartnerLayout from '../components/PartnerLayout';
import PartnerDashboard from '../components/PartnerDashboard';

export default function PartnerDashboardPage() {
  return (
    <PartnerLayout activeSection="dashboard" onSectionChange={(s) => { window.location.href = `/partner/${s}`; }}>
      <PartnerDashboard onNavigate={(s) => { window.location.href = `/partner/${s}`; }} />
    </PartnerLayout>
  );
}
