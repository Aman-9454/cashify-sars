'use client';

import React from 'react';
import AdminPanelLayout from '../components/AdminPanelLayout';
import AdminPartners from '../components/AdminPartners';

export default function AdminPartnersPage() {
  return (
    <AdminPanelLayout activeSection="partners" onSectionChange={(s) => { window.location.href = `/admin/${s}`; }}>
      <AdminPartners />
    </AdminPanelLayout>
  );
}
