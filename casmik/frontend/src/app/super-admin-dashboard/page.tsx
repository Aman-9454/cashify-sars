'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/super-admin-dashboard/components/AdminLayout';
import AdminSectionRouter from '@/app/super-admin-dashboard/components/AdminSectionRouter';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('casmik_admin_auth');
      if (auth !== 'true') {
        router.replace('/admin/login');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [router]);

  if (isAuthorized !== true) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center text-white select-none">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4 shadow-xl shadow-primary/20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-base font-bold text-white tracking-wide">CAMSIK Admin Security</p>
        <p className="text-xs text-white/50 mt-1">Verifying administrative access...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <AdminSectionRouter />
    </AdminLayout>
  );
}