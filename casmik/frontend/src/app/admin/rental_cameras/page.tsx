'use client';
import React from 'react';
import AdminPanelLayout from '../components/AdminPanelLayout';
import AdminRentalCameras from '../components/AdminRentalCameras';

export default function AdminRentalCamerasUnderscorePage() {
  return (
    <AdminPanelLayout activeSection="rental_cameras" onSectionChange={(s) => { window.location.href = `/admin?section=${s}`; }}>
      <AdminRentalCameras />
    </AdminPanelLayout>
  );
}
