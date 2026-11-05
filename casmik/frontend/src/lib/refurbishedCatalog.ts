export type ProductCategory = 'Smartphones' | 'Cameras' | 'Laptops' | 'Tablets' | 'Smartwatches';
export type ProductCondition = 'Superb' | 'Good' | 'Fair';

export interface InspectionItem {
  display: 'Passed' | 'Good';
  battery: 'Passed' | 'Good';
  camera: 'Passed' | 'Good';
  speakers: 'Passed' | 'Good';
  chargingPort: 'Passed' | 'Good';
  sensor: 'Passed' | 'Good'; // Face ID / Touch ID / Shutter Mechanism
}

export interface RefurbishedProduct {
  id: string;
  modelId: string;
  brand: string;
  model: string;
  category: ProductCategory;
  condition: ProductCondition;
  conditionNote: string;
  storage: string;
  color: string;
  originalPrice: number;
  sellingPrice: number;
  discount: number;
  batteryHealth: number | string; // e.g. 98 or "Shutter: 3,400"
  warranty: string;
  rating: number;
  reviews: number;
  deliveryDays: number;
  image: string;
  gallery: string[];
  stock: number;
  status: 'available' | 'reserved' | 'sold';
  specs: string;
  inspectionReport: InspectionItem;
}

export const defaultRefurbishedProducts: RefurbishedProduct[] = [
  // ── Smartphones ──
  {
    id: 'ref-phone-15-pro',
    modelId: 'iphone-15-pro',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    category: 'Smartphones',
    condition: 'Superb',
    conditionNote: 'Like new, minimal marks',
    storage: '128GB',
    color: 'Natural Titanium',
    originalPrice: 134900,
    sellingPrice: 58999,
    discount: 56,
    batteryHealth: 98,
    warranty: '12 months',
    rating: 4.9,
    reviews: 248,
    deliveryDays: 2,
    image: '/assets/images/refurbished/iphone-15-pro.png',
    gallery: [
      '/assets/images/refurbished/iphone-15-pro.png',
      '/assets/images/refurbished/iphone-15-pro-natural-back.jpg',
      '/assets/images/refurbished/iphone-15-pro-natural-camera.jpg',
    ],
    stock: 4,
    status: 'available',
    specs: '6.1" Super Retina XDR 120Hz, A17 Pro Chip, 48MP Triple Lens, Natural Titanium',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-phone-15-pro-256-blue',
    modelId: 'iphone-15-pro',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    category: 'Smartphones',
    condition: 'Superb',
    conditionNote: 'Pristine chassis, in original packaging',
    storage: '256GB',
    color: 'Blue Titanium',
    originalPrice: 144900,
    sellingPrice: 64999,
    discount: 55,
    batteryHealth: 99,
    warranty: '12 months',
    rating: 5.0,
    reviews: 189,
    deliveryDays: 2,
    image: '/assets/images/refurbished/iphone-15-pro-blue.jpg',
    gallery: [
      '/assets/images/refurbished/iphone-15-pro-blue.jpg',
      '/assets/images/refurbished/iphone-15-pro-blue-front.jpg',
      '/assets/images/refurbished/iphone-15-pro-blue-angle.jpg',
    ],
    stock: 2,
    status: 'available',
    specs: '6.1" Super Retina XDR 120Hz, A17 Pro Chip, 48MP Triple Lens, Blue Titanium',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-phone-15-pro-good-black',
    modelId: 'iphone-15-pro',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    category: 'Smartphones',
    condition: 'Good',
    conditionNote: 'Screen pristine, minor edge scuff',
    storage: '128GB',
    color: 'Black Titanium',
    originalPrice: 134900,
    sellingPrice: 52499,
    discount: 61,
    batteryHealth: 92,
    warranty: '12 months',
    rating: 4.8,
    reviews: 142,
    deliveryDays: 2,
    image: '/assets/images/refurbished/iphone-15-pro-black.jpg',
    gallery: [
      '/assets/images/refurbished/iphone-15-pro-black.jpg',
      '/assets/images/refurbished/iphone-15-pro-black-front.jpg',
      '/assets/images/refurbished/iphone-15-pro-black-angle.jpg',
    ],
    stock: 3,
    status: 'available',
    specs: '6.1" Super Retina XDR 120Hz, A17 Pro Chip, 48MP Triple Lens, Black Titanium',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-phone-15-pro-good-natural-256',
    modelId: 'iphone-15-pro',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    category: 'Smartphones',
    condition: 'Good',
    conditionNote: 'Microscopic marks on band, 100% verified',
    storage: '256GB',
    color: 'Natural Titanium',
    originalPrice: 144900,
    sellingPrice: 56999,
    discount: 61,
    batteryHealth: 90,
    warranty: '12 months',
    rating: 4.8,
    reviews: 167,
    deliveryDays: 2,
    image: '/assets/images/refurbished/iphone-15-pro-natural-back.jpg',
    gallery: [
      '/assets/images/refurbished/iphone-15-pro-natural-back.jpg',
      '/assets/images/refurbished/iphone-15-pro.png',
      '/assets/images/refurbished/iphone-15-pro-natural-camera.jpg',
    ],
    stock: 2,
    status: 'available',
    specs: '6.1" Super Retina XDR 120Hz, A17 Pro Chip, 48MP Triple Lens, Natural Titanium',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-phone-15-pro-fair-white',
    modelId: 'iphone-15-pro',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    category: 'Smartphones',
    condition: 'Fair',
    conditionNote: 'Noticeable frame wear, 100% functional screen & optics',
    storage: '128GB',
    color: 'White Titanium',
    originalPrice: 134900,
    sellingPrice: 46999,
    discount: 65,
    batteryHealth: 86,
    warranty: '6 months',
    rating: 4.7,
    reviews: 98,
    deliveryDays: 2,
    image: '/assets/images/refurbished/iphone-15-pro-white.jpg',
    gallery: [
      '/assets/images/refurbished/iphone-15-pro-white.jpg',
      '/assets/images/refurbished/iphone-15-pro-white-front.jpg',
      '/assets/images/refurbished/iphone-15-pro-white-angle.jpg',
    ],
    stock: 2,
    status: 'available',
    specs: '6.1" Super Retina XDR 120Hz, A17 Pro Chip, 48MP Triple Lens, White Titanium',
    inspectionReport: {
      display: 'Passed',
      battery: 'Good',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-phone-15-pro-fair-black-256',
    modelId: 'iphone-15-pro',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    category: 'Smartphones',
    condition: 'Fair',
    conditionNote: 'Visible signs of use, fully tested 45-point certified',
    storage: '256GB',
    color: 'Black Titanium',
    originalPrice: 144900,
    sellingPrice: 49999,
    discount: 66,
    batteryHealth: 84,
    warranty: '6 months',
    rating: 4.6,
    reviews: 114,
    deliveryDays: 2,
    image: '/assets/images/refurbished/iphone-15-pro-black-angle.jpg',
    gallery: [
      '/assets/images/refurbished/iphone-15-pro-black-angle.jpg',
      '/assets/images/refurbished/iphone-15-pro-black.jpg',
      '/assets/images/refurbished/iphone-15-pro-black-front.jpg',
    ],
    stock: 1,
    status: 'available',
    specs: '6.1" Super Retina XDR 120Hz, A17 Pro Chip, 48MP Triple Lens, Black Titanium',
    inspectionReport: {
      display: 'Passed',
      battery: 'Good',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-phone-14-pro-max-superb',
    modelId: 'iphone-14-pro-max',
    brand: 'Apple',
    model: 'iPhone 14 Pro Max',
    category: 'Smartphones',
    condition: 'Superb',
    conditionNote: 'Mint condition, zero blemishes',
    storage: '128GB',
    color: 'Space Black',
    originalPrice: 139900,
    sellingPrice: 58999,
    discount: 58,
    batteryHealth: 97,
    warranty: '12 months',
    rating: 4.9,
    reviews: 210,
    deliveryDays: 2,
    image: '/assets/images/refurbished/iphone-14-pro-max.png',
    gallery: [
      '/assets/images/refurbished/iphone-14-pro-max.png',
    ],
    stock: 3,
    status: 'available',
    specs: '6.7" Super Retina XDR OLED, A16 Bionic, 48MP Pro Camera System, Dynamic Island',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-phone-14-pro-max-fair',
    modelId: 'iphone-14-pro-max',
    brand: 'Apple',
    model: 'iPhone 14 Pro Max',
    category: 'Smartphones',
    condition: 'Fair',
    conditionNote: 'Visible corner scuffs, certified display & optics',
    storage: '128GB',
    color: 'Gold',
    originalPrice: 139900,
    sellingPrice: 44999,
    discount: 68,
    batteryHealth: 84,
    warranty: '6 months',
    rating: 4.6,
    reviews: 180,
    deliveryDays: 2,
    image: '/assets/images/refurbished/iphone-14-pro-gold.jpg',
    gallery: [
      '/assets/images/refurbished/iphone-14-pro-gold.jpg',
      '/assets/images/refurbished/iphone-14-pro-gold-camera.jpg',
    ],
    stock: 2,
    status: 'available',
    specs: '6.7" Super Retina XDR OLED, A16 Bionic, 48MP Pro Camera System, Dynamic Island',
    inspectionReport: {
      display: 'Passed',
      battery: 'Good',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-phone-14-pro-max',
    modelId: 'iphone-14-pro-max',
    brand: 'Apple',
    model: 'iPhone 14 Pro Max',
    category: 'Smartphones',
    condition: 'Good',
    conditionNote: 'Flawless display, minor back scuffs',
    storage: '256GB',
    color: 'Deep Purple',
    originalPrice: 139900,
    sellingPrice: 52999,
    discount: 62,
    batteryHealth: 92,
    warranty: '12 months',
    rating: 4.8,
    reviews: 312,
    deliveryDays: 2,
    image: '/assets/images/refurbished/iphone-14-pro-max.png',
    gallery: [
      '/assets/images/refurbished/iphone-14-pro-max.png',
    ],
    stock: 3,
    status: 'available',
    specs: '6.7" Super Retina XDR OLED, A16 Bionic, 48MP Pro Camera System, Dynamic Island',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-phone-s24-ultra',
    modelId: 'galaxy-s24-ultra',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    category: 'Smartphones',
    condition: 'Superb',
    conditionNote: 'Like new, minimal marks',
    storage: '256GB',
    color: 'Titanium Black',
    originalPrice: 129999,
    sellingPrice: 62999,
    discount: 52,
    batteryHealth: 97,
    warranty: '12 months',
    rating: 4.9,
    reviews: 312,
    deliveryDays: 2,
    image: '/assets/images/refurbished/galaxy-s24-ultra.png',
    gallery: [
      '/assets/images/refurbished/galaxy-s24-ultra.png',
    ],
    stock: 5,
    status: 'available',
    specs: '6.8" QHD+ AMOLED 2X 120Hz, Snapdragon 8 Gen 3, 200MP Quad Camera, S-Pen included',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-phone-s24-ultra-good',
    modelId: 'galaxy-s24-ultra',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    category: 'Smartphones',
    condition: 'Good',
    conditionNote: 'Light pocket wear on bezel, pristine display',
    storage: '256GB',
    color: 'Titanium Gray',
    originalPrice: 129999,
    sellingPrice: 56999,
    discount: 56,
    batteryHealth: 91,
    warranty: '12 months',
    rating: 4.8,
    reviews: 198,
    deliveryDays: 2,
    image: '/assets/images/refurbished/galaxy-s24-ultra.png',
    gallery: [
      '/assets/images/refurbished/galaxy-s24-ultra.png',
    ],
    stock: 3,
    status: 'available',
    specs: '6.8" QHD+ AMOLED 2X 120Hz, Snapdragon 8 Gen 3, 200MP Quad Camera, S-Pen included',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-phone-s24-ultra-fair',
    modelId: 'galaxy-s24-ultra',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    category: 'Smartphones',
    condition: 'Fair',
    conditionNote: 'Surface cosmetic scratches, S-Pen included, 100% functional',
    storage: '256GB',
    color: 'Titanium Violet',
    originalPrice: 129999,
    sellingPrice: 49999,
    discount: 62,
    batteryHealth: 85,
    warranty: '6 months',
    rating: 4.6,
    reviews: 142,
    deliveryDays: 2,
    image: '/assets/images/refurbished/galaxy-s24-violet.jpg',
    gallery: [
      '/assets/images/refurbished/galaxy-s24-violet.jpg',
      '/assets/images/refurbished/galaxy-s24-violet-camera.jpg',
    ],
    stock: 2,
    status: 'available',
    specs: '6.8" QHD+ AMOLED 2X 120Hz, Snapdragon 8 Gen 3, 200MP Quad Camera, S-Pen included',
    inspectionReport: {
      display: 'Passed',
      battery: 'Good',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-phone-oneplus-12',
    modelId: 'oneplus-12',
    brand: 'OnePlus',
    model: 'OnePlus 12 5G',
    category: 'Smartphones',
    condition: 'Superb',
    conditionNote: 'Mint condition, zero blemishes',
    storage: '256GB',
    color: 'Silky Black',
    originalPrice: 69999,
    sellingPrice: 41999,
    discount: 40,
    batteryHealth: 96,
    warranty: '12 months',
    rating: 4.8,
    reviews: 145,
    deliveryDays: 2,
    image: '/assets/images/refurbished/oneplus-12.png',
    gallery: [
      '/assets/images/refurbished/oneplus-12.png',
    ],
    stock: 4,
    status: 'available',
    specs: '6.82" 2K 120Hz ProXDR, Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera, 100W SuperVOOC',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-phone-pixel-8-pro',
    modelId: 'pixel-8-pro',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    category: 'Smartphones',
    condition: 'Good',
    conditionNote: 'Excellent condition with original charger',
    storage: '128GB',
    color: 'Obsidian Black',
    originalPrice: 106999,
    sellingPrice: 48999,
    discount: 54,
    batteryHealth: 93,
    warranty: '12 months',
    rating: 4.7,
    reviews: 178,
    deliveryDays: 2,
    image: '/assets/images/refurbished/pixel-8-pro.png',
    gallery: [
      '/assets/images/refurbished/pixel-8-pro.png',
    ],
    stock: 3,
    status: 'available',
    specs: '6.7" Super Actua OLED, Google Tensor G3, Pro Camera System with 5x Telephoto, 7-yr OS updates',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-phone-13-pro-max',
    modelId: 'iphone-13-pro-max',
    brand: 'Apple',
    model: 'iPhone 13 Pro Max',
    category: 'Smartphones',
    condition: 'Fair',
    conditionNote: 'Tested & 100% functional, visible exterior scuffs',
    storage: '256GB',
    color: 'Sierra Blue',
    originalPrice: 129900,
    sellingPrice: 38999,
    discount: 70,
    batteryHealth: 84,
    warranty: '6 months',
    rating: 4.6,
    reviews: 420,
    deliveryDays: 2,
    image: '/assets/images/refurbished/iphone-13-pro-max.png',
    gallery: [
      '/assets/images/refurbished/iphone-13-pro-max.png',
    ],
    stock: 2,
    status: 'available',
    specs: '6.7" ProMotion 120Hz, A15 Bionic, Cinematic Mode 4K, Ceramic Shield front',
    inspectionReport: {
      display: 'Passed',
      battery: 'Good',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },

  // ── Cameras & Optics ──
  {
    id: 'ref-cam-sony-a7',
    modelId: 'sony-alpha-a7',
    brand: 'Sony',
    model: 'Sony Alpha A7 (Body Only)',
    category: 'Cameras',
    condition: 'Superb',
    conditionNote: 'Clean sensor, low shutter count, original strap',
    storage: 'Body Only',
    color: 'Black',
    originalPrice: 95000,
    sellingPrice: 34999,
    discount: 63,
    batteryHealth: 'Shutter: 3,420',
    warranty: '12 months',
    rating: 4.9,
    reviews: 164,
    deliveryDays: 2,
    image: '/assets/images/refurbished/sony-a7.jpg',
    gallery: [
      '/assets/images/refurbished/sony-a7.jpg',
    ],
    stock: 3,
    status: 'available',
    specs: '24.3 MP Full-Frame Exmor CMOS Sensor, BIONZ X Processor, Fast Hybrid AF, Full HD 60p',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-cam-canon-eos-rp',
    modelId: 'canon-eos-rp',
    brand: 'Canon',
    model: 'Canon EOS RP Full Frame',
    category: 'Cameras',
    condition: 'Superb',
    conditionNote: 'Pristine sensor glass, battery health 99%',
    storage: 'Body Only',
    color: 'Matte Black',
    originalPrice: 110000,
    sellingPrice: 52999,
    discount: 52,
    batteryHealth: 'Shutter: 2,150',
    warranty: '12 months',
    rating: 4.8,
    reviews: 130,
    deliveryDays: 2,
    image: '/assets/images/refurbished/canon-eos-rp.jpg',
    gallery: [
      '/assets/images/refurbished/canon-eos-rp.jpg',
      '/assets/images/refurbished/canon-eos-r.webp',
    ],
    stock: 2,
    status: 'available',
    specs: '26.2 MP Full-Frame CMOS Sensor, DIGIC 8 Processor, Dual Pixel AF, Vari-Angle Touchscreen',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-cam-nikon-z50ii',
    modelId: 'nikon-z50ii',
    brand: 'Nikon',
    model: 'Nikon Z50 II Mirrorless',
    category: 'Cameras',
    condition: 'Good',
    conditionNote: 'Like new body, certified optical path',
    storage: 'Body Only',
    color: 'Black',
    originalPrice: 85000,
    sellingPrice: 46999,
    discount: 45,
    batteryHealth: 'Shutter: 4,800',
    warranty: '12 months',
    rating: 4.8,
    reviews: 95,
    deliveryDays: 2,
    image: '/assets/images/refurbished/nikon-z50ii.png',
    gallery: [
      '/assets/images/refurbished/nikon-z50ii.png',
    ],
    stock: 4,
    status: 'available',
    specs: '20.9 MP DX Sensor, EXPEED 7 Engine, AI Subject Detection, 4K UHD 60p video, Picture Controls',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-cam-sony-1635gm',
    modelId: 'sony-1635-gm',
    brand: 'Sony',
    model: 'Sony FE 16-35mm f/2.8 GM Lens',
    category: 'Cameras',
    condition: 'Superb',
    conditionNote: 'Zero fungus, pristine elements, hood included',
    storage: 'Lens with Hood',
    color: 'Black',
    originalPrice: 179900,
    sellingPrice: 84999,
    discount: 53,
    batteryHealth: 'Optics: 100% Clean',
    warranty: '12 months',
    rating: 5.0,
    reviews: 84,
    deliveryDays: 2,
    image: '/assets/images/refurbished/sony-1635gm.jpg',
    gallery: [
      '/assets/images/refurbished/sony-1635gm.jpg',
    ],
    stock: 2,
    status: 'available',
    specs: 'G Master Flagship Wide Zoom, Constant f/2.8, Direct Drive SSM, Nano AR Coating, Weather Sealed',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },

  // ── Laptops ──
  {
    id: 'ref-lap-macbook-air-m2',
    modelId: 'macbook-air-m2',
    brand: 'Apple',
    model: 'MacBook Air M2',
    category: 'Laptops',
    condition: 'Good',
    conditionNote: 'Flawless Liquid Retina screen, clean palm rest',
    storage: '256GB SSD',
    color: 'Space Gray',
    originalPrice: 114900,
    sellingPrice: 72999,
    discount: 36,
    batteryHealth: 94,
    warranty: '12 months',
    rating: 4.9,
    reviews: 210,
    deliveryDays: 2,
    image: '/assets/images/refurbished/macbook-air-m2.png',
    gallery: [
      '/assets/images/refurbished/macbook-air-m2.png',
    ],
    stock: 4,
    status: 'available',
    specs: '13.6" Liquid Retina, Apple M2 chip 8-core CPU / 8-core GPU, 8GB Unified RAM, MagSafe 3',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-lap-macbook-pro-14',
    modelId: 'macbook-pro-14',
    brand: 'Apple',
    model: 'MacBook Pro 14" M3 Pro',
    category: 'Laptops',
    condition: 'Superb',
    conditionNote: 'Under 30 battery cycles, pristine chassis',
    storage: '512GB SSD',
    color: 'Space Black',
    originalPrice: 199900,
    sellingPrice: 129999,
    discount: 35,
    batteryHealth: 99,
    warranty: '12 months',
    rating: 5.0,
    reviews: 92,
    deliveryDays: 2,
    image: '/assets/images/refurbished/macbook-pro-14.png',
    gallery: [
      '/assets/images/refurbished/macbook-pro-14.png',
    ],
    stock: 2,
    status: 'available',
    specs: '14.2" Liquid Retina XDR ProMotion 120Hz, M3 Pro 11-core CPU, 18GB RAM, 512GB SSD, HDMI, SDXC',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-lap-dell-xps-15',
    modelId: 'dell-xps-15',
    brand: 'Dell',
    model: 'Dell XPS 15 9530',
    category: 'Laptops',
    condition: 'Good',
    conditionNote: 'Clean keyboard & 3.5K OLED touchscreen',
    storage: '512GB SSD',
    color: 'Platinum Silver',
    originalPrice: 149900,
    sellingPrice: 69999,
    discount: 53,
    batteryHealth: 88,
    warranty: '6 months',
    rating: 4.7,
    reviews: 78,
    deliveryDays: 2,
    image: '/assets/images/refurbished/dell-xps-15.png',
    gallery: [
      '/assets/images/refurbished/dell-xps-15.png',
    ],
    stock: 3,
    status: 'available',
    specs: '15.6" 3.5K OLED Touch, Intel Core i7-13700H, 16GB DDR5 RAM, 512GB Gen4 SSD, RTX 4060 8GB',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },

  // ── Tablets & Wearables ──
  {
    id: 'ref-tab-ipad-pro-129',
    modelId: 'ipad-pro-129',
    brand: 'Apple',
    model: 'iPad Pro 12.9" M2',
    category: 'Tablets',
    condition: 'Good',
    conditionNote: 'Flawless Liquid Retina XDR mini-LED, minimal bezel wear',
    storage: '128GB Wi-Fi',
    color: 'Space Gray',
    originalPrice: 112900,
    sellingPrice: 58999,
    discount: 48,
    batteryHealth: 95,
    warranty: '12 months',
    rating: 4.9,
    reviews: 140,
    deliveryDays: 2,
    image: '/assets/images/refurbished/ipad-pro-m2.jpg',
    gallery: [
      '/assets/images/refurbished/ipad-pro-m2.jpg',
    ],
    stock: 3,
    status: 'available',
    specs: '12.9" Liquid Retina XDR mini-LED 120Hz, Apple M2 chip, Face ID, Thunderbolt 4, Apple Pencil 2 support',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-tab-galaxy-s9',
    modelId: 'galaxy-tab-s9-ultra',
    brand: 'Samsung',
    model: 'Galaxy Tab S9 Ultra',
    category: 'Tablets',
    condition: 'Superb',
    conditionNote: 'Like new, S-Pen included in box',
    storage: '256GB Wi-Fi',
    color: 'Graphite',
    originalPrice: 108999,
    sellingPrice: 54999,
    discount: 50,
    batteryHealth: 96,
    warranty: '12 months',
    rating: 4.8,
    reviews: 86,
    deliveryDays: 2,
    image: '/assets/images/refurbished/galaxy-tab-s9.jpg',
    gallery: [
      '/assets/images/refurbished/galaxy-tab-s9.jpg',
    ],
    stock: 3,
    status: 'available',
    specs: '14.6" Dynamic AMOLED 2X 120Hz, Snapdragon 8 Gen 2, IP68 water resistance, Quad AKG speakers',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
  {
    id: 'ref-watch-apple-ultra',
    modelId: 'apple-watch-ultra',
    brand: 'Apple',
    model: 'Apple Watch Ultra',
    category: 'Smartwatches',
    condition: 'Superb',
    conditionNote: 'Titanium casing pristine, battery health 99%',
    storage: '49mm GPS + Cellular',
    color: 'Titanium / Alpine Loop',
    originalPrice: 89900,
    sellingPrice: 39999,
    discount: 55,
    batteryHealth: 99,
    warranty: '12 months',
    rating: 4.9,
    reviews: 194,
    deliveryDays: 2,
    image: '/assets/images/refurbished/apple-watch-ultra.jpg',
    gallery: [
      '/assets/images/refurbished/apple-watch-ultra.jpg',
    ],
    stock: 4,
    status: 'available',
    specs: '49mm Aerospace-grade Titanium, 100m Water Resistance, Dual-Frequency GPS, Action Button, 36h Battery',
    inspectionReport: {
      display: 'Passed',
      battery: 'Passed',
      camera: 'Passed',
      speakers: 'Passed',
      chargingPort: 'Passed',
      sensor: 'Passed',
    },
  },
];

const STORAGE_KEY = 'casmik_refurbished_catalog_v6';

export function getModelKey(p: { modelId?: string; model: string }): string {
  if (p.modelId && p.modelId.trim() !== '') {
    return p.modelId.trim().toLowerCase();
  }
  return p.model
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getVariantsByModel(products: RefurbishedProduct[], modelKey: string): RefurbishedProduct[] {
  const target = modelKey.trim().toLowerCase();
  return products.filter((p) => getModelKey(p) === target);
}

export function getConditionsForModel(
  products: RefurbishedProduct[],
  modelKey: string
): Record<ProductCondition, RefurbishedProduct[]> {
  const variants = getVariantsByModel(products, modelKey);
  return {
    Superb: variants.filter((p) => p.condition === 'Superb'),
    Good: variants.filter((p) => p.condition === 'Good'),
    Fair: variants.filter((p) => p.condition === 'Fair'),
  };
}

export function getRefurbishedProducts(): RefurbishedProduct[] {
  if (typeof window === 'undefined') {
    return defaultRefurbishedProducts;
  }
  try {
    // Purge old storage versions to avoid stale images
    [
      'casmik_refurbished_catalog_v1',
      'casmik_refurbished_catalog_v2',
      'casmik_refurbished_catalog_v3',
      'casmik_refurbished_catalog_v4',
      'casmik_refurbished_catalog_v5',
    ].forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (_) {}
    });

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultRefurbishedProducts));
      return defaultRefurbishedProducts;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Auto-sync images and galleries with defaultRefurbishedProducts so code updates take effect immediately
      const defaultMap = new Map(defaultRefurbishedProducts.map((p) => [p.id, p]));
      let changed = false;
      const synced = parsed.map((p) => {
        const def = defaultMap.get(p.id);
        if (def) {
          if (p.image !== def.image || JSON.stringify(p.gallery) !== JSON.stringify(def.gallery)) {
            changed = true;
            return {
              ...p,
              image: def.image,
              gallery: def.gallery,
            };
          }
        }
        return p;
      });

      // Ensure any new products in defaultRefurbishedProducts exist in the synced catalog
      for (const def of defaultRefurbishedProducts) {
        if (!synced.some((p) => p.id === def.id)) {
          synced.push(def);
          changed = true;
        }
      }

      if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
      }
      return synced;
    }
  } catch (err) {
    console.error('Error reading refurbished catalog:', err);
  }
  return defaultRefurbishedProducts;
}

export function saveRefurbishedProducts(products: RefurbishedProduct[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('casmik_refurbished_updated', { detail: products }));
  } catch (err) {
    console.error('Error saving refurbished catalog:', err);
  }
}

export function resetRefurbishedProducts(): RefurbishedProduct[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultRefurbishedProducts));
    window.dispatchEvent(new CustomEvent('casmik_refurbished_updated', { detail: defaultRefurbishedProducts }));
  }
  return defaultRefurbishedProducts;
}

export const DEFAULT_REFURBISHED_PRODUCTS = defaultRefurbishedProducts;
