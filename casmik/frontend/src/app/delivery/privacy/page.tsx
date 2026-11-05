import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Truck, 
  MapPin, 
  Navigation, 
  Camera, 
  CreditCard, 
  ChevronRight, 
  Building2, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';

export const metadata = {
  title: 'Delivery Partner Privacy Policy & Location Disclosure | Camsik Logistics',
  description: 'Official privacy policy for Camsik delivery partners and field inspection executives. Explicit disclosure on foreground and background location tracking, camera access, and DPDP Act 2023 compliance.',
};

export default function DeliveryPrivacyPolicyPage() {
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
            <Link href="/delivery" className="hover:text-white transition-colors">Delivery Hub</Link>
            <ChevronRight size={13} />
            <span className="text-purple-400 font-bold">Delivery Privacy Policy</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
                <Truck size={14} className="text-purple-400" />
                CAMSIK LOGISTICS &amp; FIELD TECHNICIAN PRIVACY DISCLOSURE
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                Delivery Privacy Policy
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Clear and transparent disclosure regarding personal information, foreground &amp; background location telemetry, camera permissions, and earnings security for Camsik delivery executives and doorstep inspection technicians.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2 text-slate-400 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Clock size={14} className="text-purple-400" />
                <span>Last Updated: {lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Google Play Location Policy Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-blue-400" />
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
                    <li><a href="#delivery-scope" className="hover:text-purple-400 transition-colors block py-1">1. Scope of the Application</a></li>
                    <li><a href="#location-disclosure" className="hover:text-purple-400 transition-colors block py-1 text-emerald-400 font-bold">2. Prominent Location Disclosure (Foreground &amp; Background)</a></li>
                    <li><a href="#camera-permissions" className="hover:text-purple-400 transition-colors block py-1">3. Camera &amp; Inspection Media Access</a></li>
                    <li><a href="#delivery-personal-data" className="hover:text-purple-400 transition-colors block py-1">4. Executive Identification &amp; Vehicle Data</a></li>
                    <li><a href="#earnings-payouts" className="hover:text-purple-400 transition-colors block py-1">5. Earnings, Bank Transfers &amp; Fuel Allowances</a></li>
                    <li><a href="#executive-rights" className="hover:text-purple-400 transition-colors block py-1">6. Executive Rights &amp; Shift Control</a></li>
                    <li><a href="#grievance" className="hover:text-purple-400 transition-colors block py-1">7. Grievance Officer &amp; Fleet Operations</a></li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold mb-2">
                    <Navigation size={16} />
                    <span>Zero Ad-Tracking Guarantee</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Location data is utilized purely for real-time order dispatch, navigation, and customer delivery ETA. It is never sold, shared with ad networks, or accessed when you are marked Offline.
                  </p>
                </div>
              </div>
            </aside>

            {/* Main Policy Details */}
            <article className="lg:col-span-8 space-y-10 text-sm leading-relaxed text-slate-300">
              <section id="delivery-scope" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Building2 size={20} className="text-purple-400" />
                  1. Scope of the Application
                </h2>
                <p className="mb-3">
                  This Privacy Policy applies to independent logistics partners, delivery executives, and doorstep camera inspection technicians utilizing the <strong>Camsik Delivery</strong> mobile application (package: <code className="text-purple-300 bg-purple-950/50 px-1.5 py-0.5 rounded">in.camsik.delivery</code>).
                </p>
                <p>
                  By logging in as a Delivery Partner, you consent to the operational collection of data necessary to assign, route, verify, and complete gadget collections and customer deliveries.
                </p>
              </section>

              {/* Prominent Disclosure for Google Play */}
              <section id="location-disclosure" className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/40 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/40">
                  <Navigation size={14} />
                  PROMINENT DISCLOSURE • GOOGLE PLAY COMPLIANCE
                </div>
                <h2 className="text-xl font-bold text-white">
                  2. Foreground &amp; Background Location Data Collection
                </h2>
                <p>
                  <strong>Why Camsik Delivery requires Location permissions:</strong>
                </p>
                <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/20 space-y-3 text-xs leading-relaxed">
                  <p className="text-slate-200">
                    The Camsik Delivery app collects <strong>precise and approximate location data</strong> both in the <strong>foreground</strong> (while the app is open and visible on screen) and in the <strong>background</strong> (even when the app is minimized or the screen is turned off), subject to the following strict conditions:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li>
                      <strong>Automated Task Dispatching:</strong> To allocate pickup requests and delivery shipments based on proximity, ensuring minimal transit time and optimal fuel efficiency.
                    </li>
                    <li>
                      <strong>Customer ETA &amp; Live Tracking:</strong> To compute accurate transit ETAs and notify customers when a diagnostic technician is approaching their doorstep for gadget verification.
                    </li>
                    <li>
                      <strong>On-Duty Safety &amp; High-Value Transit Assurance:</strong> Because executives handle high-value electronics (DSLR cameras, lenses, MacBooks, flagships), background telemetry provides transit route verification and anti-theft deterrence during active consignments.
                    </li>
                    <li>
                      <strong>Turn-by-Turn Routing:</strong> To facilitate navigation to seller and customer residences.
                    </li>
                  </ul>
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-medium">
                    Important Control: Background location collection is activated ONLY when your toggle status is set to &quot;Active On Duty • Online&quot;. When you toggle to &quot;Currently Offline&quot; or sign out, location tracking terminates immediately.
                  </div>
                </div>
              </section>

              <section id="camera-permissions" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Camera size={20} className="text-purple-400" />
                  3. Camera &amp; Inspection Media Access
                </h2>
                <p>
                  The Camsik Delivery app requests Camera access for legitimate on-field verification purposes:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                  <li>Photographing gadget exterior condition, screen scratches, camera sensor glass, and lens barrels during the 45-point doorstep diagnostic inspection.</li>
                  <li>Scanning package barcodes, consignment waybills, and QR codes at distribution hubs.</li>
                  <li>Capturing seller ID proof and signed handover forms to establish authentic proof of transfer.</li>
                </ul>
              </section>

              <section id="delivery-personal-data" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Truck size={20} className="text-purple-400" />
                  4. Executive Identification &amp; Vehicle Data
                </h2>
                <p>To register you in the fleet, we collect:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <h4 className="font-semibold text-white uppercase tracking-wider mb-2 text-purple-300">Personal &amp; KYC Records</h4>
                    <p className="text-slate-400 leading-relaxed">Full legal name, mobile phone number (OTP verified), emergency contact details, Aadhaar / Voter ID, and valid Driving License.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <h4 className="font-semibold text-white uppercase tracking-wider mb-2 text-purple-300">Fleet &amp; Vehicle Details</h4>
                    <p className="text-slate-400 leading-relaxed">Vehicle type (two-wheeler / van), vehicle registration number plate, and insurance validity to ensure compliance with transport regulations.</p>
                  </div>
                </div>
              </section>

              <section id="earnings-payouts" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard size={20} className="text-purple-400" />
                  5. Earnings, Bank Transfers &amp; Fuel Allowances
                </h2>
                <p>
                  Bank account numbers, IFSC codes, and UPI IDs provided by delivery executives are stored with AES-256 encryption. They are used exclusively to disburse weekly earnings, per-pickup inspection incentives, and distance-based fuel reimbursements.
                </p>
              </section>

              <section id="executive-rights" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-purple-400" />
                  6. Executive Rights &amp; Shift Control
                </h2>
                <p>
                  Delivery executives maintain complete control over when they share location data. You can toggle offline at any moment via the Profile tab. Under the DPDP Act 2023, you may request corrections to your profile or request account decommissioning upon settlement of pending payouts.
                </p>
              </section>

              <section id="grievance" className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertCircle size={20} className="text-purple-400" />
                  7. Grievance Officer &amp; Fleet Operations
                </h2>
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5">
                  <p className="font-bold text-white text-sm">Logistics &amp; Fleet Compliance Cell</p>
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
