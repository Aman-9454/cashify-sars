'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const RevenueChartInner = dynamic(() => import('./RevenueChartInner'), { ssr: false });

export default function RevenueChart() {
  return <RevenueChartInner />;
}