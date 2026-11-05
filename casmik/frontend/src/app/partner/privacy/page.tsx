import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Store, 
  FileText, 
  BadgeCheck, 
  CreditCard, 
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
  title: 'Partner Privacy Policy & Data Terms | Camsik Partner Ecosystem',
  description: 'Official privacy policy for Camsik retail hub and franchise partners. Details on partner KYC, commission payouts, customer data confidentiality, and DPDP Act 2023 compliance.',
};

export default function PartnerPrivacyPolicyPage() {
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
            <Link href="/partner" className="hover:text-white transition-colors">Partner Hub</Link>
            <ChevronRight size={13} />
            <span className="text-purple-400 font-bold">Partner Privacy Policy</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
                <Store size={14} className="text-purple-400" />
                CAMSIK PARTNER ECOSYSTEM PRIVACY &amp; COMPLIANCE
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                Partner Privacy Policy
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                This policy governs the collection, processing, and protection of data for retail partners, franchise operators, and store owners operating on the Camsik Partner platform and mobile applications.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2 text-slate-400 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Clock size={14} className="text-purple-400" />
                <span>Last Updated: {lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Applicable to Camsik Partner App &amp; Web Portal</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck size={14} className="text-blue-400" />
                <span>Compliant with DPDP Act 2023 &amp; IT Act 2000</span>
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
                    <li><a href="#partner-scope" className="hover:text-purple-400 transition-colors block py-1">1. Scope &amp; Eligibility</a></li>
                    <li><a href="#partner-data" className="hover:text-purple-400 transition-colors block py-1">2. Information Collected from Partners</a></li>
                    <li><a href="#customer-confidentiality" className="hover:text-purple-400 transition-colors block py-1 text-emerald-400 font-semibold">3. Customer Data Confidentiality Mandate</a></li>
                    <li><a href="#commission-banking" className="hover:text-purple-400 transition-colors block py-1">4. Payouts &amp; Financial Security</a></li>
                    <li><a href="#device-sourcing" className="hover:text-purple-400 transition-colors block py-1">5. Anti-Theft Verification &amp; KYC</a></li>
                    <li><a href="#partner-rights" className="hover:text-purple-400 transition-colors block py-1">6. Partner Rights (DPDP Act 2023)</a></li>
                    <li><a href="#grievance" className="hover:text-purple-400 transition-colors block py-1">7. Grievance Officer &amp; Support</a></li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20 text-xs">
                  <div className="flex items-center gap-2 text-purple-300 font-bold mb-2">
                    <Lock size={16} />
                    <span>Commercial Data Confidentiality</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Partner revenue records, commission rates, and inventory volumes are treated with strict institutional confidentiality and never disclosed to competing outlets.
                  </p>
                </div>
              </div>
            </aside>

            {/* Main Policy Details */}
            <article className="lg:col-span-8 space-y-10 text-sm leading-relaxed text-slate-300">
              <section id="partner-scope" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Building2 size={20} className="text-purple-400" />
                  1. Scope &amp; Eligibility
                </h2>
                <p className="mb-3">
                  This Privacy Policy applies to registered electronics store owners, franchise operators, refurbishment centers, and verified commercial trade-in partners accessing the <strong>Camsik Partner</strong> application (package: <code className="text-purple-300 bg-purple-950/50 px-1.5 py-0.5 rounded">in.camsik.partner</code>) or the partner web portal.
                </p>
                <p>
                  By enrolling as a Camsik Partner, you acknowledge and agree to the operational guidelines and data processing workflows documented herein.
                </p>
              </section>

              <section id="partner-data" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={20} className="text-purple-400" />
                  2. Information Collected from Partners
                </h2>
                <p>During onboarding and daily operations, we collect the following partner credentials:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2 text-purple-300">Business &amp; Store Identity</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Store name, trade license / Shop &amp; Establishment certificate, GSTIN, registered physical address, operational postal PIN codes, and store manager contact details.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2 text-purple-300">Owner Verification &amp; KYC</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Authorized signatory PAN, Aadhaar or government ID for business verification, and digital authentication tokens.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2 text-purple-300">Settlement &amp; Banking Data</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Beneficiary business bank account number, IFSC code, and registered UPI ID for automated disbursement of trade-in commissions and liquidation payouts.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2 text-purple-300">Device Diagnostic Data</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Device IMEI / serial numbers, diagnostic condition scores, camera shutter counts, battery health, and liquidation receipts recorded at your hub.</p>
                  </div>
                </div>
              </section>

              <section id="customer-confidentiality" className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  <ShieldCheck size={14} />
                  MANDATORY B2B CONFIDENTIALITY OBLIGATION
                </div>
                <h2 className="text-xl font-bold text-white">3. Customer Data Confidentiality Mandate</h2>
                <p>
                  Partners interact directly with retail customers trading pre-owned gadgets. Under the <strong>Digital Personal Data Protection Act, 2023</strong> and Camsik policy:
                </p>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-2 text-xs">
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                    <li><strong>Zero Local Data Storage:</strong> Partners must NEVER copy, download, backup, or inspect customer files, personal photos, video galleries, contacts, or chat databases from traded gadgets.</li>
                    <li><strong>Enforced Factory Reset:</strong> Any device accepted at a Partner hub must have cloud activation locks (Apple iCloud, Google FRP, Knox) removed and undergo certified reset before dispatch.</li>
                    <li><strong>Strict Anti-Harvesting:</strong> Customer phone numbers and addresses displayed for trade coordination must never be used for independent unsolicited marketing or third-party sharing.</li>
                  </ul>
                </div>
              </section>

              <section id="commission-banking" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard size={20} className="text-purple-400" />
                  4. Payouts &amp; Financial Security
                </h2>
                <p>
                  Partner commission transfers are routed directly through RBI-authorized payment aggregators and automated banking rails (IMPS/NEFT). Bank records are stored using AES-256 bank-grade encryption with access restricted to certified financial compliance personnel.
                </p>
              </section>

              <section id="device-sourcing" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BadgeCheck size={20} className="text-purple-400" />
                  5. Anti-Theft Verification &amp; Regulatory Disclosures
                </h2>
                <p>
                  In accordance with Indian second-hand goods commerce regulations and law enforcement protocols, Camsik maintains immutable audit trails of device serial numbers, IMEI records, and seller ownership affidavits. In the event of formal police or cybercrime inquiries regarding stolen property, relevant verification logs will be produced as mandated by law.
                </p>
              </section>

              <section id="partner-rights" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-purple-400" />
                  6. Partner Rights (DPDP Act 2023)
                </h2>
                <p>Partners reserve the right to review registered store details, update bank coordinates, and request account termination upon settlement of pending trade-in commissions, subject to statutory 5-year commercial record retention requirements.</p>
              </section>

              <section id="grievance" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertCircle size={20} className="text-purple-400" />
                  7. Grievance Officer &amp; Partner Support
                </h2>
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5">
                  <p className="font-bold text-white text-sm">Partner Governance &amp; Compliance Cell</p>
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
