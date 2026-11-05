'use client';
import React, { useState } from 'react';
import { Send, Users, Handshake, Truck, Search, X, Plus, Bell, CheckCircle } from 'lucide-react';
import { customers, partners, deliveryAgents } from '@/lib/casmikData';
import Icon from '@/components/ui/AppIcon';


type AudienceType = 'all_users' | 'all_partners' | 'all_delivery' | 'custom';

const audienceOptions = [
  { key: 'all_users', label: 'All Users', desc: `${customers.length} registered users`, icon: Users, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { key: 'all_partners', label: 'All Partners', desc: `${partners.length} active partners`, icon: Handshake, color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { key: 'all_delivery', label: 'All Delivery Agents', desc: `${deliveryAgents.length} delivery agents`, icon: Truck, color: 'bg-green-50 border-green-200 text-green-700' },
  { key: 'custom', label: 'Custom Selection', desc: 'Search and select specific recipients', icon: Search, color: 'bg-orange-50 border-orange-200 text-orange-700' },
];

const sentHistory: { id: number; title: string; body: string; audience: string; sent: string; recipients: number; opened: number }[] = [
  /* Static mock history commented out for live data:
  { id: 1, title: 'New Year Offer!', body: 'Get 20% extra on all sell orders this January!', audience: 'All Users', sent: '1 Jan 2025', recipients: 1250, opened: 892 },
  { id: 2, title: 'Partner Commission Update', body: 'Commission rates updated for Q1 2025. Check your dashboard.', audience: 'All Partners', sent: '28 Dec 2024', recipients: 5, opened: 5 },
  { id: 3, title: 'New Task Available', body: 'Multiple pickup tasks available in your area. Check now!', audience: 'All Delivery Agents', sent: '27 Dec 2024', recipients: 5, opened: 4 },
  */
];

export default function AdminPushNotifications() {
  const [audience, setAudience] = useState<AudienceType>('all_users');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<{ id: string; name: string; type: string }[]>([]);
  const [sent, setSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');

  const allPeople = [
    ...customers.map(c => ({ id: c.id, name: c.name, type: 'User', city: c.city, phone: c.phone })),
    ...partners.map(p => ({ id: p.id, name: p.storeName, type: 'Partner', city: p.city, phone: p.phone })),
    ...deliveryAgents.map(a => ({ id: a.id, name: a.name, type: 'Delivery', city: a.city, phone: a.phone })),
  ];

  const searchResults = searchQuery.length > 1
    ? allPeople.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.city.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : [];

  const addRecipient = (person: typeof allPeople[0]) => {
    if (!selectedRecipients.find(r => r.id === person.id)) {
      setSelectedRecipients(prev => [...prev, { id: person.id, name: person.name, type: person.type }]);
    }
    setSearchQuery('');
  };

  const removeRecipient = (id: string) => setSelectedRecipients(prev => prev.filter(r => r.id !== id));

  const handleSend = () => {
    if (!title.trim() || !body.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setTitle('');
      setBody('');
      setSelectedRecipients([]);
    }, 3000);
  };

  const getRecipientCount = () => {
    if (audience === 'all_users') return customers.length;
    if (audience === 'all_partners') return partners.length;
    if (audience === 'all_delivery') return deliveryAgents.length;
    return selectedRecipients.length;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-gray-900">Push Notifications</h2>
        <p className="text-sm text-gray-500">Send push notifications to users, partners, delivery agents or specific individuals</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: 'compose', label: 'Compose & Send' },
          { key: 'history', label: 'Sent History' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'compose' && (
        <div className="grid grid-cols-3 gap-5">
          {/* Compose Form */}
          <div className="col-span-2 space-y-5">
            {sent && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                <CheckCircle size={20} className="text-green-600" />
                <div>
                  <p className="text-sm font-bold text-green-800">Notification sent successfully!</p>
                  <p className="text-xs text-green-600">Delivered to {getRecipientCount()} recipients</p>
                </div>
              </div>
            )}

            {/* Audience Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Select Audience</h3>
              <div className="grid grid-cols-2 gap-3">
                {audienceOptions.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button key={opt.key} onClick={() => setAudience(opt.key as AudienceType)}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${audience === opt.key ? `${opt.color} border-current` : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${audience === opt.key ? 'bg-current/10' : 'bg-gray-100'}`}>
                        <Icon size={16} className={audience === opt.key ? 'opacity-100' : 'text-gray-500'} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{opt.label}</p>
                        <p className="text-xs opacity-70">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Search */}
              {audience === 'custom' && (
                <div className="mt-4">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search users, partners, delivery agents..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {searchResults.map(person => (
                        <button key={person.id} onClick={() => addRecipient(person)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${person.type === 'User' ? 'bg-blue-100 text-blue-700' : person.type === 'Partner' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                            {person.name[0]}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{person.name}</p>
                            <p className="text-xs text-gray-400">{person.type} · {person.city}</p>
                          </div>
                          <Plus size={14} className="text-gray-400" />
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedRecipients.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedRecipients.map(r => (
                        <span key={r.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">
                          {r.name}
                          <button onClick={() => removeRecipient(r.id)}><X size={11} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Message Compose */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Compose Message</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">Notification Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Special Offer Just for You!" maxLength={65}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <p className="text-xs text-gray-400 mt-1">{title.length}/65 characters</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">Message Body *</label>
                  <textarea value={body} onChange={e => setBody(e.target.value)}
                    placeholder="Write your notification message here..." rows={4} maxLength={240}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  <p className="text-xs text-gray-400 mt-1">{body.length}/240 characters</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Notification Sound</label>
                    <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white">
                      <option>Default Sound</option>
                      <option>Casmik Chime</option>
                      <option>Alert Tone</option>
                      <option>Silent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Priority</label>
                    <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white">
                      <option>Normal</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleSend} disabled={!title.trim() || !body.trim() || (audience === 'custom' && selectedRecipients.length === 0)}
              className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all">
              <Send size={16} /> Send to {getRecipientCount()} Recipient{getRecipientCount() !== 1 ? 's' : ''}
            </button>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Preview</h3>
              <div className="bg-gray-900 rounded-2xl p-4">
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-white text-xs font-black">C</span>
                    </div>
                    <span className="text-white/80 text-xs font-semibold">CASMIK</span>
                    <span className="text-white/40 text-xs ml-auto">now</span>
                  </div>
                  <p className="text-white text-sm font-bold mb-1">{title || 'Notification Title'}</p>
                  <p className="text-white/70 text-xs">{body || 'Your notification message will appear here...'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Audience</span>
                  <span className="font-bold text-gray-900">{audienceOptions.find(a => a.key === audience)?.label}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Recipients</span>
                  <span className="font-bold text-gray-900">{getRecipientCount()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Title Length</span>
                  <span className={`font-bold ${title.length > 50 ? 'text-yellow-600' : 'text-gray-900'}`}>{title.length}/65</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Body Length</span>
                  <span className={`font-bold ${body.length > 200 ? 'text-yellow-600' : 'text-gray-900'}`}>{body.length}/240</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          {sentHistory.map(h => (
            <div key={h.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bell size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{h.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{h.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">Audience: <span className="font-bold text-gray-700">{h.audience}</span></span>
                      <span className="text-xs text-gray-400">Sent: <span className="font-bold text-gray-700">{h.sent}</span></span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{h.recipients} sent</p>
                  <p className="text-xs text-green-600 font-bold">{h.opened} opened ({Math.round((h.opened / h.recipients) * 100)}%)</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
