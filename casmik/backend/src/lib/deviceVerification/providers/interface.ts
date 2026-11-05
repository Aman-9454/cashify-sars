import { DeviceVerificationReport, VerificationInput } from '../types';

export interface DeviceVerificationProvider {
  name: string;
  isAvailable(): boolean;
  verifyDevice(input: VerificationInput): Promise<DeviceVerificationReport>;
}
