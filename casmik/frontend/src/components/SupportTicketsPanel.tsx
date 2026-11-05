'use client';
import React, { useState } from 'react';
import { Plus, MessageSquare, CheckCircle, AlertCircle, Send, X } from 'lucide-react';

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

interface TicketReply {
  id: string;
  author: string;
  authorType: 'admin' | 'user';
  message: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  replies: TicketReply[];
}

interface Props {
  panelType: 'user' | 'partner' | 'delivery';
  userName: string;
}

const statusColors: Record<TicketStatus, string> = { open: 'bg-blue-50 text-blue-700', in_progress: 'bg-yellow-50 text-yellow-700', resolved: 'bg-green-50 text-green-700', closed: 'bg-gray-100 text-gray-500' };
const priorityColors: Record<TicketPriority, string> = { low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-50 text-blue-700', high: 'bg-orange-50 text-orange-700', urgent: 'bg-red-50 text-red-700' };

const sampleTickets: Record<string, SupportTicket[]> = {
  partner: [
    { id: 'pt-001', ticketNumber: 'TKT-P-001', subject: 'Payout not processed', description: 'My payout request of ₹28,500 submitted on Dec 12 is still pending.', category: 'Payment', status: 'in_progress', priority: 'high', createdAt: '2024-12-22T10:00:00Z', replies: [{ id: 'r1', author: 'Admin Support', authorType: 'admin', message: 'We are processing your payout. It will be credited within 2 business days.', createdAt: '2024-12-22T14:00:00Z' }] },
    { id: 'pt-002', ticketNumber: 'TKT-P-002', subject: 'Order not showing in dashboard', description: 'Order CSM-2024-007 was assigned to me but not visible in my orders list.', category: 'Order', status: 'open', priority: 'medium', createdAt: '2024-12-23T09:00:00Z', replies: [] },
  ],
  delivery: [
    { id: 'dt-001', ticketNumber: 'TKT-D-001', subject: 'Wrong pickup address', description: 'The address for order CSM-2024-005 is incorrect. GPS is not finding it.', category: 'Delivery', status: 'resolved', priority: 'urgent', createdAt: '2024-12-22T13:00:00Z', replies: [{ id: 'r2', author: 'Admin Support', authorType: 'admin', message: 'Correct address: 5 Anna Nagar, Block B, Chennai - 600040. Please call customer at 9432109876.', createdAt: '2024-12-22T15:00:00Z' }] },
  ],
  user: [
    { id: 'ut-001', ticketNumber: 'TKT-U-001', subject: 'Payment not received', description: 'I sold my iPhone 15 Pro Max 2 weeks ago but still haven\'t received payment.', category: 'Payment', status: 'open', priority: 'urgent', createdAt: '2024-12-20T10:00:00Z', replies: [] },
    { id: 'ut-002', ticketNumber: 'TKT-U-002', subject: 'Device condition mismatch', description: 'The refurbished device I received has lower battery health than listed.', category: 'Product', status: 'in_progress', priority: 'high', createdAt: '2024-12-23T08:00:00Z', replies: [{ id: 'r3', author: 'Admin Support', authorType: 'admin', message: 'We apologize for the inconvenience. Our team will contact you within 24 hours to resolve this.', createdAt: '2024-12-23T12:00:00Z' }] },
  ],
};

const categoryOptions: Record<string, string[]> = {
  partner: ['Payment', 'Order', 'Account', 'Technical', 'Commission', 'Other'],
  delivery: ['Delivery', 'Order', 'Account', 'Technical', 'Earnings', 'Other'],
  user: ['Payment', 'Order', 'Product', 'Account', 'Technical', 'Other'],
};

export default function SupportTicketsPanel({ panelType, userName }: Props) {
  const [tickets, setTickets] = useState<SupportTicket[]>(sampleTickets[panelType] || []);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [form, setForm] = useState({ subject: '', description: '', category: categoryOptions[panelType][0], priority: 'medium' as TicketPriority });

  const sendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    const reply: TicketReply = { id: `r-${Date.now()}`, author: userName, authorType: 'user', message: replyText, createdAt: new Date().toISOString() };
    const updated = { ...selectedTicket, replies: [...selectedTicket.replies, reply], status: 'in_progress' as TicketStatus };
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updated : t));
    setSelectedTicket(updated);
    setReplyText('');
  };

  const createTicket = () => {
    if (!form.subject.trim()) return;
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`, ticketNumber: `TKT-${panelType.toUpperCase()[0]}-${String(tickets.length + 1).padStart(3, '0')}`,
      subject: form.subject, description: form.description, category: form.category, status: 'open', priority: form.priority,
      createdAt: new Date().toISOString(), replies: [],
    };
    setTickets(prev => [...prev, newTicket]);
    setShowNewModal(false);
    setForm({ subject: '', description: '', category: categoryOptions[panelType][0], priority: 'medium' });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900">Support Tickets</h2>
          <p className="text-sm text-gray-500">Raise and track your support requests</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: tickets.length, icon: MessageSquare, color: 'bg-blue-50 text-blue-600' },
          { label: 'Open', value: tickets.filter(t => t.status === 'open').length, icon: AlertCircle, color: 'bg-red-50 text-red-600' },
          { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}><s.icon size={18} /></div>
            <div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-5">
        {/* Ticket List */}
        <div className={`${selectedTicket ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'} flex-1 space-y-3`}>
          {tickets.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No tickets yet</p>
              <p className="text-sm mt-1">Create a ticket to get support</p>
            </div>
          )}
          {tickets.map(ticket => (
            <div key={ticket.id} onClick={() => setSelectedTicket(ticket)}
              className={`bg-white rounded-2xl border p-4 cursor-pointer hover:shadow-md transition-all ${selectedTicket?.id === ticket.id ? 'border-primary shadow-md' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-gray-400">{ticket.ticketNumber}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${statusColors[ticket.status]}`}>{ticket.status.replace('_', ' ')}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{ticket.subject}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ticket.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">{ticket.category}</span>
                <div className="flex items-center gap-2">
                  {ticket.replies.length > 0 && <span className="flex items-center gap-1"><MessageSquare size={11} /> {ticket.replies.length}</span>}
                  <span>{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selectedTicket && (
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-4">
              <div className="p-4 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400">{selectedTicket.ticketNumber}</p>
                  <h3 className="font-bold text-gray-900 text-sm mt-0.5">{selectedTicket.subject}</h3>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} className="text-gray-400" /></button>
              </div>
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${statusColors[selectedTicket.status]}`}>{selectedTicket.status.replace('_', ' ')}</span>
                </div>
                <p className="text-sm text-gray-700">{selectedTicket.description}</p>
              </div>
              <div className="p-4 border-b border-gray-100 max-h-64 overflow-y-auto space-y-3">
                <p className="text-xs font-bold text-gray-500">Conversation ({selectedTicket.replies.length})</p>
                {selectedTicket.replies.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No replies yet. Admin will respond soon.</p>}
                {selectedTicket.replies.map(reply => (
                  <div key={reply.id} className={`flex gap-2 ${reply.authorType === 'admin' ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${reply.authorType === 'admin' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {reply.author[0]}
                    </div>
                    <div className={`flex-1 rounded-xl p-2.5 text-xs ${reply.authorType === 'admin' ? 'bg-primary/10 text-gray-800' : 'bg-gray-100 text-gray-700'}`}>
                      <p className="font-bold mb-0.5">{reply.author}</p>
                      <p>{reply.message}</p>
                      <p className="text-gray-400 mt-1">{new Date(reply.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                <div className="p-4">
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                    rows={3} placeholder="Add a reply..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none mb-2" />
                  <button onClick={sendReply} disabled={!replyText.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                    <Send size={14} /> Send Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 mb-4">Raise Support Ticket</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {categoryOptions[panelType].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as TicketPriority }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Subject</label>
                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Brief subject of your issue..." />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Describe your issue in detail..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNewModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50">Cancel</button>
              <button onClick={createTicket} disabled={!form.subject.trim()}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50">Submit Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
