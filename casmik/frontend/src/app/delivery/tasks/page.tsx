'use client';

import React from 'react';
import DeliveryLayout from '../components/DeliveryLayout';
import DeliveryTasks from '../components/DeliveryTasks';

export default function DeliveryTasksPage() {
  return (
    <DeliveryLayout activeSection="tasks" onSectionChange={(s) => { window.location.href = `/delivery/${s}`; }}>
      <DeliveryTasks />
    </DeliveryLayout>
  );
}
