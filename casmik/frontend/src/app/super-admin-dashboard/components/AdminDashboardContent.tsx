import React from 'react';
import KPIBentoGrid from './KPIBentoGrid';
import RevenueChart from './RevenueChart';
import OrdersBarChart from './OrdersBarChart';
import RecentOrdersTable from './RecentOrdersTable';
import PartnerPerformancePanel from './PartnerPerformancePanel';
import AlertsPanel from './AlertsPanel';
import AssignmentQueue from './AssignmentQueue';

export default function AdminDashboardContent() {
  return (
    <div className="space-y-6 max-w-screen-2xl">
      {/* KPI Bento */}
      <KPIBentoGrid />

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <div className="xl:col-span-1">
          <OrdersBarChart />
        </div>
      </div>

      {/* Middle row: Recent orders + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <RecentOrdersTable />
        </div>
        <div className="xl:col-span-1 space-y-5">
          <AlertsPanel />
          <AssignmentQueue />
        </div>
      </div>

      {/* Partner performance */}
      <PartnerPerformancePanel />
    </div>
  );
}