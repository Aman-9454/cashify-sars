'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  RefreshCw,
  Zap,
  TrendingDown,
  Camera,
  ShieldCheck,
  Search,
  Check,
  Smartphone,
  Laptop,
  Sparkles,
  Tag,
  Clock,
  MapPin,
  Calendar,
  User,
  Phone,
  AlertCircle,
  X,
  CreditCard,
  Truck,
  BatteryCharging,
  Layers,
  Award,
  Package,
  Receipt,
  Wallet,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';
import {
  RefurbishedProduct,
  ProductCondition,
  getRefurbishedProducts,
  getModelKey,
  getConditionsForModel,
  getVariantsByModel,
} from '@/lib/refurbishedCatalog';
import {
  getCurrentUser,
  setCurrentUser,
  saveCustomerOrder,
  CustomerUser,
  CustomerOrderRecord,
} from '@/lib/auth';
import UnserviceableAreaModal from '@/components/UnserviceableAreaModal';

// ── Types ──
type ExchangeWizardStep =
  | 'select-old'
  | 'condition'
  | 'select-new'
  | 'product-detail'
  | 'checkout'
  | 'confirmed';

interface OldDeviceItem {
  id: string;
  category: 'Cameras' | 'Lenses' | 'Smartphones' | 'Laptops';
  brand: string;
  name: string;
  image: string;
  basePrice: number;
  specs: string;
}

// ── Catalog of Old Devices for Trade-in ──
const oldTradeInDevices: OldDeviceItem[] = [
  // Cameras
  {
    id: 'old-cam-sony-a7',
    category: 'Cameras',
    brand: 'Sony',
    name: 'Sony Alpha A7 (Body Only)',
    image: '/assets/images/refurbished/sony-a7.jpg',
    basePrice: 38000,
    specs: '24.3 MP Full-Frame, E-mount, BIONZ X',
  },
  {
    id: 'old-cam-sony-a7ii',
    category: 'Cameras',
    brand: 'Sony',
    name: 'Sony Alpha A7 II Body',
    image: '/assets/images/refurbished/sony-a7.jpg',
    basePrice: 52000,
    specs: '24.3 MP Full-Frame, 5-axis IBIS, Fast Hybrid AF',
  },
  {
    id: 'old-cam-sony-a7iii',
    category: 'Cameras',
    brand: 'Sony',
    name: 'Sony Alpha A7 III Body',
    image: '/assets/images/refurbished/sony-a7.jpg',
    basePrice: 85000,
    specs: '24.2 MP BSI Sensor, 4K HDR, 693 AF Points, Dual Slots',
  },
  {
    id: 'old-cam-canon-rp',
    category: 'Cameras',
    brand: 'Canon',
    name: 'Canon EOS RP Full Frame',
    image: '/assets/images/refurbished/canon-eos-rp.jpg',
    basePrice: 58000,
    specs: '26.2 MP Full-Frame, Dual Pixel CMOS AF, 4K UHD',
  },
  {
    id: 'old-cam-canon-r',
    category: 'Cameras',
    brand: 'Canon',
    name: 'Canon EOS R Mirrorless Body',
    image: '/assets/images/refurbished/canon-eos-r.webp',
    basePrice: 78000,
    specs: '30.3 MP Full-Frame, DIGIC 8, 4K Canon Log',
  },
  {
    id: 'old-cam-nikon-z50',
    category: 'Cameras',
    brand: 'Nikon',
    name: 'Nikon Z50 Mirrorless Body',
    image: '/assets/images/refurbished/nikon-z50ii.png',
    basePrice: 48000,
    specs: '20.9 MP DX CMOS, Eye-Detection AF, 4K UHD 30p',
  },
  {
    id: 'old-cam-nikon-z50ii',
    category: 'Cameras',
    brand: 'Nikon',
    name: 'Nikon Z50 II Mirrorless',
    image: '/assets/images/refurbished/nikon-z50ii.png',
    basePrice: 62000,
    specs: '20.9 MP DX Sensor, EXPEED 7 Engine, AI Subject Detection',
  },
  {
    id: 'old-cam-nikon-z30',
    category: 'Cameras',
    brand: 'Nikon',
    name: 'Nikon Z30 Creator Body',
    image: '/assets/images/refurbished/nikon-z50ii.png',
    basePrice: 42000,
    specs: '20.9 MP DX Sensor, Vari-angle Screen, Uncropped 4K',
  },
  {
    id: 'old-cam-fuji-xt4',
    category: 'Cameras',
    brand: 'Fujifilm',
    name: 'Fujifilm X-T4 Mirrorless',
    image: '/assets/images/refurbished/fujifilm-xt5.jpg',
    basePrice: 79000,
    specs: '26.1 MP X-Trans CMOS 4, In-Body Image Stabilization',
  },
  {
    id: 'old-cam-fuji-xt5',
    category: 'Cameras',
    brand: 'Fujifilm',
    name: 'Fujifilm X-T5 Mirrorless',
    image: '/assets/images/refurbished/fujifilm-xt5.jpg',
    basePrice: 110000,
    specs: '40.2 MP X-Trans 5 HR, 6.2K 30p, AI Deep Learning AF',
  },
  {
    id: 'old-cam-lumix-s5ii',
    category: 'Cameras',
    brand: 'Panasonic',
    name: 'Lumix DC-S5II Body',
    image: '/assets/images/refurbished/sony-a7.jpg',
    basePrice: 115000,
    specs: '24.2 MP Full-Frame, Phase Hybrid AF, Unlimited 4K 60p',
  },
  {
    id: 'old-cam-lumix-s1',
    category: 'Cameras',
    brand: 'Panasonic',
    name: 'Lumix S1 Pro Body',
    image: '/assets/images/refurbished/sony-a7.jpg',
    basePrice: 92000,
    specs: '24.2 MP Full-Frame, 96 MP High-Res Shot, Dual I.S. 2',
  },

  // Lenses
  {
    id: 'old-lens-sony-2470',
    category: 'Lenses',
    brand: 'Sony',
    name: 'Sony FE 24-70mm f/2.8 GM',
    image: '/assets/images/refurbished/sony-1635gm.jpg',
    basePrice: 72000,
    specs: 'Direct Drive SSM, Nano AR Coating, 9-Blade Circular Aperture',
  },
  {
    id: 'old-lens-sony-1635',
    category: 'Lenses',
    brand: 'Sony',
    name: 'Sony FE 16-35mm f/2.8 GM',
    image: '/assets/images/refurbished/sony-1635gm.jpg',
    basePrice: 75000,
    specs: 'Ultra-wide angle zoom, Constant f/2.8 aperture, Dust & Moisture resistant',
  },
  {
    id: 'old-lens-canon-rf-50',
    category: 'Lenses',
    brand: 'Canon',
    name: 'Canon RF 50mm f/1.2L USM',
    image: '/assets/images/categories/lens.png',
    basePrice: 95000,
    specs: 'Ultra-fast f/1.2 prime, Ring-type USM, Control Ring',
  },
  {
    id: 'old-lens-nikon-z-2470',
    category: 'Lenses',
    brand: 'Nikon',
    name: 'NIKKOR Z 24-70mm f/2.8 S',
    image: '/assets/images/categories/lens.png',
    basePrice: 88000,
    specs: 'Multi-focus system, ARNEO & Nano Crystal Coat, OLED panel',
  },

  // Smartphones
  {
    id: 'old-phone-ip13pro',
    category: 'Smartphones',
    brand: 'Apple',
    name: 'Apple iPhone 13 Pro (128GB)',
    image: '/assets/images/refurbished/iphone-13-pro-max.png',
    basePrice: 46000,
    specs: 'A15 Bionic, 120Hz ProMotion Super Retina, Triple 12MP',
  },
  {
    id: 'old-phone-ip14',
    category: 'Smartphones',
    brand: 'Apple',
    name: 'Apple iPhone 14 (128GB)',
    image: '/assets/images/refurbished/iphone-14-pro-max.png',
    basePrice: 39000,
    specs: 'Super Retina XDR, Photonic Engine, Crash Detection',
  },
  {
    id: 'old-phone-ip14pro',
    category: 'Smartphones',
    brand: 'Apple',
    name: 'Apple iPhone 14 Pro (128GB)',
    image: '/assets/images/refurbished/iphone-14-pro-gold.jpg',
    basePrice: 58000,
    specs: 'Dynamic Island, Always-On display, 48MP Main sensor',
  },
  {
    id: 'old-phone-s22u',
    category: 'Smartphones',
    brand: 'Samsung',
    name: 'Samsung Galaxy S22 Ultra 5G',
    image: '/assets/images/refurbished/galaxy-s24-ultra.png',
    basePrice: 42000,
    specs: 'Embedded S Pen, Nightography 108MP, 100x Space Zoom',
  },
  {
    id: 'old-phone-s23u',
    category: 'Smartphones',
    brand: 'Samsung',
    name: 'Samsung Galaxy S23 Ultra 5G',
    image: '/assets/images/refurbished/galaxy-s24-violet.jpg',
    basePrice: 62000,
    specs: '200MP sensor, Snapdragon 8 Gen 2 for Galaxy, 5000mAh',
  },
  {
    id: 'old-phone-pixel7pro',
    category: 'Smartphones',
    brand: 'Google',
    name: 'Google Pixel 7 Pro (128GB)',
    image: '/assets/images/refurbished/pixel-8-pro.png',
    basePrice: 32000,
    specs: 'Google Tensor G2, 30x Super Res Zoom, Macro Focus',
  },

  // Laptops
  {
    id: 'old-lap-macbook-air-m1',
    category: 'Laptops',
    brand: 'Apple',
    name: 'Apple MacBook Air M1 (256GB)',
    image: '/assets/images/refurbished/macbook-air-m2.png',
    basePrice: 43000,
    specs: 'Apple M1 Chip, 8-Core CPU, 13.3" Retina, 18hr battery',
  },
  {
    id: 'old-lap-macbook-pro-m1',
    category: 'Laptops',
    brand: 'Apple',
    name: 'Apple MacBook Pro 14" M1 Pro',
    image: '/assets/images/refurbished/macbook-pro-14.png',
    basePrice: 82000,
    specs: '10-Core CPU, 16-Core GPU, Liquid Retina XDR, MagSafe 3',
  },
  {
    id: 'old-lap-dell-xps-15',
    category: 'Laptops',
    brand: 'Dell',
    name: 'Dell XPS 15 9520 (i7 12th Gen)',
    image: '/assets/images/refurbished/dell-xps-15.png',
    basePrice: 65000,
    specs: 'Intel Core i7-12700H, RTX 3050 Ti, 15.6" OLED 3.5K',
  },
];

// Diagnostic Questions Data
interface DiagnosticOption {
  label: string;
  sublabel: string;
  adj: number;
}

interface DiagnosticQuestion {
  id: string;
  question: string;
  options: DiagnosticOption[];
}

const cameraQuestions: DiagnosticQuestion[] = [
  {
    id: 'power',
    question: 'Does the camera power on & shoot normally?',
    options: [
      { label: 'Powers on & Shoots Perfectly', sublabel: 'Normal shutter response & dials', adj: 0 },
      { label: 'Intermittent Shutter Lag', sublabel: 'Takes photos but occasional pause', adj: -3000 },
      { label: 'Does Not Power On', sublabel: 'Requires servicing / board check', adj: -8000 },
    ],
  },
  {
    id: 'sensor',
    question: 'Sensor Glass & Viewfinder Condition?',
    options: [
      { label: 'Pristine Flawless Sensor', sublabel: 'Zero spots, dust or scratches', adj: 2000 },
      { label: 'Minor Dust (Easily Cleaned)', sublabel: 'Standard sensor dust specks', adj: 0 },
      { label: 'Visible Scratches / Fungus', sublabel: 'Coating damage or fungus mark', adj: -5000 },
    ],
  },
  {
    id: 'body',
    question: 'Body Cosmetic & Rubber Grip Condition?',
    options: [
      { label: 'Like New / Flawless', sublabel: 'No scratches, firm rubber grips', adj: 1500 },
      { label: 'Good (Minor Rub Marks)', sublabel: 'Normal cosmetic edge wear', adj: 0 },
      { label: 'Heavy Paint Wear / Peeling', sublabel: 'Loose rubber or body dings', adj: -3500 },
    ],
  },
  {
    id: 'accessories',
    question: 'Original Accessories Included?',
    options: [
      { label: 'Full Box + Charger + 2 Batteries', sublabel: 'Complete packaging & caps', adj: 2500 },
      { label: 'Original Charger + 1 Battery', sublabel: 'Basic working bundle', adj: 0 },
      { label: 'Third-Party Charger Only', sublabel: 'No original box/charger', adj: -2000 },
    ],
  },
  {
    id: 'shutter',
    question: 'Estimated Shutter Actuations?',
    options: [
      { label: '< 20,000 Shutter Count', sublabel: 'Light hobbyist usage', adj: 1500 },
      { label: '20,000 - 60,000 Shutter Count', sublabel: 'Moderate regular use', adj: 0 },
      { label: '> 80,000 Shutter Count', sublabel: 'Heavy professional workload', adj: -4000 },
    ],
  },
];

const smartphoneQuestions: DiagnosticQuestion[] = [
  {
    id: 'screen',
    question: 'Display & Touchscreen Status?',
    options: [
      { label: 'Original Flawless Screen', sublabel: 'Zero scratches, perfect TrueTone/120Hz', adj: 2000 },
      { label: 'Minor Hairline Scratches', sublabel: 'Touch & display 100% functional', adj: 0 },
      { label: 'Cracked Glass / Black Dots', sublabel: 'Display bleeding or lines', adj: -6000 },
    ],
  },
  {
    id: 'body',
    question: 'Back Glass & Metal Frame?',
    options: [
      { label: 'Mint / Pristine Condition', sublabel: 'Always used in case', adj: 1000 },
      { label: 'Minor Edge Dents / Scratches', sublabel: 'Standard daily wear', adj: 0 },
      { label: 'Cracked Back Glass / Bent', sublabel: 'Chassis damage', adj: -3500 },
    ],
  },
  {
    id: 'battery',
    question: 'Battery Health Percentage?',
    options: [
      { label: '90% - 100% Health', sublabel: 'Excellent battery longevity', adj: 1500 },
      { label: '80% - 89% Health', sublabel: 'Standard operational health', adj: 0 },
      { label: 'Below 80% / Service Alert', sublabel: 'Requires battery replacement', adj: -3000 },
    ],
  },
  {
    id: 'hardware',
    question: 'Cameras, FaceID & Microphones?',
    options: [
      { label: 'All Cameras & Sensors Perfect', sublabel: '0.5x, 1x, 3x, FaceID 100%', adj: 0 },
      { label: 'FaceID / Fingerprint Failure', sublabel: 'Biometric sensor unavailable', adj: -3000 },
      { label: 'Camera Shaking / Foggy Lens', sublabel: 'OIS motor or lens flaw', adj: -4500 },
    ],
  },
];

const laptopQuestions: DiagnosticQuestion[] = [
  {
    id: 'display',
    question: 'Screen & Retina Coating?',
    options: [
      { label: 'Pristine Flawless Display', sublabel: 'No dead pixels or delamination', adj: 1500 },
      { label: 'Keyboard Imprints / Micro Scratches', sublabel: 'Visible only under direct light', adj: 0 },
      { label: 'Cracked Panel / Lines / Stain', sublabel: 'Screen replacement needed', adj: -7000 },
    ],
  },
  {
    id: 'keyboard',
    question: 'Keyboard & Trackpad Condition?',
    options: [
      { label: 'All Keys & Touchpad Perfect', sublabel: 'Smooth typing & gestures', adj: 0 },
      { label: 'Sticky / Stiff Keys', sublabel: 'Minor key resistance', adj: -2500 },
      { label: 'Trackpad Click Defect', sublabel: 'Click or haptic unresponsive', adj: -4000 },
    ],
  },
  {
    id: 'battery',
    question: 'Battery Health & Charger?',
    options: [
      { label: 'Original Charger + High Health', sublabel: 'Holds charge 6+ hours', adj: 2000 },
      { label: 'Normal Battery Health', sublabel: 'Holds charge 3-5 hours', adj: 0 },
      { label: 'Service Battery Warning', sublabel: 'Requires replacement', adj: -4000 },
    ],
  },
  {
    id: 'body',
    question: 'Aluminum Body & Hinges?',
    options: [
      { label: 'Mint / Solid Hinges', sublabel: 'Smooth opening & closing', adj: 1500 },
      { label: 'Minor Edge Scuffs', sublabel: 'Cosmetic edge rub', adj: 0 },
      { label: 'Heavy Dent / Loose Hinge', sublabel: 'Chassis deformity', adj: -4500 },
    ],
  },
];

// Available Promo Coupon Codes
interface CouponOption {
  code: string;
  title: string;
  discount: number;
  description: string;
  minAmount: number;
}

const availableCoupons: CouponOption[] = [
  {
    code: 'CAMSIK500',
    title: 'Flat ₹500 Instant Discount',
    discount: 500,
    description: 'Instant welcome credit on any exchange upgrade',
    minAmount: 10000,
  },
  {
    code: 'UPGRADE1000',
    title: 'Flagship Upgrade Bonus: ₹1,000 OFF',
    discount: 1000,
    description: 'Applicable on pro cameras & flagship smartphone upgrades',
    minAmount: 25000,
  },
  {
    code: 'FESTIVE1500',
    title: 'Festive Mega Exchange: ₹1,500 OFF',
    discount: 1500,
    description: 'Special seasonal booster for certified refurbished purchases',
    minAmount: 40000,
  },
];

const getCategoryFallbackImage = (category?: string) => {
  if (category === 'Lenses') return '/assets/images/categories/lens.png';
  if (category === 'Smartphones') return '/assets/images/categories/smartphone.png';
  if (category === 'Laptops') return '/assets/images/categories/laptop.png';
  return '/assets/images/categories/dslr.png';
};

export default function ExchangeDevicePage() {
  const [step, setStep] = useState<ExchangeWizardStep>('select-old');

  // Step 1: Dynamic Old Devices for Trade-in
  const [tradeInDevices, setTradeInDevices] = useState<OldDeviceItem[]>(oldTradeInDevices);
  const [oldCategoryFilter, setOldCategoryFilter] = useState<string>('all');
  const [oldSearchQuery, setOldSearchQuery] = useState('');
  const [selectedOldDevice, setSelectedOldDevice] = useState<OldDeviceItem | null>(null);

  // Step 2: Dynamic Category Diagnostics & Questions
  const [categoryQuestionsMap, setCategoryQuestionsMap] = useState<Record<string, DiagnosticQuestion[]>>({
    Cameras: cameraQuestions,
    Smartphones: smartphoneQuestions,
    Laptops: laptopQuestions,
    Lenses: cameraQuestions,
  });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const exchangeBonus = 3000; // Guaranteed Camsik bonus

  // Step 3 & 4: Dynamic Upgrade Products Catalog & Selection
  const [refurbishedCatalog, setRefurbishedCatalog] = useState<RefurbishedProduct[]>([]);
  const [newCategoryFilter, setNewCategoryFilter] = useState<string>('all');
  const [newSearchQuery, setNewSearchQuery] = useState('');
  const [selectedUpgradeProduct, setSelectedUpgradeProduct] = useState<RefurbishedProduct | null>(null);
  const [activeDetailCondition, setActiveDetailCondition] = useState<ProductCondition>('Superb');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Step 5: Checkout, Coupons, Slot Booking
  const [appliedCoupon, setAppliedCoupon] = useState<CouponOption | null>(null);
  const [customCouponInput, setCustomCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // Handover Slot & Address
  const [pickupDate, setPickupDate] = useState('');
  const [pickupSlot, setPickupSlot] = useState('10:00 AM - 1:00 PM');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerPincode, setCustomerPincode] = useState('');
  const [paymentPreference, setPaymentPreference] = useState<'delivery' | 'online' | 'emi'>('delivery');
  const [showUnserviceableModal, setShowUnserviceableModal] = useState(false);

  // Payout Details if Old Device Trade-in Value > Upgrade Price
  const [payoutDetails, setPayoutDetails] = useState('');

  // Auth Gate
  const [currentUserState, setCurrentUserState] = useState<CustomerUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPhone, setAuthPhone] = useState('');
  const [authName, setAuthName] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authOtpSent, setAuthOtpSent] = useState(false);

  // Confirmed Order
  const [confirmedOrder, setConfirmedOrder] = useState<CustomerOrderRecord | null>(null);

  // ── Load Live Catalog, Questions & Models from MongoDB APIs on Mount ──
  useEffect(() => {
    // 1. Initial local refurbished fallback
    const products = getRefurbishedProducts();
    setRefurbishedCatalog(products);

    // 2. Fetch dynamic trade-in models from /api/models (Admin-managed)
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.models) && data.models.length > 0) {
          const mapped: OldDeviceItem[] = data.models.map((m: any) => {
            let cat: 'Cameras' | 'Lenses' | 'Smartphones' | 'Laptops' = 'Smartphones';
            const cLower = (m.categoryId || '').toLowerCase();
            if (cLower.includes('dslr') || cLower.includes('camera') || cLower.includes('cam')) cat = 'Cameras';
            else if (cLower.includes('lens')) cat = 'Lenses';
            else if (cLower.includes('laptop')) cat = 'Laptops';
            else if (cLower.includes('phone') || cLower.includes('mobile') || cLower.includes('smart')) cat = 'Smartphones';

            const brandName = m.brandId ? m.brandId.charAt(0).toUpperCase() + m.brandId.slice(1) : 'Brand';
            return {
              id: m.id,
              category: cat,
              brand: brandName,
              name: m.name,
              image: m.image || '/assets/images/phones/generic.png',
              basePrice: Number(m.basePrice) || 30000,
              specs: Array.isArray(m.storages) && m.storages.length > 0 ? m.storages.join(' / ') : 'Certified trade-in',
            };
          });
          setTradeInDevices(mapped);
        }
      })
      .catch((err) => console.warn('Failed to load dynamic models in exchange page:', err));

    // 3. Fetch dynamic refurbished upgrade devices from /api/refurbished (Admin-managed)
    fetch('/api/refurbished')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setRefurbishedCatalog(data.products);
        }
      })
      .catch((err) => console.warn('Failed to load dynamic refurbished in exchange page:', err));

    // 4. Fetch dynamic diagnostic questions from /api/questions (Admin-managed)
    fetch('/api/questions')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          const qMap: Record<string, DiagnosticQuestion[]> = {
            Cameras: [],
            Smartphones: [],
            Laptops: [],
            Lenses: [],
          };
          data.questions.forEach((q: any) => {
            const catId = (q.categoryId || '').toLowerCase();
            let targetKey: string | null = null;
            if (catId.includes('dslr') || catId.includes('camera')) targetKey = 'Cameras';
            else if (catId.includes('lens')) targetKey = 'Lenses';
            else if (catId.includes('laptop')) targetKey = 'Laptops';
            else if (catId.includes('phone') || catId.includes('smartphone')) targetKey = 'Smartphones';

            if (targetKey && Array.isArray(q.options) && q.options.length > 0) {
              qMap[targetKey].push({
                id: q.id,
                question: q.question,
                options: q.options.map((opt: any) => ({
                  label: opt.label,
                  sublabel: opt.sublabel || '',
                  adj: Number(opt.adj) || 0,
                })),
              });
            }
          });

          setCategoryQuestionsMap((prev) => ({
            Cameras: qMap.Cameras.length > 0 ? qMap.Cameras : prev.Cameras,
            Smartphones: qMap.Smartphones.length > 0 ? qMap.Smartphones : prev.Smartphones,
            Laptops: qMap.Laptops.length > 0 ? qMap.Laptops : prev.Laptops,
            Lenses: qMap.Lenses.length > 0 ? qMap.Lenses : (qMap.Cameras.length > 0 ? qMap.Cameras : prev.Lenses),
          }));
        }
      })
      .catch((err) => console.warn('Failed to load dynamic questions in exchange page:', err));

    // 5. Auth & Delivery presets
    const user = getCurrentUser();
    setCurrentUserState(user);
    if (user) {
      setCustomerName(user.name);
      setCustomerPhone(user.phone);
    }

    // Default pickup date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPickupDate(tomorrow.toISOString().split('T')[0]);

    // Load city if stored in localStorage
    try {
      const savedCity = localStorage.getItem('camsik_city');
      if (savedCity) {
        const parsed = JSON.parse(savedCity);
        if (parsed?.name && parsed.name !== 'All Cities') {
          setCustomerCity(parsed.name);
        }
      }
    } catch {}
  }, []);

  // ── Diagnostics questions resolver based on chosen old device & category ──
  const activeQuestions = useMemo(() => {
    if (!selectedOldDevice) return categoryQuestionsMap.Cameras;
    return categoryQuestionsMap[selectedOldDevice.category] || categoryQuestionsMap.Cameras;
  }, [selectedOldDevice, categoryQuestionsMap]);

  // ── Valuation Calculation ──
  const diagnosticAdjustmentsTotal = useMemo(() => {
    return Object.values(answers).reduce((acc, curr) => acc + curr, 0);
  }, [answers]);

  const oldDeviceNetValuation = useMemo(() => {
    if (!selectedOldDevice) return 0;
    const calculated = selectedOldDevice.basePrice + diagnosticAdjustmentsTotal;
    return Math.max(calculated, 8000);
  }, [selectedOldDevice, diagnosticAdjustmentsTotal]);

  const totalTradeInCredit = useMemo(() => {
    return oldDeviceNetValuation + exchangeBonus;
  }, [oldDeviceNetValuation, exchangeBonus]);

  // ── Filtered Old Devices (Using Live tradeInDevices) ──
  const filteredOldDevices = useMemo(() => {
    return tradeInDevices.filter((d) => {
      const matchCat =
        oldCategoryFilter === 'all' ||
        d.category.toLowerCase() === oldCategoryFilter.toLowerCase();
      const matchSearch =
        oldSearchQuery.trim() === '' ||
        d.name.toLowerCase().includes(oldSearchQuery.toLowerCase()) ||
        d.brand.toLowerCase().includes(oldSearchQuery.toLowerCase()) ||
        d.specs.toLowerCase().includes(oldSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [tradeInDevices, oldCategoryFilter, oldSearchQuery]);

  // ── Filtered Upgrade Products ──
  const filteredUpgradeProducts = useMemo(() => {
    return refurbishedCatalog.filter((p) => {
      const matchCat =
        newCategoryFilter === 'all' ||
        p.category.toLowerCase() === newCategoryFilter.toLowerCase();
      const matchSearch =
        newSearchQuery.trim() === '' ||
        p.model.toLowerCase().includes(newSearchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(newSearchQuery.toLowerCase()) ||
        p.specs.toLowerCase().includes(newSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [refurbishedCatalog, newCategoryFilter, newSearchQuery]);

  // ── Model Variants for Product Detail View (Step 4) ──
  const currentModelKey = selectedUpgradeProduct
    ? getModelKey(selectedUpgradeProduct)
    : '';

  const siblingVariants = useMemo(() => {
    if (!selectedUpgradeProduct) return [];
    return getVariantsByModel(refurbishedCatalog, currentModelKey);
  }, [refurbishedCatalog, selectedUpgradeProduct, currentModelKey]);

  const conditionGroups = useMemo(() => {
    if (!selectedUpgradeProduct) {
      return { Superb: [], Good: [], Fair: [] };
    }
    return getConditionsForModel(refurbishedCatalog, currentModelKey);
  }, [refurbishedCatalog, selectedUpgradeProduct, currentModelKey]);

  // ── Financial Breakdown for Checkout (Step 5) ──
  const upgradeDevicePrice = selectedUpgradeProduct?.sellingPrice || 0;
  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const netDifference = upgradeDevicePrice - totalTradeInCredit - couponDiscountAmount;
  const netPayableAmount = Math.max(netDifference, 0);
  const balanceOwedToUser = netDifference < 0 ? Math.abs(netDifference) : 0;

  // ── Navigation Handlers ──
  const handleSelectOldDevice = (item: OldDeviceItem) => {
    setSelectedOldDevice(item);
    const defaults: Record<string, number> = {};
    const questions =
      categoryQuestionsMap[item.category] || categoryQuestionsMap.Cameras;
    questions.forEach((q) => {
      if (q.options && q.options.length > 0) {
        defaults[q.id] = q.options[0].adj;
      }
    });
    setAnswers(defaults);
    setStep('condition');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectUpgradeModel = (prod: RefurbishedProduct) => {
    setSelectedUpgradeProduct(prod);
    setActiveDetailCondition(prod.condition);
    setActiveImageIndex(0);
    setStep('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchUnit = (unit: RefurbishedProduct) => {
    setSelectedUpgradeProduct(unit);
    setActiveDetailCondition(unit.condition);
    setActiveImageIndex(0);
  };

  const handleSelectConditionGrade = (cond: ProductCondition) => {
    setActiveDetailCondition(cond);
    if (!selectedUpgradeProduct) return;
    const unitsInCond = conditionGroups[cond];
    if (unitsInCond && unitsInCond.length > 0) {
      setSelectedUpgradeProduct(unitsInCond[0]);
      setActiveImageIndex(0);
    }
  };

  const handleApplyCoupon = (coupon: CouponOption) => {
    if (upgradeDevicePrice < coupon.minAmount) {
      setCouponError(`Requires minimum upgrade value of ₹${coupon.minAmount.toLocaleString('en-IN')}`);
      return;
    }
    setAppliedCoupon(coupon);
    setCouponError('');
  };

  const handleApplyCustomCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const query = customCouponInput.trim().toUpperCase();
    const match = availableCoupons.find((c) => c.code === query);
    if (match) {
      handleApplyCoupon(match);
      setCustomCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try CAMSIK500 or UPGRADE1000');
    }
  };

  // ── Auth Handling ──
  const handleTriggerAuth = () => {
    setShowAuthModal(true);
  };

  const handleQuickLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authOtpSent) {
      if (authPhone.replace(/\D/g, '').length < 10) return;
      setAuthOtpSent(true);
    } else {
      const newUser: CustomerUser = {
        id: 'user-' + Date.now(),
        name: authName.trim() || `Customer ${authPhone.slice(-4)}`,
        phone: authPhone.trim(),
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(newUser);
      setCurrentUserState(newUser);
      setCustomerName(newUser.name);
      setCustomerPhone(newUser.phone);
      setShowAuthModal(false);
    }
  };

  // ── Confirm Exchange Order ──
  const handleConfirmOrder = async () => {
    if (!currentUserState) {
      setShowAuthModal(true);
      return;
    }

    if (!customerName || !customerPhone || !customerAddress || !customerPincode) {
      alert('Please fill in your complete delivery address and phone number.');
      return;
    }

    const orderId = 'CAM-EXCH-' + Math.floor(100000 + Math.random() * 900000);

    // Verify PIN serviceability
    try {
      const pinRes = await fetch(`/api/pincodes?pincode=${encodeURIComponent(customerPincode.trim())}`);
      const pinData = await pinRes.json();
      if (pinData.success && pinData.serviceable === false) {
        const unserviceableOrder = {
          id: orderId,
          orderNumber: orderId,
          type: 'exchange',
          status: 'unserviceable',
          customerName,
          customerPhone,
          customerAddress,
          city: customerCity || 'Delhi NCR',
          pinCode: customerPincode.trim(),
          deviceName: `${selectedOldDevice?.name || 'Old Device'} ➔ ${selectedUpgradeProduct?.model || 'Upgrade Device'}`,
          quotedPrice: upgradeDevicePrice,
          finalPrice: netPayableAmount,
          paymentStatus: 'pending',
          notes: `Unserviceable Area Exchange Order. PIN: ${customerPincode.trim()}`,
          createdAt: new Date().toISOString(),
        };

        if (typeof window !== 'undefined') {
          try {
            const list = JSON.parse(localStorage.getItem('casmik_orders_v1') || '[]');
            localStorage.setItem('casmik_orders_v1', JSON.stringify([unserviceableOrder, ...list]));
            window.dispatchEvent(new Event('casmik_orders_updated'));
          } catch {}
        }
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(unserviceableOrder),
        }).catch(() => {});

        setShowUnserviceableModal(true);
        return;
      }
    } catch (err) {
      console.warn('Exchange pincode service check error:', err);
    }
    const orderRecord: CustomerOrderRecord = {
      id: orderId,
      orderNumber: orderId,
      type: 'exchange',
      status: 'handover_scheduled',
      createdAt: new Date().toISOString(),
      customerName,
      customerPhone,
      customerAddress,
      city: customerCity || 'Delhi NCR',
      pincode: customerPincode,
      pickupDate,
      pickupSlot,
      paymentMethod:
        balanceOwedToUser > 0
          ? 'Doorstep Payout to Customer (Cash/UPI)'
          : paymentPreference === 'delivery'
          ? 'Pay on Handover (Cash/UPI)'
          : paymentPreference === 'online'
          ? 'Prepaid Online'
          : 'No-Cost EMI',
      paymentStatus: paymentPreference === 'online' ? 'paid' : 'pay_on_delivery',
      oldDevice: selectedOldDevice
        ? {
            brand: selectedOldDevice.brand,
            model: selectedOldDevice.name,
            image: selectedOldDevice.image,
            category: selectedOldDevice.category,
            conditionSummary: 'Verified 5-Point Trade-In Diagnostics',
            valuation: oldDeviceNetValuation,
            exchangeBonus,
          }
        : undefined,
      newDevice: selectedUpgradeProduct
        ? {
            id: selectedUpgradeProduct.id,
            brand: selectedUpgradeProduct.brand,
            model: selectedUpgradeProduct.model,
            storage: selectedUpgradeProduct.storage,
            color: selectedUpgradeProduct.color,
            condition: selectedUpgradeProduct.condition,
            price: selectedUpgradeProduct.sellingPrice,
            originalPrice: selectedUpgradeProduct.originalPrice,
            warranty: selectedUpgradeProduct.warranty,
            batteryHealth: selectedUpgradeProduct.batteryHealth,
            image:
              selectedUpgradeProduct.gallery && selectedUpgradeProduct.gallery[0]
                ? selectedUpgradeProduct.gallery[0]
                : selectedUpgradeProduct.image,
          }
        : undefined,
      upgradePrice: upgradeDevicePrice,
      tradeInCredit: oldDeviceNetValuation,
      exchangeBonus,
      couponCode: appliedCoupon?.code,
      couponDiscount: couponDiscountAmount,
      netPayable: netPayableAmount,
      balanceOwedToUser: balanceOwedToUser > 0 ? balanceOwedToUser : undefined,
      payoutDetails: balanceOwedToUser > 0 ? payoutDetails : undefined,
    };

    saveCustomerOrder(orderRecord);
    setConfirmedOrder(orderRecord);
    setStep('confirmed');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Live MongoDB API Order Insertion for cross-platform and Admin panel sync
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...orderRecord,
        type: 'exchange',
        deviceName: `${selectedOldDevice?.name || 'Old Device'} ➔ ${selectedUpgradeProduct?.model || 'Upgrade Device'}`,
        amount: netPayableAmount,
        quotedPrice: upgradeDevicePrice,
        finalPrice: netPayableAmount,
      }),
    }).catch((err) => console.error('Failed to sync exchange order to database:', err));
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <CustomerHeader />

        {/* ─────────────────────────────────────────────────────────────
            HEADER HERO & WORKFLOW STEPPER BAR (FULL WIDTH & EXPANSIVE)
        ────────────────────────────────────────────────────────────── */}
        <section className="bg-white border-b border-slate-200/80 pt-6 pb-4 sm:pt-8 sm:pb-6 shadow-2xs">
          <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black mb-3 border border-emerald-200/80 shadow-2xs">
                <RefreshCw size={13} className="text-emerald-600" />
                <span>UPGRADE &amp; TRADE-IN PROGRAM</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Exchange Your Old Device for a Newer Model
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-slate-600 mt-2 font-medium">
                Get guaranteed ₹3,000 extra exchange bonus on top of market valuation. Simultaneous doorstep handover with zero downtime for your photography &amp; tech workflow.
              </p>
            </div>

            {/* Stepper Progress Bar */}
            <div className="mt-8 pt-5 border-t border-slate-100 overflow-x-auto scrollbar-none">
              <div className="flex items-center justify-between min-w-[750px] text-xs">
                {[
                  { key: 'select-old', num: '1', title: 'Select Old Device', desc: 'Choose trade-in gear' },
                  { key: 'condition', num: '2', title: 'Condition Check', desc: 'Get instant valuation' },
                  { key: 'select-new', num: '3', title: 'Choose Upgrade', desc: 'Select target device' },
                  { key: 'product-detail', num: '4', title: 'Unit & Grade', desc: 'Photos & specs' },
                  { key: 'checkout', num: '5', title: 'Pay Difference', desc: 'Coupons & slot' },
                ].map((s, idx, arr) => {
                  const isCurrent = step === s.key;
                  const isPast =
                    (s.key === 'select-old' && step !== 'select-old') ||
                    (s.key === 'condition' && ['select-new', 'product-detail', 'checkout', 'confirmed'].includes(step)) ||
                    (s.key === 'select-new' && ['product-detail', 'checkout', 'confirmed'].includes(step)) ||
                    (s.key === 'product-detail' && ['checkout', 'confirmed'].includes(step));

                  return (
                    <React.Fragment key={s.key}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shrink-0 ${
                            isCurrent
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm'
                              : isPast
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isPast ? <Check size={15} strokeWidth={3} /> : s.num}
                        </div>
                        <div>
                          <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-slate-900 font-black' : isPast ? 'text-slate-700' : 'text-slate-400'}`}>
                            {s.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                      {idx < arr.length - 1 && <ChevronRight size={16} className="text-slate-300 mx-2 shrink-0" />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            STEP 1: SELECT OLD DEVICE (FULL WIDTH 5-COL GRID)
        ────────────────────────────────────────────────────────────── */}
        {step === 'select-old' && (
          <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-10">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 xl:p-10 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
                    Select Your Existing Device
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Choose the camera body, lens, smartphone or laptop you want to trade in
                  </p>
                </div>

                {/* Real-time search */}
                <div className="relative w-full sm:w-80 lg:w-96">
                  <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search your device (e.g. Sony A7, iPhone 14, MacBook)..."
                    value={oldSearchQuery}
                    onChange={(e) => setOldSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-2xs"
                  />
                  {oldSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setOldSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-3 mb-8 scrollbar-none">
                {[
                  { key: 'all', label: 'All Equipment' },
                  { key: 'cameras', label: '📷 DSLR & Mirrorless' },
                  { key: 'lenses', label: '🔍 Camera Lenses' },
                  { key: 'smartphones', label: '📱 Smartphones' },
                  { key: 'laptops', label: '💻 Laptops & Tablets' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setOldCategoryFilter(tab.key)}
                    className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      oldCategoryFilter === tab.key
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Grid of Devices (Full Width Responsive 5-Col) */}
              {filteredOldDevices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
                  {filteredOldDevices.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectOldDevice(item)}
                      className="p-4 sm:p-5 rounded-3xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xl hover:-translate-y-0.5 transition-all text-left flex items-center gap-4 group cursor-pointer"
                    >
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-50/90 p-2 flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = getCategoryFallbackImage(item.category);
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 inline-block mb-1">
                          {item.brand}
                        </span>
                        <p className="text-sm sm:text-base font-black text-slate-900 truncate leading-snug">
                          {item.name}
                        </p>
                        <p className="text-xs sm:text-sm font-extrabold text-emerald-600 mt-1">
                          Up to ₹{item.basePrice.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-base font-semibold text-slate-500">
                    No devices found matching &ldquo;{oldSearchQuery}&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOldSearchQuery('');
                      setOldCategoryFilter('all');
                    }}
                    className="mt-3 text-sm font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Clear search filter
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 2: ANSWER DIAGNOSTIC QUESTIONS (FULL WIDTH 2-COL LAYOUT)
        ────────────────────────────────────────────────────────────── */}
        {step === 'condition' && selectedOldDevice && (
          <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
            <button
              type="button"
              onClick={() => setStep('select-old')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 mb-6 group cursor-pointer"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Device Selection</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Diagnostics Questions */}
              <div className="lg:col-span-8 2xl:col-span-8 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  {/* Selected Device Banner */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white p-1.5 border border-slate-200 flex items-center justify-center shrink-0">
                        <img
                          src={selectedOldDevice.image}
                          alt={selectedOldDevice.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = getCategoryFallbackImage(selectedOldDevice.category);
                          }}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                          {selectedOldDevice.brand} · {selectedOldDevice.category}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                          {selectedOldDevice.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">{selectedOldDevice.specs}</p>
                      </div>
                    </div>

                    <div className="text-right hidden sm:block shrink-0">
                      <span className="text-[11px] text-slate-400 font-medium">Base Market Value</span>
                      <p className="text-lg font-black text-slate-800">
                        ₹{selectedOldDevice.basePrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      Verify Device Condition &amp; Shutter
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Select accurate options below for certified doorstep trade-in valuation
                    </p>
                  </div>

                  {/* Diagnostic Questions List */}
                  <div className="space-y-6">
                    {activeQuestions.map((q) => (
                      <div key={q.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                        <p className="text-sm font-black text-slate-900 mb-3">{q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                          {q.options.map((opt) => {
                            const isSelected = answers[q.id] === opt.adj;
                            return (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.adj }))}
                                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className={`text-xs font-black ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                                      {opt.label}
                                    </span>
                                    {isSelected && <Check size={14} className="text-emerald-600 shrink-0 ml-1" />}
                                  </div>
                                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                                    {opt.sublabel}
                                  </p>
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 mt-3 block">
                                  {opt.adj > 0 ? `+₹${opt.adj}` : opt.adj < 0 ? `-₹${Math.abs(opt.adj)}` : 'Included'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Live Valuation Summary */}
              <div className="lg:col-span-4 2xl:col-span-4 lg:sticky lg:top-24 space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-lg">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Live Trade-in Valuation
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Real-time Lock
                    </span>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm mb-6">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Market Price:</span>
                      <span className="font-bold text-slate-900">₹{selectedOldDevice.basePrice.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Condition Adjustments:</span>
                      <span className={`font-bold ${diagnosticAdjustmentsTotal >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {diagnosticAdjustmentsTotal >= 0 ? `+₹${diagnosticAdjustmentsTotal}` : `-₹${Math.abs(diagnosticAdjustmentsTotal)}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Net Device Valuation:</span>
                      <span className="font-bold text-slate-900">₹{oldDeviceNetValuation.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60">
                      <span>Guaranteed Exchange Bonus:</span>
                      <span>+ ₹{exchangeBonus.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="text-sm font-black text-slate-900">Total Trade-In Credit:</span>
                      <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                        ₹{totalTradeInCredit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('select-new');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    <span>Choose Upgrade Gear</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <ShieldCheck size={14} />
                      <span>Instant doorstep inspection &amp; instant price lock</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-slate-400" />
                      <span>Simultaneous old device collection &amp; new gear delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 3: SELECT TARGET UPGRADE PRODUCT (FULL WIDTH 4-COL)
        ────────────────────────────────────────────────────────────── */}
        {step === 'select-new' && (
          <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
            {/* Top Trade-in Credit Reminder Bar */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex flex-wrap items-center justify-between gap-4 mb-8 shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-emerald-100 tracking-wider">
                    Trade-In Gear Active: {selectedOldDevice?.name}
                  </p>
                  <p className="text-base sm:text-lg font-black">
                    Total Credit Applied: ₹{totalTradeInCredit.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-medium text-emerald-200">(Includes ₹3,000 Exchange Bonus)</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('condition')}
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Change Valuation &larr;
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 xl:p-10 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
                    Select Your Target Upgrade Device
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Choose any certified refurbished camera, smartphone, or laptop to upgrade to
                  </p>
                </div>

                <div className="relative w-full sm:w-80 lg:w-96">
                  <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search upgrade model (e.g. iPhone 15 Pro, Sony A7 III)..."
                    value={newSearchQuery}
                    onChange={(e) => setNewSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-2xs"
                  />
                  {newSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setNewSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-3 mb-8 scrollbar-none">
                {[
                  { key: 'all', label: 'All Upgrades' },
                  { key: 'smartphones', label: '📱 Smartphones' },
                  { key: 'cameras', label: '📷 Cameras & Optics' },
                  { key: 'laptops', label: '💻 Laptops' },
                  { key: 'tablets', label: '📟 Tablets' },
                  { key: 'smartwatches', label: '⌚ Smartwatches' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setNewCategoryFilter(tab.key)}
                    className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      newCategoryFilter === tab.key
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Upgrade Products Grid (Full Width 4-Col) */}
              {filteredUpgradeProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
                  {filteredUpgradeProducts.map((prod) => {
                    const priceDiff = prod.sellingPrice - totalTradeInCredit;
                    const isExtraBack = priceDiff < 0;
                    const extraBackAmount = Math.abs(priceDiff);
                    const effectivePayable = Math.max(priceDiff, 0);

                    return (
                      <div
                        key={prod.id}
                        className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xl transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="relative aspect-square rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden p-4 mb-4 flex items-center justify-center">
                            <img
                              src={prod.image}
                              alt={prod.model}
                              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = getCategoryFallbackImage(prod.category);
                              }}
                            />
                            <div className="absolute top-3 left-3">
                              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-900 text-white shadow-2xs">
                                {prod.category}
                              </span>
                            </div>
                            <div className="absolute top-3 right-3">
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-2xs">
                                {prod.discount}% OFF
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {prod.brand}
                          </p>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5 line-clamp-1">
                            {prod.model}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-medium">
                            {prod.specs}
                          </p>
                        </div>

                        {/* Price & Difference with Remaining Balance Callout */}
                        <div className="mt-5 pt-4 border-t border-slate-100">
                          <div className="flex items-baseline justify-between mb-2">
                            <div>
                              <p className="text-[10px] text-slate-400">Certified Price</p>
                              <p className="text-xs font-semibold text-slate-600 line-through">
                                ₹{prod.originalPrice.toLocaleString('en-IN')}
                              </p>
                              <p className="text-sm font-black text-slate-900">
                                ₹{prod.sellingPrice.toLocaleString('en-IN')}
                              </p>
                            </div>

                            {isExtraBack ? (
                              <div className="text-right">
                                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">
                                  You Receive Extra
                                </p>
                                <p className="text-lg font-black text-emerald-600">
                                  +₹{extraBackAmount.toLocaleString('en-IN')}
                                </p>
                              </div>
                            ) : (
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-500 uppercase">You Pay Difference</p>
                                <p className="text-lg font-black text-slate-900">
                                  ₹{effectivePayable.toLocaleString('en-IN')}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-[11px] font-bold flex items-center justify-between mb-2.5 border border-emerald-200/70">
                            <span>Trade-In Credit:</span>
                            <span>- ₹{totalTradeInCredit.toLocaleString('en-IN')}</span>
                          </div>

                          {/* Extra balance payout notice if trade-in > buying price */}
                          {isExtraBack && (
                            <div className="p-2.5 rounded-xl bg-emerald-100/70 text-emerald-900 text-[11px] font-bold border border-emerald-300/80 mb-3 flex items-start gap-1.5 leading-snug">
                              <Coins size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                              <span>
                                Remaining balance of ₹{extraBackAmount.toLocaleString('en-IN')} will be paid to you after receiving the device!
                              </span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSelectUpgradeModel(prod)}
                            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <span>View Units &amp; Select</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-base font-semibold text-slate-500">
                    No products found matching &ldquo;{newSearchQuery}&rdquo;.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 4: DETAILED PRODUCT VIEW (FULL WIDTH DUAL COLUMN)
        ────────────────────────────────────────────────────────────── */}
        {step === 'product-detail' && selectedUpgradeProduct && (
          <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
            <button
              type="button"
              onClick={() => setStep('select-new')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 mb-6 group cursor-pointer"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to All Upgrades</span>
            </button>

            {/* Trade-In Active Highlight Banner */}
            <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-black">Trade-In Gear: {selectedOldDevice?.name}</p>
                  <p className="text-xs text-emerald-700">
                    Total Credit: ₹{totalTradeInCredit.toLocaleString('en-IN')} (Includes ₹3,000 Extra Exchange Bonus)
                  </p>
                </div>
              </div>

              {selectedUpgradeProduct.sellingPrice < totalTradeInCredit ? (
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-800 uppercase block">You Receive Extra</span>
                  <span className="text-lg font-black text-emerald-600">
                    + ₹{(totalTradeInCredit - selectedUpgradeProduct.sellingPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Net Upgrade Price:</span>
                  <span className="text-lg font-black text-slate-900">
                    ₹{(selectedUpgradeProduct.sellingPrice - totalTradeInCredit).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            {/* Extra balance notification banner if applicable */}
            {selectedUpgradeProduct.sellingPrice < totalTradeInCredit && (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-400 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
                    💸
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-md">
                        Payout to You
                      </span>
                      <span className="text-base font-black text-emerald-900">
                        ₹{(totalTradeInCredit - selectedUpgradeProduct.sellingPrice).toLocaleString('en-IN')} Balance
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-900 mt-1">
                      Your old device valuation (₹{totalTradeInCredit.toLocaleString('en-IN')}) is higher than this upgrade price! 
                      <span className="font-bold underline ml-1">
                        Remaining balance of ₹{(totalTradeInCredit - selectedUpgradeProduct.sellingPrice).toLocaleString('en-IN')} will be paid directly after receiving and inspecting your device at your doorstep.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 xl:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16">
                {/* Left Column: Image Showcase & Dedicated Multi-Angle Thumbnails */}
                <div className="lg:col-span-6 2xl:col-span-5 flex flex-col items-center">
                  <div className="relative w-full aspect-square max-w-[480px] rounded-3xl bg-slate-50 border border-slate-200/80 p-6 flex items-center justify-center mb-4 overflow-hidden">
                    <img
                      key={`${selectedUpgradeProduct.id}-${activeImageIndex}`}
                      src={
                        selectedUpgradeProduct.gallery && selectedUpgradeProduct.gallery[activeImageIndex]
                          ? selectedUpgradeProduct.gallery[activeImageIndex]
                          : selectedUpgradeProduct.image
                      }
                      alt={`${selectedUpgradeProduct.brand} ${selectedUpgradeProduct.model} - ${selectedUpgradeProduct.color}`}
                      className="max-w-full max-h-full object-contain filter drop-shadow-md transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.src = getCategoryFallbackImage(selectedUpgradeProduct.category);
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="text-xs font-bold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs">
                        {selectedUpgradeProduct.condition}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500 text-white shadow-2xs">
                        {selectedUpgradeProduct.discount}% OFF
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-2 whitespace-nowrap">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>{selectedUpgradeProduct.color} · {selectedUpgradeProduct.storage}</span>
                    </div>
                  </div>

                  {/* Clickable Multi-Angle Thumbnails */}
                  <div className="flex items-center gap-3 w-full max-w-[480px] justify-center overflow-x-auto py-1">
                    {(selectedUpgradeProduct.gallery && selectedUpgradeProduct.gallery.length > 0
                      ? selectedUpgradeProduct.gallery
                      : [selectedUpgradeProduct.image]
                    ).map((img, idx) => {
                      const isSelected = activeImageIndex === idx;
                      return (
                        <button
                          key={`${selectedUpgradeProduct.id}-thumb-${idx}`}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-slate-50 p-2 border transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white shadow-md'
                              : 'border-slate-200 hover:border-slate-300 bg-white/50'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Angle ${idx + 1}`}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = getCategoryFallbackImage(selectedUpgradeProduct.category);
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Condition Grade & Units Switcher */}
                <div className="lg:col-span-6 2xl:col-span-7 flex flex-col justify-between space-y-6">
                  <div>
                    {/* Condition Pill & Note */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200 mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{selectedUpgradeProduct.condition}</span>
                      <span className="text-emerald-600/70">·</span>
                      <span className="font-medium text-emerald-800">{selectedUpgradeProduct.conditionNote}</span>
                    </div>

                    {/* Title & Storage/Color */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                      {selectedUpgradeProduct.brand} {selectedUpgradeProduct.model}
                    </h1>
                    <p className="text-sm sm:text-base font-semibold text-slate-500 mt-1">
                      {selectedUpgradeProduct.storage} · {selectedUpgradeProduct.color}
                    </p>

                    {/* Price Row */}
                    <div className="flex items-baseline gap-3 mt-4">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900">
                        ₹{selectedUpgradeProduct.sellingPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-base text-slate-400 line-through">
                        ₹{selectedUpgradeProduct.originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        {selectedUpgradeProduct.discount}% OFF
                      </span>
                    </div>

                    {/* Condition Grade Selector */}
                    <div className="mt-6 p-5 rounded-3xl bg-slate-50/90 border border-slate-200/90 shadow-xs">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center shadow-xs">
                            1
                          </span>
                          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                            Select Condition Grade
                          </h3>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-md border border-slate-200/60">
                          {siblingVariants.length} certified {siblingVariants.length === 1 ? 'unit' : 'units'} listed
                        </span>
                      </div>

                      {/* 3 Condition Option Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(['Superb', 'Good', 'Fair'] as ProductCondition[]).map((cond) => {
                          const isSelected = activeDetailCondition === cond;
                          const count = conditionGroups[cond].length;
                          const prices = conditionGroups[cond].map((p) => p.sellingPrice);
                          const minPrice = prices.length > 0 ? Math.min(...prices) : null;

                          return (
                            <button
                              key={cond}
                              type="button"
                              onClick={() => handleSelectConditionGrade(cond)}
                              className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                                isSelected
                                  ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-md'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-black ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                  {cond}
                                </span>
                                {isSelected && (
                                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                    <Check size={10} strokeWidth={3} />
                                  </div>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-medium">
                                {count > 0 ? `${count} in stock` : 'Out of stock'}
                              </p>
                              <p className="text-xs font-black text-slate-900 mt-2">
                                {minPrice ? `From ₹${minPrice.toLocaleString('en-IN')}` : '—'}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Individual Certified Units Switcher */}
                    <div className="mt-5 p-5 rounded-3xl bg-slate-50/90 border border-slate-200/90 shadow-xs">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center shadow-xs">
                          2
                        </span>
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                          Choose Verified Inventory Unit ({conditionGroups[activeDetailCondition].length} Available)
                        </h3>
                      </div>

                      {conditionGroups[activeDetailCondition].length > 0 ? (
                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                          {conditionGroups[activeDetailCondition].map((unit) => {
                            const isSelected = selectedUpgradeProduct.id === unit.id;
                            return (
                              <button
                                key={unit.id}
                                type="button"
                                onClick={() => handleSwitchUnit(unit)}
                                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                  isSelected
                                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-11 h-11 rounded-xl bg-slate-100 p-1 flex items-center justify-center shrink-0 border border-slate-200/60">
                                    <img
                                      src={unit.image}
                                      alt={unit.model}
                                      className="max-w-full max-h-full object-contain"
                                      onError={(e) => {
                                        e.currentTarget.src = getCategoryFallbackImage(unit.category);
                                      }}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-black text-slate-900 truncate">
                                        {unit.color} · {unit.storage}
                                      </p>
                                      {isSelected && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white">
                                          Active
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                                      <span>
                                        {typeof unit.batteryHealth === 'number' ? `${unit.batteryHealth}% Battery` : unit.batteryHealth}
                                      </span>
                                      <span className="text-slate-300">·</span>
                                      <span>{unit.warranty} Warranty</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <p className="text-sm font-black text-slate-900">
                                    ₹{unit.sellingPrice.toLocaleString('en-IN')}
                                  </p>
                                  <p className="text-[10px] text-emerald-600 font-extrabold">
                                    {unit.discount}% OFF
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-100 text-center text-xs text-slate-500">
                          No certified units currently available in {activeDetailCondition} condition.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proceed CTA with Net Balance Logic */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      {selectedUpgradeProduct.sellingPrice < totalTradeInCredit ? (
                        <div>
                          <p className="text-xs font-bold text-emerald-700">Remaining Balance Paid to You:</p>
                          <p className="text-2xl sm:text-3xl font-black text-emerald-600">
                            + ₹{(totalTradeInCredit - selectedUpgradeProduct.sellingPrice).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            (Paid after receiving &amp; testing old device)
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-slate-400">Net Payable After Trade-In:</p>
                          <p className="text-2xl sm:text-3xl font-black text-emerald-700">
                            ₹{(selectedUpgradeProduct.sellingPrice - totalTradeInCredit).toLocaleString('en-IN')}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setStep('checkout');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                    >
                      <span>Proceed to Exchange Checkout</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 5: CHECKOUT, COUPONS & DETAILED SUMMARY (FULL WIDTH)
        ────────────────────────────────────────────────────────────── */}
        {step === 'checkout' && selectedOldDevice && selectedUpgradeProduct && (
          <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
            <button
              type="button"
              onClick={() => setStep('product-detail')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 mb-6 group cursor-pointer"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Unit Selection</span>
            </button>

            {/* If Trade-In Credit > Buying Price, show special alert banner */}
            {balanceOwedToUser > 0 && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border-2 border-emerald-500 text-emerald-950 mb-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
                    🎉
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-emerald-900">
                      Positive Balance: You Receive ₹{balanceOwedToUser.toLocaleString('en-IN')} Extra!
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-800 mt-1 leading-relaxed">
                      Your old device valuation exceeds this upgrade device price. You pay <strong className="text-emerald-950 underline">₹0</strong> today, and the <strong className="text-emerald-950">remaining balance of ₹{balanceOwedToUser.toLocaleString('en-IN')} will be paid directly after receiving and inspecting your device at your doorstep</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Side-by-Side Comparative Cards + Doorstep Schedule & Address */}
              <div className="lg:col-span-7 2xl:col-span-8 space-y-6">
                {/* 1. Comparative Trade-In Visual Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <RefreshCw size={18} className="text-emerald-600" />
                    <span>Doorstep Exchange Overview</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Old Gear */}
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 flex flex-col justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-16 h-16 rounded-xl bg-white p-1 border border-amber-200/80 flex items-center justify-center shrink-0">
                          <img
                            src={selectedOldDevice.image}
                            alt={selectedOldDevice.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = getCategoryFallbackImage(selectedOldDevice.category);
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            Old Device Handover
                          </span>
                          <p className="text-sm font-black text-slate-900 truncate mt-1">
                            {selectedOldDevice.name}
                          </p>
                          <p className="text-xs text-slate-500 font-semibold">
                            Trade-In Value: ₹{oldDeviceNetValuation.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-amber-200/60 text-xs font-bold text-emerald-700 flex items-center justify-between">
                        <span>Guaranteed Bonus:</span>
                        <span>+ ₹{exchangeBonus.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* New Upgrade */}
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 flex flex-col justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-16 h-16 rounded-xl bg-white p-1 border border-emerald-200/80 flex items-center justify-center shrink-0">
                          <img
                            src={
                              selectedUpgradeProduct.gallery && selectedUpgradeProduct.gallery[0]
                                ? selectedUpgradeProduct.gallery[0]
                                : selectedUpgradeProduct.image
                            }
                            alt={selectedUpgradeProduct.model}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = getCategoryFallbackImage(selectedUpgradeProduct.category);
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Upgrade Delivered
                          </span>
                          <p className="text-sm font-black text-slate-900 truncate mt-1">
                            {selectedUpgradeProduct.brand} {selectedUpgradeProduct.model}
                          </p>
                          <p className="text-xs text-slate-600 font-semibold">
                            {selectedUpgradeProduct.storage} · {selectedUpgradeProduct.color}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-emerald-200/60 text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Certified Condition:</span>
                        <span className="text-emerald-700 font-black">{selectedUpgradeProduct.condition} ({selectedUpgradeProduct.warranty})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Schedule Doorstep Handover Slot */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-emerald-600" />
                    <span>Schedule Simultaneous Doorstep Handover</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Preferred Handover Date
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Preferred Time Window
                      </label>
                      <select
                        value={pickupSlot}
                        onChange={(e) => setPickupSlot(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      >
                        <option value="10:00 AM - 1:00 PM">10:00 AM - 1:00 PM (Morning)</option>
                        <option value="1:00 PM - 4:00 PM">1:00 PM - 4:00 PM (Afternoon)</option>
                        <option value="4:00 PM - 7:00 PM">4:00 PM - 7:00 PM (Evening)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Doorstep Delivery & Pickup Address */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-emerald-600" />
                    <span>Doorstep Address &amp; Contact Details</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Adarsh Sachan"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number (for OTP &amp; Technician Call)</label>
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Street Address &amp; Landmark</label>
                      <textarea
                        rows={2}
                        placeholder="House/Flat No., Building Name, Street, Landmark..."
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">City</label>
                        <input
                          type="text"
                          placeholder="e.g. Delhi NCR, Mumbai..."
                          value={customerCity}
                          onChange={(e) => setCustomerCity(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">PIN Code</label>
                        <input
                          type="text"
                          placeholder="6-digit PIN code"
                          value={customerPincode}
                          onChange={(e) => setCustomerPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                    </div>

                    {/* Bank / UPI details input if remaining balance is to be paid to customer */}
                    {balanceOwedToUser > 0 && (
                      <div className="pt-3 border-t border-slate-100">
                        <label className="block text-xs font-black text-emerald-800 mb-1.5">
                          Bank Account / UPI ID for ₹{balanceOwedToUser.toLocaleString('en-IN')} Balance Payout
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. username@okhdfcbank or Account Number & IFSC"
                          value={payoutDetails}
                          onChange={(e) => setPayoutDetails(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                        <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                          Remaining balance will be credited instantly after the technician receives and verifies your old device.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Payment Preference */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                    <CreditCard size={18} className="text-emerald-600" />
                    <span>
                      {balanceOwedToUser > 0
                        ? 'Doorstep Handover Payout Method'
                        : 'How would you like to pay the difference?'}
                    </span>
                  </h3>

                  {balanceOwedToUser > 0 ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                      <Wallet size={20} className="text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-slate-900">
                          Direct Instant Payout on Handover
                        </p>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          Technician will inspect your old device and transfer ₹{balanceOwedToUser.toLocaleString('en-IN')} via UPI/IMPS on the spot!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                          COD
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">Pay on Handover (Cash on Delivery)</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Pay remaining difference via cash or UPI to technician upon doorstep delivery</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-200/80 px-2.5 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Coupons & Exchange Order Summary (MATCHING SCREENSHOT 2) */}
              <div className="lg:col-span-5 2xl:col-span-4 space-y-6 lg:sticky lg:top-24">
                {/* Available Coupon Codes Engine */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={17} className="text-emerald-600" />
                    <h3 className="text-sm font-black text-slate-900">Apply Exchange Coupon</h3>
                  </div>

                  {/* Coupons list */}
                  <div className="space-y-2.5 mb-4">
                    {availableCoupons.map((c) => {
                      const isApplied = appliedCoupon?.code === c.code;
                      return (
                        <div
                          key={c.code}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isApplied
                              ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                                {c.code}
                              </span>
                              <span className="text-xs font-extrabold text-emerald-700">Save ₹{c.discount}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">{c.description}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => (isApplied ? setAppliedCoupon(null) : handleApplyCoupon(c))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                              isApplied
                                ? 'bg-slate-900 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {isApplied ? 'Applied' : 'Apply'}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Coupon Input */}
                  <form onSubmit={handleApplyCustomCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Have another promo code?"
                      value={customCouponInput}
                      onChange={(e) => setCustomCouponInput(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                  {couponError && <p className="text-[11px] text-rose-600 mt-1.5 font-semibold">{couponError}</p>}
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    FINAL DETAILED EXCHANGE ORDER SUMMARY (MATCHING SCREENSHOT 2)
                ────────────────────────────────────────────────────────────── */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-lg">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">
                    Exchange Order Summary
                  </h2>
                  <p className="text-xs text-slate-500 mb-6 font-medium">
                    Review your trade-in breakdown before booking
                  </p>

                  <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 text-xs sm:text-sm">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-slate-500 font-medium">Upgrading To</span>
                      <span className="font-bold text-slate-900 text-right">
                        {selectedUpgradeProduct.brand} {selectedUpgradeProduct.model} ({selectedUpgradeProduct.storage} · {selectedUpgradeProduct.color})
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Upgrade Product Price</span>
                      <span className="font-semibold text-slate-900">
                        ₹{upgradeDevicePrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-700">
                      <span className="font-medium">
                        Your Gear Valuation ({selectedOldDevice.name})
                      </span>
                      <span className="font-bold">
                        - ₹{oldDeviceNetValuation.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-700">
                      <span className="font-medium">Special Camsik Exchange Bonus</span>
                      <span className="font-bold">
                        - ₹{exchangeBonus.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-emerald-700 font-semibold">
                        <span>Coupon Discount ({appliedCoupon.code})</span>
                        <span>- ₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3.5 border-t border-slate-200 font-black text-base">
                      <span className="text-slate-900">Net Amount to Pay on Delivery</span>
                      <span className="text-emerald-600 text-2xl font-black">
                        ₹{netPayableAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Remaining balance callout if trade-in valuation exceeds upgrade price */}
                    {balanceOwedToUser > 0 && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-100/70 border border-emerald-300/80 text-emerald-950 text-xs font-bold flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-black text-emerald-900">
                            Extra Balance Paid to You: +₹{balanceOwedToUser.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                            Remaining balance will be paid directly to your bank account / UPI after receiving your device at your doorstep!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm CTA */}
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    <span>
                      {balanceOwedToUser > 0
                        ? `Confirm Exchange & Receive ₹${balanceOwedToUser.toLocaleString('en-IN')}`
                        : 'Confirm Doorstep Exchange'}
                    </span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="text-[11px] text-slate-400 text-center mt-3 font-medium">
                    Simultaneous doorstep pickup &amp; delivery · 100% verified certified gear
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 6: ORDER CONFIRMED SCREEN (SAVED TO /my-orders)
        ────────────────────────────────────────────────────────────── */}
        {step === 'confirmed' && confirmedOrder && (
          <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center p-8 sm:p-12">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle size={44} />
              </div>

              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3 inline-block">
                Doorstep Exchange Scheduled
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Exchange Order #{confirmedOrder.orderNumber} Confirmed! 🎉
              </h1>
              <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
                Our certified technician will visit your doorstep on <span className="font-bold text-slate-800">{confirmedOrder.pickupDate}</span> during <span className="font-bold text-slate-800">{confirmedOrder.pickupSlot}</span> with your new <span className="font-bold text-slate-800">{confirmedOrder.newDevice?.brand} {confirmedOrder.newDevice?.model}</span>.
              </p>

              {/* Itemized Order Breakdown Card */}
              <div className="mt-8 bg-slate-50 rounded-2xl border border-slate-200/80 p-6 text-left space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Your Handover Gear:</span>
                  <span className="font-bold text-slate-900">{confirmedOrder.oldDevice?.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">New Upgrade Gear Delivered:</span>
                  <span className="font-bold text-slate-900">
                    {confirmedOrder.newDevice?.brand} {confirmedOrder.newDevice?.model} ({confirmedOrder.newDevice?.storage})
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Trade-In Valuation Applied:</span>
                  <span className="font-bold">- ₹{confirmedOrder.tradeInCredit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Special Camsik Exchange Bonus:</span>
                  <span className="font-bold">- ₹{confirmedOrder.exchangeBonus.toLocaleString('en-IN')}</span>
                </div>
                {confirmedOrder.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount ({confirmedOrder.couponCode}):</span>
                    <span className="font-bold">- ₹{confirmedOrder.couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-black text-slate-900">
                  <span>Net Amount to Pay on Handover:</span>
                  <span className="text-emerald-600 text-xl font-black">
                    ₹{confirmedOrder.netPayable.toLocaleString('en-IN')}
                  </span>
                </div>

                {confirmedOrder.balanceOwedToUser && confirmedOrder.balanceOwedToUser > 0 && (
                  <div className="p-3.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-950 font-bold flex items-start gap-2 mt-2">
                    <Coins size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-sm text-emerald-900">
                        Remaining Balance to be Paid to You: +₹{confirmedOrder.balanceOwedToUser.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Will be deposited to your UPI / Bank account immediately after receiving &amp; testing your old device.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>Handover Address:</span>
                  <span className="font-semibold text-slate-800">
                    {confirmedOrder.customerAddress}, {confirmedOrder.city} - {confirmedOrder.pincode}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/my-orders"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Package size={15} />
                  <span>Check in My Orders</span>
                </Link>

                <Link
                  href={`/track-order?phone=${confirmedOrder.customerPhone}`}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <Truck size={15} />
                  <span>Track Live Status</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            LOGIN / AUTH POPUP MODAL GATE BEFORE ORDER CONFIRMATION
        ────────────────────────────────────────────────────────────── */}
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                  <User size={22} />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {authOtpSent ? 'Enter Verification OTP' : 'Sign In to Confirm Exchange'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {authOtpSent
                    ? `We sent a 4-digit code to +91 ${authPhone}`
                    : 'Verify your mobile number to link your trade-in and track your order in My Orders.'}
                </p>
              </div>

              <form onSubmit={handleQuickLoginSubmit} className="space-y-4">
                {!authOtpSent ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Adarsh Sachan"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">10-Digit Mobile Number</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="w-full px-4 py-3 rounded-r-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={authPhone.length < 10}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-600/20 mt-2"
                    >
                      Get Verification Code &rarr;
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Enter OTP (Any 4 digits)</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="• • • •"
                        value={authOtp}
                        onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center tracking-[1em] text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={authOtp.length < 4}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-600/20 mt-2"
                    >
                      Verify &amp; Confirm Order &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthOtpSent(false)}
                      className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 mt-2"
                    >
                      Change Mobile Number
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        )}
      </div>

      <UnserviceableAreaModal
        isOpen={showUnserviceableModal}
        pincode={customerPincode}
        onClose={() => setShowUnserviceableModal(false)}
        onGoHome={() => {
          setShowUnserviceableModal(false);
          setStep('select-old');
        }}
      />

      <CustomerFooter />
    </main>
  );
}