import { DeviceVerificationProvider } from './interface';
import { LocalVerificationProvider } from './localProvider';
import { IMEIInfoProvider } from './imeiInfoProvider';

export function getVerificationProvider(): DeviceVerificationProvider {
  const providerType = (process.env.IMEI_PROVIDER || 'local').toLowerCase().trim();

  if (providerType === 'imei-info' || process.env.IMEI_INFO_ENABLED === 'true') {
    const imeiInfo = new IMEIInfoProvider();
    if (imeiInfo.isAvailable()) {
      return imeiInfo;
    }
  }

  return new LocalVerificationProvider();
}

export * from './interface';
export * from './localProvider';
export * from './imeiInfoProvider';
