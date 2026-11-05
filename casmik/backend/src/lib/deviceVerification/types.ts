export type DeviceVerificationStatus = 'pending' | 'verified' | 'failed' | 'mismatch' | 'expired';

export type BlacklistStatus = 'clean' | 'blacklisted' | 'unknown';

export interface DeviceInfo {
  brand: string;
  manufacturer?: string;
  model: string;
  marketingName?: string;
  modelNumber?: string;
  variant?: string;
  storage?: string;
  ram?: string;
  deviceType?: string;
  os?: string;
  osVersion?: string;
}

export interface VerificationIdentifiers {
  imei1: string;
  imei2?: string;
  maskedImei: string;
  tac: string;
  serialNumber?: string;
  luhnValid: boolean;
}

export interface DeviceMatchingResult {
  matched: boolean;
  brandMatched: boolean;
  modelMatched: boolean;
  variantMatched: boolean;
  mismatchReason?: string;
  selectedDevice: {
    brand: string;
    model: string;
    variant?: string;
  };
  detectedDevice: {
    brand: string;
    model: string;
    variant?: string;
  };
}

export interface NetworkAndSecurityInfo {
  carrier?: string;
  simInfo?: string;
  networkCapability?: string; // 5G, 4G
  carrierLock?: string; // Unlocked, Locked
  activationStatus?: string; // Activated, Not Activated
  blacklistStatus: BlacklistStatus;
  blacklistRecord?: {
    source?: string;
    date?: string;
    reason?: string;
  };
  warrantyStatus?: string;
  refurbishedStatus?: string;
}

export interface DeviceVerificationReport {
  verificationId: string; // e.g. CAM-IMEI-XXXXXXXX
  sessionId?: string;
  status: DeviceVerificationStatus;
  source: 'local' | 'imei-info' | 'mobile-diagnostics' | 'ceir-reference';
  providerName: string;
  timestamp: string;
  device: DeviceInfo;
  identifiers: VerificationIdentifiers;
  matching: DeviceMatchingResult;
  security: NetworkAndSecurityInfo;
  notes: string[];
}

export interface DeviceVerificationSession {
  sessionId: string;
  token: string;
  userId?: string;
  sellFlowId?: string;
  status: 'active' | 'completed' | 'expired' | 'failed';
  createdAt: string;
  expiresAt: string;
  selectedDevice: {
    category?: string;
    brand: string;
    model: string;
    variant?: string;
    storage?: string;
    color?: string;
  };
  deviceDetected?: boolean;
  imeiVerified?: boolean;
  deviceMatched?: boolean;
  webVerificationUrl?: string;
  appDeepLink?: string;
  verificationReport?: DeviceVerificationReport;
}

export interface VerificationInput {
  imei: string;
  imei2?: string;
  selectedBrand: string;
  selectedModel: string;
  selectedVariant?: string;
  source?: 'website-manual' | 'mobile-app' | 'qr-session';
  deviceDetailsFromApp?: Partial<DeviceInfo>;
}
