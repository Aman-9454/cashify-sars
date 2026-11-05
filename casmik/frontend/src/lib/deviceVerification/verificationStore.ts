import { DeviceVerificationSession, DeviceVerificationReport } from './types';
import { generateSessionId } from './luhn';
import { getDatabase } from '@/lib/mongodb';

// Global in-memory cache for fast session & report lookup (survives Next.js HMR)
const globalStore = globalThis as unknown as {
  __camsik_verification_sessions__?: Map<string, DeviceVerificationSession>;
  __camsik_verification_reports__?: Map<string, DeviceVerificationReport>;
};

const activeSessions = globalStore.__camsik_verification_sessions__ || new Map<string, DeviceVerificationSession>();
const completedReports = globalStore.__camsik_verification_reports__ || new Map<string, DeviceVerificationReport>();

if (!globalStore.__camsik_verification_sessions__) {
  globalStore.__camsik_verification_sessions__ = activeSessions;
}
if (!globalStore.__camsik_verification_reports__) {
  globalStore.__camsik_verification_reports__ = completedReports;
}

const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Creates a new verification session.
 */
export async function createVerificationSession(params: {
  userId?: string;
  sellFlowId?: string;
  selectedDevice: {
    category?: string;
    brand: string;
    model: string;
    variant?: string;
    storage?: string;
    color?: string;
  };
}): Promise<DeviceVerificationSession> {
  const sessionId = generateSessionId();
  const token = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();

  const session: DeviceVerificationSession = {
    sessionId,
    token,
    userId: params.userId,
    sellFlowId: params.sellFlowId,
    status: 'active',
    createdAt: now.toISOString(),
    expiresAt,
    selectedDevice: params.selectedDevice,
    deviceDetected: false,
    imeiVerified: false,
    deviceMatched: false,
  };

  activeSessions.set(sessionId, session);

  try {
    const db = await getDatabase();
    await db.collection('device_verification_sessions').insertOne({ ...session });
  } catch (err) {
    // MongoDB optional; gracefully continue with memory store
  }

  return session;
}

/**
 * Retrieves a verification session by sessionId and checks expiration.
 */
export async function getVerificationSession(sessionId: string): Promise<DeviceVerificationSession | null> {
  let session = activeSessions.get(sessionId) || null;

  if (!session) {
    try {
      const db = await getDatabase();
      const doc = await db.collection('device_verification_sessions').findOne({ sessionId });
      if (doc) {
        session = doc as unknown as DeviceVerificationSession;
        activeSessions.set(sessionId, session);
      }
    } catch {
      // Continue
    }
  }

  if (!session) return null;

  // Check TTL expiration
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    session.status = 'expired';
    activeSessions.set(sessionId, session);
  }

  return session;
}

/**
 * Updates a verification session with diagnostic results.
 */
export async function completeVerificationSession(
  sessionId: string,
  report: DeviceVerificationReport
): Promise<DeviceVerificationSession | null> {
  const session = await getVerificationSession(sessionId);
  if (!session || session.status === 'expired') return null;

  session.status = report.status === 'verified' ? 'completed' : 'failed';
  session.deviceDetected = true;
  session.imeiVerified = report.identifiers.luhnValid;
  session.deviceMatched = report.matching.matched;
  session.verificationReport = report;

  activeSessions.set(sessionId, session);
  saveVerificationReport(report);

  try {
    const db = await getDatabase();
    await db.collection('device_verification_sessions').updateOne(
      { sessionId },
      { $set: { ...session, updatedAt: new Date().toISOString() } }
    );
  } catch {
    // Continue
  }

  return session;
}

/**
 * Saves a completed verification report.
 */
export async function saveVerificationReport(report: DeviceVerificationReport): Promise<void> {
  completedReports.set(report.verificationId, report);

  try {
    const db = await getDatabase();
    await db.collection('device_verification_reports').insertOne({ ...report });
  } catch {
    // Continue
  }
}

/**
 * Retrieves a completed verification report by verificationId.
 */
export async function getVerificationReport(verificationId: string): Promise<DeviceVerificationReport | null> {
  let report = completedReports.get(verificationId) || null;

  if (!report) {
    try {
      const db = await getDatabase();
      const doc = await db.collection('device_verification_reports').findOne({ verificationId });
      if (doc) {
        report = doc as unknown as DeviceVerificationReport;
        completedReports.set(verificationId, report);
      }
    } catch {
      // Continue
    }
  }

  return report;
}
