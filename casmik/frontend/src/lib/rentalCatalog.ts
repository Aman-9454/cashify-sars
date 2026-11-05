export type RentalCategory =
  | 'Cinema Cameras'
  | 'Mirrorless'
  | 'Cinema Lenses'
  | 'Gimbals & Rigs'
  | 'Action & Drones';

export type RentalBrand =
  | 'Sony'
  | 'Canon'
  | 'Nikon'
  | 'Fujifilm'
  | 'Blackmagic'
  | 'RED'
  | 'DJI'
  | 'Panasonic';

export interface RentalCamera {
  id: string;
  modelId: string;
  brand: RentalBrand;
  model: string;
  category: RentalCategory;
  sensor: string;
  mount: string;
  videoRes: string;
  dailyPrice: number;
  weeklyPrice: number;
  securityDeposit: number;
  rating: number;
  reviewsCount: number;
  image: string;
  gallery: string[];
  includedKit: string[];
  specs: string;
  features: string[];
  stock: number;
  status: 'available' | 'rented' | 'maintenance';
  popular?: boolean;
  minDays: number;
}

export const defaultRentalCameras: RentalCamera[] = [
  // ── 1. SONY FX3 CINEMA LINE ──
  {
    id: 'rent-sony-fx3',
    modelId: 'sony-fx3',
    brand: 'Sony',
    model: 'Sony FX3 Cinema Line Full-Frame',
    category: 'Cinema Cameras',
    sensor: '12.1MP Full-Frame Exmor R BSI CMOS',
    mount: 'Sony E-Mount',
    videoRes: 'UHD 4K 120p / FHD 240p 10-Bit 4:2:2',
    dailyPrice: 2899,
    weeklyPrice: 16999,
    securityDeposit: 8000,
    rating: 4.9,
    reviewsCount: 142,
    image: 'https://ik.imagekit.io/avdarinn/casmik/refurbished/sony-a7.jpg',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/refurbished/sony-a7.jpg',
      'https://ik.imagekit.io/avdarinn/casmik/categories/dslr.png',
      'https://ik.imagekit.io/avdarinn/casmik/categories/video.png',
    ],
    includedKit: [
      'Sony FX3 Camera Body with Sensor Cap',
      'XLR Top Handle Unit with 2x Audio Inputs',
      '2x Genuine Sony NP-FZ100 Batteries',
      'Dual-Bay Rapid Charger + AC Cable',
      '160GB CFexpress Type A High-Speed Card',
      'Pelican Air 1535 Waterproof Rugged Hard Case',
    ],
    specs: '15+ stops dynamic range, S-Cinetone, Active cooling fan for unlimited 4K record, Dual ISO 800 / 12,800',
    features: [
      'Compact handheld cage-free design with 1/4"-20 mounting threads',
      'Fast Hybrid AF with Real-Time Eye & Touch Tracking',
      '5-Axis in-body image stabilization with Active Mode',
      'Full size HDMI Type-A output with 16-bit RAW support',
    ],
    stock: 4,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 2. SONY A7 IV ──
  {
    id: 'rent-sony-a7iv',
    modelId: 'sony-a7iv',
    brand: 'Sony',
    model: 'Sony Alpha A7 IV Mirrorless Camera',
    category: 'Mirrorless',
    sensor: '33MP Full-Frame Exmor R CMOS',
    mount: 'Sony E-Mount',
    videoRes: '4K 60p 10-Bit 4:2:2 / 7K Oversampling',
    dailyPrice: 1499,
    weeklyPrice: 8999,
    securityDeposit: 5000,
    rating: 4.8,
    reviewsCount: 230,
    image: 'https://ik.imagekit.io/avdarinn/casmik/refurbished/sony-a7.jpg',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/refurbished/sony-a7.jpg',
      'https://ik.imagekit.io/avdarinn/casmik/categories/dslr.png',
    ],
    includedKit: [
      'Sony Alpha A7 IV Camera Body',
      '2x Sony NP-FZ100 Batteries',
      'Dual Charger with Power Adapter',
      '128GB SanDisk Extreme Pro 200MB/s V30 SD Card',
      'Pro Padded Camera Bag + Strap',
    ],
    specs: '33MP BSI sensor, BIONZ XR engine, 759-point phase detection AF, Breathing Compensation',
    features: [
      'Superb hybrid performance for pro weddings, events & fashion',
      'Vari-angle 3.0" touchscreen LCD',
      'Dual card slots (CFexpress Type A & SD UHS-II)',
      'S-Log3 & S-Cinetone color profiles included',
    ],
    stock: 6,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 3. CANON EOS R5 ──
  {
    id: 'rent-canon-eos-r5',
    modelId: 'canon-r5',
    brand: 'Canon',
    model: 'Canon EOS R5 8K Full-Frame Mirrorless',
    category: 'Mirrorless',
    sensor: '45MP Full-Frame CMOS Sensor',
    mount: 'Canon RF Mount',
    videoRes: '8K 30p RAW & 4K 120p 10-Bit Internal',
    dailyPrice: 2699,
    weeklyPrice: 15499,
    securityDeposit: 8000,
    rating: 4.9,
    reviewsCount: 118,
    image: 'https://ik.imagekit.io/avdarinn/casmik/refurbished/canon-eos-r.webp',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/refurbished/canon-eos-r.webp',
      'https://ik.imagekit.io/avdarinn/casmik/refurbished/canon-eos-rp.jpg',
      'https://ik.imagekit.io/avdarinn/casmik/categories/dslr.png',
    ],
    includedKit: [
      'Canon EOS R5 Camera Body',
      '2x Canon LP-E6NH High-Capacity Batteries',
      'Dual Smart Charger + AC Cord',
      '512GB CFexpress Type B Ultra-Speed Card (1700MB/s)',
      'Weatherproof Shockproof Flight Case',
    ],
    specs: '45MP resolution, Up to 8 stops In-Body Image Stabilization (IBIS), Dual Pixel CMOS AF II',
    features: [
      'Cinematic 8K DCI RAW recording without external recorder',
      'Deep learning autofocus tracking for humans, animals & vehicles',
      'Up to 20 fps silent electronic shutter',
      'Weather, dust, and moisture-sealed magnesium body',
    ],
    stock: 3,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 4. CANON EOS R6 MARK II ──
  {
    id: 'rent-canon-r6-mk2',
    modelId: 'canon-r6-mk2',
    brand: 'Canon',
    model: 'Canon EOS R6 Mark II Mirrorless Body',
    category: 'Mirrorless',
    sensor: '24.2MP Full-Frame CMOS Sensor',
    mount: 'Canon RF Mount',
    videoRes: '6K Oversampled 4K 60p Uncropped 10-Bit',
    dailyPrice: 1599,
    weeklyPrice: 9499,
    securityDeposit: 5000,
    rating: 4.9,
    reviewsCount: 95,
    image: 'https://ik.imagekit.io/avdarinn/casmik/refurbished/canon-eos-rp.jpg',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/refurbished/canon-eos-rp.jpg',
      'https://ik.imagekit.io/avdarinn/casmik/refurbished/canon-eos-r.webp',
    ],
    includedKit: [
      'Canon EOS R6 Mark II Body',
      '2x Canon LP-E6NH Batteries',
      'Dual Fast Charger',
      '128GB UHS-II V60 High-Speed SD Card',
      'Padded Protective Camera Sling',
    ],
    specs: 'Blazing 40 fps electronic shutter, 8 stops IBIS, Canon Log 3 & HDR PQ, 6 hour recording limit',
    features: [
      'Industry-leading low-light sensitivity up to ISO 102,400',
      'Advanced vehicle & aircraft AF tracking algorithms',
      'Dual UHS-II SD card slots for instant backup recording',
      'Pre-shooting buffer mode for fast sports & wildlife',
    ],
    stock: 5,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 5. SONY FX6 CINEMA CAMERA ──
  {
    id: 'rent-sony-fx6',
    modelId: 'sony-fx6',
    brand: 'Sony',
    model: 'Sony FX6 Full-Frame Cinema Camera (ILME-FX6)',
    category: 'Cinema Cameras',
    sensor: '10.2MP Full-Frame Back-Illuminated Exmor R',
    mount: 'Sony E-Mount',
    videoRes: '4K DCI 60p / 4K UHD 120p / FHD 240p',
    dailyPrice: 4499,
    weeklyPrice: 26999,
    securityDeposit: 15000,
    rating: 5.0,
    reviewsCount: 68,
    image: 'https://ik.imagekit.io/avdarinn/casmik/categories/video.png',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/categories/video.png',
      'https://ik.imagekit.io/avdarinn/casmik/refurbished/sony-a7.jpg',
    ],
    includedKit: [
      'Sony FX6 Cinema Camera Body with Smart Grip',
      'Smart Handle with Dual XLR Audio Controls',
      '3.5" LCD Viewfinder Monitor with Sun Hood',
      '2x BP-U60 High-Capacity Broadcast Batteries',
      'BC-U1A Fast Charger + DC Adapter',
      '160GB CFexpress Type A Pro Card + Card Reader',
      'Heavy-Duty Wheeled Master Hard Case',
    ],
    specs: 'Electronic Variable ND (1/4 to 1/128 ND), Dual Base ISO 800 / 12,800, 16-bit RAW 12G-SDI output',
    features: [
      'Netflix Approved production cinema camera',
      'Unsurpassed cinema autofocus with face & eye detection',
      'Pro 12G-SDI, HDMI, TC In/Out and Genlock sync ports',
      'Ultra-compact 0.89kg modular body for easy gimbal balancing',
    ],
    stock: 2,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 6. NIKON Z8 FLAGSHIP ──
  {
    id: 'rent-nikon-z8',
    modelId: 'nikon-z8',
    brand: 'Nikon',
    model: 'Nikon Z8 Flagship Pro Mirrorless Camera',
    category: 'Mirrorless',
    sensor: '45.7MP Full-Frame Stacked CMOS',
    mount: 'Nikon Z Mount',
    videoRes: '8.3K 60p N-RAW & 4.1K 120p ProRes RAW',
    dailyPrice: 2799,
    weeklyPrice: 16499,
    securityDeposit: 9000,
    rating: 4.9,
    reviewsCount: 76,
    image: 'https://ik.imagekit.io/avdarinn/casmik/refurbished/nikon-z50ii.png',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/refurbished/nikon-z50ii.png',
      'https://ik.imagekit.io/avdarinn/casmik/categories/dslr.png',
    ],
    includedKit: [
      'Nikon Z8 Pro Camera Body',
      '2x Nikon EN-EL15c Rechargeable Batteries',
      'Dual Quick Battery Charger',
      '512GB CFexpress Type B Card (1750 MB/s)',
      'Waterproof Sealed Hard Case',
    ],
    specs: 'Zero rolling shutter mechanical-free sensor, EXPEED 7 processor, 120 fps burst photography',
    features: [
      'Baby Z9 powerhouse with 30% smaller & lighter magnesium body',
      'Internal 12-bit N-RAW & ProRes 422 HQ recording without recorder',
      '9 subject detection types with 4-axis tilting touchscreen',
      'Dual USB-C ports (one for charging/power, one for tethering)',
    ],
    stock: 3,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 7. BLACKMAGIC POCKET CINEMA 6K PRO ──
  {
    id: 'rent-bmpcc-6k-pro',
    modelId: 'bmpcc-6k-pro',
    brand: 'Blackmagic',
    model: 'Blackmagic Pocket Cinema Camera 6K Pro',
    category: 'Cinema Cameras',
    sensor: 'Super 35 HDR Sensor (23.10 x 12.99mm)',
    mount: 'Canon EF Mount',
    videoRes: '6K (6144 x 3456) 50 fps / 4K DCI 60 fps',
    dailyPrice: 1899,
    weeklyPrice: 10999,
    securityDeposit: 6000,
    rating: 4.8,
    reviewsCount: 164,
    image: 'https://ik.imagekit.io/avdarinn/casmik/categories/video.png',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/categories/video.png',
      'https://ik.imagekit.io/avdarinn/casmik/categories/dslr.png',
    ],
    includedKit: [
      'BMPCC 6K Pro Body with Sensor Cap',
      'SmallRig Full Camera Cage with Top Handle & Cable Clamps',
      '3x NP-F570 Li-Ion Batteries',
      'Dual NP-F Charger + DC Mains Adapter',
      'Samsung T7 Shield 1TB High-Speed USB-C SSD + SSD Mount',
      'Padded Protective Cinema Kit Bag',
    ],
    specs: 'Built-in 2, 4, 6 stop motorized ND filters, Dual Native ISO 400 / 3200, 1500-nit HDR tilt screen',
    features: [
      'Legendary Blackmagic Generation 5 Color Science',
      'Dual mini XLR audio inputs with 48V phantom power',
      'Record directly to external USB-C SSD drives',
      '12-bit Blackmagic RAW workflow with DaVinci Resolve compatibility',
    ],
    stock: 4,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 8. RED KOMODO 6K CINEMA ──
  {
    id: 'rent-red-komodo',
    modelId: 'red-komodo',
    brand: 'RED',
    model: 'RED KOMODO 6K Global Shutter Cinema Camera',
    category: 'Cinema Cameras',
    sensor: '19.9MP Super 35 Global Shutter CMOS',
    mount: 'Canon RF Mount (with EF Adapter)',
    videoRes: '6K 40 fps / 4K 60 fps / 2K 120 fps REDCODE RAW',
    dailyPrice: 5499,
    weeklyPrice: 32999,
    securityDeposit: 20000,
    rating: 5.0,
    reviewsCount: 52,
    image: 'https://ik.imagekit.io/avdarinn/casmik/categories/video.png',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/categories/video.png',
      'https://ik.imagekit.io/avdarinn/casmik/categories/dslr.png',
    ],
    includedKit: [
      'RED KOMODO 6K Production Body',
      'Canon RF-to-EF Lens Mount Adapter with Drop-in Variable ND',
      'SmallRig Production Cage with Top Handle & Side Grips',
      'PortKeys BM5 III 5.5" 2200-nit SDI Touchscreen Monitor',
      '2x Core SWX V-Mount Micro Batteries + Dual V-Mount Charger',
      '2x 512GB RED CFAST 2.0 Cards + High-Speed USB-C Card Reader',
      'Custom Laser-Cut Pelican Air Hard Case',
    ],
    specs: 'Global Shutter sensor (zero flash banding, zero jello), REDCODE RAW 16-bit, 16+ stops dynamic range',
    features: [
      'World-class Hollywood feature film & high-end commercial standard',
      'Tiny 4x4x4 inch cubic form factor for drone, gimbal & car rigs',
      'Integrated wireless 4K camera control via iOS & Android RED App',
      '12G-SDI 4K live monitoring output',
    ],
    stock: 2,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 9. SONY A7S III ──
  {
    id: 'rent-sony-a7siii',
    modelId: 'sony-a7siii',
    brand: 'Sony',
    model: 'Sony Alpha A7S III 4K 120p Low-Light King',
    category: 'Mirrorless',
    sensor: '12.1MP Full-Frame Exmor R BSI CMOS',
    mount: 'Sony E-Mount',
    videoRes: '4K UHD 120p / FHD 240p 10-Bit 4:2:2 All-Intra',
    dailyPrice: 2299,
    weeklyPrice: 13499,
    securityDeposit: 7000,
    rating: 4.9,
    reviewsCount: 188,
    image: 'https://ik.imagekit.io/avdarinn/casmik/refurbished/sony-a7.jpg',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/refurbished/sony-a7.jpg',
      'https://ik.imagekit.io/avdarinn/casmik/categories/dslr.png',
    ],
    includedKit: [
      'Sony Alpha A7S III Body',
      '2x Sony NP-FZ100 Batteries',
      'Dual Rapid Charger',
      '160GB CFexpress Type A Tough Card',
      'Pro Water-Resistant Case',
    ],
    specs: 'ISO expandable to 409,600, S-Log3, 15+ stops dynamic range, 9.44M-dot Quad-XGA EVF',
    features: [
      'The world benchmark for nightclub, music video & night-shoot filmmaking',
      'Unsurpassed 4K 120fps slow-motion without overheating',
      'Full-size HDMI output with 16-bit RAW video out',
      'Fast Hybrid AF with 759 phase-detection points',
    ],
    stock: 3,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 10. FUJIFILM X-T5 ──
  {
    id: 'rent-fujifilm-xt5',
    modelId: 'fujifilm-xt5',
    brand: 'Fujifilm',
    model: 'Fujifilm X-T5 40MP Retro Hybrid Camera',
    category: 'Mirrorless',
    sensor: '40.2MP X-Trans CMOS 5 HR BSI Sensor',
    mount: 'Fujifilm X-Mount',
    videoRes: '6.2K 30p / 4K 60p 10-Bit 4:2:2 Internal',
    dailyPrice: 1199,
    weeklyPrice: 6999,
    securityDeposit: 4000,
    rating: 4.8,
    reviewsCount: 92,
    image: 'https://ik.imagekit.io/avdarinn/casmik/refurbished/fujifilm-xt5.jpg',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/refurbished/fujifilm-xt5.jpg',
      'https://ik.imagekit.io/avdarinn/casmik/categories/dslr.png',
    ],
    includedKit: [
      'Fujifilm X-T5 Camera Body',
      '2x Fujifilm NP-W235 Batteries',
      'Dual Fast Charger',
      '128GB SanDisk Extreme Pro SD Card',
      'Retro Leather Neck Strap + Padded Case',
    ],
    specs: '40.2MP detail, 19 Film Simulation recipes (including Nostalgic Neg), 7.0 stops IBIS',
    features: [
      'Gorgeous classic tactile analog dials for Shutter Speed, ISO & Exposure',
      'Compact lightweight 557g vintage weather-sealed body',
      'Deep AI subject tracking for birds, animals, cars & trains',
      'Pixel Shift Multi-Shot generates massive 160MP still files',
    ],
    stock: 4,
    status: 'available',
    popular: false,
    minDays: 1,
  },

  // ── 11. SONY FE 24-70MM F/2.8 GM II ──
  {
    id: 'rent-sony-2470gm2',
    modelId: 'sony-2470-gm2',
    brand: 'Sony',
    model: 'Sony FE 24-70mm f/2.8 GM II Pro Zoom Lens',
    category: 'Cinema Lenses',
    sensor: 'Full-Frame Compatible',
    mount: 'Sony E-Mount',
    videoRes: 'Optimized for 8K Optics & Silent XD Linear AF',
    dailyPrice: 899,
    weeklyPrice: 4999,
    securityDeposit: 3000,
    rating: 5.0,
    reviewsCount: 310,
    image: 'https://ik.imagekit.io/avdarinn/casmik/refurbished/sony-1635gm.jpg',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/refurbished/sony-1635gm.jpg',
      'https://ik.imagekit.io/avdarinn/casmik/categories/lens.png',
    ],
    includedKit: [
      'Sony FE 24-70mm f/2.8 GM II Lens',
      'Front & Rear Lens Caps',
      'ALC-SH168 Petal Lens Hood with Filter Window',
      '82mm B+W UV Nano Pro-Glass Filter',
      'Padded Cordura Lens Case with Shoulder Strap',
    ],
    specs: 'Constant f/2.8 maximum aperture, 4 XD Linear Motors, 22% lighter than Mk1, Close 0.21m focus',
    features: [
      'The essential workhorse lens for weddings, corporate & documentary',
      'Dedicated manual aperture ring with click/de-click switch',
      'Zoom smoothness switch (Tight / Smooth)',
      'Fluorine coated front element resists fingerprints & rain',
    ],
    stock: 8,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 12. SONY FE 70-200MM F/2.8 GM OSS II ──
  {
    id: 'rent-sony-70200gm2',
    modelId: 'sony-70200-gm2',
    brand: 'Sony',
    model: 'Sony FE 70-200mm f/2.8 GM OSS II Telephoto',
    category: 'Cinema Lenses',
    sensor: 'Full-Frame Compatible',
    mount: 'Sony E-Mount',
    videoRes: 'Optical SteadyShot with 3 Panning Modes',
    dailyPrice: 1199,
    weeklyPrice: 6999,
    securityDeposit: 4000,
    rating: 4.9,
    reviewsCount: 145,
    image: 'https://ik.imagekit.io/avdarinn/casmik/categories/lens.png',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/categories/lens.png',
      'https://ik.imagekit.io/avdarinn/casmik/refurbished/sony-1635gm.jpg',
    ],
    includedKit: [
      'Sony FE 70-200mm f/2.8 GM OSS II Lens',
      'Rotating Arca-Swiss Tripod Collar Foot',
      'Deep Round Lens Hood with Polarizer Access Port',
      'Front 77mm & Rear Lens Caps',
      'Semi-Rigid Padded Cylinder Case',
    ],
    specs: 'World’s lightest 70-200mm f/2.8 (only 1,045g), Internal zoom mechanism, 4 XD Linear AF Motors',
    features: [
      'Razor sharp telephoto reach for concerts, sports & creamy bridal portraits',
      '4x faster AF tracking compared to previous generation',
      'Full-time DMF (Direct Manual Focus) switch',
      'Compatible with 1.4x and 2.0x Sony teleconverters',
    ],
    stock: 5,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 13. CANON RF 28-70MM F/2L USM ──
  {
    id: 'rent-canon-rf-2870',
    modelId: 'canon-rf-2870',
    brand: 'Canon',
    model: 'Canon RF 28-70mm f/2L USM Prime-Killer Zoom',
    category: 'Cinema Lenses',
    sensor: 'Full-Frame Compatible',
    mount: 'Canon RF Mount',
    videoRes: 'Ultra-Fast f/2.0 Constant Aperture Throughout Zoom',
    dailyPrice: 1299,
    weeklyPrice: 7499,
    securityDeposit: 4500,
    rating: 5.0,
    reviewsCount: 88,
    image: 'https://ik.imagekit.io/avdarinn/casmik/categories/lens.png',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/categories/lens.png',
      'https://ik.imagekit.io/avdarinn/casmik/refurbished/canon-eos-r.webp',
    ],
    includedKit: [
      'Canon RF 28-70mm f/2L USM Lens',
      'EW-103 Locking Lens Hood',
      'Front 95mm & Rear Dust Caps',
      '95mm B+W Clear Protective Filter',
      'Heavy-Duty Padded Hard Shell Case',
    ],
    specs: 'Unprecedented constant f/2 aperture, L-series optical quality, Customizable lens control ring',
    features: [
      'Replaces an entire bag of primes (28mm, 35mm, 50mm, 70mm f/2)',
      'Unbelievable subject separation & creamy cinematic bokeh',
      'Ring-type USM ultrasonic focus motor for near-silent operation',
      'Weather-sealed against dust, sand, and splashing rain',
    ],
    stock: 4,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 14. DJI RONIN 4D 4-AXIS CINEMA ──
  {
    id: 'rent-dji-ronin-4d',
    modelId: 'dji-ronin-4d',
    brand: 'DJI',
    model: 'DJI Ronin 4D 4-Axis 6K Cinema Camera System',
    category: 'Cinema Cameras',
    sensor: 'Zenmuse X9-6K Full-Frame Sensor',
    mount: 'DJI DL Mount (with E-Mount & M-Mount units)',
    videoRes: '6K 60p & 4K 120p ProRes RAW & 422 HQ',
    dailyPrice: 6999,
    weeklyPrice: 39999,
    securityDeposit: 25000,
    rating: 5.0,
    reviewsCount: 39,
    image: 'https://ik.imagekit.io/avdarinn/casmik/categories/video.png',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/categories/video.png',
      'https://ik.imagekit.io/avdarinn/casmik/categories/gimbal.png',
    ],
    includedKit: [
      'DJI Ronin 4D 6K Cinema Body with X9 Gimbal Camera',
      'Active Z-Axis Vertical Stabilizer Arm with Counterweights',
      'Left & Right Modular Hand Grips with Focus Wheels',
      'High-Bright 1000-nit Wireless Remote Monitor',
      'LiDAR Range Finder for Auto-Manual Focus',
      '3x TB50 Intelligent Flight Batteries + Charging Hub',
      '1TB DJI PROSSD + High-Speed USB-C Cable',
      'Heavy-Duty Wheeled Master Hard Travel Case',
    ],
    specs: 'World’s first 4-axis active stabilization (eliminates footsteps completely), Built-in 9-stop ND filters',
    features: [
      'Revolutionary cinematic camera for dynamic tracking shots and single-operator crews',
      'Groundbreaking LiDAR wave focus display system',
      'O3 Pro Video Transmission technology for up to 6km wireless feed',
      'ActiveTrack Pro AI tracking stays locked onto actors automatically',
    ],
    stock: 2,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 15. DJI RS 3 PRO GIMBAL KIT ──
  {
    id: 'rent-dji-rs3-pro',
    modelId: 'dji-rs3-pro',
    brand: 'DJI',
    model: 'DJI RS 3 Pro Gimbal Stabilizer Combo Kit',
    category: 'Gimbals & Rigs',
    sensor: 'Up to 4.5kg (10 lbs) Camera Payload',
    mount: 'Dual-Layer Quick Release Plates (Arca-Swiss / Manfrotto)',
    videoRes: 'Supports FX3, FX6, Canon C70 & RED Komodo',
    dailyPrice: 699,
    weeklyPrice: 3899,
    securityDeposit: 2500,
    rating: 4.9,
    reviewsCount: 280,
    image: 'https://ik.imagekit.io/avdarinn/casmik/categories/gimbal.png',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/categories/gimbal.png',
      'https://ik.imagekit.io/avdarinn/casmik/categories/video.png',
    ],
    includedKit: [
      'DJI RS 3 Pro Gimbal with Carbon Fiber Axis Arms',
      'BG30 Battery Grip (12-Hour Runtime)',
      'Ronin Focus Motor (2022) with Rod Mount & Gear Strips',
      'Briefcase Handle for Low-Angle Shots',
      'RavenEye Image Transmission Transmitter Unit',
      'Phone Holder, Extended Grip/Tripod & Cable Pack',
      'Custom Padded Carry Case',
    ],
    specs: 'Automated axis locks, 1.8" OLED full-color touchscreen, 3rd-Gen RS stabilization algorithm',
    features: [
      'SuperSmooth mode provides extra stability for long lenses up to 100mm',
      'Bluetooth wireless camera shutter control without trailing cables',
      'Extended carbon fiber arms balance cinema cameras with matte boxes',
      'Dual-mode Bluetooth supports both record triggering and zoom control',
    ],
    stock: 7,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 16. CANON EOS C70 CINEMA ──
  {
    id: 'rent-canon-c70',
    modelId: 'canon-c70',
    brand: 'Canon',
    model: 'Canon EOS C70 4K Super 35 Cinema Camera',
    category: 'Cinema Cameras',
    sensor: 'Super 35mm DGO (Dual Gain Output) Sensor',
    mount: 'Canon RF Mount',
    videoRes: '4K DCI 120p / 2K 180p 10-Bit 4:2:2 XF-AVC',
    dailyPrice: 3299,
    weeklyPrice: 19499,
    securityDeposit: 10000,
    rating: 4.9,
    reviewsCount: 84,
    image: 'https://ik.imagekit.io/avdarinn/casmik/categories/video.png',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/categories/video.png',
      'https://ik.imagekit.io/avdarinn/casmik/refurbished/canon-eos-r.webp',
    ],
    includedKit: [
      'Canon EOS C70 Camera Body',
      'Removable Top Handle with Dual Mini-XLR Inputs',
      '2x Canon BP-A30 High Capacity Batteries',
      'CG-A20 Dual Battery Charger + Power Supply',
      '2x 128GB SanDisk Extreme Pro V90 SD Cards',
      'Custom Padded Weatherproof Cinema Case',
    ],
    specs: '16+ stops dynamic range with DGO, Built-in motorized 2/4/6/8/10 stop ND filters, Direct Touch AF control',
    features: [
      'Netflix Approved compact cinema powerhouse',
      'Dual Pixel CMOS AF with EOS iTR AF X eye/head detection',
      'Vertical shooting grip mode designed for social-first productions',
      'Dual SD slots for simultaneous recording in different codecs',
    ],
    stock: 3,
    status: 'available',
    popular: true,
    minDays: 1,
  },

  // ── 17. GOPRO HERO 12 BLACK CREATOR EDITION ──
  {
    id: 'rent-gopro-hero-12',
    modelId: 'gopro-hero-12',
    brand: 'Canon', // fallback brand category or generic
    model: 'GoPro HERO 12 Black Creator Edition Kit',
    category: 'Action & Drones',
    sensor: '1/1.9" 27MP Action Sensor with 8:7 Aspect Ratio',
    mount: 'Standard GoPro Quick Release & 1/4"-20 Thread',
    videoRes: '5.3K 60p / 4K 120p HDR Video with GP-Log',
    dailyPrice: 499,
    weeklyPrice: 2699,
    securityDeposit: 1500,
    rating: 4.8,
    reviewsCount: 312,
    image: 'https://ik.imagekit.io/avdarinn/casmik/categories/action.png',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/categories/action.png',
      'https://ik.imagekit.io/avdarinn/casmik/categories/dslr.png',
    ],
    includedKit: [
      'GoPro HERO 12 Black Camera Unit (Waterproof to 33ft/10m)',
      'Volta Battery Grip with Tripod Legs & Remote Controls',
      'Media Mod with Built-in Directional Mic & 3.5mm Port',
      'Light Mod Compact LED Video Fill Light',
      '3x Enduro Cold-Weather Rechargeable Batteries',
      'Dual Battery Charger + 128GB SanDisk Extreme MicroSD Card',
      'Hard Protective Travel Zipper Case',
    ],
    specs: 'HyperSmooth 6.0 with 360° Horizon Lock, Bluetooth wireless audio for AirPods/mic, Timecode sync',
    features: [
      'The ultimate portable vlogging, travel, adventure & extreme sport kit',
      'Record in full 8:7 ratio for effortless cropping to both 9:16 and 16:9',
      'Rugged, dustproof, and submersible without bulky underwater housing',
      'Over 5 hours of total 4K continuous battery recording life',
    ],
    stock: 9,
    status: 'available',
    popular: false,
    minDays: 1,
  },

  // ── 18. PANASONIC LUMIX S5IIX ──
  {
    id: 'rent-lumix-s5iix',
    modelId: 'lumix-s5iix',
    brand: 'Panasonic',
    model: 'Panasonic LUMIX S5IIX All-Black Cinema Hybrid',
    category: 'Mirrorless',
    sensor: '24.2MP Full-Frame CMOS Sensor',
    mount: 'Leica L-Mount',
    videoRes: '6K 30p / 4K 60p 10-Bit All-Intra & ProRes RAW',
    dailyPrice: 1399,
    weeklyPrice: 7999,
    securityDeposit: 4500,
    rating: 4.8,
    reviewsCount: 71,
    image: 'https://ik.imagekit.io/avdarinn/casmik/categories/video.png',
    gallery: [
      'https://ik.imagekit.io/avdarinn/casmik/categories/video.png',
      'https://ik.imagekit.io/avdarinn/casmik/categories/dslr.png',
    ],
    includedKit: [
      'Panasonic LUMIX S5IIX Matte Black Body',
      '2x Panasonic DMW-BLK22 Batteries',
      'Dual Rapid Charger with Display',
      'Samsung T7 Shield 1TB USB-C SSD for ProRes Direct Record',
      'Padded Protective Shoulder Bag',
    ],
    specs: 'Phase Hybrid AF, Active I.S. stabilization, Direct SSD Recording via USB-C, Live Streaming via Wi-Fi/Ethernet',
    features: [
      'Internal Apple ProRes 422 recording directly to USB SSD',
      'Sleek all-black stealth design without branding text',
      'Real-Time LUT grading preview directly on screen while shooting',
      'Dual native ISO for pristine noise-free low light shadows',
    ],
    stock: 3,
    status: 'available',
    popular: false,
    minDays: 1,
  },
];

const RENTAL_STORAGE_KEY = 'casmik_rental_catalog_v1';

export function getRentalCameras(): RentalCamera[] {
  if (typeof window === 'undefined') return defaultRentalCameras;
  try {
    const raw = localStorage.getItem(RENTAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RENTAL_STORAGE_KEY, JSON.stringify(defaultRentalCameras));
      return defaultRentalCameras;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge any new default cameras that might be missing in stored copy
      let changed = false;
      const merged = [...parsed];
      for (const def of defaultRentalCameras) {
        if (!merged.some((p) => p.id === def.id)) {
          merged.push(def);
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(RENTAL_STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    }
  } catch (e) {
    console.error('Failed to get rental cameras:', e);
  }
  return defaultRentalCameras;
}

export function saveRentalCameras(cameras: RentalCamera[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RENTAL_STORAGE_KEY, JSON.stringify(cameras));
    window.dispatchEvent(new CustomEvent('casmik_rental_catalog_updated', { detail: cameras }));
  } catch (e) {
    console.error('Failed to save rental cameras:', e);
  }
}

export function resetRentalCameras(): RentalCamera[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(RENTAL_STORAGE_KEY, JSON.stringify(defaultRentalCameras));
    window.dispatchEvent(new CustomEvent('casmik_rental_catalog_updated', { detail: defaultRentalCameras }));
  }
  return defaultRentalCameras;
}

export function getRentalCameraById(id: string): RentalCamera | undefined {
  const cameras = getRentalCameras();
  return cameras.find((c) => c.id === id || c.modelId === id);
}

// ── Multi-day Discount Calculator ──
export function calculateRentalPrice(
  dailyRate: number,
  days: number,
  deposit: number = 0
): {
  basePrice: number;
  discountPercent: number;
  discountAmount: number;
  rentalSubtotal: number;
  securityDeposit: number;
  grandTotal: number;
} {
  const validDays = Math.max(1, days);
  const basePrice = dailyRate * validDays;

  let discountPercent = 0;
  if (validDays >= 30) {
    discountPercent = 30; // 30% off for 1 month+
  } else if (validDays >= 14) {
    discountPercent = 20; // 20% off for 2 weeks+
  } else if (validDays >= 7) {
    discountPercent = 15; // 15% off for 1 week+
  } else if (validDays >= 3) {
    discountPercent = 10; // 10% off for 3+ days
  }

  const discountAmount = Math.round((basePrice * discountPercent) / 100);
  const rentalSubtotal = basePrice - discountAmount;
  const grandTotal = rentalSubtotal + deposit;

  return {
    basePrice,
    discountPercent,
    discountAmount,
    rentalSubtotal,
    securityDeposit: deposit,
    grandTotal,
  };
}
