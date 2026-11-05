'use client';
import React from 'react';
import { Star, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

// Backend integration point: fetch from /api/v1/admin/partners/performance?limit=6
const partners = [
{
  id: 'partner-001',
  name: 'TechHub Store',
  city: 'Bengaluru',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1707e4993-1772206653314.png",
  avatarAlt: 'TechHub Store storefront in Bengaluru',
  rating: 4.9,
  ordersThisMonth: 142,
  completionRate: 97.2,
  revenue: '₹4.8L',
  trend: 'up',
  status: 'Active',
  pincodes: 8
},
{
  id: 'partner-002',
  name: 'QuickFix Mumbai',
  city: 'Mumbai',
  avatar: "https://images.unsplash.com/photo-1616386261012-8a328c89d5b6",
  avatarAlt: 'QuickFix Mumbai office interior',
  rating: 4.7,
  ordersThisMonth: 118,
  completionRate: 94.1,
  revenue: '₹3.9L',
  trend: 'up',
  status: 'Active',
  pincodes: 12
},
{
  id: 'partner-003',
  name: 'Rajasthan Devices',
  city: 'Jaipur',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_16798ebc0-1787485882302.png",
  avatarAlt: 'Rajasthan Devices store exterior',
  rating: 4.5,
  ordersThisMonth: 76,
  completionRate: 88.4,
  revenue: '₹2.1L',
  trend: 'down',
  status: 'Active',
  pincodes: 5
},
{
  id: 'partner-004',
  name: 'Ahmedabad Tech',
  city: 'Ahmedabad',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_15d6e4402-1787485873021.png",
  avatarAlt: 'Ahmedabad Tech service center',
  rating: 4.6,
  ordersThisMonth: 89,
  completionRate: 91.0,
  revenue: '₹2.7L',
  trend: 'up',
  status: 'Active',
  pincodes: 7
},
{
  id: 'partner-005',
  name: 'GadgetZone Pune',
  city: 'Pune',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_166b5af31-1777824479299.png",
  avatarAlt: 'GadgetZone Pune retail store interior',
  rating: 4.8,
  ordersThisMonth: 104,
  completionRate: 95.2,
  revenue: '₹3.3L',
  trend: 'up',
  status: 'Active',
  pincodes: 9
},
{
  id: 'partner-006',
  name: 'Hyderabad Fix Pro',
  city: 'Hyderabad',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b8775881-1787485873767.png",
  avatarAlt: 'Hyderabad Fix Pro service workshop',
  rating: 4.3,
  ordersThisMonth: 52,
  completionRate: 82.7,
  revenue: '₹1.4L',
  trend: 'down',
  status: 'Under Review',
  pincodes: 3
}];


const statusConfig: Record<string, {bg: string;text: string;}> = {
  Active: { bg: 'bg-primary/10', text: 'text-primary' },
  'Under Review': { bg: 'bg-warning/10', text: 'text-warning' },
  Suspended: { bg: 'bg-danger/10', text: 'text-danger' }
};

export default function PartnerPerformancePanel() {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-bold text-foreground text-base">Partner Performance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Top performing partners this month</p>
        </div>
        <button className="text-xs font-semibold text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
          View All Partners
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {['Partner', 'City', 'Rating', 'Orders (Mo)', 'Completion', 'Revenue', 'PIN Codes', 'Status', 'Actions'].map((col) =>
              <th key={`pcol-${col}`} className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {partners.map((partner, pi) => {
              const statusCfg = statusConfig[partner.status] || statusConfig.Active;
              return (
                <tr
                  key={partner.id}
                  className={`border-b border-border hover:bg-primary-50/40 transition-colors ${pi % 2 === 0 ? 'bg-white' : 'bg-muted/10'}`}>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                        <AppImage
                          src={partner.avatar}
                          alt={partner.avatarAlt}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover" />

                      </div>
                      <div>
                        <p className="font-bold text-foreground">{partner.name}</p>
                        <p className="text-muted-foreground font-tabular text-xs">{partner.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{partner.city}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-warning fill-warning" />
                      <span className="font-bold text-foreground">{partner.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-foreground font-tabular">{partner.ordersThisMonth}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${partner.completionRate >= 90 ? 'bg-primary' : partner.completionRate >= 80 ? 'bg-warning' : 'bg-danger'}`}
                          style={{ width: `${partner.completionRate}%` }} />

                      </div>
                      <span className={`font-bold font-tabular ${partner.completionRate >= 90 ? 'text-primary' : partner.completionRate >= 80 ? 'text-warning' : 'text-danger'}`}>
                        {partner.completionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground font-tabular">{partner.revenue}</span>
                      {partner.trend === 'up' ?
                      <TrendingUp size={12} className="text-primary" /> :
                      <TrendingDown size={12} className="text-danger" />
                      }
                    </div>
                  </td>
                  <td className="px-4 py-3 font-tabular text-foreground">{partner.pincodes}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg font-semibold ${statusCfg.bg} ${statusCfg.text} whitespace-nowrap`}>
                      {partner.status === 'Active' ?
                      <CheckCircle size={10} /> :
                      <XCircle size={10} />
                      }
                      {partner.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors">
                      View
                    </button>
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
      </div>
    </div>);

}