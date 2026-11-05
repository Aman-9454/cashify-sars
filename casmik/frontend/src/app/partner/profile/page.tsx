'use client';

import React, { useState, useEffect } from 'react';
import PartnerLayout from '../components/PartnerLayout';
import PartnerProfile from '../components/PartnerProfile';
import { Partner, partners } from '@/lib/casmikData';

export default function PartnerProfilePage() {
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
    <PartnerLayout activeSection="profile" onSectionChange={(s) => { window.location.href = `/partner/${s}`; }}>
      <PartnerProfile partner={session} onUpdateSession={setSession} />
    </PartnerLayout>
  );
}
