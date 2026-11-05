'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const OrdersBarChartInner = dynamic(() => import('./OrdersBarChartInner'), { ssr: false });

export default function OrdersBarChart() {
  return <OrdersBarChartInner />;
}