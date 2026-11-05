import { Partner, partners as defaultPartners } from './casmikData';

export const PARTNERS_STORAGE_KEY = 'casmik_partners_v1';
export const PARTNER_SESSION_KEY = 'casmik_partner_session';

export function getAllPartners(): Partner[] {
  if (typeof window === 'undefined') return defaultPartners;
  try {
    const raw = localStorage.getItem(PARTNERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Initialize with default partners if not already set
    localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(defaultPartners));
  } catch (err) {
    console.warn('Failed to load partners storage:', err);
  }
  return defaultPartners;
}

export function getPartnerById(partnerId?: string | null): Partner {
  const all = getAllPartners();
  if (partnerId) {
    const found = all.find(p => p.id === partnerId);
    if (found) return found;
  }
  // Try session partner
  if (typeof window !== 'undefined') {
    try {
      const sessionRaw = localStorage.getItem(PARTNER_SESSION_KEY);
      if (sessionRaw) {
        const sessionPartner = JSON.parse(sessionRaw);
        if (sessionPartner?.id) {
          const match = all.find(p => p.id === sessionPartner.id);
          if (match) return match;
          return sessionPartner;
        }
      }
    } catch {}
  }
  return all[1] || all[0] || defaultPartners[0];
}

export function checkPartnerBalance(partnerId?: string | null, amount: number = 0): {
  hasSufficientBalance: boolean;
  availableBalance: number;
  partner: Partner;
  shortfall: number;
} {
  const partner = getPartnerById(partnerId);
  const currentBalance = typeof partner.availableBalance === 'number' ? partner.availableBalance : 0;
  const hasSufficient = currentBalance >= amount;
  return {
    hasSufficientBalance: hasSufficient,
    availableBalance: currentBalance,
    partner,
    shortfall: hasSufficient ? 0 : amount - currentBalance,
  };
}

export function deductPartnerBalance(
  partnerId: string | null | undefined,
  amount: number,
  orderNumber: string,
  customerName: string
): { success: boolean; newBalance: number; error?: string } {
  if (typeof window === 'undefined') return { success: true, newBalance: 0 };
  const all = getAllPartners();
  const targetPartner = getPartnerById(partnerId);
  const pId = targetPartner.id;

  if (targetPartner.availableBalance < amount) {
    return {
      success: false,
      newBalance: targetPartner.availableBalance,
      error: `Insufficient partner wallet balance. Available: ₹${targetPartner.availableBalance.toLocaleString('en-IN')}, Required: ₹${amount.toLocaleString('en-IN')}`,
    };
  }

  const newBalance = targetPartner.availableBalance - amount;
  const updatedPartners = all.map(p => {
    if (p.id === pId) {
      return {
        ...p,
        availableBalance: newBalance,
        totalEarnings: (p.totalEarnings || 0) + Math.round(amount * 0.08), // 8% commission earned on completed orders
        completedOrders: (p.completedOrders || 0) + 1,
      };
    }
    return p;
  });

  try {
    localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(updatedPartners));

    // Update active partner session if applicable
    const sessionRaw = localStorage.getItem(PARTNER_SESSION_KEY);
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw);
      if (session?.id === pId) {
        localStorage.setItem(
          PARTNER_SESSION_KEY,
          JSON.stringify({
            ...session,
            availableBalance: newBalance,
          })
        );
      }
    }

    // Add transaction to history
    const historyKey = `casmik_payout_history_${pId}`;
    const existingHistRaw = localStorage.getItem(historyKey);
    const existingHist = existingHistRaw ? JSON.parse(existingHistRaw) : [];
    const newTxn = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount,
      status: 'paid',
      method: 'Spot Payout',
      txnId: `DISB-${orderNumber}-${Date.now().toString().slice(-4)}`,
      orderNumber,
      customerName,
    };
    localStorage.setItem(historyKey, JSON.stringify([newTxn, ...existingHist]));

    window.dispatchEvent(new CustomEvent('casmik_partners_updated', { detail: updatedPartners }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to deduct partner wallet balance:', err);
  }

  return { success: true, newBalance };
}

export function addPartnerBalance(partnerId: string | null | undefined, amount: number): number {
  if (typeof window === 'undefined') return 0;
  const all = getAllPartners();
  const targetPartner = getPartnerById(partnerId);
  const pId = targetPartner.id;
  const newBalance = (targetPartner.availableBalance || 0) + amount;

  const updatedPartners = all.map(p => {
    if (p.id === pId) {
      return {
        ...p,
        availableBalance: newBalance,
      };
    }
    return p;
  });

  try {
    localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(updatedPartners));
    const sessionRaw = localStorage.getItem(PARTNER_SESSION_KEY);
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw);
      if (session?.id === pId) {
        localStorage.setItem(
          PARTNER_SESSION_KEY,
          JSON.stringify({
            ...session,
            availableBalance: newBalance,
          })
        );
      }
    }
    window.dispatchEvent(new CustomEvent('casmik_partners_updated', { detail: updatedPartners }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to add partner wallet balance:', err);
  }

  return newBalance;
}
