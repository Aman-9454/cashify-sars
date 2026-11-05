import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  FileText, 
  Terminal, 
  Server, 
  ChevronRight, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';

export const metadata = {
  title: 'Admin Privacy & Data Governance Policy | Camsik Admin Suite',
  description: 'Internal privacy and enterprise data governance policy for Camsik administrative personnel, system operators, and moderators. Covers RBAC, access auditing, and DPDP Act 2023 compliance.',
};

export default function AdminPrivacyPolicyPage() {
  const lastUpdated = 'October 2026';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <CustomerHeader />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80 py-10 sm:py-14">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={13} />
            <Link href="/admin" className="hover:text-white transition-colors">Admin Control</Link>
            <ChevronRight size={13} />
            <span className="text-purple-400 font-bold">Admin Privacy &amp; Governance</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
                <ShieldCheck size={14} className="text-purple-400" />
                ENTERPRISE DATA GOVERNANCE &amp; INTERNAL PRIVACY
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                Admin Privacy &amp; Data Governance
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Policy governing data security, access logs, confidential record handling, and role-based permissions for administrators, inventory managers, and customer support operators of Camsik.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2 text-slate-400 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Clock size={14} className="text-purple-400" />
                <span>Last Updated: {lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Applicable to in.camsik.admin</span>
              </div>
              <div className="flex items-center gap-2">
                <Server size={14} className="text-blue-400" />
                <span>Zero Trust Architecture &amp; RBAC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Body */}
      <section className="py-12 sm:py-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Table of Contents */}
            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-4">
                    Table of Contents
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300 font-medium">
                    <li><a href="#admin-scope" className="hover:text-purple-400 transition-colors block py-1">1. Scope &amp; Target Audience</a></li>
                    <li><a href="#operator-telemetry" className="hover:text-purple-400 transition-colors block py-1">2. Operator Telemetry &amp; Audit Logs</a></li>
                    <li><a href="#rbac-governance" className="hover:text-purple-400 transition-colors block py-1 text-emerald-400 font-semibold">3. Role-Based Access Control (RBAC)</a></li>
                    <li><a href="#customer-protection" className="hover:text-purple-400 transition-colors block py-1">4. Handling of Customer &amp; Partner Data</a></li>
                    <li><a href="#security-defense" className="hover:text-purple-400 transition-colors block py-1">5. Enterprise Security &amp; Encryption</a></li>
                    <li><a href="#legal-retention" className="hover:text-purple-400 transition-colors block py-1">6. Statutory Retention &amp; DPDP Act</a></li>
                    <li><a href="#grievance" className="hover:text-purple-400 transition-colors block py-1">7. Chief Information Security Officer Contact</a></li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20 text-xs">
                  <div className="flex items-center gap-2 text-purple-300 font-bold mb-2">
                    <Key size={16} />
                    <span>Principle of Least Privilege</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Administrative access to customer payment VPAs, identity documents, and pricing indices is segmented strictly by verified operational role.
                  </p>
                </div>
              </div>
            </aside>

            {/* Main Policy Details */}
            <article className="lg:col-span-8 space-y-10 text-sm leading-relaxed text-slate-300">
              <section id="admin-scope" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Building2 size={20} className="text-purple-400" />
                  1. Scope &amp; Target Audience
                </h2>
                <p className="mb-3">
                  This policy outlines internal data processing and governance standards for the <strong>Camsik Admin Suite</strong> (mobile application package: <code className="text-purple-300 bg-purple-950/50 px-1.5 py-0.5 rounded">in.camsik.admin</code>) and the web administration console.
                </p>
                <p>
                  Access is restricted solely to authorized enterprise staff, system administrators, and vetted operational managers of Camsik Electronics Pvt. Ltd.
                </p>
              </section>

              <section id="operator-telemetry" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Terminal size={20} className="text-purple-400" />
                  2. Operator Telemetry &amp; Audit Logs
                </h2>
                <p>To prevent insider threats, unauthorized data manipulation, and ensure complete accountability, the Admin Suite records:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <h4 className="font-semibold text-white uppercase tracking-wider mb-2 text-purple-300">Access Telemetry</h4>
                    <p className="text-slate-400 leading-relaxed">Operator login timestamps, origin IP address, device fingerprints, session token lifetimes, and two-factor authentication events.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <h4 className="font-semibold text-white uppercase tracking-wider mb-2 text-purple-300">Operational Mutex Logs</h4>
                    <p className="text-slate-400 leading-relaxed">Audit trail of order state changes, valuation overrides, partner commission approvals, customer refund authorizations, and device status modifications.</p>
                  </div>
                </div>
              </section>

              <section id="rbac-governance" className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  <Lock size={14} />
                  ZERO TRUST &amp; LEAST PRIVILEGE
                </div>
                <h2 className="text-xl font-bold text-white">3. Role-Based Access Control (RBAC)</h2>
                <p>
                  In compliance with ISO/IEC 27001 and DPDP Act 2023 principles:
                </p>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-2 text-xs">
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                    <li><strong>Support Tier:</strong> Read-only access to customer contact coordinates and active shipment tracking details. No access to unmasked bank account numbers.</li>
                    <li><strong>Finance Tier:</strong> Access restricted to payout settlement approvals, GST ledger generation, and banking webhook verification.</li>
                    <li><strong>Inventory &amp; Diagnostics Tier:</strong> Access to camera and smartphone condition reports, IMEI validation logs, and grading metrics.</li>
                    <li><strong>Super Administrator:</strong> Full platform configuration with mandatory multi-factor authentication (MFA) and immutable audit log streaming.</li>
                  </ul>
                </div>
              </section>

              <section id="customer-protection" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={20} className="text-purple-400" />
                  4. Handling of Customer &amp; Partner Data
                </h2>
                <p>
                  Administrative operators are strictly bound by corporate non-disclosure agreements (NDAs). Exporting bulk customer databases, phone numbers, or private hardware inspection records to unauthorized external drives or personal cloud accounts is strictly prohibited and subject to civil and criminal penalties under Section 43A of the Information Technology Act, 2000.
                </p>
              </section>

              <section id="security-defense" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={20} className="text-purple-400" />
                  5. Enterprise Security &amp; Cryptography
                </h2>
                <p>
                  All database transactions utilize TLS 1.3 encryption in flight and AES-256 encryption at rest. Internal administrative API endpoints require cryptographically signed JWT session tokens and are protected by rate-limiting algorithms and DDoS mitigation filters.
                </p>
              </section>

              <section id="legal-retention" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-purple-400" />
                  6. Statutory Retention &amp; DPDP Act Compliance
                </h2>
                <p>
                  System audit logs and transaction records are preserved for a statutory duration of 5 years to comply with Indian commercial taxation laws, GST regulations, and cyber security reporting directives issued by CERT-In.
                </p>
              </section>

              <section id="grievance" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertCircle size={20} className="text-purple-400" />
                  7. Chief Information Security Officer Contact
                </h2>
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5">
                  <p className="font-bold text-white text-sm">Enterprise Security &amp; Compliance Office</p>
                  <p className="text-slate-400">Camsik Electronics Pvt. Ltd.</p>
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin size={14} className="text-purple-400 flex-shrink-0" />
                    <span>A-315, Shanti Shopping Center, Near Mira Road Station, Mumbai, Maharashtra - 401107, India</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail size={14} className="text-purple-400 flex-shrink-0" />
                    <a href="mailto:sellatcamsik@gmail.com" className="text-purple-300 hover:underline">sellatcamsik@gmail.com</a>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone size={14} className="text-purple-400 flex-shrink-0" />
                    <span>+91 8976000010 (Monday – Sunday, 9:00 AM – 9:00 PM IST)</span>
                  </div>
                </div>
              </section>
            </article>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </main>
  );
}
