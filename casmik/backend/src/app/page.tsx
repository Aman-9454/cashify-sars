import React from 'react';

export default function BackendStatusPage() {
  return (
    <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#10b981', fontSize: '1.75rem' }}>🚀 Camsik SaaS Backend API Server</h1>
      <p style={{ color: '#94a3b8' }}>
        Status: <strong style={{ color: '#38bdf8' }}>ONLINE & HEALTHY</strong>
      </p>
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#131b2e', borderRadius: '12px', border: '1px solid #1e293b' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#f1f5f9' }}>Available API Services</h3>
        <ul style={{ color: '#cbd5e1', lineHeight: '1.8' }}>
          <li><code>/api/orders</code> — Order processing & live status tracking</li>
          <li><code>/api/questions</code> — 45-point device valuation diagnostic tree</li>
          <li><code>/api/categories</code> — Electronics categories catalog</li>
          <li><code>/api/brands</code> — Supported device brands</li>
          <li><code>/api/models</code> — Device models & pricing matrix</li>
          <li><code>/api/partners</code> — Merchant & Partner store management</li>
          <li><code>/api/delivery</code> — Doorstep executive dispatch</li>
          <li><code>/api/saas/clients</code> — Multi-tenant client & database manager</li>
          <li><code>/api/saas/templates</code> — Project templates catalog</li>
        </ul>
      </div>
      <p style={{ marginTop: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
        Port: 4028 • Database: MongoDB Atlas (Multi-Tenant Isolated)
      </p>
    </div>
  );
}

