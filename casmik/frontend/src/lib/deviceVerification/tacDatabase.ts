import { DeviceInfo, DeviceMatchingResult } from './types';

export interface TACRecord {
  tac: string;
  brand: string;
  model: string;
  marketingName?: string;
  modelNumber?: string;
  os?: string;
  network?: string;
}

// Built-in curated TAC database for popular smartphones
export const TAC_DATABASE: TACRecord[] = [
  // Apple iPhone 16 Series
  { tac: '35304610', brand: 'Apple', model: 'iPhone 16 Pro Max', marketingName: 'iPhone 16 Pro Max', modelNumber: 'A3296', os: 'iOS 18', network: '5G' },
  { tac: '35304710', brand: 'Apple', model: 'iPhone 16 Pro', marketingName: 'iPhone 16 Pro', modelNumber: 'A3293', os: 'iOS 18', network: '5G' },
  { tac: '35304810', brand: 'Apple', model: 'iPhone 16 Plus', marketingName: 'iPhone 16 Plus', modelNumber: 'A3290', os: 'iOS 18', network: '5G' },
  { tac: '35304910', brand: 'Apple', model: 'iPhone 16', marketingName: 'iPhone 16', modelNumber: 'A3287', os: 'iOS 18', network: '5G' },

  // Apple iPhone 15 Series
  { tac: '35693811', brand: 'Apple', model: 'iPhone 15 Pro Max', marketingName: 'iPhone 15 Pro Max', modelNumber: 'A3106', os: 'iOS 17', network: '5G' },
  { tac: '35201211', brand: 'Apple', model: 'iPhone 15 Pro', marketingName: 'iPhone 15 Pro', modelNumber: 'A3102', os: 'iOS 17', network: '5G' },
  { tac: '35875110', brand: 'Apple', model: 'iPhone 15 Plus', marketingName: 'iPhone 15 Plus', modelNumber: 'A3094', os: 'iOS 17', network: '5G' },
  { tac: '35438210', brand: 'Apple', model: 'iPhone 15', marketingName: 'iPhone 15', modelNumber: 'A3090', os: 'iOS 17', network: '5G' },

  // Apple iPhone 14 & 13 Series
  { tac: '35241911', brand: 'Apple', model: 'iPhone 14 Pro Max', marketingName: 'iPhone 14 Pro Max', modelNumber: 'A2894', os: 'iOS 16', network: '5G' },
  { tac: '35198211', brand: 'Apple', model: 'iPhone 14 Pro', marketingName: 'iPhone 14 Pro', modelNumber: 'A2890', os: 'iOS 16', network: '5G' },
  { tac: '35781911', brand: 'Apple', model: 'iPhone 14', marketingName: 'iPhone 14', modelNumber: 'A2882', os: 'iOS 16', network: '5G' },
  { tac: '35541911', brand: 'Apple', model: 'iPhone 13 Pro Max', marketingName: 'iPhone 13 Pro Max', modelNumber: 'A2643', os: 'iOS 15', network: '5G' },
  { tac: '35619211', brand: 'Apple', model: 'iPhone 13', marketingName: 'iPhone 13', modelNumber: 'A2633', os: 'iOS 15', network: '5G' },

  // Samsung Galaxy S Series
  { tac: '35698411', brand: 'Samsung', model: 'Galaxy S24 Ultra', marketingName: 'Galaxy S24 Ultra 5G', modelNumber: 'SM-S928B', os: 'Android 14', network: '5G' },
  { tac: '35749210', brand: 'Samsung', model: 'Galaxy S24+', marketingName: 'Galaxy S24+ 5G', modelNumber: 'SM-S926B', os: 'Android 14', network: '5G' },
  { tac: '35912308', brand: 'Samsung', model: 'Galaxy S24', marketingName: 'Galaxy S24 5G', modelNumber: 'SM-S921B', os: 'Android 14', network: '5G' },
  { tac: '35246811', brand: 'Samsung', model: 'Galaxy S23 Ultra', marketingName: 'Galaxy S23 Ultra 5G', modelNumber: 'SM-S918B', os: 'Android 13', network: '5G' },
  { tac: '35112411', brand: 'Samsung', model: 'Galaxy S23', marketingName: 'Galaxy S23 5G', modelNumber: 'SM-S911B', os: 'Android 13', network: '5G' },
  { tac: '35451911', brand: 'Samsung', model: 'Galaxy Z Fold 5', marketingName: 'Galaxy Z Fold 5', modelNumber: 'SM-F946B', os: 'Android 13', network: '5G' },

  // Google Pixel Series
  { tac: '35712309', brand: 'Google', model: 'Pixel 9 Pro XL', marketingName: 'Pixel 9 Pro XL', modelNumber: 'GEC77', os: 'Android 14', network: '5G' },
  { tac: '35841210', brand: 'Google', model: 'Pixel 9 Pro', marketingName: 'Pixel 9 Pro', modelNumber: 'GC148', os: 'Android 14', network: '5G' },
  { tac: '35661210', brand: 'Google', model: 'Pixel 8 Pro', marketingName: 'Pixel 8 Pro', modelNumber: 'GC3VE', os: 'Android 14', network: '5G' },
  { tac: '35441210', brand: 'Google', model: 'Pixel 8', marketingName: 'Pixel 8', modelNumber: 'GKWS6', os: 'Android 14', network: '5G' },

  // OnePlus Series
  { tac: '86754304', brand: 'OnePlus', model: 'OnePlus 12', marketingName: 'OnePlus 12 5G', modelNumber: 'CPH2573', os: 'OxygenOS 14', network: '5G' },
  { tac: '86940305', brand: 'OnePlus', model: 'OnePlus 12R', marketingName: 'OnePlus 12R 5G', modelNumber: 'CPH2585', os: 'OxygenOS 14', network: '5G' },
  { tac: '86421305', brand: 'OnePlus', model: 'OnePlus 11', marketingName: 'OnePlus 11 5G', modelNumber: 'CPH2449', os: 'OxygenOS 13', network: '5G' },

  // Xiaomi & Others
  { tac: '86849304', brand: 'Xiaomi', model: 'Xiaomi 14 Ultra', marketingName: 'Xiaomi 14 Ultra', modelNumber: '24030PN60G', os: 'HyperOS', network: '5G' },
  { tac: '86543204', brand: 'Xiaomi', model: 'Xiaomi 14', marketingName: 'Xiaomi 14', modelNumber: '23127PN0CG', os: 'HyperOS', network: '5G' },
  { tac: '86221104', brand: 'Vivo', model: 'X100 Pro', marketingName: 'Vivo X100 Pro', modelNumber: 'V2309', os: 'Funtouch OS 14', network: '5G' },
];

/**
 * Normalizes string for fuzzy matching (lowercases, strips spaces, hyphens, and punctuation).
 */
export function normalizeDeviceString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Looks up TAC code in our database.
 */
export function lookupTAC(tac: string): TACRecord | null {
  if (!tac) return null;
  const clean = tac.trim().slice(0, 8);
  const found = TAC_DATABASE.find(t => t.tac === clean);
  return found || null;
}

/**
 * Compares selected device with detected device.
 */
export function matchDevice(
  selected: { brand: string; model: string; variant?: string },
  detected: DeviceInfo
): DeviceMatchingResult {
  const normSelectedBrand = normalizeDeviceString(selected.brand);
  const normDetectedBrand = normalizeDeviceString(detected.brand);

  const normSelectedModel = normalizeDeviceString(selected.model);
  const normDetectedModel = normalizeDeviceString(detected.model);

  // Brand Match
  const brandMatched =
    normSelectedBrand === normDetectedBrand ||
    normSelectedBrand.includes(normDetectedBrand) ||
    normDetectedBrand.includes(normSelectedBrand);

  // Model Match
  const modelMatched =
    normSelectedModel === normDetectedModel ||
    normSelectedModel.includes(normDetectedModel) ||
    normDetectedModel.includes(normSelectedModel);

  // Variant Match (if variant provided)
  let variantMatched = true;
  if (selected.variant && detected.variant) {
    const normSelectedVar = normalizeDeviceString(selected.variant);
    const normDetectedVar = normalizeDeviceString(detected.variant);
    variantMatched =
      normSelectedVar === normDetectedVar ||
      normSelectedVar.includes(normDetectedVar) ||
      normDetectedVar.includes(normSelectedVar);
  }

  const matched = brandMatched && modelMatched;

  let mismatchReason: string | undefined;
  if (!brandMatched) {
    mismatchReason = `Selected brand "${selected.brand}" does not match detected brand "${detected.brand}".`;
  } else if (!modelMatched) {
    mismatchReason = `Selected model "${selected.model}" does not match detected model "${detected.model}".`;
  } else if (!variantMatched) {
    mismatchReason = `Selected variant "${selected.variant}" does not match detected variant "${detected.variant}".`;
  }

  return {
    matched,
    brandMatched,
    modelMatched,
    variantMatched,
    mismatchReason,
    selectedDevice: {
      brand: selected.brand,
      model: selected.model,
      variant: selected.variant,
    },
    detectedDevice: {
      brand: detected.brand,
      model: detected.model,
      variant: detected.variant,
    },
  };
}
