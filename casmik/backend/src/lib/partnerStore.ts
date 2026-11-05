import fs from 'fs';
import path from 'path';
import { getDatabase } from '@/lib/mongodb';
import { partners as defaultPartners, Partner } from '@/lib/casmikData';

const isVercel = process.env.VERCEL === '1';
const DATA_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const PARTNERS_FILE = path.join(DATA_DIR, 'registered_partners.json');

function ensureDataFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PARTNERS_FILE)) {
      fs.writeFileSync(PARTNERS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    // Silent catch on read-only environments
  }
}

export function getLocalPartners(): Partner[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(PARTNERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalPartner(partner: Partner): void {
  ensureDataFile();
  try {
    const existing = getLocalPartners();
    const updated = [
      partner,
      ...existing.filter((p) => p.id !== partner.id && p.email !== partner.email && p.phone !== partner.phone),
    ];
    fs.writeFileSync(PARTNERS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not save partner locally:', err);
  }
}

export async function getAllPartners(): Promise<Partner[]> {
  const localList = getLocalPartners();
  let mongoList: Partner[] | null = null;

  try {
    const fetchMongo = async () => {
      const db = await getDatabase();
      return await db.collection('partners').find({}).toArray();
    };
    const docs = await Promise.race([
      fetchMongo(),
      new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error('Mongo timeout')), 2000)),
    ]);
    if (docs) {
      mongoList = docs.map((doc: any) => ({
        id: doc.id || doc._id?.toString(),
        name: doc.name,
        storeName: doc.storeName,
        phone: doc.phone,
        email: doc.email,
        city: doc.city,
        state: doc.state || 'Maharashtra',
        address: doc.address || '',
        pinCodes: doc.pinCodes || [],
        categories: doc.categories || ['cat-dslr', 'cat-lens', 'cat-video-camera'],
        status: doc.status || 'pending',
        rating: doc.rating ?? 5.0,
        totalOrders: doc.totalOrders ?? 0,
        completedOrders: doc.completedOrders ?? 0,
        totalEarnings: doc.totalEarnings ?? 0,
        pendingPayout: doc.pendingPayout ?? 0,
        availableBalance: doc.availableBalance ?? 0,
        joinedAt: doc.joinedAt || new Date().toISOString().split('T')[0],
        avatar: doc.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
        commission: doc.commission ?? 5.0,
        commissionType: doc.commissionType || 'percentage',
        password: doc.password,
        documents: doc.documents || {},
      }));
    }
  } catch (err) {
    // MongoDB optional/fallback
  }

  // If MongoDB is connected and responded, MongoDB is the single source of truth
  if (mongoList !== null) {
    return mongoList;
  }

  // Fallback only if MongoDB is unreachable
  return localList;
}

export async function savePartner(partner: Partner): Promise<Partner> {
  saveLocalPartner(partner);

  try {
    const db = await getDatabase();
    const toSave = { ...partner };
    delete (toSave as any)._id;
    await db.collection('partners').updateOne(
      { $or: [{ id: partner.id }, { email: partner.email }, { phone: partner.phone }] },
      { $set: toSave },
      { upsert: true }
    );
  } catch (err) {
    console.warn('MongoDB partner upsert warning:', err);
  }

  return partner;
}

export async function updatePartner(
  partnerId: string,
  updates: Partial<Partner>
): Promise<Partner | null> {
  ensureDataFile();
  const localList = getLocalPartners();
  const allCurrent = await getAllPartners();
  const target = allCurrent.find((p) => p.id === partnerId);

  if (!target) return null;

  const updatedPartner: Partner = {
    ...target,
    ...updates,
  };

  // Update in local file
  const localIdx = localList.findIndex((p) => p.id === partnerId);
  if (localIdx !== -1) {
    localList[localIdx] = updatedPartner;
    fs.writeFileSync(PARTNERS_FILE, JSON.stringify(localList, null, 2), 'utf-8');
  } else {
    localList.unshift(updatedPartner);
    fs.writeFileSync(PARTNERS_FILE, JSON.stringify(localList, null, 2), 'utf-8');
  }

  // Update in MongoDB
  try {
    const db = await getDatabase();
    const toUpdate = { ...updates };
    delete (toUpdate as any)._id;
    await db.collection('partners').updateOne(
      { $or: [{ id: partnerId }, { email: target.email }, { phone: target.phone }] },
      { $set: toUpdate },
      { upsert: true }
    );
  } catch (err) {
    console.warn('MongoDB partner update warning:', err);
  }

  return updatedPartner;
}

export async function findPartnerByIdentifier(identifier: string): Promise<Partner | null> {
  const cleanPhone = identifier.replace(/\D/g, '').slice(-10);
  const cleanEmail = identifier.trim().toLowerCase();
  const cleanId = identifier.trim();

  const all = await getAllPartners();
  const found = all.find(
    (p) =>
      p.id === cleanId ||
      p.email.toLowerCase() === cleanEmail ||
      (cleanPhone.length >= 10 && p.phone.replace(/\D/g, '').slice(-10) === cleanPhone)
  );

  return found || null;
}
