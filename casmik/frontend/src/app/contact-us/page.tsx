'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Navigation,
  Copy,
  Check,
  ExternalLink,
  Car,
  Train,
  HelpCircle,
  ArrowRight,
  Headphones,
  Calendar,
  Zap,
  Award
} from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';

const INQUIRY_TYPES = [
  { id: 'sell', label: '📱 Sell Phone / Laptop / Camera', desc: 'Instant valuation & free doorstep pickup' },
  { id: 'exchange', label: '🔄 1-Step Device Exchange', desc: 'Trade-in old gadget with extra bonus' },
  { id: 'buy', label: '🛒 Buy Refurbished Tech', desc: 'Warranty & 45-point certification queries' },
  { id: 'studio', label: '🏢 Corporate & Bulk Liquidation', desc: 'Multi-device office / studio sale' },
  { id: 'support', label: '💬 General Customer Support', desc: 'Order tracking & payout questions' },
];

const FAQS = [
  {
    q: 'Do I need an appointment before visiting the Mumbai hub?',
    a: 'Walk-ins are always welcome during our working hours (9:00 AM – 9:00 PM IST, Monday to Sunday). However, booking in advance via WhatsApp or phone guarantees zero waiting time with our certified diagnostic technician.'
  },
  {
    q: 'Can I choose free doorstep pickup instead of visiting in person?',
    a: 'Absolutely! If you are located in Mumbai, Thane, Navi Mumbai, Pune, Delhi NCR, Bangalore, or any of our 200+ covered cities, a certified Camsik executive will visit your home or office, inspect the device, and transfer your payout instantly on the spot.'
  },
  {
    q: 'What accessories should I bring to get the maximum valuation?',
    a: 'To receive the top estimated price, bring original charger, power adapters, original box, and invoice/bill if available. Missing accessories slightly adjust the final offer.'
  },
  {
    q: 'How is the payout transferred when selling at the office?',
    a: 'Payouts are made instantly via IMPS Bank Transfer, NEFT, or UPI (Google Pay, PhonePe, Paytm). The funds reflect in your bank account before you hand over the device.'
  }
];

export default function ContactUsPage() {
  const [selectedInquiry, setSelectedInquiry] = useState('sell');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    preferredContact: 'whatsapp',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const addressText = "A-315, Shanti Shopping Center, Near Mira Road Station, Mumbai, Maharashtra - 401107";
  const mapDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=Shanti+Shopping+Center+Mira+Road+Mumbai+401107";
  const googleMapEmbedSrc = "https://maps.google.com/maps?q=Shanti%20Shopping%20Center,%20Mira%20Road,%20Mumbai,%20Maharashtra%20401107&t=&z=16&ie=UTF8&iwloc=&output=embed";

  const handleCopyAddress = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(addressText);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <CustomerHeader />

      {/* Main Content Area */}
      <section className="flex-1 py-6 sm:py-8 lg:py-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-10 sm:space-y-12">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight size={13} />
            <span className="text-foreground font-bold">Contact Us</span>
          </nav>

          {/* Hero Header Banner */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-10 lg:p-12 overflow-hidden shadow-xl border border-slate-700/40">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mb-20" />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
                <Sparkles size={14} className="text-emerald-400" />
                Direct Tech Valuation &amp; ReCommerce Experience Desk
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-tight">
                Let&apos;s Connect with Our <span className="text-emerald-400">Tech Specialists</span>
              </h1>
              <p className="mt-3 sm:mt-4 text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl">
                Looking to sell used smartphones, MacBooks, tablets, DSLR bodies, trade-in lenses, or visit our registered Mumbai inspection hub? We&apos;re here 7 days a week.
              </p>
            </div>

            {/* Quick Value Metrics Bar */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10 text-xs sm:text-sm">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="font-bold text-white">&lt; 30 Min Response</p>
                  <p className="text-slate-400 text-xs">Rapid valuation quote</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="font-bold text-white">Instant IMPS / UPI</p>
                  <p className="text-slate-400 text-xs">Spot payout guarantee</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Building2 size={18} />
                </div>
                <div>
                  <p className="font-bold text-white">Mumbai Walk-in Hub</p>
                  <p className="text-slate-400 text-xs">A-315, Shanti Shopping</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                  <Navigation size={18} />
                </div>
                <div>
                  <p className="font-bold text-white">12+ Major Cities</p>
                  <p className="text-slate-400 text-xs">Doorstep pickup network</p>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Two-Column Grid: Contact Info + Message Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Left Column: Official Contact Channels */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                    <Sparkles size={13} className="text-emerald-600" />
                    Official Headquarters
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Open Today
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                  Contact Details
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mb-6">
                  Direct channels for instant tech valuations, trade-in approvals, and order verification inquiries.
                </p>

                <div className="space-y-4">
                  {/* Address Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-emerald-300 transition-colors group">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <MapPin size={22} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                            Registered Office &amp; Hub
                          </h3>
                          <button
                            type="button"
                            onClick={handleCopyAddress}
                            className="text-xs font-semibold text-slate-600 hover:text-emerald-600 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-xs"
                            title="Copy full address"
                          >
                            {copiedAddress ? (
                              <>
                                <Check size={12} className="text-emerald-600" />
                                <span className="text-emerald-600 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                          A-315, Shanti Shopping Center, Near Mira Road Station
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                          Mumbai, Maharashtra - 401107
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
                            <Train size={12} /> 2 mins from Mira Road Stn (Platform 1)
                          </span>
                          <a
                            href={mapDirectionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-800 font-bold hover:bg-slate-300 transition-colors"
                          >
                            <ExternalLink size={12} /> Map Directions
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone Hotline */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-blue-300 transition-colors group">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 shadow-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Phone size={22} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                            Direct Support &amp; Valuation Line
                          </h3>
                        </div>
                        <a
                          href="tel:+918976000010"
                          className="text-lg sm:text-xl font-black text-slate-900 hover:text-blue-600 transition-colors block"
                        >
                          +91 8976000010
                        </a>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          <span>Monday – Sunday: <strong>9:00 AM – 9:00 PM IST</strong></span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-indigo-300 transition-colors group">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Mail size={22} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                            Official Inquiries &amp; Payouts
                          </h3>
                        </div>
                        <a
                          href="mailto:sellatcamsik@gmail.com"
                          className="text-base sm:text-lg font-black text-slate-900 hover:text-indigo-600 transition-colors block break-all"
                        >
                          sellatcamsik@gmail.com
                        </a>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Zap size={12} className="text-amber-500" />
                          <span>Average response: under 30 minutes</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: WhatsApp & Call */}
              <div className="pt-4 border-t border-slate-200/80 space-y-3">
                <a
                  href="https://wa.me/918976000010?text=Hi%20Camsik%20team,%20I%20want%20to%20sell/trade-in%20my%20device"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 btn-press"
                >
                  <MessageCircle size={20} />
                  Chat on WhatsApp (+91 8976000010)
                </a>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <a
                    href="tel:+918976000010"
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone size={14} /> Call Office
                  </a>
                  <a
                    href={mapDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation size={14} /> View On Map
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Send Message & Inquiry Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-sm">
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200 mb-3">
                  <Headphones size={13} className="text-blue-600" />
                  Fast Response Form
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Submit Your Inquiry
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Tell us what smartphone, laptop, tablet, camera, or gear you are dealing with and our valuation team will connect promptly.
                </p>
              </div>

              {/* Inquiry Reason Pills */}
              <div className="mb-6">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2.5">
                  Select Topic / Inquiry Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {INQUIRY_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedInquiry(type.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedInquiry === type.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {submitted ? (
                <div className="p-8 rounded-3xl bg-emerald-50/90 border border-emerald-200 text-center animate-fade-in my-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-950 mb-2">
                    Inquiry Submitted Successfully!
                  </h3>
                  <p className="text-sm text-emerald-800 max-w-md mx-auto mb-6 leading-relaxed">
                    Thank you, <strong>{formData.name}</strong>. Your inquiry regarding <strong>{INQUIRY_TYPES.find(t => t.id === selectedInquiry)?.label}</strong> has been routed to our Mumbai desk. A Camsik advisor will reach out to you via <strong>{formData.phone}</strong> shortly.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', phone: '', company: '', preferredContact: 'whatsapp', message: '' });
                      }}
                      className="px-6 py-2.5 rounded-xl bg-white text-emerald-700 font-extrabold text-xs uppercase tracking-wider border border-emerald-300 hover:bg-emerald-100 transition-colors"
                    >
                      Send Another Inquiry
                    </button>
                    <a
                      href={`https://wa.me/918976000010?text=Hi%20Camsik,%20I%20just%20submitted%20an%20inquiry%20for%20${encodeURIComponent(formData.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle size={14} /> Open in WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="8976000010"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="rahul@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Company / Studio Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Wedding Studio / Production House"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Preferred Reply Mode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Preferred Way To Receive Valuation Offer
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                        { id: 'phone', label: 'Phone Call', icon: Phone },
                        { id: 'email', label: 'Email', icon: Mail }
                      ].map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = formData.preferredContact === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, preferredContact: mode.id })}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <Icon size={14} />
                            {mode.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Message &amp; Device Details <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Mention device (e.g. iPhone 15 Pro, MacBook M3, Sony A7 IV), storage, condition, accessories, or questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-press disabled:opacity-60"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={16} /> Send Valuation Inquiry
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Interactive Google Map Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 lg:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200 mb-2">
                  <MapPin size={13} className="text-emerald-600" />
                  Live Location &amp; Navigation
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Visit Our Mumbai Inspection Center
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                  Drop by our registered facility for on-the-spot physical inspection, hardware diagnostics, and instant bank payout.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={mapDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <Navigation size={14} className="text-emerald-400" />
                  Open in Google Maps
                </a>
              </div>
            </div>

            {/* Map Canvas with Floating Info Overlay */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
              {/* Google Maps Embed iframe */}
              <div className="w-full h-[380px] sm:h-[460px] lg:h-[500px]">
                <iframe
                  title="Camsik Official Mumbai Office Location"
                  src={googleMapEmbedSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full grayscale-[15%] contrast-[105%]"
                />
              </div>

              {/* Floating Overlay Badge on Map (Desktop & Tablet) */}
              <div className="hidden sm:block absolute top-4 left-4 max-w-sm bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200/80 z-10 text-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    Camsik Registered Office
                  </span>
                </div>
                <p className="font-bold text-slate-800 leading-snug">
                  A-315, Shanti Shopping Center
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Near Mira Road Railway Station, Mumbai 401107
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-slate-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" /> 9:00 AM – 9:00 PM
                  </span>
                  <a
                    href={mapDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                  >
                    Directions <ChevronRight size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Travel & Commute Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Train size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    By Local Train
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    100 meters (2-min walk) from <strong>Mira Road Station</strong> (Western Line, Platform 1 exit).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Car size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    By Car / Cab
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Direct access from <strong>Western Express Highway (WEH)</strong> via Mira-Bhayandar Flyover.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <Building2 size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Building Landmark
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Inside <strong>Shanti Shopping Center</strong>, Wing A, 3rd Floor, Room 315. Ample parking space.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Step Walk-In Selling Process */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl">
            <div className="max-w-2xl mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
                <Award size={13} />
                Walk-In Experience
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                How Walk-In Selling &amp; Testing Works
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Transparent 15-minute process from gear hand-in to instant funds transfer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 relative">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-lg flex items-center justify-center mb-4">
                  1
                </div>
                <h3 className="text-base font-black text-white mb-2">
                  Bring Your Device &amp; ID Proof
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Bring your phone, laptop, tablet, or camera body, accessories, charger, and any Govt ID (Aadhaar / PAN / Driving License).
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 relative">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 font-black text-lg flex items-center justify-center mb-4">
                  2
                </div>
                <h3 className="text-base font-black text-white mb-2">
                  10-Min Live Technical Check
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Our certified technician conducts 45-point hardware diagnostics, tests battery &amp; display health, and verifies certified data wipe in front of you.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 relative">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 font-black text-lg flex items-center justify-center mb-4">
                  3
                </div>
                <h3 className="text-base font-black text-white mb-2">
                  Instant Bank / UPI Credit
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Approve your quote and receive the agreed amount instantly through verified IMPS or UPI before leaving the counter.
                </p>
              </div>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 lg:p-10 shadow-sm">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200 mb-2">
                <HelpCircle size={13} className="text-slate-600" />
                Frequently Asked Questions
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Visiting &amp; Support Questions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isOpen
                        ? 'bg-slate-50/80 border-emerald-400 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-bold text-slate-900">
                        {faq.q}
                      </h3>
                      <ChevronRight
                        size={16}
                        className={`shrink-0 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-90 text-emerald-600' : ''
                        }`}
                      />
                    </div>
                    {isOpen && (
                      <p className="text-xs sm:text-sm text-slate-600 mt-3 pt-3 border-t border-slate-200/60 leading-relaxed animate-fade-in">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* Floating Call & WhatsApp Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <a
          href="https://wa.me/918976000010?text=Hi%20Camsik%20team,%20I%20have%20an%20inquiry"
          target="_blank"
          rel="noopener noreferrer"
          className="w-13 h-13 rounded-full bg-emerald-500 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform ring-4 ring-emerald-500/20 group relative"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={26} />
          <span className="hidden group-hover:block absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            Chat on WhatsApp
          </span>
        </a>
        <a
          href="tel:+918976000010"
          className="w-13 h-13 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform ring-4 ring-blue-600/20 group relative"
          aria-label="Call Camsik Support"
        >
          <Phone size={24} />
          <span className="hidden group-hover:block absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            Call +91 8976000010
          </span>
        </a>
      </div>

      <CustomerFooter />
    </main>
  );
}
