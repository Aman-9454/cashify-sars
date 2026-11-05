'use client';
import React from 'react';
import { useAdminSection } from './AdminLayout';
import AdminDashboardContent from './AdminDashboardContent';
import AdminSectionCustomers from './AdminSectionCustomers';
import AdminSectionPartners from './AdminSectionPartners';
import AdminSectionDelivery from './AdminSectionDelivery';
import AdminSectionOrders from './AdminSectionOrders';
import AdminSectionCategories from './AdminSectionCategories';
import AdminSectionBrands from './AdminSectionBrands';
import AdminSectionModels from './AdminSectionModels';
import AdminSectionPricing from './AdminSectionPricing';
import AdminSectionPayouts from './AdminSectionPayouts';
import AdminSectionGeneric from './AdminSectionGeneric';

export default function AdminSectionRouter() {
  const { activeSection } = useAdminSection();

  switch (activeSection) {
    case 'dashboard': return <AdminDashboardContent />;
    case 'customers': return <AdminSectionCustomers />;
    case 'partners': return <AdminSectionPartners />;
    case 'delivery': return <AdminSectionDelivery />;
    case 'sell-orders': return <AdminSectionOrders type="sell" />;
    case 'buy-orders': return <AdminSectionOrders type="buy" />;
    case 'exchange-orders': return <AdminSectionOrders type="exchange" />;
    case 'repair-orders': return <AdminSectionOrders type="repair" />;
    case 'pickups': return <AdminSectionOrders type="pickups" />;
    case 'categories': return <AdminSectionCategories />;
    case 'brands': return <AdminSectionBrands />;
    case 'models': return <AdminSectionModels />;
    case 'pricing': return <AdminSectionPricing />;
    case 'payouts': return <AdminSectionPayouts />;
    default: return <AdminSectionGeneric section={activeSection} />;
  }
}
