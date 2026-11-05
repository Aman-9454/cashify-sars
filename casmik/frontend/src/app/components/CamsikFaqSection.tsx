'use client';
import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  HelpCircle, 
  Sparkles, 
  PhoneCall, 
  Search, 
  X, 
  MessageCircle, 
  Smartphone, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Laptop,
  Camera,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';

interface FAQ {
  id: string;
  category: 'Selling & Valuation' | 'Buying Refurbished' | 'Exchange & Upgrade' | 'Doorstep & Privacy';
  question: string;
  answer: string;
  badge: string;
}

const faqs: FAQ[] = [
  {
    id: 'faq-1',
    category: 'Selling & Valuation',
    badge: 'AI Valuation Engine',
    question: 'How is the resale price of my phone, laptop, or camera calculated on Camsik?',
    answer: 'Our proprietary pricing algorithm analyzes live secondary market demand across India, processor/sensor generation, physical cosmetics, battery cycle health, display condition (OLED burn-in, scratches), camera sensor health, and included original accessories to calculate the highest guaranteed payout.',
  },
  {
    id: 'faq-2',
    category: 'Selling & Valuation',
    badge: 'KYC & Paperwork',
    question: 'Do I need the original box and bill to sell my device on Camsik?',
    answer: 'No! An original bill and retail packaging are not mandatory. Having them adds a small value bonus, but you can sell your smartphone, MacBook, tablet, or camera with just a valid government photo ID (Aadhaar Card, Driving License, or Passport) for legal KYC compliance.',
  },
  {
    id: 'faq-3',
    category: 'Buying Refurbished',
    badge: '45-Point Inspection',
    question: 'What quality checks do certified refurbished devices go through?',
    answer: 'Every device undergoes a 45-point hardware inspection conducted by certified diagnostic technicians. We test touchscreen responsiveness, battery health (guaranteed 85%+), motherboard thermals, camera optics, biometric sensors (Face ID/Touch ID/Shutter), and speaker audio clarity. Defective units are rejected.',
  },
  {
    id: 'faq-4',
    category: 'Buying Refurbished',
    badge: 'Warranty & Returns',
    question: 'What warranty and return policy do I get when buying refurbished tech?',
    answer: 'All certified refurbished devices purchased from Camsik come with a 6 to 12 months comprehensive warranty covering manufacturing and hardware defects, along with a 7-day hassle-free replacement guarantee if the device fails to meet expectations.',
  },
  {
    id: 'faq-5',
    category: 'Exchange & Upgrade',
    badge: '1-Step Doorstep Swap',
    question: 'How does the 1-step device exchange process work?',
    answer: 'Select the upgraded device you want and enter the details of your old phone, laptop, or camera. We add an exclusive exchange bonus (up to ₹5,000) directly to your trade-in credit. Our specialist arrives at your doorstep with your upgraded device, inspects your old gadget, and you pay only the remaining balance on the spot.',
  },
  {
    id: 'faq-6',
    category: 'Exchange & Upgrade',
    badge: 'Cashback Balance',
    question: 'What happens if my old gadget is worth more than the device I want to buy?',
    answer: 'If your trade-in valuation exceeds the cost of your selected upgrade, Camsik pays YOU the remaining balance! The technician immediately transfers the surplus cash to your UPI or bank account right at your doorstep.',
  },
  {
    id: 'faq-7',
    category: 'Doorstep & Privacy',
    badge: 'DoD 5220.22-M Wipe',
    question: 'How is my private data and photos protected before device resale?',
    answer: 'Data security is our highest priority. Before any device leaves your hands, our technician performs a certified DoD 5220.22-M military-grade data sanitization wiping all internal SSDs, storage buffers, and user accounts. You receive a digitally signed legal bill of sale and liability indemnity certificate.',
  },
  {
    id: 'faq-8',
    category: 'Doorstep & Privacy',
    badge: '100% Free Doorstep',
    question: 'Are there any pickup or cancellation fees if I decline the doorstep quote?',
    answer: 'Zero hidden fees and zero travel charges! Doorstep evaluation is 100% free across 200+ cities in India. If the final on-site quote does not meet your expectations for any reason, you can decline with zero penalty.',
  },
  {
    id: 'faq-9',
    category: 'Selling & Valuation',
    badge: '7-Day Price Lock',
    question: 'How long is my online price quote valid?',
    answer: 'Once you generate a quote on Camsik, your price is locked for 7 days. You have complete flexibility to schedule your free doorstep pickup at any convenient slot within that period without worrying about market price fluctuations.',
  },
  {
    id: 'faq-10',
    category: 'Doorstep & Privacy',
    badge: 'Instant Spot Transfer',
    question: 'When and how will I receive payment for my device?',
    answer: 'Payment is initiated immediately before the technician packs the equipment. You can choose Instant UPI (Google Pay, PhonePe, Paytm) or direct IMPS bank transfer. The technician waits until you receive the bank confirmation SMS.',
  },
];

const categories = [
  'All Questions',
  'Selling & Valuation',
  'Buying Refurbished',
  'Exchange & Upgrade',
  'Doorstep & Privacy',
] as const;

type CategoryTab = typeof categories[number];

export default function CamsikFaqSection() {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['faq-1', 'faq-3', 'faq-5']));
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('All Questions');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === 'All Questions' || faq.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section id="faq" className="py-10 lg:py-16 bg-slate-50 border-t border-slate-200/80 w-full overflow-hidden">
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-200/80 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles size={13} className="text-purple-600" />
            Got Questions? We&apos;ve Got Answers
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Everything you need to know about selling, buying refurbished tech, or exchanging devices safely on Camsik.
          </p>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 lg:w-96 shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search e.g. warranty, data wipe, exchange..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 shadow-sm transition-all text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="w-full space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.has(faq.id);
              return (
                <div
                  key={faq.id}
                  className={`w-full rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white border-purple-200 shadow-md'
                      : 'bg-white/80 hover:bg-white border-slate-200/80 shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <HelpCircle size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 block mb-0.5">
                          {faq.badge} · {faq.category}
                        </span>
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-purple-600' : ''}`}>
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
              No matching questions found for &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>

        {/* Still Have Questions Bar */}
        <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <PhoneCall size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                Have a specific gadget or questions about bulk liquidation?
              </h4>
              <p className="text-xs text-slate-500">
                Our gadget specialists are available Mon–Sun 9 AM – 9 PM to assist you.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/contact-us"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              Contact Support
            </Link>
            <a
              href="https://wa.me/918976000010"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
