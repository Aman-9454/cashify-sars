import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface InspectionCriterion {
  id: string;
  key: string;
  label: string;
  sublabel: string;
  category: 'screen' | 'sensor' | 'body' | 'battery' | 'motherboard' | 'optics';
  deductionAmount: number;
  scoreWeight: number;
  isPassedByDefault: boolean;
}

const defaultCriteria: InspectionCriterion[] = [
  {
    id: 'crit-screen',
    key: 'screenOriginal',
    label: 'OEM Display & Screen Glass',
    sublabel: 'No lines, OEM calibration, zero discoloration or dead pixels',
    category: 'screen',
    deductionAmount: 4500,
    scoreWeight: 20,
    isPassedByDefault: true,
  },
  {
    id: 'crit-touch',
    key: 'touchPerfect',
    label: 'Digitizer & Touch Responsiveness',
    sublabel: 'Instant multi-touch response across all 10 fingers & edges',
    category: 'screen',
    deductionAmount: 2500,
    scoreWeight: 15,
    isPassedByDefault: true,
  },
  {
    id: 'crit-battery',
    key: 'batteryHealthy',
    label: 'Battery Health (>85% Retention)',
    sublabel: 'Zero swelling, optimal thermal performance during video recording',
    category: 'battery',
    deductionAmount: 2000,
    scoreWeight: 15,
    isPassedByDefault: true,
  },
  {
    id: 'crit-camera',
    key: 'cameraClean',
    label: 'Optics & Sensor Glass Clarity',
    sublabel: 'No fungus, zero scratch on sensor glass or front lens elements',
    category: 'optics',
    deductionAmount: 3000,
    scoreWeight: 15,
    isPassedByDefault: true,
  },
  {
    id: 'crit-shutter',
    key: 'shutterLow',
    label: 'Shutter Actuation & Mechanism',
    sublabel: 'Mechanical shutter count under 25,000 cycles & snappy curtain',
    category: 'sensor',
    deductionAmount: 2000,
    scoreWeight: 10,
    isPassedByDefault: true,
  },
  {
    id: 'crit-motherboard',
    key: 'motherboardClean',
    label: 'Motherboard & Liquid Damage Indicator',
    sublabel: 'LDI pure white, no short circuit, no third-party micro-soldering',
    category: 'motherboard',
    deductionAmount: 5000,
    scoreWeight: 25,
    isPassedByDefault: true,
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    totalPoints: 45,
    criteria: defaultCriteria,
    gradingScale: [
      { minScore: 90, grade: 'Grade A+ (Pristine)', color: '#10B981' },
      { minScore: 75, grade: 'Grade A (Minor wear)', color: '#059669' },
      { minScore: 50, grade: 'Grade B (Fair)', color: '#F59E0B' },
      { minScore: 0, grade: 'Grade C (Heavily used)', color: '#EF4444' },
    ],
    timestamp: new Date().toISOString(),
  });
}
