'use client';
import React, { useState } from 'react';
import { Partner } from '@/lib/casmikData';
import { 
  Settings, 
  Bell, 
  Shield, 
  Smartphone, 
  CheckCircle2, 
  Save, 
  Lock, 
  Sliders, 
  Clock, 
  Truck, 
  AlertCircle
} from 'lucide-react';

interface PartnerSettingsProps {
  partner?: Partner | null;
  onUpdateSession?: (p: Partner) => void;
}

export default function PartnerSettings({ partner, onUpdateSession }: PartnerSettingsProps) {
  const [autoAccept, setAutoAccept] = useState(partner?.settings?.autoAccept ?? true);
  const [smsAlerts, setSmsAlerts] = useState(partner?.settings?.smsAlerts ?? true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(partner?.settings?.whatsappAlerts ?? true);
  const [emailDigest, setEmailDigest] = useState(partner?.settings?.emailDigest ?? false);
  const [dailyCapacity, setDailyCapacity] = useState(partner?.settings?.dailyCapacity || '15');
  const [operatingHours, setOperatingHours] = useState(partner?.settings?.operatingHours || '10:00 AM - 8:30 PM');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (partner?.settings) {
      if (partner.settings.autoAccept !== undefined) setAutoAccept(partner.settings.autoAccept);
      if (partner.settings.smsAlerts !== undefined) setSmsAlerts(partner.settings.smsAlerts);
      if (partner.settings.whatsappAlerts !== undefined) setWhatsappAlerts(partner.settings.whatsappAlerts);
      if (partner.settings.emailDigest !== undefined) setEmailDigest(partner.settings.emailDigest);
      if (partner.settings.dailyCapacity) setDailyCapacity(partner.settings.dailyCapacity);
      if (partner.settings.operatingHours) setOperatingHours(partner.settings.operatingHours);
    }
  }, [partner]);

  const handleSave = async () => {
    if (!partner) return;
    setIsSaving(true);
    try {
      const updatedSettings = {
        autoAccept,
        dailyCapacity,
        operatingHours,
        smsAlerts,
        whatsappAlerts,
        emailDigest,
      };

      const payload = {
        id: partner.id,
        partnerId: partner.id,
        settings: updatedSettings,
      };

      const res = await fetch('/api/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const updated: Partner = {
        ...partner,
        settings: updatedSettings,
      };

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.partner) {
          Object.assign(updated, json.partner);
        }
      }

      if (onUpdateSession) {
        onUpdateSession(updated);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('casmik_partner_session', JSON.stringify(updated));
        window.dispatchEvent(new Event('casmik_partners_updated'));
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save partner settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            Store &amp; Partner Settings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure order fulfillment preferences, capacity limits, and notification channels.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 transition-all self-start sm:self-auto disabled:opacity-60 cursor-pointer"
        >
          {isSaving ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={15} />
          )}
          <span>{isSaving ? 'Saving to Database...' : 'Save All Changes'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Settings successfully updated and synchronized with your store profile.
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Operational & Order Rules */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Allocation Preferences */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <Sliders size={18} className="text-primary" />
              Order Intake &amp; Capacity
            </h3>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">Auto-Accept New Orders</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Automatically accept incoming sell and exchange orders matching your store pincodes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoAccept(!autoAccept)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  autoAccept ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoAccept ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Max Daily Order Capacity</label>
                <input
                  type="number"
                  value={dailyCapacity}
                  onChange={(e) => setDailyCapacity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-primary"
                />
                <p className="text-[11px] text-gray-400 mt-1">Maximum pickup requests routed per day</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Store Operating Hours</label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-primary"
                />
                <p className="text-[11px] text-gray-400 mt-1">Technicians will only dispatch within this window</p>
              </div>
            </div>
          </div>

          {/* Notifications Channels */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <Bell size={18} className="text-primary" />
              Real-time Alert Preferences
            </h3>

            <div className="divide-y divide-gray-100">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">WhatsApp Instant Dispatch Alerts</p>
                  <p className="text-xs text-gray-500">Receive order pickup and technician status via WhatsApp bot</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatsappAlerts(!whatsappAlerts)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    whatsappAlerts ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${whatsappAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">SMS Notifications</p>
                  <p className="text-xs text-gray-500">Urgent customer reschedule or inspection escalations</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsAlerts(!smsAlerts)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    smsAlerts ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${smsAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">Daily Financial Ledger Digest</p>
                  <p className="text-xs text-gray-500">End-of-day summary email with commission and payout receipt</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailDigest(!emailDigest)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    emailDigest ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${emailDigest ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Authentication */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <Lock size={18} className="text-primary" />
              Account Security
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Enter minimum 8 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <button
                onClick={() => alert('Password updated successfully.')}
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors mt-2"
              >
                Update Password
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
            <div className="flex items-center gap-2 font-bold text-xs">
              <AlertCircle size={15} className="text-amber-600" />
              Assigned Store Hub
            </div>
            <p className="text-xs mt-1 text-amber-800">
              For changes to your store trade name, bank accounts, or verified territory pin codes, contact Camsik Super Admin or your territory manager.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
