import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  HardDrive, 
  FileText, 
  EyeOff, 
  UserCheck, 
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
  title: 'Privacy Policy & DoD Data Wipe Certification | Camsik ReCommerce',
  description: 'Learn how Camsik protects your personal data, enforces DoD 5220.22-M and NIST 800-88 military-grade data sanitization on pre-owned devices, and complies with DPDP Act 2023.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'September 2026';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <CustomerHeader />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80 py-10 sm:py-14">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={13} />
            <span className="text-purple-400 font-bold">Privacy Policy</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
                <ShieldCheck size={14} className="text-purple-400" />
                DATA PRIVACY &amp; SECURITY GUARANTEE
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                Privacy Policy
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                At Camsik Electronics Pvt. Ltd., data privacy is not an afterthought—it is the foundation of our ReCommerce ecosystem. We guarantee 100% data sanitization on every sold gadget and rigorous protection of your personal information.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2 text-slate-400 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Clock size={14} className="text-purple-400" />
                <span>Last Updated: {lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Compliant with DPDP Act 2023 &amp; IT Act 2000</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive size={14} className="text-blue-400" />
                <span>NIST 800-88 / DoD 5220.22-M Standard</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Body */}
      <section className="py-12 sm:py-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Quick Navigation Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-4">
                    Table of Contents
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300 font-medium">
                    <li>
                      <a href="#introduction" className="hover:text-purple-400 transition-colors block py-1">
                        1. Introduction &amp; Corporate Identity
                      </a>
                    </li>
                    <li>
                      <a href="#data-collection" className="hover:text-purple-400 transition-colors block py-1">
                        2. Information We Collect
                      </a>
                    </li>
                    <li>
                      <a href="#data-wipe" className="hover:text-purple-400 transition-colors block py-1 text-emerald-400 font-semibold">
                        3. Certified DoD 5220.22-M Data Wipe
                      </a>
                    </li>
                    <li>
                      <a href="#how-we-use" className="hover:text-purple-400 transition-colors block py-1">
                        4. Purpose of Data Processing
                      </a>
                    </li>
                    <li>
                      <a href="#sharing-policy" className="hover:text-purple-400 transition-colors block py-1">
                        5. Data Sharing &amp; Third Parties
                      </a>
                    </li>
                    <li>
                      <a href="#security-measures" className="hover:text-purple-400 transition-colors block py-1">
                        6. Security Infrastructure &amp; Encryption
                      </a>
                    </li>
                    <li>
                      <a href="#user-rights" className="hover:text-purple-400 transition-colors block py-1">
                        7. Your Legal Rights (DPDP Act 2023)
                      </a>
                    </li>
                    <li>
                      <a href="#cookies" className="hover:text-purple-400 transition-colors block py-1">
                        8. Cookies &amp; Tracking Technologies
                      </a>
                    </li>
                    <li>
                      <a href="#grievance" className="hover:text-purple-400 transition-colors block py-1">
                        9. Grievance Officer &amp; Inquiries
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Ecosystem Policies */}
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs space-y-2.5">
                  <h4 className="font-bold uppercase tracking-wider text-purple-400 text-[11px]">
                    Ecosystem Privacy Policies
                  </h4>
                  <div className="space-y-1.5 pt-1 font-medium">
                    <Link href="/partner/privacy" className="flex items-center justify-between text-slate-300 hover:text-purple-400 py-1 border-b border-slate-800/60">
                      <span>Store &amp; Partner Policy</span>
                      <ChevronRight size={12} />
                    </Link>
                    <Link href="/delivery/privacy" className="flex items-center justify-between text-slate-300 hover:text-purple-400 py-1 border-b border-slate-800/60">
                      <span>Delivery &amp; Fleet Policy</span>
                      <ChevronRight size={12} />
                    </Link>
                    <Link href="/admin/privacy" className="flex items-center justify-between text-slate-300 hover:text-purple-400 py-1">
                      <span>Admin &amp; Enterprise Governance</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>

                {/* Trust Badge Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20 text-xs">
                  <div className="flex items-center gap-2 text-purple-300 font-bold mb-2">
                    <Lock size={16} />
                    <span>Zero Data Sale Pledge</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Camsik never sells, rents, or monetizes customer personal information to advertisers, telemarketers, or external data brokers.
                  </p>
                </div>
              </div>
            </aside>

            {/* Main Policy Text */}
            <article className="lg:col-span-8 space-y-10 text-sm leading-relaxed text-slate-300">
              {/* Section 1 */}
              <section id="introduction" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Building2 size={20} className="text-purple-400" />
                  1. Introduction &amp; Corporate Identity
                </h2>
                <p className="mb-3">
                  This Privacy Policy outlines how <strong>Camsik Electronics Pvt. Ltd.</strong> (&quot;Camsik&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operating via our website <code className="text-purple-300 bg-purple-950/50 px-1.5 py-0.5 rounded">casmik-one.vercel.app</code> and mobile applications, collects, stores, protects, and sanitizes personal and hardware data when you buy, sell, trade-in, or repair consumer electronics (smartphones, laptops, MacBooks, tablets, DSLR/mirrorless cameras, lenses, and gear).
                </p>
                <p>
                  By accessing or utilizing any part of the Camsik platform, you consent to the data practices described herein, compliant with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, the <strong>Information Technology Act, 2000</strong>, and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>.
                </p>
              </section>

              {/* Section 2 */}
              <section id="data-collection" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={20} className="text-purple-400" />
                  2. Information We Collect
                </h2>
                <p>
                  To deliver seamless door-to-door valuations, instant bank payouts, and certified refurbished hardware, we collect the following categories of information:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2 text-purple-300">
                      Personal Identifiers
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Legal full name, phone number (OTP-verified), email address, physical residence or office pickup address, landmark, and postal PIN code.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2 text-purple-300">
                      Financial &amp; Payout Details
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      UPI Virtual Payment Address (VPA), Bank Account Number, and IFSC Code used exclusively for instant spot payouts via IMPS/NEFT. We do not store card CVVs or netbanking passwords.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2 text-purple-300">
                      Device &amp; Hardware Telemetry
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Device IMEI 1 &amp; 2, serial number, OEM model, storage configuration, battery health percentage, camera shutter count, screen condition grading, and 45-point diagnostic reports.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2 text-purple-300">
                      Mandatory KYC Verification
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Government photo identification (Aadhaar, Voter ID, Driving Licence, or Passport) required under Indian second-hand trade and police anti-theft directives to prove legal device ownership.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3 - Core Guarantee */}
              <section id="data-wipe" className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  <ShieldCheck size={14} />
                  OUR FLAGSHIP SECURITY COMMITMENT
                </div>
                <h2 className="text-xl font-bold text-white">
                  3. DoD 5220.22-M &amp; NIST 800-88 Certified Data Wipe Policy
                </h2>
                <p>
                  One of the biggest concerns when selling a pre-owned smartphone, laptop, or camera is personal data privacy (photos, messages, banking tokens, saved passwords, family media).
                </p>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-2 text-xs">
                  <p className="font-semibold text-emerald-400">Every device handled by Camsik undergoes certified sanitization:</p>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                    <li><strong>Factory Grade Multi-Pass Overwrite:</strong> Conforming to U.S. Department of Defense (DoD 5220.22-M) and NIST Special Publication 800-88 Rev. 1 guidelines for media sanitization.</li>
                    <li><strong>Internal Flash &amp; Storage Scrub:</strong> SSDs, eMMC drives, and device flash partitions are securely scrubbed, preventing forensically recoverable remnants.</li>
                    <li><strong>Camera Buffer &amp; SD Slot Flush:</strong> On DSLRs, mirrorless bodies, and action cams, internal write buffers, custom EXIF copyright tags, and wireless profiles are purged to factory zero.</li>
                    <li><strong>Activation Lock Deregistration:</strong> Complete verification that Apple iCloud / Find My, Google FRP (Factory Reset Protection), Samsung Knox, and Microsoft BitLocker accounts are unlinked before transaction closing.</li>
                  </ul>
                </div>
                <p className="text-xs text-slate-400">
                  A digital <strong>Certificate of Data Sanitization</strong> is automatically archived for our records and can be provided to corporate enterprises or retail customers upon request.
                </p>
              </section>

              {/* Section 4 */}
              <section id="how-we-use" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCheck size={20} className="text-purple-400" />
                  4. Purpose of Data Processing
                </h2>
                <p>We process collected data solely for legitimate business operations:</p>
                <ul className="list-disc list-inside space-y-2 text-xs text-slate-300">
                  <li>Generating real-time algorithmic valuation estimates for pre-owned gadgets.</li>
                  <li>Dispatching trained diagnostic technicians to your verified address for free doorstep verification.</li>
                  <li>Executing instant spot payouts via secure UPI and IMPS payment rails.</li>
                  <li>Generating digitally authenticated bills of sale and legally binding transfer-of-ownership deeds.</li>
                  <li>Delivering certified refurbished products and servicing 6-month / 1-year product warranty claims.</li>
                  <li>Preventing fraudulent transactions and verifying hardware serials against national lost &amp; stolen property registries.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section id="sharing-policy" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <EyeOff size={20} className="text-purple-400" />
                  5. Data Sharing &amp; Third Parties
                </h2>
                <p>
                  <strong>We do not sell customer information.</strong> Your data is shared exclusively in the following limited and controlled scenarios:
                </p>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <strong className="text-white block mb-1">Doorstep Logistics &amp; Verification Agents:</strong>
                    Pickup executives receive only your designated pickup address and contact number to coordinate arrival and inspection.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <strong className="text-white block mb-1">Regulated Financial Gateways:</strong>
                    UPI VPAs and bank coordinates are processed through RBI-authorized payment aggregators (e.g., Cashfree, Razorpay, or direct banking IMPS APIs).
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <strong className="text-white block mb-1">Law Enforcement &amp; Legal Mandates:</strong>
                    We are legally obligated to disclose device serial numbers and seller KYC if formally requested by Indian Police or judicial authorities investigating stolen, stolen-in-transit, or cybercrime-linked goods.
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section id="security-measures" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Lock size={20} className="text-purple-400" />
                  6. Security Infrastructure &amp; Encryption
                </h2>
                <p>
                  Camsik implements multi-tier enterprise defenses to ensure the confidentiality, integrity, and availability of all data:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                  <li><strong>Data in Transit:</strong> 256-bit SSL/TLS 1.3 cryptographic protocols protect all data transmitted between your browser/app and our servers.</li>
                  <li><strong>Data at Rest:</strong> AES-256 encryption across cloud database clusters and object storage buckets.</li>
                  <li><strong>Role-Based Access Control (RBAC):</strong> Only vetted, authorized personnel have access to transaction records on a need-to-know basis.</li>
                  <li><strong>Continuous Audits:</strong> Regular vulnerability scans and automated security checks across production deployments.</li>
                </ul>
              </section>

              {/* Section 7 */}
              <section id="user-rights" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-purple-400" />
                  7. Your Legal Rights (DPDP Act 2023)
                </h2>
                <p>As a data principal under the Indian Digital Personal Data Protection Act, 2023, you have the right to:</p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                  <li>Request a summary of personal data held about you and processing activities undertaken.</li>
                  <li>Request correction, updating, or completion of inaccurate or incomplete personal data.</li>
                  <li>Request erasure of personal data, subject to legal retention obligations (e.g., GST invoice retention and law enforcement second-hand electronics logs for 5 years).</li>
                  <li>Nominate another individual to exercise your rights in event of incapacity.</li>
                </ul>
              </section>

              {/* Section 8 */}
              <section id="cookies" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <HardDrive size={20} className="text-purple-400" />
                  8. Cookies &amp; Tracking Technologies
                </h2>
                <p className="text-xs text-slate-400">
                  We use essential session tokens and analytics cookies to maintain your login session, save your device valuation progress in the shopping cart, and optimize page load speeds. You can configure your browser to reject non-essential cookies at any time without restricting core buyback functionality.
                </p>
              </section>

              {/* Section 9 */}
              <section id="grievance" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertCircle size={20} className="text-purple-400" />
                  9. Grievance Redressal &amp; Data Protection Officer
                </h2>
                <p className="text-xs text-slate-300">
                  In accordance with the Information Technology Act, 2000 and DPDP Act, 2023, the details of our designated Grievance Officer are provided below:
                </p>
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5">
                  <p className="font-bold text-white text-sm">Grievance &amp; Compliance Cell</p>
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
