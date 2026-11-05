import { isValidLuhn, maskIMEI, extractTAC } from './luhn';
import { LocalVerificationProvider } from './providers/localProvider';
import { matchDevice } from './tacDatabase';

export async function runTestSuites() {
  const results: { test: string; passed: boolean; details?: any }[] = [];

  // Test 1: Luhn algorithm validation
  const validImei = '353046101234561'; // Valid 15 digits passing Luhn
  const invalidLuhnImei = '353046101234568';
  results.push({
    test: 'Luhn validation (valid vs invalid)',
    passed: isValidLuhn(validImei) === true && isValidLuhn(invalidLuhnImei) === false,
  });

  // Test 2: Masking
  const masked = maskIMEI(validImei);
  results.push({
    test: 'IMEI Masking format (35******12345)',
    passed: masked === '35******34561' && !masked.includes('0461012'),
  });

  // Test 3: TAC extraction
  const tac = extractTAC(validImei);
  results.push({
    test: 'TAC Extraction (first 8 digits)',
    passed: tac === '35304610',
  });

  // Test 4: Local provider with matching iPhone 16 Pro Max
  const localProvider = new LocalVerificationProvider();
  const matchReport = await localProvider.verifyDevice({
    imei: '353046101234561',
    selectedBrand: 'Apple',
    selectedModel: 'iPhone 16 Pro Max',
    selectedVariant: '256GB',
  });
  results.push({
    test: 'Local Verification - Matching Device',
    passed: matchReport.status === 'verified' && matchReport.matching.matched === true,
  });

  // Test 5: Local provider with mismatched device
  const mismatchReport = await localProvider.verifyDevice({
    imei: '353046101234561', // TAC maps to iPhone 16 Pro Max
    selectedBrand: 'Apple',
    selectedModel: 'iPhone 15 Pro Max',
  });
  results.push({
    test: 'Local Verification - Mismatch Detection',
    passed: mismatchReport.status === 'mismatch' && mismatchReport.matching.modelMatched === false,
  });

  // Test 6: Blacklist detection
  const blacklistedReport = await localProvider.verifyDevice({
    imei: '359999999999998',
    selectedBrand: 'Apple',
    selectedModel: 'iPhone 16 Pro Max',
  });
  results.push({
    test: 'Blacklist Detection',
    passed: blacklistedReport.security.blacklistStatus === 'blacklisted',
  });

  return results;
}
