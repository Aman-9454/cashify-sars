'use client';

import React from 'react';
import AdminPanelLayout from '../components/AdminPanelLayout';
import AdminCMS from '../components/AdminCMS';

export default function AdminCMSPage() {
  return (
    <AdminPanelLayout activeSection="cms" onSectionChange={(s) => { window.location.href = `/admin/${s}`; }}>
      <AdminCMS />
    </AdminPanelLayout>
  );
}
