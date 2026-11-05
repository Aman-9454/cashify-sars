'use client';
import React, { useState } from 'react';
import { Search, Plus, MessageSquare, Clock, CheckCircle, AlertCircle, ChevronDown, Send, X, User, Handshake, Truck } from 'lucide-react';

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
type TicketUserType = 'user' | 'partner' | 'delivery';

interface TicketReply {
  id: string;
  author: string;
  authorType: 'admin' | TicketUserType;
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
  userType: TicketUserType;
  userName: string;
  userEmail: string;
  userPhone: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
  replies: TicketReply[];
}

const initialTickets: SupportTicket[] = [
  /* Static mock tickets commented out for live data:
  { id: 'tkt-001', ticketNumber: 'TKT-2024-001', subject: 'Payment not received for sold device', description: 'I sold my iPhone 15 Pro Max 2 weeks ago but still haven\'t received the payment. Order CSM-2024-001. Please help.', category: 'Payment', status: 'open', priority: 'urgent', userType: 'user', userName: 'Rahul Sharma', userEmail: 'rahul@email.com', userPhone: '9876543210', orderId: 'CSM-2024-001', createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z', replies: [] },
  { id: 'tkt-002', ticketNumber: 'TKT-2024-002', subject: 'Cannot login to partner dashboard', description: 'My account credentials are not working. I was approved last week but still cannot access the partner panel.', category: 'Account', status: 'in_progress', priority: 'high', userType: 'partner', userName: 'Vikash Singh (DigiWorld)', userEmail: 'vikash@digiworld.com', userPhone: '9432109876', createdAt: '2024-12-21T09:00:00Z', updatedAt: '2024-12-21T14:00:00Z', replies: [{ id: 'r-001', author: 'Admin Support', authorType: 'admin', message: 'We have checked your account. Your credentials have been reset. Please try logging in with the new password sent to your email.', createdAt: '2024-12-21T14:00:00Z' }] },
  { id: 'tkt-003', ticketNumber: 'TKT-2024-003', subject: 'Order not assigned to me despite accepting', description: 'I accepted order CSM-2024-007 but it shows as unassigned in my dashboard. Please check.', category: 'Order', status: 'open', priority: 'high', userType: 'partner', userName: 'Pradeep Sharma (MobileHub)', userEmail: 'pradeep@mobilehub.com', userPhone: '9765432109', orderId: 'CSM-2024-007', createdAt: '2024-12-22T11:00:00Z', updatedAt: '2024-12-22T11:00:00Z', replies: [] },
  { id: 'tkt-004', ticketNumber: 'TKT-2024-004', subject: 'Device pickup location is incorrect', description: 'The customer address on my task shows wrong location. GPS is taking me to wrong place. Need correct address for order CSM-2024-005.', category: 'Delivery', status: 'in_progress', priority: 'urgent', userType: 'delivery', userName: 'Ravi Kumar', userEmail: 'ravi@casmik.com', userPhone: '9876543210', orderId: 'CSM-2024-005', createdAt: '2024-12-22T13:00:00Z', updatedAt: '2024-12-22T15:00:00Z', replies: [{ id: 'r-002', author: 'Admin Support', authorType: 'admin', message: 'We have updated the address. The correct address is: 5 Anna Nagar, Block B, Chennai - 600040. Please call the customer at 9432109876 before visiting.', createdAt: '2024-12-22T15:00:00Z' }] },
  { id: 'tkt-005', ticketNumber: 'TKT-2024-005', subject: 'Refurbished device received with defects', description: 'I ordered a refurbished iPhone 15 Pro (Order CSM-2024-003) but the battery health is only 72% while listing said 88%. This is misleading.', category: 'Product', status: 'open', priority: 'high', userType: 'user', userName: 'Amit Singh', userEmail: 'amit@email.com', userPhone: '9654321098', orderId: 'CSM-2024-003', createdAt: '2024-12-23T08:00:00Z', updatedAt: '2024-12-23T08:00:00Z', replies: [] },
  { id: 'tkt-006', ticketNumber: 'TKT-2024-006', subject: 'Payout request pending for 10 days', description: 'I submitted a payout request of ₹28,500 on Dec 12 but it is still pending. Please process it urgently.', category: 'Payment', status: 'open', priority: 'medium', userType: 'partner', userName: 'Rajesh Kumar (TechHub)', userEmail: 'rajesh@techhub.com', userPhone: '9876543210', createdAt: '2024-12-22T10:00:00Z', updatedAt: '2024-12-22T10:00:00Z', replies: [] },
  { id: 'tkt-007', ticketNumber: 'TKT-2024-007', subject: 'App crashing during OTP verification', description: 'The delivery app crashes every time I try to verify OTP for order pickup. This is happening since yesterday.', category: 'Technical', status: 'resolved', priority: 'medium', userType: 'delivery', userName: 'Suresh Nair', userEmail: 'suresh@casmik.com', userPhone: '9765432109', createdAt: '2024-12-19T14:00:00Z', updatedAt: '2024-12-20T10:00:00Z', replies: [{ id: 'r-003', author: 'Admin Support', authorType: 'admin', message: 'We have pushed an app update (v2.1.4) that fixes the OTP crash issue. Please update your app from the Play Store and try again.', createdAt: '2024-12-20T10:00:00Z' }] },
  { id: 'tkt-008', ticketNumber: 'TKT-2024-008', subject: 'Exchange value much lower than quoted', description: 'I was quoted ₹42,000 for my OnePlus 12 during exchange but after inspection they offered only ₹28,000. The device is in perfect condition.', category: 'Pricing', status: 'open', priority: 'medium', userType: 'user', userName: 'Sneha Reddy', userEmail: 'sneha@email.com', userPhone: '9543210987', orderId: 'CSM-2024-004', createdAt: '2024-12-23T09:00:00Z', updatedAt: '2024-12-23T09:00:00Z', replies: [] },
  */
];

const statusColors: Record<TicketStatus, string> = { open: 'bg-blue-50 text-blue-700', in_progress: 'bg-yellow-50 text-yellow-700', resolved: 'bg-green-50 text-green-700', closed: 'bg-gray-100 text-gray-500' };
const priorityColors: Record<TicketPriority, string> = { low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-50 text-blue-700', high: 'bg-orange-50 text-orange-700', urgent: 'bg-red-50 text-red-700' };
const userTypeIcons: Record<TicketUserType, React.ElementType> = { user: User, partner: Handshake, delivery: Truck };
const userTypeColors: Record<TicketUserType, string> = { user: 'bg-blue-50 text-blue-700', partner: 'bg-purple-50 text-purple-700', delivery: 'bg-green-50 text-green-700' };

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('casmik_tickets_v1');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) return list;
        }
        localStorage.setItem('casmik_tickets_v1', JSON.stringify(initialTickets));
      } catch {}
    }
    return initialTickets;
  });

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);

  // Form states for creating ticket
  const [newRaisedBy, setNewRaisedBy] = useState<TicketUserType>('user');
  const [newPriority, setNewPriority] = useState<TicketPriority>('medium');
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('Payment');
  const [newDescription, setNewDescription] = useState('');

  const syncTickets = (updatedList: SupportTicket[]) => {
    setTickets(updatedList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('casmik_tickets_v1', JSON.stringify(updatedList));
        window.dispatchEvent(new CustomEvent('casmik_tickets_updated'));
      } catch {}
    }
  };

  const filtered = tickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.ticketNumber.toLowerCase().includes(search.toLowerCase()) || t.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchType = filterType === 'all' || t.userType === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const sendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    const reply: TicketReply = { id: `r-${Date.now()}`, author: 'Admin Support', authorType: 'admin', message: replyText, createdAt: new Date().toISOString() };
    const updated = { ...selectedTicket, replies: [...selectedTicket.replies, reply], status: 'in_progress' as TicketStatus, updatedAt: new Date().toISOString() };
    const updatedList = tickets.map(t => t.id === selectedTicket.id ? updated : t);
    syncTickets(updatedList);
    setSelectedTicket(updated);
    setReplyText('');
  };

  const updateStatus = (ticketId: string, status: TicketStatus) => {
    const updatedList = tickets.map(t => t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t);
    syncTickets(updatedList);
    if (selectedTicket?.id === ticketId) setSelectedTicket(prev => prev ? { ...prev, status } : null);
  };

  const handleCreateTicket = () => {
    if (!newSubject.trim()) return;
    const randNum = Math.floor(100 + Math.random() * 900);
    const newTkt: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-2024-${randNum}`,
      subject: newSubject.trim(),
      description: newDescription.trim() || 'No additional details provided.',
      category: newCategory,
      status: 'open',
      priority: newPriority,
      userType: newRaisedBy,
      userName: newRaisedBy === 'user' ? 'Customer Support' : newRaisedBy === 'partner' ? 'Partner Hub' : 'Delivery Rider',
      userEmail: 'support@camsik.com',
      userPhone: '+91 9967853364',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    };
    const updated = [newTkt, ...tickets];
    syncTickets(updated);
    setNewSubject('');
    setNewDescription('');
    setShowNewTicket(false);
  };

  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">Support Tickets</h2>
          <p className="text-sm text-gray-500">Manage tickets from users, partners and delivery agents</p>
        </div>
        <button onClick={() => setShowNewTicket(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer">
          <Plus size={16} /> Create Ticket
        </button>
      </div>

      {/* Stats - Clickable interactive filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'all', label: 'Total Tickets', value: tickets.length, icon: MessageSquare, color: 'bg-blue-50 text-blue-600', ring: 'ring-blue-500' },
          { id: 'open', label: 'Open', value: openCount, icon: AlertCircle, color: 'bg-red-50 text-red-600', ring: 'ring-red-500' },
          { id: 'in_progress', label: 'In Progress', value: inProgressCount, icon: Clock, color: 'bg-yellow-50 text-yellow-600', ring: 'ring-yellow-500' },
          { id: 'resolved', label: 'Resolved', value: resolvedCount, icon: CheckCircle, color: 'bg-green-50 text-green-600', ring: 'ring-green-500' },
        ].map(s => {
          const isActive = filterStatus === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className={`bg-white rounded-2xl p-4 border transition-all flex items-center gap-3 text-left cursor-pointer group ${
                isActive 
                  ? `ring-2 ${s.ring} border-transparent shadow-md scale-[1.02]` 
                  : 'border-gray-100 hover:border-gray-300 shadow-sm hover:shadow'
              }`}
              title={`Filter by ${s.label}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} group-hover:scale-105 transition-transform`}>
                <s.icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black text-gray-900 leading-none">{s.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  <p className="text-xs font-semibold text-gray-500 truncate">{s.label}</p>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-5">
        {/* Ticket List */}
        <div className={`${selectedTicket ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'} flex-1 space-y-4`}>
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-40">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tickets..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="relative">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                <option value="all">All Types</option>
                <option value="user">Users</option>
                <option value="partner">Partners</option>
                <option value="delivery">Delivery</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Ticket Cards */}
          <div className="space-y-3">
            {filtered.map(ticket => {
              const TypeIcon = userTypeIcons[ticket.userType];
              return (
                <div key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                  className={`bg-white rounded-2xl border p-4 cursor-pointer hover:shadow-md transition-all ${selectedTicket?.id === ticket.id ? 'border-primary shadow-md' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-400">{ticket.ticketNumber}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${statusColors[ticket.status]}`}>{ticket.status.replace('_', ' ')}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{ticket.subject}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ticket.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${userTypeColors[ticket.userType]}`}>
                        <TypeIcon size={10} />
                        {ticket.userType}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{ticket.userName}</span>
                    <div className="flex items-center gap-2">
                      {ticket.replies.length > 0 && <span className="flex items-center gap-1"><MessageSquare size={11} /> {ticket.replies.length}</span>}
                      <span>{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No tickets found</p>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Detail Panel */}
        {selectedTicket && (
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-4">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400">{selectedTicket.ticketNumber}</p>
                  <h3 className="font-bold text-gray-900 text-sm mt-0.5">{selectedTicket.subject}</h3>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4 border-b border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">From</span>
                  <span className="text-xs font-semibold text-gray-900">{selectedTicket.userName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Type</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${userTypeColors[selectedTicket.userType]}`}>{selectedTicket.userType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Category</span>
                  <span className="text-xs font-semibold text-gray-700">{selectedTicket.category}</span>
                </div>
                {selectedTicket.orderId && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Order</span>
                    <span className="text-xs font-bold text-primary">{selectedTicket.orderId}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <div className="relative">
                    <select value={selectedTicket.status} onChange={e => updateStatus(selectedTicket.id, e.target.value as TicketStatus)}
                      className={`text-xs font-bold px-2 py-0.5 rounded-lg border-0 focus:outline-none cursor-pointer ${statusColors[selectedTicket.status]}`}>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-500 mb-2">Description</p>
                <p className="text-sm text-gray-700">{selectedTicket.description}</p>
              </div>

              {/* Replies */}
              <div className="p-4 border-b border-gray-100 max-h-64 overflow-y-auto space-y-3">
                <p className="text-xs font-bold text-gray-500">Conversation ({selectedTicket.replies.length})</p>
                {selectedTicket.replies.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No replies yet</p>
                )}
                {selectedTicket.replies.map(reply => (
                  <div key={reply.id} className={`flex gap-2 ${reply.authorType === 'admin' ? 'flex-row-reverse' : ''}`}>
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

              {/* Reply Box */}
              <div className="p-4">
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                  rows={3} placeholder="Type your reply..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none mb-2" />
                <button onClick={sendReply} disabled={!replyText.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <Send size={14} /> Send Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 mb-4">Create Support Ticket</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Raised By</label>
                  <select value={newRaisedBy} onChange={e => setNewRaisedBy(e.target.value as TicketUserType)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="user">User</option><option value="partner">Partner</option><option value="delivery">Delivery Agent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Priority</label>
                  <select value={newPriority} onChange={e => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Subject</label>
                <input value={newSubject} onChange={e => setNewSubject(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Brief subject..." />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Category</label>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="Payment">Payment</option><option value="Order">Order</option><option value="Account">Account</option><option value="Technical">Technical</option><option value="Product">Product</option><option value="Delivery">Delivery</option><option value="Pricing">Pricing</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Description</label>
                <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)}
                  rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Detailed description..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNewTicket(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleCreateTicket} disabled={!newSubject.trim()}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer">Create Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
