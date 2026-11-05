'use client';
import React, { useState, createContext, useContext } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

export type AdminSection =
  | 'dashboard' |'customers' |'partners' |'delivery' |'sell-orders' |'buy-orders' |'exchange-orders' |'repair-orders' |'pickups' |'categories' |'brands' |'models' |'inventory' |'pricing' |'questions' |'coupons' |'payments' |'payouts' |'pincodes' |'support' |'reviews' |'notifications' |'cms' |'reports' |'settings' |'roles';

interface AdminContextType {
  activeSection: AdminSection;
  setActiveSection: (s: AdminSection) => void;
}

export const AdminContext = createContext<AdminContextType>({
  activeSection: 'dashboard',
  setActiveSection: () => {},
});

export const useAdminSection = () => useContext(AdminContext);

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  return (
    <AdminContext.Provider value={{ activeSection, setActiveSection }}>
      <div className="flex h-screen bg-surface overflow-hidden">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <div className="flex-1 flex flex-col overflow-hidden admin-sidebar-transition">
          <AdminTopbar onMenuToggle={() => setSidebarCollapsed(c => !c)} activeSection={activeSection} />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}