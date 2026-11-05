'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Camera,
  Layers,
  Video,
  Film,
  Compass,
  Sparkles,
  CheckCircle2,
  LogIn,
  ShieldCheck,
  Phone,
  User,
  Package,
  LogOut,
} from 'lucide-react';
import { deviceModels, brands, categories } from '@/lib/casmikData';
import { getCurrentUser, logoutUser, CustomerUser } from '@/lib/auth';
import NotificationBell from '@/components/NotificationBell';

const popularCities = [
  { id: 'all', name: 'All Cities', areas: [] },
  { id: 'delhi', name: 'Delhi NCR', areas: ['Connaught Place', 'Karol Bagh', 'Dwarka', 'Rohini', 'Noida', 'Gurgaon'] },
  { id: 'mumbai', name: 'Mumbai', areas: ['Andheri West', 'Bandra West', 'Dadar', 'Thane West', 'Borivali'] },
  { id: 'bengaluru', name: 'Bengaluru', areas: ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'Jayanagar'] },
  { id: 'hyderabad', name: 'Hyderabad', areas: ['Gachibowli', 'Hitec City', 'Banjara Hills', 'Jubilee Hills', 'Madhapur'] },
  { id: 'pune', name: 'Pune', areas: ['Kothrud', 'Baner', 'Viman Nagar', 'Hinjewadi', 'Wakad'] },
  { id: 'chennai', name: 'Chennai', areas: ['T Nagar', 'Velachery', 'Anna Nagar', 'Adyar', 'OMR'] },
  { id: 'kolkata', name: 'Kolkata', areas: ['Salt Lake', 'Park Street', 'New Town', 'Ballygunge'] },
  { id: 'ahmedabad', name: 'Ahmedabad', areas: ['Navrangpura', 'Satellite', 'Bodakdev', 'SG Highway'] },
  { id: 'jaipur', name: 'Jaipur', areas: ['Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'C-Scheme'] },
  { id: 'chandigarh', name: 'Chandigarh', areas: ['Sector 17', 'Sector 35', 'Sector 22', 'Mohali'] },
  { id: 'lucknow', name: 'Lucknow', areas: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar'] },
];

interface SearchResult {
  id: string;
  type: 'model' | 'brand';
  name: string;
  brandName?: string;
  image?: string;
  categorySlug?: string;
  slug?: string;
}

export default function CustomerHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [activeCityObj, setActiveCityObj] = useState(popularCities[0]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<CustomerUser | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    const onAuthChange = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener('casmik_auth_change', onAuthChange);
    return () => window.removeEventListener('casmik_auth_change', onAuthChange);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Load saved city from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('camsik_city');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name) {
          setSelectedCity(parsed.area ? `${parsed.name} (${parsed.area})` : parsed.name);
        }
      }
    } catch {}
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q || q.trim().length < 1) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const lower = q.toLowerCase();
    const results: SearchResult[] = [];

    // Search camera brands
    brands
      .filter((b) => b.name.toLowerCase().includes(lower))
      .slice(0, 3)
      .forEach((b) => {
        results.push({
          id: `brand-${b.id}`,
          type: 'brand',
          name: b.name,
          image: b.logo,
          slug: b.slug,
        });
      });

    // Search camera models
    deviceModels
      .filter((m) => m.name.toLowerCase().includes(lower))
      .slice(0, 6)
      .forEach((m) => {
        const brand = brands.find((b) => b.id === m.brandId);
        results.push({
          id: `model-${m.id}`,
          type: 'model',
          name: m.name,
          brandName: brand?.name,
          image: m.image,
          slug: m.slug,
        });
      });

    setSearchResults(results.slice(0, 8));
    setShowResults(true);
  };

  const handleCitySelect = (city: typeof popularCities[0], area?: string) => {
    setActiveCityObj(city);
    if (city.id === 'all') {
      setSelectedCity('All Cities');
      setSelectedArea(null);
      localStorage.setItem('camsik_city', JSON.stringify({ id: 'all', name: 'All Cities' }));
      setCityModalOpen(false);
      return;
    }
    if (area) {
      setSelectedCity(`${city.name} (${area})`);
      setSelectedArea(area);
      localStorage.setItem('camsik_city', JSON.stringify({ id: city.id, name: city.name, area }));
      setCityModalOpen(false);
    } else if (city.areas.length === 0) {
      setSelectedCity(city.name);
      setSelectedArea(null);
      localStorage.setItem('camsik_city', JSON.stringify({ id: city.id, name: city.name }));
      setCityModalOpen(false);
    }
  };

  const filteredCities = popularCities.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.areas.some((a) => a.toLowerCase().includes(citySearch.toLowerCase()))
  );

  return (
    <>
      {/* Top Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 w-full overflow-x-clip ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border/80'
            : 'bg-white border-b border-border'
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-8 xl:px-10 w-full">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4 lg:gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                <div className="relative flex items-center justify-center">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.2} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center tracking-tight leading-none">
                  <span className="font-black text-xl sm:text-2xl text-slate-900">CAM</span>
                  <span className="font-black text-xl sm:text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    SIK
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5 leading-none hidden xs:block">
                  Electronics & Cameras
                </span>
              </div>
            </Link>

            {/* Live Search Bar — Desktop */}
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl relative">
              <div className="w-full flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 shadow-sm focus-within:border-purple-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-600/10 transition-all">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) setShowResults(true);
                  }}
                  placeholder="Search phones, laptops, tablets, cameras (e.g. iPhone 16 Pro, MacBook M3, Sony A7...)"
                  className="w-full text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowResults(false);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-2 duration-200">
                  {searchResults.length > 0 ? (
                    <div className="p-2 max-h-96 overflow-y-auto divide-y divide-slate-100">
                      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Matching Devices & Brands
                      </div>
                      {searchResults.map((res) => (
                        <Link
                          key={res.id}
                          href={
                            res.type === 'model'
                              ? `/sell-device-get-quote?model=${res.slug}`
                              : `/sell-device-get-quote?brand=${res.slug}`
                          }
                          onClick={() => setShowResults(false)}
                          className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-purple-50/70 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-lg bg-slate-100 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200">
                            {res.image ? (
                              <img
                                src={res.image}
                                alt={res.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.src = '/assets/images/categories/dslr.png';
                                }}
                              />
                            ) : (
                              <Camera className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-purple-700 truncate">
                              {res.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {res.type === 'model' ? `${res.brandName || ''} · Get Instant Quote` : 'Device Brand'}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-slate-500">
                      No tech or camera devices found matching &ldquo;{searchQuery}&rdquo;.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Actions: City Selector + NotificationBell + Login + CTA + Mobile hamburger */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* City Selector Button */}
              <button
                type="button"
                onClick={() => setCityModalOpen(true)}
                className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/60 text-slate-800 text-xs sm:text-sm font-semibold transition-all duration-150 flex-shrink-0"
              >
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
                <span className="max-w-[70px] sm:max-w-[110px] truncate text-xs sm:text-sm">{selectedCity}</span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0" />
              </button>

              {/* Real-time Web & App Notifications with chime sound */}
              <NotificationBell role="user" />

              {/* Login / Auth Dropdown or Button */}
              {user ? (
                <div ref={userDropdownRef} className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 text-slate-800 text-xs sm:text-sm font-semibold transition-all duration-150"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[90px] truncate font-bold text-purple-900">
                      {user.name || user.phone}
                    </span>
                    <ChevronDown size={14} className={`text-purple-600 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in-50 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name || 'Verified Customer'}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.phone}</p>
                      </div>
                      <Link
                        href="/my-orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        <Package size={15} className="text-purple-600" />
                        <span>My Orders & Exchanges</span>
                      </Link>
                      <Link
                        href="/track-order"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        <MapPin size={15} className="text-indigo-600" />
                        <span>Track Active Order</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logoutUser();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left mt-1"
                      >
                        <LogOut size={15} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-sm font-semibold text-slate-700 hover:text-purple-700 transition-colors"
                >
                  <LogIn size={15} />
                  <span>Login</span>
                </Link>
              )}

              {/* Instant Sell CTA - hidden on small mobile to keep header clean and prevent right-shift */}
              <Link
                href="/sell-device-get-quote"
                className="hidden sm:inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 hover:shadow-purple-600/30 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sell Device</span>
              </Link>

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Second Navigation Row — Desktop Mega Navigation */}
          <div className="hidden lg:flex items-center justify-between border-t border-slate-100 py-2.5">
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-900 hover:text-purple-600 hover:bg-purple-50/60 transition-colors"
              >
                Home
              </Link>

              {/* Sell Device Dropdown */}
              <div ref={megaMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  onMouseEnter={() => setMegaMenuOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    megaMenuOpen
                      ? 'text-purple-700 bg-purple-50'
                      : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50/60'
                  }`}
                >
                  <Sparkles size={15} className="text-purple-600" />
                  <span>Sell Devices & Gear</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mega Dropdown Menu */}
                {megaMenuOpen && (
                  <div
                    onMouseLeave={() => setMegaMenuOpen(false)}
                    className="absolute top-full left-0 mt-2 w-[920px] bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 z-50 grid grid-cols-5 gap-5 animate-in fade-in-50 slide-in-from-top-2 duration-200"
                  >
                    {/* Column 1: Smartphones */}
                    <div>
                      <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                        <span className="text-base">📱</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Smartphones</h4>
                      </div>
                      <ul className="space-y-1.5">
                        {[
                          { name: 'Apple iPhones', brand: 'brand-apple-phone' },
                          { name: 'Samsung Galaxy', brand: 'brand-samsung-phone' },
                          { name: 'Google Pixel', brand: 'brand-google-phone' },
                          { name: 'OnePlus Series', brand: 'brand-oneplus-phone' },
                          { name: 'Xiaomi Series', brand: 'brand-xiaomi-phone' },
                        ].map((p) => (
                          <li key={p.name}>
                            <Link
                              href={`/sell-device-get-quote?brand=${p.brand}&cat=cat-smartphone`}
                              onClick={() => setMegaMenuOpen(false)}
                              className="flex items-center justify-between text-xs font-medium text-slate-600 hover:text-purple-600 hover:translate-x-1 transition-all py-1"
                            >
                              <span>{p.name}</span>
                              <ChevronRight size={12} className="text-slate-300" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Column 2: Laptops */}
                    <div>
                      <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                        <span className="text-base">💻</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Laptops</h4>
                      </div>
                      <ul className="space-y-1.5">
                        {[
                          { name: 'Apple MacBooks', brand: 'brand-apple-laptop' },
                          { name: 'Dell XPS & Inspiron', brand: 'brand-dell-laptop' },
                          { name: 'HP Spectre & Envy', brand: 'brand-hp-laptop' },
                          { name: 'Lenovo ThinkPads', brand: 'brand-lenovo-laptop' },
                          { name: 'ASUS ROG & ZenBook', brand: 'brand-asus-laptop' },
                        ].map((l) => (
                          <li key={l.name}>
                            <Link
                              href={`/sell-device-get-quote?brand=${l.brand}&cat=cat-laptop`}
                              onClick={() => setMegaMenuOpen(false)}
                              className="flex items-center justify-between text-xs font-medium text-slate-600 hover:text-purple-600 hover:translate-x-1 transition-all py-1"
                            >
                              <span>{l.name}</span>
                              <ChevronRight size={12} className="text-slate-300" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Column 3: Tablets */}
                    <div>
                      <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                        <span className="text-base">📟</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Tablets & iPads</h4>
                      </div>
                      <ul className="space-y-1.5">
                        {[
                          { name: 'Apple iPad Pro / Air', brand: 'brand-apple-tablet' },
                          { name: 'Galaxy Tab S-Series', brand: 'brand-samsung-tablet' },
                          { name: 'OnePlus Pad', brand: 'brand-oneplus-tablet' },
                          { name: 'Lenovo Tablets', brand: 'brand-lenovo-tablet' },
                        ].map((t) => (
                          <li key={t.name}>
                            <Link
                              href={`/sell-device-get-quote?brand=${t.brand}&cat=cat-tablet`}
                              onClick={() => setMegaMenuOpen(false)}
                              className="flex items-center justify-between text-xs font-medium text-slate-600 hover:text-purple-600 hover:translate-x-1 transition-all py-1"
                            >
                              <span>{t.name}</span>
                              <ChevronRight size={12} className="text-slate-300" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Column 4: Cameras */}
                    <div>
                      <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                        <Camera className="w-4 h-4 text-purple-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">DSLR & Mirrorless</h4>
                      </div>
                      <ul className="space-y-1.5">
                        {['Canon', 'Nikon', 'Sony', 'Fujifilm', 'LUMIX'].map((b) => (
                          <li key={b}>
                            <Link
                              href={`/sell-device-get-quote?brand=${b.toLowerCase()}&cat=cat-dslr`}
                              onClick={() => setMegaMenuOpen(false)}
                              className="flex items-center justify-between text-xs font-medium text-slate-600 hover:text-purple-600 hover:translate-x-1 transition-all py-1"
                            >
                              <span>{b} Cameras</span>
                              <ChevronRight size={12} className="text-slate-300" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Column 5: Lenses & Action */}
                    <div>
                      <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Lenses & Action</h4>
                      </div>
                      <ul className="space-y-1.5">
                        {[
                          { name: 'Sony & Canon Lenses', brand: 'sony', cat: 'cat-lens' },
                          { name: 'Sigma & Tamron Lenses', brand: 'sigma', cat: 'cat-lens' },
                          { name: 'GoPro Hero Action', brand: 'gopro', cat: 'cat-action-camera' },
                          { name: 'DJI Osmo & Gimbals', brand: 'dji', cat: 'cat-action-camera' },
                          { name: 'Insta360 360 Cams', brand: 'insta360', cat: 'cat-action-camera' },
                        ].map((l) => (
                          <li key={l.name}>
                            <Link
                              href={`/sell-device-get-quote?brand=${l.brand}&cat=${l.cat}`}
                              onClick={() => setMegaMenuOpen(false)}
                              className="flex items-center justify-between text-xs font-medium text-slate-600 hover:text-indigo-600 hover:translate-x-1 transition-all py-1"
                            >
                              <span>{l.name}</span>
                              <ChevronRight size={12} className="text-slate-300" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/buy-refurbished"
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-purple-600 hover:bg-purple-50/60 transition-colors"
              >
                Buy Refurbished
              </Link>
              <Link
                href="/rental-cameras"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/70 transition-colors"
              >
                <Camera size={14} className="text-rose-600" />
                <span>Rent Cameras</span>
                <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-[10px] font-black text-rose-700 uppercase">NEW</span>
              </Link>
              <Link
                href="/exchange-device"
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-purple-600 hover:bg-purple-50/60 transition-colors"
              >
                Exchange Device
              </Link>
              <Link
                href="/my-orders"
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-purple-600 hover:bg-purple-50/60 transition-colors"
              >
                My Orders
              </Link>
              <Link
                href="/track-order"
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-purple-600 hover:bg-purple-50/60 transition-colors"
              >
                Track Order
              </Link>
              <Link
                href="/how-it-works"
                className="px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold text-slate-700 hover:text-purple-600 hover:bg-purple-50/60 transition-colors whitespace-nowrap"
              >
                How It Works
              </Link>
              <Link
                href="/why-camsik"
                className="px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold text-slate-700 hover:text-purple-600 hover:bg-purple-50/60 transition-colors whitespace-nowrap"
              >
                Why Camsik
              </Link>
              <Link
                href="/faq"
                className="px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold text-slate-700 hover:text-purple-600 hover:bg-purple-50/60 transition-colors whitespace-nowrap"
              >
                FAQ
              </Link>
              <Link
                href="/contact-us"
                className="px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold text-slate-700 hover:text-purple-600 hover:bg-purple-50/60 transition-colors whitespace-nowrap"
              >
                Contact Us
              </Link>
            </nav>

            {/* Help & Support pill */}
            <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0 pl-3">
              <span className="hidden xl:inline-flex items-center gap-1 font-medium text-emerald-600 whitespace-nowrap">
                <ShieldCheck size={14} /> 100% Secure Valuation
              </span>
              <span className="hidden xl:inline">•</span>
              <a
                href="tel:+918976000010"
                className="font-bold text-slate-700 hover:text-primary transition-colors inline-flex items-center gap-1 whitespace-nowrap"
              >
                <Phone size={12} className="text-primary" /> +91 8976000010
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* City Selection Modal — Cashify Style */}
      {cityModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Select Your City</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your location to get accurate pickup dates and local doorstep technicians
                </p>
              </div>
              <button
                onClick={() => setCityModalOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* City Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Search city or locality (e.g. Bengaluru, Connaught Place, Koramangala...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10"
                />
              </div>
            </div>

            {/* Cities Grid */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Popular Cities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {filteredCities.map((city) => {
                    const isSelected = activeCityObj.id === city.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => handleCitySelect(city)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/80 text-purple-800 font-bold shadow-sm'
                            : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50 text-slate-700 font-medium'
                        }`}
                      >
                        <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="text-xs truncate">{city.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 ml-auto flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Localities Section (shown if selected city has localities) */}
              {activeCityObj && activeCityObj.areas.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Localities in {activeCityObj.name}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCitySelect(activeCityObj)}
                      className={`p-2.5 rounded-lg border text-xs text-left font-medium transition-colors ${
                        !selectedArea && activeCityObj.id === 'all'
                          ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      All Localities
                    </button>
                    {activeCityObj.areas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleCitySelect(activeCityObj, area)}
                        className={`p-2.5 rounded-lg border text-xs text-left font-medium transition-colors ${
                          selectedArea === area
                            ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Offcanvas Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden overflow-hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 bottom-0 right-0 w-[85vw] sm:w-80 max-w-[340px] bg-white shadow-2xl p-5 sm:p-6 flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-sm">
                    C
                  </div>
                  <span className="font-extrabold text-lg text-slate-900">CAMSIK</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-slate-900 hover:bg-purple-50 hover:text-purple-600"
                >
                  <span>Home</span>
                </Link>

                <div className="pt-2 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Device Categories
                </div>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/sell-device-get-quote?cat=${c.id}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-600"
                  >
                    <span className="flex items-center gap-2.5">
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                    </span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>
                ))}

                <div className="pt-4 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  More Services
                </div>
                <Link
                  href="/buy-refurbished"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-purple-50"
                >
                  Buy Refurbished Gear
                </Link>
                <Link
                  href="/rental-cameras"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50"
                >
                  <Camera size={16} className="text-rose-600" />
                  <span>Rent Cameras &amp; Gear</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-[10px] font-black text-rose-700 ml-auto">NEW</span>
                </Link>
                <Link
                  href="/exchange-device"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-purple-50"
                >
                  Exchange Device
                </Link>
                <Link
                  href="/my-orders"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-50 font-bold"
                >
                  My Orders & Exchanges
                </Link>
                <Link
                  href="/track-order"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-purple-50"
                >
                  Track Order
                </Link>
                <Link
                  href="/how-it-works"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-purple-50"
                >
                  How It Works
                </Link>
                <Link
                  href="/why-camsik"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-purple-50"
                >
                  Why Camsik
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-purple-50"
                >
                  FAQ
                </Link>
                <Link
                  href="/contact-us"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-purple-50"
                >
                  Contact Us
                </Link>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100">
              {user ? (
                <div className="space-y-2 mb-2.5">
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{user.name || 'Account'}</p>
                      <p className="text-[11px] text-slate-500">{user.phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logoutUser();
                        setMobileOpen(false);
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <LogOut size={13} />
                      Logout
                    </button>
                  </div>
                  <Link
                    href="/my-orders"
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-100/70 text-purple-800 text-sm font-bold hover:bg-purple-200/70"
                  >
                    <Package size={16} />
                    <span>View My Orders</span>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 hover:bg-slate-50 mb-2.5"
                >
                  <LogIn size={16} />
                  <span>Account Login</span>
                </Link>
              )}
              <Link
                href="/sell-device-get-quote"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-bold shadow-md shadow-purple-600/25"
              >
                <Sparkles size={16} />
                <span>Sell Device & Get Instant Quote</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}