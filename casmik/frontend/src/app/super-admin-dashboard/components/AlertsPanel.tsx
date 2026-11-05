import React from 'react';
import { AlertTriangle, Clock, UserX, TrendingDown, Zap } from 'lucide-react';

// Backend integration point: fetch from /api/v1/admin/alerts
const alerts = [
  {
    id: 'alert-1',
    icon: Clock,
    title: '8 pickups delayed',
    desc: 'Delayed by more than 2 hours — need reassignment',
    severity: 'danger',
    time: '12 min ago',
  },
  {
    id: 'alert-2',
    icon: Zap,
    title: '₹2.4L payout pending',
    desc: '34 partners awaiting payout — process by Friday',
    severity: 'warning',
    time: '1 hr ago',
  },
  {
    id: 'alert-3',
    icon: UserX,
    title: 'Partner TechHub inactive',
    desc: 'No activity for 48 hours — 12 orders unassigned',
    severity: 'danger',
    time: '3 hr ago',
  },
  {
    id: 'alert-4',
    icon: TrendingDown,
    title: 'Completion rate dipped',
    desc: 'Rate dropped to 91.4% — review cancellations',
    severity: 'warning',
    time: '5 hr ago',
  },
];

const severityConfig = {
  danger: { bg: 'bg-danger/10', icon: 'text-danger', border: 'border-danger/20' },
  warning: { bg: 'bg-warning/10', icon: 'text-warning', border: 'border-warning/20' },
};

export default function AlertsPanel() {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-danger" />
          <h3 className="font-bold text-foreground text-sm">Active Alerts</h3>
          <span className="px-2 py-0.5 rounded-lg bg-danger/10 text-danger text-xs font-bold">4</span>
        </div>
        <button className="text-xs text-primary font-semibold hover:underline">View All</button>
      </div>
      <div className="p-3 space-y-2">
        {alerts.map((alert) => {
          const cfg = severityConfig[alert.severity as 'danger' | 'warning'];
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                <alert.icon size={13} className={cfg.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground leading-tight">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{alert.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">{alert.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}