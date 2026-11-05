'use client';

import React, { useState, useEffect } from 'react';
import PartnerLayout from '../components/PartnerLayout';
import PartnerSettings from '../components/PartnerSettings';
import { Partner, partners } from '@/lib/casmikData';

export default function PartnerSettingsPage() {
  const [session, setSession] = useState<Partner>(partners[0]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('casmik_partner_session');
        if (saved) setSession(JSON.parse(saved));
      } catch {}
    }
  }, []);

  return (
    <PartnerLayout activeSection="settings" onSectionChange={(s) => { window.location.href = `/partner/${s}`; }}>
      <PartnerSettings partner={session} onUpdateSession={setSession} />
    </PartnerLayout>
  );
}
