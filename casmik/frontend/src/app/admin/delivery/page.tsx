'use client';

import React from 'react';
import AdminPanelLayout from '../components/AdminPanelLayout';
import AdminDelivery from '../components/AdminDelivery';

export default function AdminDeliveryPage() {
  return (
    <AdminPanelLayout activeSection="delivery" onSectionChange={(s) => { window.location.href = `/admin/${s}`; }}>
      <AdminDelivery />
    </AdminPanelLayout>
  );
}
