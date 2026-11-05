'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DeliveryLayout from './components/DeliveryLayout';
import DeliveryDashboard from './components/DeliveryDashboard';
import DeliveryTasks from './components/DeliveryTasks';
import DeliveryInspection from './components/DeliveryInspection';
import DeliveryEarnings from './components/DeliveryEarnings';
import DeliveryProfile from './components/DeliveryProfile';
import SupportTicketsPanel from '@/components/SupportTicketsPanel';
import { Clock, ShieldAlert, RefreshCw, LogOut, ArrowRight, Truck } from 'lucide-react';
import { deliveryAgents, DeliveryAgent } from '@/lib/casmikData';

export type DeliverySection = 'dashboard' | 'tasks' | 'inspection' | 'earnings' | 'profile' | 'support';

interface ExtendedAgent extends DeliveryAgent {
  approvalStatus?: 'approved' | 'pending' | 'rejected';
}

export default function DeliveryPage() {
  const [activeSection, setActiveSection] = useState<DeliverySection>('dashboard');
  const [session, setSession] = useState<ExtendedAgent | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    if (typeof window === 'undefined') return;
    try {
      const storedSession = localStorage.getItem('casmik_delivery_session');
      if (!storedSession) {
        setSession(null);
        setLoading(false);
        return;
      }
      const currentAgent: ExtendedAgent = JSON.parse(storedSession);

      // Check live database for approval status changes
      const savedAgents = localStorage.getItem('casmik_delivery_agents_v1');
      if (savedAgents) {
        const list: ExtendedAgent[] = JSON.parse(savedAgents);
        const match = list.find(a => a.id === currentAgent.id || a.phone === currentAgent.phone);
        if (match) {
          localStorage.setItem('casmik_delivery_session', JSON.stringify(match));
          setSession(match);
          setLoading(false);
          return;
        }
      }

      setSession(currentAgent);
    } catch {
      setSession(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('casmik_delivery_session');
      window.location.href = '/delivery/login';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">Checking delivery authorization...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect immediately to delivery login
  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/delivery/login';
    }
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-800 space-y-4">
          <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-400 border border-amber-500/20">
            <Truck size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-white">Delivery Executive Portal Security</h2>
            <p className="text-slate-400 text-xs">
              Verifying delivery executive authorization...
            </p>
          </div>
          <p className="text-[11px] text-slate-500">Redirecting to Delivery Login...</p>
        </div>
      </div>
    );
  }

  // Pending approval screen
  if (session.approvalStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-primary/5 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center border border-amber-100">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 text-amber-600 animate-pulse">
            <Clock size={40} />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-3">
            Pending Super Admin Approval
          </span>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Application Under Review</h2>
          <p className="text-gray-500 text-sm mb-6">
            Hello <strong>{session.name}</strong>, your delivery executive application is under review. The Camsik Admin team is verifying your documents and vehicle details.
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 text-left mb-6 space-y-2.5 text-xs text-gray-600">
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-400">Agent ID:</span>
              <span className="font-bold text-gray-900">{session.id}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-400">Registered Phone:</span>
              <span className="font-semibold text-gray-800">{session.phone}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-400">City / Operational Hub:</span>
              <span className="font-semibold text-gray-800">{session.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Vehicle:</span>
              <span className="font-semibold text-gray-800">{session.vehicle} ({session.vehicleNumber})</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={checkAuth}
              className="flex-1 py-3 bg-primary text-white rounded-2xl font-bold text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <RefreshCw size={14} /> Refresh Status
            </button>
            <button
              onClick={handleLogout}
              className="py-3 px-5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return (
        <DeliveryDashboard
          onNavigateToTasks={() => setActiveSection('tasks')}
          onNavigateToEarnings={() => setActiveSection('earnings')}
        />
      );
      case 'tasks': return <DeliveryTasks onOpenInspection={(orderId) => {
        if (typeof window !== 'undefined' && orderId) {
          localStorage.setItem('casmik_delivery_active_inspection_id', orderId);
        }
        setActiveSection('inspection');
      }} />;
      case 'inspection': return <DeliveryInspection onBackToTasks={() => setActiveSection('tasks')} />;
      case 'earnings': return <DeliveryEarnings />;
      case 'profile': return <DeliveryProfile />;
      case 'support': return <SupportTicketsPanel panelType="delivery" userName={session.name || "Agent"} />;
      default: return <DeliveryDashboard />;
    }
  };

  return (
    <DeliveryLayout activeSection={activeSection} onSectionChange={setActiveSection} currentAgent={session}>
      {renderSection()}
    </DeliveryLayout>
  );
}

