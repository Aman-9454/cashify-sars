'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  Palette,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Eye,
  ShieldCheck,
  Check,
  Zap,
  ShoppingBag,
  Truck,
  Building,
  UserCheck,
  BarChart3,
  CreditCard,
  QrCode,
  DollarSign,
  ChevronRight,
  Battery,
  Wifi,
  Signal,
} from 'lucide-react';
import { THEMES_REGISTRY } from '@/lib/themesRegistry';
import { ThemeDesignTokens, PanelKey, Tenant } from '@/lib/types';

interface ThemePreviewStudioProps {
  tenant?: Tenant;
  onSave?: (updatedTokens: ThemeDesignTokens, panelOverrides?: Record<string, any>) => void;
}

const ALL_PANELS: { key: PanelKey; label: string; device: 'desktop' | 'ios' | 'android'; category: 'User' | 'Partner' | 'Delivery' | 'Admin' }[] = [
  { key: 'user_web', label: 'User Website', device: 'desktop', category: 'User' },
  { key: 'user_android', label: 'User Android App', device: 'android', category: 'User' },
  { key: 'user_ios', label: 'User iOS App', device: 'ios', category: 'User' },
  { key: 'partner_web', label: 'Partner Website', device: 'desktop', category: 'Partner' },
  { key: 'partner_android', label: 'Partner Android App', device: 'android', category: 'Partner' },
  { key: 'partner_ios', label: 'Partner iOS App', device: 'ios', category: 'Partner' },
  { key: 'delivery_web', label: 'Delivery Website', device: 'desktop', category: 'Delivery' },
  { key: 'delivery_android', label: 'Delivery Android App', device: 'android', category: 'Delivery' },
  { key: 'delivery_ios', label: 'Delivery iOS App', device: 'ios', category: 'Delivery' },
  { key: 'admin_web', label: 'Admin Website', device: 'desktop', category: 'Admin' },
  { key: 'admin_android', label: 'Admin Android App', device: 'android', category: 'Admin' },
  { key: 'admin_ios', label: 'Admin iOS App', device: 'ios', category: 'Admin' },
];

export default function ThemePreviewStudio({ tenant, onSave }: ThemePreviewStudioProps) {
  const [selectedThemeId, setSelectedThemeId] = useState<string>(tenant?.templateId || THEMES_REGISTRY[0].id);
  const activeTheme = THEMES_REGISTRY.find((t) => t.id === selectedThemeId) || THEMES_REGISTRY[0];

  const [activePanel, setActivePanel] = useState<PanelKey>('user_web');
  const [deviceFrameMode, setDeviceFrameMode] = useState<'desktop' | 'tablet' | 'ios' | 'android'>('desktop');

  // Interactive Tokens state
  const [tokens, setTokens] = useState<ThemeDesignTokens>({ ...activeTheme.tokens });
  const [panelOverrides, setPanelOverrides] = useState<Record<string, any>>(tenant?.branding?.panelOverrides || {});
  const [savedNotification, setSavedNotification] = useState(false);

  // Sync when selected theme changes
  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    const th = THEMES_REGISTRY.find((t) => t.id === themeId);
    if (th) {
      setTokens({ ...th.tokens });
    }
  };

  const currentPanelMeta = ALL_PANELS.find((p) => p.key === activePanel) || ALL_PANELS[0];

  // Auto-switch frame when selecting panel
  const handleSelectPanel = (panel: typeof ALL_PANELS[0]) => {
    setActivePanel(panel.key);
    if (panel.device === 'desktop') setDeviceFrameMode('desktop');
    else if (panel.device === 'ios') setDeviceFrameMode('ios');
    else if (panel.device === 'android') setDeviceFrameMode('android');
  };

  const handleApplyGlobally = () => {
    if (onSave) {
      onSave(tokens, panelOverrides);
    }
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Studio Header & Global Controls */}
      <div className="bg-[#101625] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">12-Panel Live Theme & Branding Studio</h2>
            <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
              Real-time Token Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate and customize all 12 web & mobile applications across Android, iOS, and Desktop frames.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {savedNotification && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Theme Applied Successfully!</span>
            </span>
          )}

          <select
            value={selectedThemeId}
            onChange={(e) => handleSelectTheme(e.target.value)}
            className="bg-[#141C2E] border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
          >
            {THEMES_REGISTRY.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.badge})
              </option>
            ))}
          </select>

          <button
            onClick={handleApplyGlobally}
            className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Globally</span>
          </button>
        </div>
      </div>

      {/* 12-Panel Navigation Tabs */}
      <div className="bg-[#101625] border border-slate-800/80 rounded-2xl p-3 shadow-xl">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-thin">
          {ALL_PANELS.map((panel) => {
            const isSelected = activePanel === panel.key;
            return (
              <button
                key={panel.key}
                onClick={() => handleSelectPanel(panel)}
                className={`px-3.5 py-2 rounded-xl flex items-center space-x-2 whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-[#141C2E] text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {panel.device === 'desktop' ? (
                  <Monitor className="w-3.5 h-3.5" />
                ) : panel.device === 'ios' ? (
                  <Smartphone className="w-3.5 h-3.5" />
                ) : (
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>{panel.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {panel.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid: Controls & Responsive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Design Token Customizer (4 Cols) */}
        <div className="lg:col-span-4 bg-[#101625] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Design Token Inspector</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{activeTheme.name}</span>
          </div>

          {/* Color Palettes */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">Color Tokens</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Primary Color</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={tokens.primaryColor}
                    onChange={(e) => setTokens({ ...tokens, primaryColor: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={tokens.primaryColor}
                    onChange={(e) => setTokens({ ...tokens, primaryColor: e.target.value })}
                    className="w-full bg-[#141C2E] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Accent / CTA</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={tokens.accentColor}
                    onChange={(e) => setTokens({ ...tokens, accentColor: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={tokens.accentColor}
                    onChange={(e) => setTokens({ ...tokens, accentColor: e.target.value })}
                    className="w-full bg-[#141C2E] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Background</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={tokens.backgroundColor}
                    onChange={(e) => setTokens({ ...tokens, backgroundColor: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={tokens.backgroundColor}
                    onChange={(e) => setTokens({ ...tokens, backgroundColor: e.target.value })}
                    className="w-full bg-[#141C2E] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Surface Card</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={tokens.surfaceColor}
                    onChange={(e) => setTokens({ ...tokens, surfaceColor: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={tokens.surfaceColor}
                    onChange={(e) => setTokens({ ...tokens, surfaceColor: e.target.value })}
                    className="w-full bg-[#141C2E] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Geometry */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">Geometry & Type</label>

            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Font Family</span>
              <select
                value={tokens.fontHeading}
                onChange={(e) => setTokens({ ...tokens, fontHeading: e.target.value, fontBody: e.target.value })}
                className="w-full bg-[#141C2E] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="Inter">Inter (Clean Modern Sans)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Retail & ReCommerce)</option>
                <option value="Outfit">Outfit (High Energy)</option>
                <option value="SF Pro Display">SF Pro Display (Cupertino Apple)</option>
                <option value="Cinzel">Cinzel (Luxury / Serif)</option>
                <option value="JetBrains Mono">JetBrains Mono (CyberTech)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Border Radius</span>
                <span className="font-mono text-emerald-400">{tokens.borderRadius}</span>
              </div>
              <input
                type="range"
                min="4"
                max="28"
                step="2"
                value={parseInt(tokens.borderRadius) || 12}
                onChange={(e) => setTokens({ ...tokens, borderRadius: `${e.target.value}px` })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Card Variant</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['bordered', 'elevated', 'glassmorphic', 'flat'].map((variant) => (
                  <button
                    key={variant}
                    onClick={() => setTokens({ ...tokens, cardVariant: variant as any })}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold capitalize transition ${
                      tokens.cardVariant === variant
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-[#141C2E] border-slate-700 text-slate-400'
                    }`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Specific Preview Metadata */}
          <div className="p-3.5 rounded-xl bg-[#141C2E] border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Layout Pattern:</span>
              <span className="text-emerald-400 font-medium">
                {activeTheme.panelPreviews?.[activePanel]?.layoutType || 'Responsive Streamlined'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Headline Concept:</span>
              <span className="text-white font-medium truncate max-w-[180px]">
                {activeTheme.panelPreviews?.[activePanel]?.heroHeadline || 'Sell Phone'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Primary CTA:</span>
              <span className="text-cyan-400 font-mono">
                {activeTheme.panelPreviews?.[activePanel]?.primaryCtaText || 'Action'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Device Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-[#101625] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col items-center">
          {/* Device Frame Switcher */}
          <div className="flex items-center space-x-2 bg-[#141C2E] p-1.5 rounded-xl border border-slate-800 mb-6">
            <button
              onClick={() => setDeviceFrameMode('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                deviceFrameMode === 'desktop'
                  ? 'bg-emerald-500 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop Browser</span>
            </button>
            <button
              onClick={() => setDeviceFrameMode('tablet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                deviceFrameMode === 'tablet'
                  ? 'bg-emerald-500 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Apple iPad</span>
            </button>
            <button
              onClick={() => setDeviceFrameMode('ios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                deviceFrameMode === 'ios'
                  ? 'bg-emerald-500 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone 16 Pro</span>
            </button>
            <button
              onClick={() => setDeviceFrameMode('android')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                deviceFrameMode === 'android'
                  ? 'bg-emerald-500 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Pixel 9 (Android)</span>
            </button>
          </div>

          {/* RENDER DEVICE FRAME */}
          <div className="w-full flex justify-center overflow-x-auto pb-4">
            {/* 1. DESKTOP BROWSER FRAME */}
            {deviceFrameMode === 'desktop' && (
              <div
                className="w-full max-w-[760px] rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col transition-all"
                style={{ backgroundColor: tokens.backgroundColor, color: tokens.textPrimary }}
              >
                {/* Browser Top Bar */}
                <div className="bg-[#1A2234] border-b border-slate-700 px-4 py-2.5 flex items-center space-x-3 text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex-1 bg-[#0F1420] rounded-lg px-3 py-1 text-[11px] font-mono text-slate-400 flex items-center space-x-2">
                    <span className="text-emerald-400">https://</span>
                    <span>{tenant?.slug || 'demo'}.camsik.com/{activePanel.replace('_web', '')}</span>
                  </div>
                </div>

                {/* Desktop Mock Content */}
                <div className="p-6 space-y-6">
                  {/* Navbar */}
                  <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: tokens.borderColor }}>
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-md"
                        style={{ backgroundColor: tokens.primaryColor, color: tokens.isDarkTheme ? '#000000' : '#FFFFFF' }}
                      >
                        {tenant?.name?.slice(0, 2) || 'CM'}
                      </div>
                      <span className="font-extrabold text-sm" style={{ fontFamily: tokens.fontHeading }}>
                        {tenant?.name || 'ReCyclePro'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-medium">
                      <span className="hover:underline cursor-pointer">Sell Phone</span>
                      <span className="hover:underline cursor-pointer">Buy Certified</span>
                      <span className="hover:underline cursor-pointer">Repair</span>
                      <button
                        className="px-3 py-1.5 text-xs font-bold shadow-md transition"
                        style={{
                          backgroundColor: tokens.accentColor,
                          color: '#000000',
                          borderRadius: tokens.borderRadius,
                        }}
                      >
                        {activeTheme.panelPreviews?.[activePanel]?.primaryCtaText || 'Get Price'}
                      </button>
                    </div>
                  </div>

                  {/* Panel Specific Hero Area */}
                  {activePanel === 'user_web' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-4">
                      <div className="space-y-3">
                        <span
                          className="px-2.5 py-1 text-[10px] font-bold rounded-full inline-block"
                          style={{ backgroundColor: `${tokens.primaryColor}20`, color: tokens.primaryColor }}
                        >
                          {activeTheme.panelPreviews?.user_web?.accentHighlight || 'Instant Doorstep Transfer'}
                        </span>
                        <h1 className="text-2xl font-black tracking-tight leading-tight" style={{ fontFamily: tokens.fontHeading }}>
                          {activeTheme.panelPreviews?.user_web?.heroHeadline || 'Sell Used Tech at True Market Worth'}
                        </h1>
                        <p className="text-xs opacity-75">
                          Doorstep pickup within 2 hours. Free evaluation and instant UPI payment.
                        </p>
                      </div>

                      <div
                        className="p-5 border shadow-xl space-y-3"
                        style={{
                          backgroundColor: tokens.surfaceColor,
                          borderColor: tokens.borderColor,
                          borderRadius: tokens.borderRadius,
                        }}
                      >
                        <div className="font-bold text-xs uppercase tracking-wider text-slate-400">Quick Valuation</div>
                        <div className="p-2.5 border rounded-lg text-xs flex justify-between items-center" style={{ borderColor: tokens.borderColor }}>
                          <span>Apple iPhone 15 Pro (128GB)</span>
                          <span className="font-bold" style={{ color: tokens.primaryColor }}>Up to ₹62,000</span>
                        </div>
                        <button
                          className="w-full py-2.5 font-bold text-xs shadow-md transition"
                          style={{
                            backgroundColor: tokens.primaryColor,
                            color: tokens.isDarkTheme ? '#000000' : '#FFFFFF',
                            borderRadius: tokens.borderRadius,
                          }}
                        >
                          Calculate Exact Cash Value
                        </button>
                      </div>
                    </div>
                  )}

                  {activePanel === 'partner_web' && (
                    <div className="space-y-4 py-2">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold" style={{ fontFamily: tokens.fontHeading }}>Partner Retail Buyback POS</h2>
                        <div className="text-xs px-3 py-1 font-bold rounded-lg" style={{ backgroundColor: `${tokens.accentColor}25`, color: tokens.accentColor }}>
                          Wallet Balance: ₹42,500
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {['Walk-in Diagnosis', 'Store IMEI Quick-Scan', 'Payout Settlements'].map((card, i) => (
                          <div
                            key={i}
                            className="p-4 border shadow-md space-y-1.5"
                            style={{ backgroundColor: tokens.surfaceColor, borderColor: tokens.borderColor, borderRadius: tokens.borderRadius }}
                          >
                            <span className="text-[10px] text-slate-400 font-mono">Module #{i + 1}</span>
                            <div className="font-bold text-xs">{card}</div>
                            <div className="text-[10px] opacity-70">Process customer in-store trade-in in 90 seconds.</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePanel === 'delivery_web' && (
                    <div className="space-y-4 py-2">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold" style={{ fontFamily: tokens.fontHeading }}>Doorstep Fleet Dispatch Center</h2>
                        <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ backgroundColor: `${tokens.primaryColor}25`, color: tokens.primaryColor }}>
                          18 Active Routes
                        </span>
                      </div>
                      <div className="border rounded-xl p-4 text-xs space-y-2" style={{ backgroundColor: tokens.surfaceColor, borderColor: tokens.borderColor }}>
                        <div className="flex justify-between font-bold pb-2 border-b" style={{ borderColor: tokens.borderColor }}>
                          <span>Order #ORD-9821</span>
                          <span style={{ color: tokens.primaryColor }}>Rider En Route (3.2 km)</span>
                        </div>
                        <div className="text-[11px] opacity-80">Device: MacBook Air M2 • Customer: Rajesh M. • Scheduled: 4:30 PM</div>
                      </div>
                    </div>
                  )}

                  {activePanel === 'admin_web' && (
                    <div className="space-y-4 py-2">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold" style={{ fontFamily: tokens.fontHeading }}>ReCommerce Operations Overview</h2>
                        <div className="text-xs font-mono font-bold" style={{ color: tokens.accentColor }}>Gross Volume: ₹14.2L</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {['Orders (320)', 'Partners (48)', 'Riders (14)', 'Pending QA (6)'].map((metric, i) => (
                          <div
                            key={i}
                            className="p-3 border rounded-xl"
                            style={{ backgroundColor: tokens.surfaceColor, borderColor: tokens.borderColor, borderRadius: tokens.borderRadius }}
                          >
                            <div className="text-[11px] font-bold">{metric}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. APPLE iPAD FRAME */}
            {deviceFrameMode === 'tablet' && (
              <div
                className="w-full max-w-[580px] rounded-3xl p-4 shadow-2xl border-4 border-slate-700 bg-slate-900"
              >
                <div
                  className="rounded-2xl p-5 overflow-hidden min-h-[480px] space-y-4"
                  style={{ backgroundColor: tokens.backgroundColor, color: tokens.textPrimary }}
                >
                  <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: tokens.borderColor }}>
                    <span className="font-extrabold text-sm" style={{ fontFamily: tokens.fontHeading }}>{tenant?.name || 'Camsik ReCommerce'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ backgroundColor: tokens.primaryColor, color: '#000' }}>
                      iPad Tablet Mode
                    </span>
                  </div>
                  <div className="p-4 border rounded-xl" style={{ backgroundColor: tokens.surfaceColor, borderColor: tokens.borderColor, borderRadius: tokens.borderRadius }}>
                    <div className="font-bold text-sm mb-1">{activeTheme.panelPreviews?.[activePanel]?.heroHeadline || 'Diagnostics Hub'}</div>
                    <p className="text-xs opacity-75">{activeTheme.panelPreviews?.[activePanel]?.layoutType || 'Tablet Grid'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. iPHONE 16 PRO FRAME */}
            {deviceFrameMode === 'ios' && (
              <div className="w-[320px] rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 bg-black relative flex flex-col overflow-hidden">
                {/* Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-30 flex items-center justify-between px-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                  <div className="w-2 h-2 rounded-full bg-blue-900/40" />
                </div>

                {/* iPhone Screen Canvas */}
                <div
                  className="w-full rounded-[38px] p-4 pt-10 pb-6 min-h-[580px] flex flex-col justify-between overflow-hidden"
                  style={{ backgroundColor: tokens.backgroundColor, color: tokens.textPrimary }}
                >
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[10px] font-semibold px-2 mb-3">
                    <span>9:41</span>
                    <div className="flex items-center space-x-1.5">
                      <Signal className="w-3 h-3" />
                      <Wifi className="w-3 h-3" />
                      <Battery className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* iOS App Mock Content */}
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400">Cupertino iOS</span>
                        <h3 className="text-base font-extrabold leading-tight" style={{ fontFamily: tokens.fontHeading }}>
                          {tenant?.branding?.brandName || 'ReCyclePro'}
                        </h3>
                      </div>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: tokens.primaryColor, color: '#000' }}>
                        iOS
                      </div>
                    </div>

                    <div
                      className="p-3.5 border shadow-md space-y-2"
                      style={{
                        backgroundColor: tokens.surfaceColor,
                        borderColor: tokens.borderColor,
                        borderRadius: tokens.borderRadius,
                      }}
                    >
                      <span className="text-[9px] font-bold uppercase" style={{ color: tokens.accentColor }}>
                        {activeTheme.panelPreviews?.[activePanel]?.accentHighlight || 'Certified Doorstep Pickup'}
                      </span>
                      <div className="text-xs font-bold leading-tight">
                        {activeTheme.panelPreviews?.[activePanel]?.heroHeadline || 'Sell Old Device in 60s'}
                      </div>
                      <button
                        className="w-full py-2 text-[11px] font-bold shadow-md transition"
                        style={{
                          backgroundColor: tokens.primaryColor,
                          color: tokens.isDarkTheme ? '#000' : '#FFF',
                          borderRadius: tokens.borderRadius,
                        }}
                      >
                        {activeTheme.panelPreviews?.[activePanel]?.primaryCtaText || 'Start Diagnosis'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 border rounded-xl" style={{ backgroundColor: tokens.surfaceColor, borderColor: tokens.borderColor }}>
                        <div className="font-bold">Smartphones</div>
                        <div className="opacity-70">Apple, Samsung</div>
                      </div>
                      <div className="p-2 border rounded-xl" style={{ backgroundColor: tokens.surfaceColor, borderColor: tokens.borderColor }}>
                        <div className="font-bold">DSLR & Cameras</div>
                        <div className="opacity-70">Sony, Canon</div>
                      </div>
                    </div>
                  </div>

                  {/* iOS Home Indicator Bar */}
                  <div className="w-32 h-1 bg-slate-500/60 rounded-full mx-auto mt-4" />
                </div>
              </div>
            )}

            {/* 4. GOOGLE PIXEL 9 FRAME (ANDROID) */}
            {deviceFrameMode === 'android' && (
              <div className="w-[320px] rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 bg-[#0A0D15] relative flex flex-col overflow-hidden">
                {/* Camera Punch Hole */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-30" />

                {/* Android Screen Canvas */}
                <div
                  className="w-full rounded-[34px] p-4 pt-10 pb-5 min-h-[580px] flex flex-col justify-between overflow-hidden"
                  style={{ backgroundColor: tokens.backgroundColor, color: tokens.textPrimary }}
                >
                  {/* Android Status Bar */}
                  <div className="flex justify-between items-center text-[10px] font-medium px-2 mb-3">
                    <span>10:00 AM</span>
                    <div className="flex items-center space-x-1.5">
                      <Wifi className="w-3 h-3" />
                      <Battery className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Android Mock Content */}
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-mono">Material 3 Android</span>
                        <h3 className="text-base font-bold" style={{ fontFamily: tokens.fontHeading }}>
                          {tenant?.branding?.brandName || 'ReCyclePro'}
                        </h3>
                      </div>
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: tokens.accentColor, color: '#000' }}>
                        APK
                      </div>
                    </div>

                    <div
                      className="p-3.5 border shadow-md space-y-2"
                      style={{
                        backgroundColor: tokens.surfaceColor,
                        borderColor: tokens.borderColor,
                        borderRadius: tokens.borderRadius,
                      }}
                    >
                      <div className="text-xs font-bold">
                        {activeTheme.panelPreviews?.[activePanel]?.heroHeadline || 'Android Device Diagnostics'}
                      </div>
                      <div className="text-[10px] opacity-75">
                        {activeTheme.panelPreviews?.[activePanel]?.layoutType || 'Material Card Grid'}
                      </div>
                      <button
                        className="w-full py-2 text-[11px] font-bold shadow-md transition"
                        style={{
                          backgroundColor: tokens.primaryColor,
                          color: tokens.isDarkTheme ? '#000' : '#FFF',
                          borderRadius: tokens.borderRadius,
                        }}
                      >
                        {activeTheme.panelPreviews?.[activePanel]?.primaryCtaText || 'Quick Diagnosis'}
                      </button>
                    </div>

                    <div className="p-2.5 border rounded-xl text-[10px] flex justify-between items-center" style={{ backgroundColor: tokens.surfaceColor, borderColor: tokens.borderColor }}>
                      <span>45-Point Hardware Check</span>
                      <span className="font-bold text-emerald-400">Automated</span>
                    </div>
                  </div>

                  {/* Android Gesture Bar */}
                  <div className="w-20 h-1 bg-slate-500/80 rounded-full mx-auto mt-4" />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Thumbnails: Other 11 Panels */}
          <div className="w-full border-t border-slate-800 pt-5 mt-4">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Synchronized 12-Panel Thumbnail Matrix</span>
              <span className="text-[10px] text-slate-400 font-normal">Click to switch primary preview</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {ALL_PANELS.map((p) => {
                const isCurrent = activePanel === p.key;
                return (
                  <div
                    key={p.key}
                    onClick={() => handleSelectPanel(p)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-emerald-500/20 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                        : 'bg-[#141C2E] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-white truncate">{p.label}</span>
                    </div>
                    <div
                      className="w-full h-8 rounded-lg flex items-center justify-center text-[9px] font-mono border"
                      style={{
                        backgroundColor: tokens.backgroundColor,
                        borderColor: tokens.borderColor,
                        color: tokens.primaryColor,
                      }}
                    >
                      {p.device.toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

