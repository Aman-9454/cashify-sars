import React from 'react';
import { UserCheck, MapPin } from 'lucide-react';

// Backend integration point: fetch from /api/v1/admin/orders?status=unassigned&limit=5
const unassigned = [
  { id: 'CSM-2608-4718', device: 'iPhone 14 Pro 128GB', city: 'Delhi', pin: '110001', service: 'Repair', quote: '₹8,500' },
  { id: 'CSM-2608-4717', device: 'OnePlus 12 256GB', city: 'Chennai', pin: '600001', service: 'Exchange', quote: '₹42,000' },
  { id: 'CSM-2608-4710', device: 'iPad Pro M4 WiFi', city: 'Kolkata', pin: '700001', service: 'Sell', quote: '₹58,000' },
  { id: 'CSM-2608-4708', device: 'MacBook Pro M4', city: 'Ahmedabad', pin: '380001', service: 'Sell', quote: '₹1,12,000' },
  { id: 'CSM-2608-4705', device: 'Samsung S24 128GB', city: 'Surat', pin: '395001', service: 'Sell', quote: '₹38,500' },
];

export default function AssignmentQueue() {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck size={16} className="text-warning" />
          <h3 className="font-bold text-foreground text-sm">Assignment Queue</h3>
          <span className="px-2 py-0.5 rounded-lg bg-warning/10 text-warning text-xs font-bold">
            {unassigned?.length}
          </span>
        </div>
        <button className="text-xs font-semibold text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
          Bulk Assign
        </button>
      </div>
      <div className="p-3 space-y-2">
        {unassigned?.map((order) => (
          <div key={`queue-${order?.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{order?.device}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <MapPin size={10} />
                  {order?.city} · {order?.pin}
                </span>
                <span className="text-xs font-semibold text-primary">{order?.quote}</span>
              </div>
            </div>
            <button className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-colors btn-press">
              Assign
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}