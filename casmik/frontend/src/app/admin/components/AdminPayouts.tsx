'use client';
import React, { useState } from 'react';
import { partners } from '@/lib/casmikData';
import { CheckCircle, XCircle, Eye, CreditCard, RefreshCw, X } from 'lucide-react';

const gatewayPayments: { id: string; partner: string; partnerName: string; amount: number; date: string; method: string; txnId: string; status: string }[] = [
  /* Static mock gateway payments commented out for live data:
  { id: 'GP-001', partner: 'TechHub Store', partnerName: 'Rajesh Kumar', amount: 5000, date: '10 Aug 2026', method: 'UPI', txnId: 'UPI2026081001', status: 'success' },
  { id: 'GP-002', partner: 'MobileHub Store', partnerName: 'Pradeep Sharma', amount: 12000, date: '11 Aug 2026', method: 'Net Banking', txnId: 'NB2026081101', status: 'success' },
  { id: 'GP-003', partner: 'GadgetZone', partnerName: 'Sunil Reddy', amount: 8500, date: '12 Aug 2026', method: 'Card', txnId: 'CARD2026081201', status: 'pending' },
  */
];

const bankTransfers: { id: string; partner: string; partnerName: string; amount: number; date: string; ref: string | null; receipt: string | null; status: string }[] = [
  /* Static mock bank transfers commented out for live data:
  { id: 'BT-001', partner: 'TechHub Store', partnerName: 'Rajesh Kumar', amount: 12000, date: '10 Aug 2026', ref: 'REF123456', receipt: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200', status: 'awaiting' },
  { id: 'BT-002', partner: 'MobileHub Store', partnerName: 'Pradeep Sharma', amount: 50000, date: '10 Aug 2026', ref: '32424235', receipt: null, status: 'resolved' },
  { id: 'BT-003', partner: 'GadgetZone', partnerName: 'Sunil Reddy', amount: 500000, date: '11 Aug 2026', ref: null, receipt: null, status: 'resolved' },
  { id: 'BT-004', partner: 'iRepair Center', partnerName: 'Anil Menon', amount: 1000000, date: '19 Aug 2026', ref: null, receipt: null, status: 'resolved' },
  { id: 'BT-005', partner: 'DigiWorld', partnerName: 'Vikash Singh', amount: 10000000, date: '22 Aug 2026', ref: null, receipt: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200', status: 'open' },
  */
];

const verificationTickets: { id: string; partner: string; partnerName: string; amount: number; date: string; ref: string | null; receipt: string | null; status: string }[] = [
  /* Static mock verification tickets commented out for live data:
  { id: 'TCK-202', partner: 'TechHub Store', partnerName: 'Rajesh Kumar', amount: 12000, date: '10 Aug 2026', ref: 'REF123456', receipt: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200', status: 'awaiting' },
  { id: 'TCK-159083', partner: 'MobileHub Store', partnerName: 'Pradeep Sharma', amount: 50000, date: '10 Aug 2026', ref: '32424235', receipt: null, status: 'resolved' },
  { id: 'TCK-380786', partner: 'GadgetZone', partnerName: 'Sunil Reddy', amount: 500000, date: '10 Aug 2026', ref: null, receipt: null, status: 'resolved' },
  { id: 'TCK-638671', partner: 'iRepair Center', partnerName: 'Anil Menon', amount: 1000000, date: '19 Aug 2026', ref: null, receipt: null, status: 'resolved' },
  { id: 'TCK-716811', partner: 'TechHub Store', partnerName: 'Rajesh Kumar', amount: 100000, date: '19 Aug 2026', ref: null, receipt: null, status: 'resolved' },
  { id: 'TCK-477850', partner: 'MobileHub Store', partnerName: 'Pradeep Sharma', amount: 10000000, date: '20 Aug 2026', ref: null, receipt: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200', status: 'resolved' },
  { id: 'TCK-494660', partner: 'DigiWorld', partnerName: 'Vikash Singh', amount: 10000000, date: '22 Aug 2026', ref: null, receipt: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200', status: 'open' },
  */
];

export default function AdminPayouts() {
  const [activeTab, setActiveTab] = useState<'gateway' | 'bank' | 'tickets'>('tickets');
  const [tickets, setTickets] = useState(verificationTickets);
  const [receiptModal, setReceiptModal] = useState<string | null>(null);

  const totalEscrow = partners.reduce((s, p) => s + p.availableBalance, 0);
  const totalGateway = gatewayPayments.filter(g => g.status === 'success').reduce((s, g) => s + g.amount, 0);
  const approvedBank = bankTransfers.filter(b => b.status === 'resolved').reduce((s, b) => s + b.amount, 0);
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'awaiting').length;

  const handleApprove = (id: string) => setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
  const handleReject = (id: string) => setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      open: 'bg-blue-100 text-blue-700',
      awaiting: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      success: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      open: 'OPEN',
      awaiting: 'AWAITING PARTNER ACTION',
      resolved: 'RESOLVED',
      rejected: 'REJECTED',
      success: 'SUCCESS',
      pending: 'PENDING',
    };
    return map[status] || status.toUpperCase();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <CreditCard size={22} className="text-yellow-500" /> Partners Payments & Wallets
          </h2>
          <p className="text-sm text-gray-500">Manage partner fund refills, verify manual bank transfers, and resolve validation tickets.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">TOTAL PARTNERS WALLET ESCROW</p>
          <p className="text-3xl font-black text-gray-900">₹{totalEscrow.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">TOTAL GATEWAY PAYMENTS</p>
          <p className="text-3xl font-black text-gray-900">₹{totalGateway.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">APPROVED BANK TRANSFERS</p>
          <p className="text-3xl font-black text-gray-900">₹{approvedBank.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: 'gateway', label: `Gateway Payments (${gatewayPayments.length})`, icon: '💳' },
          { key: 'bank', label: `Bank Transfer Log (${bankTransfers.length})`, icon: '🏦' },
          { key: 'tickets', label: `Bank Verification Tickets (${openTickets} Open)`, icon: '🎫' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Gateway Payments Tab */}
      {activeTab === 'gateway' && (
        <div className="space-y-3">
          {gatewayPayments.map(gp => (
            <div key={gp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-1">{gp.id}</p>
                  <p className="font-bold text-gray-900">{gp.partner}</p>
                  <p className="text-sm text-gray-500">{gp.partnerName} · {gp.method}</p>
                  <p className="text-xs text-gray-400">{gp.date} · {gp.txnId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-green-700">+₹{gp.amount.toLocaleString('en-IN')}</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${statusBadge(gp.status)}`}>{statusLabel(gp.status)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bank Transfer Log Tab */}
      {activeTab === 'bank' && (
        <div className="space-y-3">
          {bankTransfers.map(bt => (
            <div key={bt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Bank Transfer verification (₹{bt.amount.toLocaleString('en-IN')})</p>
                  <div className="flex gap-4 mt-1">
                    <div><p className="text-xs text-gray-400">Partner</p><p className="text-sm font-bold text-gray-700">{bt.partnerName}</p></div>
                    <div><p className="text-xs text-gray-400">Requested Amount</p><p className="text-sm font-bold text-green-700">₹{bt.amount.toLocaleString('en-IN')}</p></div>
                    <div><p className="text-xs text-gray-400">Date</p><p className="text-sm font-bold text-gray-700">{bt.date}</p></div>
                    <div><p className="text-xs text-gray-400">Reference</p><p className="text-sm font-bold text-gray-700">{bt.ref || 'N/A'}</p></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {bt.receipt && (
                    <button onClick={() => setReceiptModal(bt.receipt!)} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                      <Eye size={12} /> Receipt
                    </button>
                  )}
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${statusBadge(bt.status)}`}>{statusLabel(bt.status)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-400">{ticket.id}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBadge(ticket.status)}`}>{statusLabel(ticket.status)}</span>
                  </div>
                  <p className="font-bold text-gray-900 text-base mb-3">Bank Transfer verification (₹{ticket.amount.toLocaleString('en-IN')})</p>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Partner</p>
                      <p className="text-sm font-bold text-gray-700">{ticket.partnerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Requested Amount</p>
                      <p className="text-sm font-bold text-green-700">₹{ticket.amount.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Ticket Raised</p>
                      <p className="text-sm font-bold text-gray-700">{ticket.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Payment Reference</p>
                      <p className="text-sm font-bold text-gray-700">{ticket.ref || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  {ticket.receipt && (
                    <button onClick={() => setReceiptModal(ticket.receipt!)}
                      className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 hover:border-primary transition-colors">
                      <img src={ticket.receipt} alt="Receipt" className="w-full h-full object-cover" />
                    </button>
                  )}
                  {(ticket.status === 'open' || ticket.status === 'awaiting') && (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleApprove(ticket.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 flex items-center gap-1.5">
                        <CheckCircle size={13} /> Approve Transfer
                      </button>
                      <button onClick={() => handleReject(ticket.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 flex items-center gap-1.5">
                        <XCircle size={13} /> Reject & Flag
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Preview Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setReceiptModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-4 z-10 max-w-sm w-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">Receipt Preview</h3>
              <button onClick={() => setReceiptModal(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <img src={receiptModal} alt="Receipt" className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
