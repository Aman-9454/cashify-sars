'use client';

import React from 'react';
import PartnerLayout from '../components/PartnerLayout';
import PartnerReports from '../components/PartnerReports';

export default function PartnerReportsPage() {
  return (
    <PartnerLayout activeSection="reports" onSectionChange={(s) => { window.location.href = `/partner/${s}`; }}>
      <PartnerReports />
    </PartnerLayout>
  );
}
