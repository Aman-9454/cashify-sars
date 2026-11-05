import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Truck, 
  Zap, 
  Scale, 
  AlertTriangle, 
  ChevronRight, 
  Building2,
  Clock,
  HelpCircle
} from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';

export const metadata = {
  title: 'Terms of Service & User Agreement | Camsik ReCommerce',
  description: 'Review the Terms of Service for Camsik Electronics Pvt. Ltd. governing device buyback, physical diagnostics, certified refurbished sales, warranties, and exchanges.',
};

export default function TermsOfServicePage() {
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
            <span className="text-purple-400 font-bold">Terms of Service</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
                <Scale size={14} className="text-purple-400" />
                LEGAL CONTRACT &amp; POLICIES
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                Terms of Service
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                These terms govern your access to Camsik’s services—including selling pre-owned electronics, purchasing certified refurbished gadgets, exchanging equipment, and scheduling doorstep pickups.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2 text-slate-400 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Clock size={14} className="text-purple-400" />
                <span>Effective Date: {lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Jurisdiction: Mumbai, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-blue-400" />
                <span>Camsik Electronics Pvt. Ltd.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar Table of Contents */}
            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-4">
                    Quick Navigation
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300 font-medium">
                    <li><a href="#acceptance" className="hover:text-purple-400 transition-colors block py-1">1. Acceptance of Terms &amp; Eligibility</a></li>
                    <li><a href="#ownership" className="hover:text-purple-400 transition-colors block py-1 text-amber-400 font-semibold">2. Ownership &amp; Anti-Theft Warranty</a></li>
                    <li><a href="#selling-process" className="hover:text-purple-400 transition-colors block py-1">3. Selling Process &amp; Doorstep Valuation</a></li>
                    <li><a href="#instant-payout" className="hover:text-purple-400 transition-colors block py-1">4. Instant Payout &amp; Transfer of Title</a></li>
                    <li><a href="#buy-warranty" className="hover:text-purple-400 transition-colors block py-1 text-emerald-400 font-semibold">5. Certified Refurbished Sales &amp; Warranty</a></li>
                    <li><a href="#exchange" className="hover:text-purple-400 transition-colors block py-1">6. 1-Step Device Exchange Terms</a></li>
                    <li><a href="#cancellation" className="hover:text-purple-400 transition-colors block py-1">7. Doorstep Pickup &amp; Free Cancellation</a></li>
                    <li><a href="#disclaimers-liability" className="hover:text-purple-400 transition-colors block py-1">8. Limitation of Liability &amp; Indemnity</a></li>
                    <li><a href="#dispute" className="hover:text-purple-400 transition-colors block py-1">9. Governing Law &amp; Dispute Resolution</a></li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <HelpCircle size={15} />
                    <span>Need Clarification?</span>
                  </div>
                  <p>
                    Contact our legal team at <a href="mailto:sellatcamsik@gmail.com" className="text-purple-400 underline">sellatcamsik@gmail.com</a> or call our helpline at <span className="text-white">+91 8976000010</span>.
                  </p>
                </div>
              </div>
            </aside>

            {/* Terms Content */}
            <article className="lg:col-span-8 space-y-10 text-sm leading-relaxed text-slate-300">
              {/* Section 1 */}
              <section id="acceptance" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={20} className="text-purple-400" />
                  1. Acceptance of Terms &amp; Eligibility
                </h2>
                <p>
                  By creating an account, browsing, requesting a quote, booking a doorstep pickup, purchasing refurbished electronics, or utilizing any services provided by <strong>Camsik Electronics Pvt. Ltd.</strong>, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service.
                </p>
                <p>
                  To transact on Camsik, you must be at least <strong>18 years of age</strong> and legally capable of entering into binding contracts under the Indian Contract Act, 1872. If you are under 18, you may only transact with the explicit involvement and consent of a parent or legal guardian.
                </p>
              </section>

              {/* Section 2 - Strict Anti-Stolen Policy */}
              <section id="ownership" className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 border border-amber-500/30 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
                  <ShieldAlert size={14} />
                  CRITICAL STATUTORY REQUIREMENT
                </div>
                <h2 className="text-xl font-bold text-white">
                  2. Device Ownership &amp; Zero Tolerance Anti-Theft Policy
                </h2>
                <p>
                  As a seller on Camsik, you explicitly represent, warrant, and certify that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-xs text-slate-300">
                  <li><strong>Lawful Sole Owner:</strong> You are the sole, rightful, and lawful legal owner of the device offered for sale or exchange.</li>
                  <li><strong>Free of Financial Encumbrances:</strong> The device is completely free of any active third-party liens, loans, unpaid monthly installments (EMIs), or financing security locks (including Bajaj Finserv, TVS Credit, Samsung Finance+, DMI Finance, etc.).</li>
                  <li><strong>No Corporate MDM Restrictions:</strong> The device is not enrolled in corporate Mobile Device Management (MDM), enterprise Knox, or school supervision profiles.</li>
                  <li><strong>Zero Stolen Property:</strong> The device has not been stolen, fraudulently acquired, or involved in any criminal activity.</li>
                  <li><strong>Mandatory Photo ID / KYC:</strong> Every seller is required by Indian law and Police directives for second-hand electronics to submit a valid government photo ID (Aadhaar Card, Voter ID, Driving Licence, or Passport) matching the seller&apos;s verified bank account.</li>
                </ul>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs text-amber-200">
                  <strong className="block mb-1">Police / Law Enforcement Escalation:</strong>
                  Camsik logs all IMEI numbers and hardware serials. If a device is detected as blacklisted, stolen, or associated with a police FIR, Camsik will immediately suspend the transaction, retain the hardware, and provide the seller&apos;s KYC details to cybercrime and local law enforcement authorities.
                </div>
              </section>

              {/* Section 3 */}
              <section id="selling-process" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap size={20} className="text-purple-400" />
                  3. Selling Process, Indicative Quotes &amp; Physical Diagnostics
                </h2>
                <p>
                  The selling workflow operates under clear algorithmic and diagnostic stages:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
                  <li><strong>Online Indicative Estimate:</strong> The valuation quote displayed on our portal is generated algorithmically based entirely on your declared answers (model, condition, accessories). It serves as an indicative estimate, not a final binding purchase contract.</li>
                  <li><strong>45-Point Hardware Diagnostics:</strong> During doorstep pickup, our certified technician executes our proprietary 45-point hardware verification (testing display authenticity, touch responsiveness, battery cycle health, motherboard functionality, camera sensor dust/shutter count, and speaker/microphone integrity).</li>
                  <li><strong>Counter-Offers:</strong> If physical inspection reveals undisclosed hardware defects, aftermarket non-OEM parts, or missing accessories, the technician will present a transparent revised counter-offer based on standardized grading deductions.</li>
                </ol>
              </section>

              {/* Section 4 */}
              <section id="instant-payout" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-purple-400" />
                  4. Instant Payout &amp; Irreversible Transfer of Ownership
                </h2>
                <p>
                  Once you accept the final inspected offer:
                </p>
                <ul className="list-disc list-inside space-y-2 text-xs text-slate-300">
                  <li><strong>Spot Payment:</strong> The exact agreed amount is transferred instantly to your verified UPI VPA or Bank Account via IMPS. Funds credit in your account in real-time before you release the device.</li>
                  <li><strong>Finality of Sale:</strong> Upon receipt of the electronic payout and execution of the digital bill of sale, all legal title, ownership, rights, and claims to the device transfer unconditionally and irrevocably to Camsik.</li>
                  <li><strong>No Returns on Sold Devices:</strong> Because devices undergo immediate factory-grade data wiping and enter the refurbishment stream, a completed sale cannot be cancelled, reversed, or refunded by the seller.</li>
                </ul>
              </section>

              {/* Section 5 - Certified Refurbished */}
              <section id="buy-warranty" className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  <CheckCircle2 size={14} />
                  BUYER ASSURANCE &amp; COVERAGE
                </div>
                <h2 className="text-xl font-bold text-white">
                  5. Certified Refurbished Products &amp; Warranty Policy
                </h2>
                <p>
                  All refurbished smartphones, laptops, MacBooks, tablets, and cameras sold on Camsik undergo rigorous testing and are backed by certified warranty coverage:
                </p>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-emerald-400 block mb-1">Standard Warranty Period:</strong>
                    Every certified device comes with either a <strong>6-Month</strong> or <strong>1-Year</strong> Camsik Functional Warranty as explicitly designated on the product page.
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-emerald-400 block mb-1">What Is Covered:</strong>
                    Internal component malfunctions, spontaneous motherboard failures, unexpected display matrix defects (unrelated to physical impact), and battery capacity dropping below certified performance thresholds.
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-amber-400 block mb-1">Warranty Exclusions (Voiding Events):</strong>
                    Accidental damage, cracked screens, shattered rear glass, liquid submersion / water intrusion, power surges from non-certified chargers, unauthorized third-party repairs, software rooting, or jailbreaking.
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-blue-400 block mb-1">7-Day Replacement Guarantee:</strong>
                    If your purchased device arrives Dead On Arrival (DOA) or exhibits a verifiable functional hardware defect within 7 days of delivery, Camsik will repair or provide an exact like-for-like replacement at zero cost.
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section id="exchange" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <RefreshCw size={20} className="text-purple-400" />
                  6. 1-Step Device Exchange Program
                </h2>
                <p className="text-xs text-slate-300">
                  Customers upgrading their tech can exchange old smartphones, laptops, or cameras for a certified refurbished model. The buyback value of the old gadget is deducted directly from the cart value of the upgrade. If the physical inspection of the trade-in device results in a price adjustment, the difference must be settled via online payment before the new device is released.
                </p>
              </section>

              {/* Section 7 */}
              <section id="cancellation" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Truck size={20} className="text-purple-400" />
                  7. Doorstep Pickup &amp; 100% Free Zero-Penalty Cancellation
                </h2>
                <p className="text-xs text-slate-300">
                  We believe in fair, zero-pressure recommerce. If our diagnostic technician inspects your device and proposes a revised counter-offer that does not meet your expectations, <strong>you have the absolute right to decline</strong>.
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p>✔ <strong>Zero Inspection Fee:</strong> We do not charge anything for visiting your doorstep.</p>
                  <p>✔ <strong>Zero Cancellation Penalty:</strong> You owe nothing if you choose not to proceed.</p>
                  <p>✔ <strong>Instant Device Handback:</strong> Your device is handed right back to you in the exact condition received.</p>
                </div>
              </section>

              {/* Section 8 */}
              <section id="disclaimers-liability" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle size={20} className="text-purple-400" />
                  8. Limitation of Liability &amp; Indemnity
                </h2>
                <p className="text-xs text-slate-400">
                  To the fullest extent permitted by applicable Indian law, Camsik Electronics Pvt. Ltd., its directors, officers, employees, and authorized agents shall not be liable for any indirect, punitive, special, or consequential damages, including loss of data, loss of business goodwill, or data recovery fees resulting from the factory reset and sanitization of sold devices.
                </p>
                <p className="text-xs text-slate-400">
                  You agree to defend, indemnify, and hold harmless Camsik from any claims, damages, liabilities, or expenses (including legal fees) arising from any breach of your ownership warranties or submission of stolen/encumbered hardware.
                </p>
              </section>

              {/* Section 9 */}
              <section id="dispute" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Scale size={20} className="text-purple-400" />
                  9. Governing Law &amp; Exclusive Jurisdiction
                </h2>
                <p className="text-xs text-slate-300">
                  These Terms of Service and any contractual or non-contractual disputes arising hereunder shall be governed by, construed, and enforced in accordance with the <strong>laws of the Republic of India</strong>. The courts situated in <strong>Mumbai, Maharashtra, India</strong> shall have exclusive jurisdiction to settle any disputes or claims.
                </p>
              </section>
            </article>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </main>
  );
}
