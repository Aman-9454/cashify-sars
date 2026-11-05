'use client';

import React from 'react';
import AdminPanelLayout from '../components/AdminPanelLayout';
import AdminNotifications from '../components/AdminNotifications';

export default function AdminNotificationsPage() {
  return (
    <AdminPanelLayout activeSection="notifications" onSectionChange={(s) => { window.location.href = `/admin/${s}`; }}>
      <AdminNotifications />
    </AdminPanelLayout>
  );
}
