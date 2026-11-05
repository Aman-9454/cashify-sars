'use client';

import React from 'react';
import AdminPanelLayout from '../components/AdminPanelLayout';
import AdminSettings from '../components/AdminSettings';

export default function AdminSettingsPage() {
  return (
    <AdminPanelLayout activeSection="settings" onSectionChange={(s) => { window.location.href = `/admin/${s}`; }}>
      <AdminSettings />
    </AdminPanelLayout>
  );
}
