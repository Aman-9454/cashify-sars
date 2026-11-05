'use client';

import React from 'react';
import AdminPanelLayout from '../components/AdminPanelLayout';
import AdminCoupons from '../components/AdminCoupons';

export default function AdminCouponsPage() {
  return (
    <AdminPanelLayout activeSection="coupons" onSectionChange={(s) => { window.location.href = `/admin/${s}`; }}>
      <AdminCoupons />
    </AdminPanelLayout>
  );
}
