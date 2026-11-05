import React from 'react';
import Link from 'next/link';
import { 
  AlertCircle, 
  HelpCircle, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Camera, 
  Smartphone, 
  Laptop, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';

export const metadata = {
  title: 'Device Valuation Disclaimer & Fair Pricing Policy | Camsik',
  description: 'Understand how Camsik calculates pre-owned tech resale prices, 45-point diagnostic checks, accessory deductions, and our transparent zero-pressure pricing guarantee.',
};

export default function ValuationDisclaimerPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <CustomerHeader />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80 py-10 sm:py-14">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={13} />
            <span className="text-purple-400 font-bold">Valuation Disclaimer</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-4">
                <Scale size={14} className="text-blue-400" />
                TRANSPARENT PRICING &amp; FAIR VALUATION
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                Valuation Disclaimer
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Everything you need to know about how our dynamic AI valuation engine computes gadget quotes, what our diagnostic executives verify at your doorstep, and our zero-hidden-fee promise.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2 text-slate-400 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Sparkles size={14} className="text-purple-400" />
                <span>Algorithmic Real-Time Market Valuation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>7-Day Price Lock Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-blue-400" />
                <span>100% Free Doorstep Cancellation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-4">
                    On This Page
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300 font-medium">
                    <li><a href="#algorithmic" className="hover:text-purple-400 transition-colors block py-1">1. Algorithmic Pricing Engine</a></li>
                    <li><a href="#estimate-vs-physical" className="hover:text-purple-400 transition-colors block py-1 text-blue-400 font-semibold">2. Online Estimate vs. Doorstep Check</a></li>
                    <li><a href="#diagnostic-pillars" className="hover:text-purple-400 transition-colors block py-1">3. The 45-Point Diagnostic Parameters</a></li>
                    <li><a href="#accessories-deductions" className="hover:text-purple-400 transition-colors block py-1">4. Impact of Accessories &amp; Bills</a></li>
                    <li><a href="#price-lock" className="hover:text-purple-400 transition-colors block py-1">5. 7-Day Price Lock Guarantee</a></li>
                    <li><a href="#zero-pressure" className="hover:text-purple-400 transition-colors block py-1 text-emerald-400 font-semibold">6. Zero-Pressure &amp; Free Cancellation</a></li>
                    <li><a href="#ineligible-devices" className="hover:text-purple-400 transition-colors block py-1 text-rose-400">7. Ineligible Devices We Cannot Buy</a></li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-blue-300 font-bold">
                    <Clock size={15} />
                    <span>Price Lock Feature</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Once you schedule a pickup on Camsik, your online quote is locked for 7 full days to protect you against unexpected market depreciation.
                  </p>
                </div>
              </div>
            </aside>

            {/* Articles */}
            <article className="lg:col-span-8 space-y-10 text-sm leading-relaxed text-slate-300">
              {/* Section 1 */}
              <section id="algorithmic" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Cpu size={20} className="text-purple-400" />
                  1. Algorithmic Real-Time Market Valuation
                </h2>
                <p>
                  Unlike traditional offline brick-and-mortar shops that guess prices based on subjective opinion, Camsik operates an automated dynamic pricing engine. Our algorithms synthesize:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <strong className="text-white block mb-1">Live Second-Hand Market Demand:</strong>
                    Continuous scraping of pan-India resale transaction prices for smartphones, MacBooks, cameras, and lenses.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <strong className="text-white block mb-1">Hardware Depreciation Curves:</strong>
                    Predictive modeling of age-based battery wear, sensor degradation, and component obsolescence.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <strong className="text-white block mb-1">New Generation Releases:</strong>
                    Automated price re-balancing when manufacturers (Apple, Sony, Samsung, Canon) launch successor models.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <strong className="text-white block mb-1">Component Replacement Costs:</strong>
                    Standardized OEM part pricing for authentic screens, back glasses, camera sensors, and batteries.
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section id="estimate-vs-physical" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertCircle size={20} className="text-blue-400" />
                  2. Online Estimate vs. Physical Doorstep Diagnostic Check
                </h2>
                <p>
                  It is important to understand the distinction between the quote generated online and the final spot payment:
                </p>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <p>
                    <strong className="text-blue-400">The Online Quote is an Indicative Estimate:</strong> It is derived solely from the information, options, and cosmetic condition self-declared by you during the quote questionnaire.
                  </p>
                  <p>
                    <strong className="text-emerald-400">The Doorstep Verification is Empirical:</strong> When our certified executive arrives at your location, they perform an objective 45-point diagnostic test using specialized hardware &amp; software tools. If the physical condition matches your declared answers 100%, <strong>you receive the exact full online quoted amount</strong>.
                  </p>
                  <p className="text-slate-400">
                    If hidden functional defects (e.g. non-OEM replacement screen, internal motherboard heating, cracked camera lens, battery swelling) are discovered, a standardized price adjustment is computed transparently.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section id="diagnostic-pillars" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles size={20} className="text-purple-400" />
                  3. Key Diagnostic Parameters (What Influences Your Valuation)
                </h2>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2 text-purple-300 font-bold mb-1">
                      <Smartphone size={15} />
                      <span>Display &amp; Screen Assembly</span>
                    </div>
                    <p className="text-slate-400">
                      Original OEM display vs aftermarket copy screen; presence of OLED burn-in/ghosting, colored vertical/horizontal lines, dead pixels, touch ghosting, or glass hairline cracks.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2 text-purple-300 font-bold mb-1">
                      <Laptop size={15} />
                      <span>Battery &amp; Power Health</span>
                    </div>
                    <p className="text-slate-400">
                      Maximum battery capacity percentage (iOS Health / macOS Cycle Count / Windows Battery Report). Batteries below 80% capacity or displaying &quot;Service Recommended&quot; incur standard replacement deductions.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2 text-purple-300 font-bold mb-1">
                      <Camera size={15} />
                      <span>Camera Optics, Sensors &amp; Shutter Count</span>
                    </div>
                    <p className="text-slate-400">
                      On DSLRs and mirrorless bodies: Total mechanical shutter actuations count against rated lifespan; sensor hot pixels, fungal growth or dust; autofocus motor accuracy; scratches on front or rear lens elements.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2 text-purple-300 font-bold mb-1">
                      <Cpu size={15} />
                      <span>Motherboard, Biometrics &amp; Connectivity</span>
                    </div>
                    <p className="text-slate-400">
                      Functionality of Face ID, Touch ID, or in-display fingerprint scanner; Wi-Fi 6 / Bluetooth connectivity; speaker and ear-piece clarity; microphone arrays; physical volume and power button tactile feedback.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section id="accessories-deductions" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-purple-400" />
                  4. Impact of Original Accessories &amp; Purchase Invoice
                </h2>
                <p>
                  To maximize your device valuation, we recommend having original accessories ready at pickup:
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
                    <div>
                      <strong className="text-white block">Original Manufacturer Charger / Adapter:</strong>
                      <span className="text-slate-400">Original working power brick and cable. Missing or duplicate third-party chargers slightly reduce valuation.</span>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap">+ Higher Value</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
                    <div>
                      <strong className="text-white block">Original Retail Box with Matching IMEI/Serial:</strong>
                      <span className="text-slate-400">Authentic manufacturer packaging enhances collector and buyer trust.</span>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap">+ Higher Value</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
                    <div>
                      <strong className="text-white block">Original Purchase Invoice / Tax Invoice:</strong>
                      <span className="text-slate-400">Provides clear proof of first-hand origin and establishes remaining OEM brand warranty if device is under 1 year old.</span>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap">+ Higher Value</span>
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section id="price-lock" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock size={20} className="text-purple-400" />
                  5. 7-Day Price Lock Guarantee
                </h2>
                <p className="text-xs text-slate-300">
                  Consumer electronics depreciate rapidly. When you complete an online quote and schedule a doorstep pickup, Camsik locks in that valuation for <strong>7 calendar days</strong>. Even if market prices crash due to sudden competitor announcements during those 7 days, your quote is honored as long as the device condition matches your self-declaration.
                </p>
              </section>

              {/* Section 6 - Core Customer Protection */}
              <section id="zero-pressure" className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  <ShieldCheck size={14} />
                  OUR ZERO PRESSURE GUARANTEE
                </div>
                <h2 className="text-xl font-bold text-white">
                  6. Zero-Pressure &amp; 100% Free Doorstep Cancellation
                </h2>
                <p className="text-xs text-slate-300">
                  If our diagnostic executive conducts the physical inspection and proposes an adjusted counter-offer due to undisclosed defects, <strong>you are under zero obligation to sell</strong>.
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p>✔ <strong>Zero Visiting Charges:</strong> We do not charge convenience or travel fees.</p>
                  <p>✔ <strong>Zero Diagnostics Fees:</strong> The 45-point check is completely free.</p>
                  <p>✔ <strong>Polite, Immediate Handback:</strong> Your gadget is immediately handed back without hassle.</p>
                </div>
              </section>

              {/* Section 7 */}
              <section id="ineligible-devices" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <XCircle size={20} className="text-rose-400" />
                  7. Ineligible Devices (Non-Acceptable Criteria)
                </h2>
                <p className="text-xs text-slate-400">
                  Under statutory Indian laws and company safety protocols, Camsik cannot purchase or exchange:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-rose-300/90">
                  <li>Devices reported lost, stolen, or under active police investigation.</li>
                  <li>Gadgets locked by Apple iCloud / Activation Lock, Google FRP, or Samsung Knox where credentials cannot be verified.</li>
                  <li>Smartphones or laptops currently bound by active unpaid EMI loan security lockers.</li>
                  <li>Heavily water-logged or fire-damaged devices with corroded logic boards.</li>
                  <li>Replica / counterfeit / clone devices manufactured to look like genuine OEM flagships.</li>
                </ul>
              </section>
            </article>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </main>
  );
}
