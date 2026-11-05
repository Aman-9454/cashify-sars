import React, { useState, useEffect } from 'react';
import { Save, Building2, CreditCard, Bell, Globe, Shield, Truck, Percent, MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';

type SettingsTab = 'company' | 'pincodes' | 'payment' | 'notifications' | 'delivery' | 'commission' | 'security' | 'integrations';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('pincodes');
  const [saved, setSaved] = useState(false);
  const [pincodesList, setPincodesList] = useState<{ pincode: string; city: string; active: boolean; addedAt?: string }[]>([]);
  const [newPincode, setNewPincode] = useState('');
  const [newCity, setNewCity] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const fetchPincodes = async () => {
    try {
      const res = await fetch('/api/pincodes');
      const data = await res.json();
      if (data.success && Array.isArray(data.pincodes)) {
        setPincodesList(data.pincodes);
      }
    } catch {}
  };

  useEffect(() => {
    fetchPincodes();
  }, []);

  const handleAddPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = newPincode.trim();
    if (!pin || pin.length < 5) {
      alert('Please enter a valid PIN code (e.g. 401107)');
      return;
    }
    setPincodeLoading(true);
    try {
      const res = await fetch('/api/pincodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: pin, city: newCity.trim() || 'Serviceable City' }),
      });
      const data = await res.json();
      if (data.success) {
        setNewPincode('');
        setNewCity('');
        setPincodesList(data.pincodes);
      } else {
        alert(data.message || 'Failed to add PIN code');
      }
    } catch (err: any) {
      alert('Error adding PIN code: ' + err.message);
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleDeletePincode = async (pin: string) => {
    if (!confirm(`Are you sure you want to remove PIN code ${pin}?`)) return;
    try {
      const res = await fetch(`/api/pincodes?pincode=${pin}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPincodesList(data.pincodes);
      }
    } catch {}
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
    { key: 'pincodes', label: 'Serviceable PINs', icon: MapPin },
    { key: 'company', label: 'Company', icon: Building2 },
    { key: 'payment', label: 'Payment', icon: CreditCard },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'delivery', label: 'Delivery', icon: Truck },
    { key: 'commission', label: 'Commission', icon: Percent },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'integrations', label: 'Integrations', icon: Globe },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Configure all platform settings and preferences</p>
      </div>

      {saved && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <span className="text-green-600">✓</span>
          <p className="text-sm font-semibold text-green-800">Settings saved successfully!</p>
        </div>
      )}

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-44 flex-shrink-0 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${activeTab === tab.key ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Icon size={15} />
                <span className="text-xs font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {activeTab === 'pincodes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                    <MapPin className="text-primary" size={20} />
                    Serviceable PIN Codes Management
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Orders will only be accepted for PIN codes listed here. Any unlisted PIN code will show an unserviceable area popup and be tracked in the Unserviceable Orders section.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  {pincodesList.length} Active PINs
                </span>
              </div>

              {/* Add PIN Code Form */}
              <form onSubmit={handleAddPincode} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Add New Serviceable PIN Code</p>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-Digit PIN (e.g. 401107)"
                      value={newPincode}
                      onChange={e => setNewPincode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                      required
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="City / Area Name (e.g. Mumbai / Mira Road)"
                      value={newCity}
                      onChange={e => setNewCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      disabled={pincodeLoading || !newPincode}
                      className="w-full h-full py-2.5 px-4 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus size={14} /> Add Service Area
                    </button>
                  </div>
                </div>
              </form>

              {/* Pincodes Grid */}
              <div className="space-y-2">
                <p className="text-xs font-black text-gray-700 uppercase tracking-wider">Currently Active Serviceable Areas ({pincodesList.length})</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {pincodesList.map((item) => (
                    <div
                      key={item.pincode}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white hover:border-primary/40 transition-all shadow-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-sm text-slate-900">{item.pincode}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.city}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeletePincode(item.pincode)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove PIN code"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-5">
              <h3 className="font-bold text-gray-900 text-base">Company Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Company Name', value: 'CAMSIK Technologies Pvt Ltd' },
                  { label: 'Brand Name', value: 'CAMSIK' },
                  { label: 'Support Email', value: 'sellatcamsik@gmail.com' },
                  { label: 'Support Phone', value: '+91 8976000010' },
                  { label: 'GST Number', value: '27AABCC1234D1Z5' },
                  { label: 'PAN Number', value: 'AABCC1234D' },
                  { label: 'Registered Address', value: 'A-315, Shanti Shopping Center, Near Mira Road Station, Mumbai, Maharashtra - 401107' },
                  { label: 'Currency', value: 'INR (₹)' },
                ].map(field => (
                  <div key={field.label}>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">{field.label}</label>
                    <input defaultValue={field.value} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Platform Tagline</label>
                <input defaultValue="Turn Your Old Devices Into Instant Value." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">Tax Rate (%)</label>
                  <input type="number" defaultValue="18" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">Maintenance Mode</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white">
                    <option value="off">Off (Platform Active)</option>
                    <option value="on">On (Maintenance)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-5">
              <h3 className="font-bold text-gray-900 text-base">Payment Settings</h3>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-bold text-blue-900 text-sm mb-3">Admin Bank Account (for Bank Transfers)</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Bank Name', value: 'ICICI Bank' },
                    { label: 'IFSC Code', value: 'ICIC0000004' },
                    { label: 'Account Name', value: 'Cashify Recommerce Pvt Ltd' },
                    { label: 'Account Number', value: '000405001289' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-xs font-bold text-blue-700 mb-1 block">{f.label}</label>
                      <input defaultValue={f.value} className="w-full px-3 py-2 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Payment Gateway', value: 'Razorpay' },
                  { label: 'Gateway API Key', value: 'rzp_live_xxxxxxxxxx' },
                  { label: 'Min Payout Amount (₹)', value: '1000' },
                  { label: 'Max Payout Amount (₹)', value: '500000' },
                  { label: 'Payout Processing Days', value: '2-3 Business Days' },
                  { label: 'Auto Settlement', value: 'Disabled' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">{f.label}</label>
                    <input defaultValue={f.value} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h3 className="font-bold text-gray-900 text-base">Notification Settings</h3>
              <div className="space-y-3">
                {[
                  { label: 'New Order Created', desc: 'Notify admin when a new order is placed', enabled: true },
                  { label: 'Partner Onboarded', desc: 'Notify when a new partner signs up', enabled: true },
                  { label: 'Delivery Agent Onboarded', desc: 'Notify when a new delivery agent joins', enabled: true },
                  { label: 'Order Assigned', desc: 'Notify partner when order is assigned', enabled: true },
                  { label: 'Inspection Completed', desc: 'Notify admin when inspection is done', enabled: true },
                  { label: 'Payment Processed', desc: 'Notify customer when payment is sent', enabled: true },
                  { label: 'Payout Requested', desc: 'Notify admin when partner requests payout', enabled: false },
                  { label: 'Bank Transfer Submitted', desc: 'Notify admin when partner submits bank transfer', enabled: true },
                ].map(n => (
                  <div key={n.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{n.label}</p>
                      <p className="text-xs text-gray-500">{n.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={n.enabled} className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">SMS Provider</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white">
                    <option>Twilio</option><option>MSG91</option><option>TextLocal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">Email Provider</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white">
                    <option>SendGrid</option><option>Mailgun</option><option>AWS SES</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-5">
              <h3 className="font-bold text-gray-900 text-base">Delivery Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Max Pickup Radius (km)', value: '15' },
                  { label: 'Pickup SLA (hours)', value: '24' },
                  { label: 'Delivery SLA (days)', value: '2-3' },
                  { label: 'Max Orders per Agent/Day', value: '10' },
                  { label: 'Auto Assignment', value: 'Enabled' },
                  { label: 'Reassignment Timeout (min)', value: '30' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">{f.label}</label>
                    <input defaultValue={f.value} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Pickup Time Slots</label>
                <div className="space-y-2">
                  {['9:00 AM - 11:00 AM', '11:00 AM - 1:00 PM', '1:00 PM - 3:00 PM', '3:00 PM - 5:00 PM', '5:00 PM - 7:00 PM'].map(slot => (
                    <div key={slot} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-700 font-medium">{slot}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'commission' && (
            <div className="space-y-5">
              <h3 className="font-bold text-gray-900 text-base">Commission & Payout Rules</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Default Partner Commission (%)', value: '10' },
                  { label: 'Sell Order Commission (%)', value: '12' },
                  { label: 'Buy Order Commission (%)', value: '8' },
                  { label: 'Repair Order Commission (%)', value: '15' },
                  { label: 'Exchange Order Commission (%)', value: '10' },
                  { label: 'Delivery Agent Base Pay (₹/task)', value: '150' },
                  { label: 'Delivery Incentive (₹/extra task)', value: '50' },
                  { label: 'Payout Frequency', value: 'Bi-weekly' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">{f.label}</label>
                    <input defaultValue={f.value} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5">
              <h3 className="font-bold text-gray-900 text-base">Security Settings</h3>
              <div className="space-y-3">
                {[
                  { label: 'Two-Factor Authentication', desc: 'Require 2FA for admin login', enabled: false },
                  { label: 'Session Timeout', desc: 'Auto logout after 30 minutes of inactivity', enabled: true },
                  { label: 'IP Whitelist', desc: 'Restrict admin access to specific IPs', enabled: false },
                  { label: 'Audit Logging', desc: 'Log all admin actions', enabled: true },
                  { label: 'Failed Login Alerts', desc: 'Alert on 3+ failed login attempts', enabled: true },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{s.label}</p>
                      <p className="text-xs text-gray-500">{s.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={s.enabled} className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Change Admin Password</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="password" placeholder="Current password" className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input type="password" placeholder="New password" className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-5">
              <h3 className="font-bold text-gray-900 text-base">Third-Party Integrations</h3>
              <div className="space-y-4">
                {[
                  { name: 'Razorpay', desc: 'Payment gateway for UPI, cards, net banking', status: 'connected', icon: '💳' },
                  { name: 'Firebase FCM', desc: 'Push notifications for mobile apps', status: 'connected', icon: '🔔' },
                  { name: 'Google Maps', desc: 'Location services and delivery tracking', status: 'connected', icon: '🗺️' },
                  { name: 'MSG91', desc: 'SMS OTP and notifications', status: 'disconnected', icon: '📱' },
                  { name: 'SendGrid', desc: 'Transactional email service', status: 'connected', icon: '📧' },
                  { name: 'Cloudinary', desc: 'Image storage and optimization', status: 'disconnected', icon: '🖼️' },
                  { name: 'Shiprocket', desc: 'Logistics and delivery management', status: 'disconnected', icon: '🚚' },
                ].map(intg => (
                  <div key={intg.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{intg.icon}</span>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{intg.name}</p>
                        <p className="text-xs text-gray-500">{intg.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${intg.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {intg.status === 'connected' ? '● Connected' : '○ Disconnected'}
                      </span>
                      <button className="text-xs text-primary font-bold hover:underline">
                        {intg.status === 'connected' ? 'Configure' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100">
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Save size={15} /> Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
