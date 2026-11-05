'use client';
import React, { useState } from 'react';
import { Search, Filter, Eye, UserCheck, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

// Backend integration point: fetch from /api/v1/admin/orders?limit=10&page=1
const orders = [
  { id: 'CSM-2608-4721', customer: 'Priya Nair', city: 'Bengaluru', device: 'iPhone 15 Pro Max 256GB', service: 'Sell', quote: '₹1,05,000', status: 'Inspection', partner: 'TechHub Store', pickupDate: '22 Aug 2026', assigned: true },
  { id: 'CSM-2608-4720', customer: 'Arjun Mehta', city: 'Mumbai', device: 'Samsung S24 Ultra 512GB', service: 'Sell', quote: '₹58,000', status: 'Pickup Scheduled', partner: 'QuickFix Mumbai', pickupDate: '23 Aug 2026', assigned: true },
  { id: 'CSM-2608-4719', customer: 'Sneha Reddy', city: 'Hyderabad', device: 'Sony Alpha 7 IV 24-70mm', service: 'Buy', quote: '₹1,48,000', status: 'Shipped', partner: 'Camsik Hub', pickupDate: '24 Aug 2026', assigned: true },
  { id: 'CSM-2608-4718', customer: 'Vikram Singh', city: 'Delhi', device: 'iPhone 14 Pro 128GB', service: 'Repair', quote: '₹8,500', status: 'Pending', partner: null, pickupDate: '23 Aug 2026', assigned: false },
  { id: 'CSM-2608-4717', customer: 'Kavya KM', city: 'Chennai', device: 'OnePlus 12 256GB', service: 'Exchange', quote: '₹42,000', status: 'Quote Generated', partner: null, pickupDate: '25 Aug 2026', assigned: false },
  { id: 'CSM-2608-4716', customer: 'Rohit Kapoor', city: 'Pune', device: 'iPad Pro M4 256GB', service: 'Buy', quote: '₹65,000', status: 'Delivered', partner: 'GadgetZone Pune', pickupDate: '21 Aug 2026', assigned: true },
  { id: 'CSM-2608-4715', customer: 'Ananya Sharma', city: 'Jaipur', device: 'Google Pixel 9 Pro 128GB', service: 'Sell', quote: '₹48,500', status: 'Payment Done', partner: 'Rajasthan Devices', pickupDate: '20 Aug 2026', assigned: true },
  { id: 'CSM-2608-4714', customer: 'Kiran Rao', city: 'Bengaluru', device: 'Nothing Phone 2a 256GB', service: 'Sell', quote: '₹18,200', status: 'Cancelled', partner: null, pickupDate: '22 Aug 2026', assigned: false },
  { id: 'CSM-2608-4713', customer: 'Dev Patel', city: 'Ahmedabad', device: 'Samsung Galaxy Tab S9', service: 'Repair', quote: '₹4,200', status: 'Repair In Progress', partner: 'Ahmedabad Tech', pickupDate: '22 Aug 2026', assigned: true },
  { id: 'CSM-2608-4712', customer: 'Meera Iyer', city: 'Kochi', device: 'iPhone 16 512GB', service: 'Sell', quote: '₹62,000', status: 'Pickup Scheduled', partner: null, pickupDate: '23 Aug 2026', assigned: false },
];

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  'Inspection': { bg: 'bg-info/10', text: 'text-info', dot: 'bg-info' },
  'Pickup Scheduled': { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
  'Shipped': { bg: 'bg-purple-100', text: 'text-purple-600', dot: 'bg-purple-500' },
  'Pending': { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  'Quote Generated': { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
  'Delivered': { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
  'Payment Done': { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
  'Cancelled': { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' },
  'Repair In Progress': { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
};

const serviceColors: Record<string, string> = {
  Sell: 'bg-primary/10 text-primary',
  Buy: 'bg-info/10 text-info',
  Exchange: 'bg-purple-100 text-purple-600',
  Repair: 'bg-warning/10 text-warning',
};

export default function RecentOrdersTable() {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const filtered = orders.filter(o => {
    const matchSearch = search === '' ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.device.toLowerCase().includes(search.toLowerCase());
    const matchService = serviceFilter === 'All' || o.service === serviceFilter;
    return matchSearch && matchService;
  });

  const toggleRow = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelectedRows(prev => prev.length === filtered.length ? [] : filtered.map(o => o.id));
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-foreground text-base">Recent Orders</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Live feed — last updated just now</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl text-xs font-semibold text-primary fade-in">
                {selectedRows.length} selected
                <button className="ml-1 px-2 py-0.5 bg-primary text-white rounded-lg">Assign</button>
              </div>
            )}
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Filter size={13} />
              Filter
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order ID, customer, device..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface transition-all"
            />
          </div>

          {/* Service filter */}
          <div className="flex items-center gap-1">
            {['All', 'Sell', 'Buy', 'Exchange', 'Repair'].map((s) => (
              <button
                key={`sf-${s}`}
                onClick={() => setServiceFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  serviceFilter === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="pl-5 pr-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  className="rounded border-border accent-primary"
                />
              </th>
              {['Order ID', 'Customer', 'Device', 'Service', 'Quote', 'Status', 'Partner', 'Pickup', 'Actions'].map((col) => (
                <th key={`col-${col}`} className="px-3 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order, ri) => {
              const statusCfg = statusConfig[order.status] || { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' };
              const selected = selectedRows.includes(order.id);
              return (
                <tr
                  key={order.id}
                  className={`border-b border-border transition-colors ${selected ? 'bg-primary-50' : ri % 2 === 0 ? 'bg-white' : 'bg-muted/20'} hover:bg-primary-50/60`}
                >
                  <td className="pl-5 pr-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleRow(order.id)}
                      className="rounded border-border accent-primary"
                    />
                  </td>
                  <td className="px-3 py-3 font-semibold text-foreground whitespace-nowrap font-tabular">{order.id}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <p className="font-semibold text-foreground">{order.customer}</p>
                    <p className="text-muted-foreground">{order.city}</p>
                  </td>
                  <td className="px-3 py-3 max-w-36">
                    <p className="font-medium text-foreground truncate">{order.device}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-lg font-semibold text-xs ${serviceColors[order.service] || 'bg-muted text-muted-foreground'}`}>
                      {order.service}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-bold text-foreground font-tabular whitespace-nowrap">{order.quote}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg font-semibold ${statusCfg.bg} ${statusCfg.text} whitespace-nowrap`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {order.partner ? (
                      <span className="text-foreground font-medium">{order.partner}</span>
                    ) : (
                      <span className="flex items-center gap-1 text-warning font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{order.pickupDate}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="View order details">
                        <Eye size={13} />
                      </button>
                      {!order.assigned && (
                        <button className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" title="Assign partner">
                          <UserCheck size={13} />
                        </button>
                      )}
                      <button className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="More actions">
                        <MoreHorizontal size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing <strong className="text-foreground">{filtered.length}</strong> of <strong className="text-foreground">247</strong> orders today
        </p>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40">
            <ChevronLeft size={13} />
          </button>
          {[1, 2, 3, '...', 25].map((page, pi) => (
            <button
              key={`page-${pi}`}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                page === 1 ? 'bg-primary text-white' : 'border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}