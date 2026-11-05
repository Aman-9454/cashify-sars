'use client';

import React from 'react';
import AdminPanelLayout from '../components/AdminPanelLayout';
import AdminOverview from '../components/AdminOverview';

export default function AdminOverviewPage() {
  return (
    <AdminPanelLayout activeSection="overview" onSectionChange={(s) => { window.location.href = `/admin/${s}`; }}>
      <AdminOverview onNavigate={(s) => { window.location.href = `/admin/${s}`; }} />
    </AdminPanelLayout>
  );
}
