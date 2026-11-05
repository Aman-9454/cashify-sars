'use client';

import React from 'react';
import AdminPanelLayout from '../components/AdminPanelLayout';
import AdminOrders from '../components/AdminOrders';

export default function AdminOrdersPage() {
  return (
    <AdminPanelLayout activeSection="orders" onSectionChange={(s) => { window.location.href = `/admin/${s}`; }}>
      <AdminOrders initialFilterStatus="all" initialFilterType="all" />
    </AdminPanelLayout>
  );
}
