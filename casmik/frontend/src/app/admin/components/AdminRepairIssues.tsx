'use client';
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Wrench } from 'lucide-react';

interface RepairIssue {
  id: string;
  category: string;
  title: string;
  description: string;
  estimatedPrice: number;
  maxPrice: number;
  estimatedTime: string;
  warranty: string;
  icon: string;
  active: boolean;
  bookings: number;
}

const initialIssues: RepairIssue[] = [
  /* Static mock repair issues commented out for live data:
  { id: 'rep-001', category: 'Smartphones', title: 'Screen Replacement', description: 'Cracked or broken display replacement with original quality screen', estimatedPrice: 2500, maxPrice: 8500, estimatedTime: '2-4 hours', warranty: '3 Months', icon: '📱', active: true, bookings: 142 },
  { id: 'rep-002', category: 'Smartphones', title: 'Battery Replacement', description: 'Original battery replacement for improved battery life and performance', estimatedPrice: 1200, maxPrice: 3500, estimatedTime: '1-2 hours', warranty: '6 Months', icon: '🔋', active: true, bookings: 98 },
  { id: 'rep-003', category: 'Smartphones', title: 'Charging Port Repair', description: 'Fix loose or non-functional charging port', estimatedPrice: 800, maxPrice: 2500, estimatedTime: '1-3 hours', warranty: '3 Months', icon: '🔌', active: true, bookings: 76 },
  { id: 'rep-004', category: 'Smartphones', title: 'Camera Repair', description: 'Fix blurry, black or non-functional front/rear camera', estimatedPrice: 1500, maxPrice: 5000, estimatedTime: '2-4 hours', warranty: '3 Months', icon: '📷', active: true, bookings: 54 },
  { id: 'rep-005', category: 'Smartphones', title: 'Speaker/Mic Repair', description: 'Fix distorted sound, no audio or microphone issues', estimatedPrice: 600, maxPrice: 2000, estimatedTime: '1-2 hours', warranty: '3 Months', icon: '🔊', active: true, bookings: 43 },
  { id: 'rep-006', category: 'Smartphones', title: 'Back Panel Replacement', description: 'Replace cracked or damaged back glass/panel', estimatedPrice: 1000, maxPrice: 4000, estimatedTime: '1-3 hours', warranty: '3 Months', icon: '🔲', active: true, bookings: 38 },
  { id: 'rep-007', category: 'Smartphones', title: 'Water Damage Repair', description: 'Diagnose and repair water/liquid damage to internal components', estimatedPrice: 2000, maxPrice: 8000, estimatedTime: '24-48 hours', warranty: '1 Month', icon: '💧', active: true, bookings: 29 },
  { id: 'rep-008', category: 'Smartphones', title: 'Software Issues / Hang', description: 'Fix software crashes, hanging, slow performance or boot loops', estimatedPrice: 500, maxPrice: 1500, estimatedTime: '1-2 hours', warranty: '1 Month', icon: '⚙️', active: true, bookings: 67 },
  { id: 'rep-009', category: 'Smartphones', title: 'Face ID / Fingerprint Fix', description: 'Repair non-functional biometric authentication', estimatedPrice: 1800, maxPrice: 5500, estimatedTime: '2-4 hours', warranty: '3 Months', icon: '👆', active: true, bookings: 31 },
  { id: 'rep-010', category: 'Smartphones', title: 'Network / SIM Issue', description: 'Fix no signal, SIM not detected or network connectivity problems', estimatedPrice: 700, maxPrice: 2500, estimatedTime: '1-3 hours', warranty: '3 Months', icon: '📶', active: true, bookings: 22 },
  { id: 'rep-011', category: 'Laptops', title: 'Screen Replacement', description: 'Replace cracked, flickering or dead laptop display', estimatedPrice: 5000, maxPrice: 18000, estimatedTime: '4-8 hours', warranty: '6 Months', icon: '💻', active: true, bookings: 45 },
  { id: 'rep-012', category: 'Laptops', title: 'Battery Replacement', description: 'Replace degraded laptop battery for better runtime', estimatedPrice: 2500, maxPrice: 8000, estimatedTime: '1-2 hours', warranty: '6 Months', icon: '🔋', active: true, bookings: 38 },
  { id: 'rep-013', category: 'Laptops', title: 'Keyboard Replacement', description: 'Fix stuck keys, non-functional keyboard or spill damage', estimatedPrice: 2000, maxPrice: 7000, estimatedTime: '2-4 hours', warranty: '3 Months', icon: '⌨️', active: true, bookings: 27 },
  { id: 'rep-014', category: 'Laptops', title: 'RAM/Storage Upgrade', description: 'Upgrade RAM or replace HDD with SSD for better performance', estimatedPrice: 1500, maxPrice: 12000, estimatedTime: '1-2 hours', warranty: '6 Months', icon: '💾', active: true, bookings: 52 },
  { id: 'rep-015', category: 'Laptops', title: 'Overheating / Fan Repair', description: 'Clean dust, replace thermal paste or fix cooling fan', estimatedPrice: 800, maxPrice: 3000, estimatedTime: '2-3 hours', warranty: '3 Months', icon: '🌡️', active: true, bookings: 34 },
  { id: 'rep-016', category: 'Tablets', title: 'Screen Replacement', description: 'Replace cracked or damaged tablet display', estimatedPrice: 3000, maxPrice: 12000, estimatedTime: '3-5 hours', warranty: '3 Months', icon: '📟', active: true, bookings: 19 },
  { id: 'rep-017', category: 'Tablets', title: 'Battery Replacement', description: 'Replace degraded tablet battery', estimatedPrice: 1800, maxPrice: 5000, estimatedTime: '2-3 hours', warranty: '6 Months', icon: '🔋', active: true, bookings: 14 },
  { id: 'rep-018', category: 'Smartwatches', title: 'Screen Replacement', description: 'Replace cracked smartwatch display', estimatedPrice: 1500, maxPrice: 6000, estimatedTime: '2-4 hours', warranty: '3 Months', icon: '⌚', active: true, bookings: 11 },
  { id: 'rep-019', category: 'Smartwatches', title: 'Battery Replacement', description: 'Replace smartwatch battery for better battery life', estimatedPrice: 800, maxPrice: 2500, estimatedTime: '1-2 hours', warranty: '3 Months', icon: '🔋', active: true, bookings: 9 },
  { id: 'rep-020', category: 'Earbuds', title: 'Charging Case Repair', description: 'Fix charging case not charging earbuds', estimatedPrice: 500, maxPrice: 2000, estimatedTime: '1-2 hours', warranty: '1 Month', icon: '🎧', active: true, bookings: 16 },
  */
];

const categoryList = ['All', 'Smartphones', 'Laptops', 'Tablets', 'Smartwatches', 'Earbuds'];

export default function AdminRepairIssues() {
  const [issues, setIssues] = useState(initialIssues);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editIssue, setEditIssue] = useState<RepairIssue | null>(null);
  const [form, setForm] = useState({ title: '', category: 'Smartphones', description: '', estimatedPrice: '', maxPrice: '', estimatedTime: '', warranty: '3 Months', icon: '🔧' });

  const filtered = issues.filter(i => {
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || i.category === filterCategory;
    return matchSearch && matchCat;
  });

  const openAdd = () => { setEditIssue(null); setForm({ title: '', category: 'Smartphones', description: '', estimatedPrice: '', maxPrice: '', estimatedTime: '', warranty: '3 Months', icon: '🔧' }); setShowModal(true); };
  const openEdit = (issue: RepairIssue) => { setEditIssue(issue); setForm({ title: issue.title, category: issue.category, description: issue.description, estimatedPrice: String(issue.estimatedPrice), maxPrice: String(issue.maxPrice), estimatedTime: issue.estimatedTime, warranty: issue.warranty, icon: issue.icon }); setShowModal(true); };

  const handleSave = () => {
    if (editIssue) {
      setIssues(prev => prev.map(i => i.id === editIssue.id ? { ...i, ...form, estimatedPrice: Number(form.estimatedPrice), maxPrice: Number(form.maxPrice) } : i));
    } else {
      const newIssue: RepairIssue = { id: `rep-${Date.now()}`, ...form, estimatedPrice: Number(form.estimatedPrice), maxPrice: Number(form.maxPrice), active: true, bookings: 0 };
      setIssues(prev => [...prev, newIssue]);
    }
    setShowModal(false);
  };

  const toggleActive = (id: string) => setIssues(prev => prev.map(i => i.id === id ? { ...i, active: !i.active } : i));
  const deleteIssue = (id: string) => setIssues(prev => prev.filter(i => i.id !== id));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">Repair Issues</h2>
          <p className="text-sm text-gray-500">{issues.length} repair services · {issues.filter(i => i.active).length} active</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Add Repair Issue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Services', value: issues.length, color: 'text-blue-600' },
          { label: 'Active', value: issues.filter(i => i.active).length, color: 'text-green-600' },
          { label: 'Total Bookings', value: issues.reduce((s, i) => s + i.bookings, 0), color: 'text-purple-600' },
          { label: 'Categories', value: [...new Set(issues.map(i => i.category))].length, color: 'text-orange-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search repair issues..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categoryList.map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filterCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Issue</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Price Range</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Time</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Warranty</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Bookings</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(issue => (
                <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{issue.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{issue.title}</p>
                        <p className="text-xs text-gray-400 max-w-48 truncate">{issue.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">{issue.category}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    ₹{issue.estimatedPrice.toLocaleString()} – ₹{issue.maxPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{issue.estimatedTime}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{issue.warranty}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{issue.bookings}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(issue.id)}
                      className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${issue.active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {issue.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(issue)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => deleteIssue(issue.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Wrench size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No repair issues found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-gray-900 mb-4">{editIssue ? 'Edit Repair Issue' : 'Add Repair Issue'}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Icon (emoji)</label>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="🔧" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {categoryList.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Issue Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Screen Replacement" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Brief description..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Min Price (₹)</label>
                  <input type="number" value={form.estimatedPrice} onChange={e => setForm(f => ({ ...f, estimatedPrice: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Max Price (₹)</label>
                  <input type="number" value={form.maxPrice} onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Estimated Time</label>
                  <input value={form.estimatedTime} onChange={e => setForm(f => ({ ...f, estimatedTime: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="2-4 hours" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Warranty</label>
                  <select value={form.warranty} onChange={e => setForm(f => ({ ...f, warranty: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option>1 Month</option><option>3 Months</option><option>6 Months</option><option>1 Year</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90">
                {editIssue ? 'Save Changes' : 'Add Issue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
