import { DeviceVerificationProvider } from './interface';
import { DeviceVerificationReport, VerificationInput, BlacklistStatus } from '../types';
import { LocalVerificationProvider } from './localProvider';
import { isValidLuhn, maskIMEI, extractTAC, generateVerificationId } from '../luhn';
import { matchDevice } from '../tacDatabase';

export class IMEIInfoProvider implements DeviceVerificationProvider {
  name = 'IMEI.info Enhanced Verification';
  private localFallback = new LocalVerificationProvider();

  isAvailable(): boolean {
    const isEnabled = process.env.IMEI_INFO_ENABLED === 'true';
    const apiKey = process.env.IMEI_INFO_API_KEY;
    return Boolean(isEnabled && apiKey && apiKey.trim().length > 0);
  }

  async verifyDevice(input: VerificationInput): Promise<DeviceVerificationReport> {
    const rawImei = (input.imei || '').trim().replace(/\D/g, '');

    // First, run local integrity check
    if (rawImei.length !== 15 || !isValidLuhn(rawImei)) {
      return this.localFallback.verifyDevice(input);
    }

    if (!this.isAvailable()) {
      // Fallback silently and gracefully to local provider
      const localReport = await this.localFallback.verifyDevice(input);
      return {
        ...localReport,
        notes: [
          ...localReport.notes,
          'IMEI.info integration unconfigured or disabled; executed via Camsik Local Validation Engine.',
        ],
      };
    }

    const apiKey = process.env.IMEI_INFO_API_KEY!;
    const baseUrl = process.env.IMEI_INFO_BASE_URL || 'https://api.imei.info/api';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch(`${baseUrl}/check/imei`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          imei: rawImei,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`IMEI.info returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const verificationId = generateVerificationId();
      const maskedImei = maskIMEI(rawImei);
      const tac = extractTAC(rawImei);

      const detectedBrand = data.brand || data.manufacturer || input.selectedBrand;
      const detectedModel = data.model || data.marketing_name || input.selectedModel;
      const detectedVariant = data.internal_memory || data.storage || input.selectedVariant;

      const detectedDevice = {
        brand: detectedBrand,
        manufacturer: data.manufacturer || detectedBrand,
        model: detectedModel,
        marketingName: data.marketing_name || detectedModel,
        modelNumber: data.model_number || data.model,
        variant: detectedVariant,
        storage: detectedVariant,
        deviceType: data.device_type || 'Smartphone',
        os: data.os || 'Android / iOS',
      };

      const matching = matchDevice(
        {
          brand: input.selectedBrand,
          model: input.selectedModel,
          variant: input.selectedVariant,
        },
        detectedDevice
      );

      let blacklistStatus: BlacklistStatus = 'unknown';
      let blacklistRecord: any = undefined;

      if (data.blacklist) {
        if (data.blacklist.status === 'blacklisted' || data.blacklist.is_blacklisted) {
          blacklistStatus = 'blacklisted';
          blacklistRecord = {
            source: data.blacklist.source || 'GSMA Blacklist Registry',
            date: data.blacklist.date || new Date().toISOString(),
            reason: data.blacklist.reason || 'Flagged in international blacklist database.',
          };
        } else if (data.blacklist.status === 'clean' || data.blacklist.is_clean) {
          blacklistStatus = 'clean';
        }
      } else {
        blacklistStatus = 'clean';
      }

      let status: DeviceVerificationReport['status'] = 'verified';
      if (blacklistStatus === 'blacklisted') {
        status = 'failed';
      } else if (!matching.matched) {
        status = 'mismatch';
      }

      return {
        verificationId,
        status,
        source: 'imei-info',
        providerName: this.name,
        timestamp: new Date().toISOString(),
        device: detectedDevice,
        identifiers: {
          imei1: rawImei,
          imei2: input.imei2 ? input.imei2.trim().replace(/\D/g, '') : undefined,
          maskedImei,
          tac,
          luhnValid: true,
          serialNumber: data.serial_number,
        },
        matching,
        security: {
          blacklistStatus,
          blacklistRecord,
          carrierLock: data.sim_lock || 'Unlocked',
          activationStatus: data.activation_status || 'Activated',
          warrantyStatus: data.warranty_status || 'Verified',
        },
        notes: [
          'Verified via IMEI.info API live device lookup.',
          `GSMA database status: ${blacklistStatus.toUpperCase()}`,
        ],
      };
    } catch (err: any) {
      console.warn('IMEI.info lookup failed or timed out, failing over to local provider:', err?.message);
      const fallbackReport = await this.localFallback.verifyDevice(input);
      return {
        ...fallbackReport,
        notes: [
          ...fallbackReport.notes,
          'External IMEI provider currently unreachable; completed safely with Camsik Local Validation Engine.',
        ],
      };
    }
  }
}
