'use client';

import React from 'react';
import AdminPanelLayout from '../components/AdminPanelLayout';
import AdminInventory from '../components/AdminInventory';

export default function AdminInventoryPage() {
  return (
    <AdminPanelLayout activeSection="inventory" onSectionChange={(s) => { window.location.href = `/admin/${s}`; }}>
      <AdminInventory />
    </AdminPanelLayout>
  );
}
