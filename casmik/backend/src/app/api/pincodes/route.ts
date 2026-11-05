import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

const PINCODES_FILE = path.join(process.cwd(), 'data', 'serviceable_pincodes.json');

interface PincodeEntry {
  pincode: string;
  city: string;
  active: boolean;
  addedAt: string;
}

function loadPincodesFromFile(): PincodeEntry[] {
  try {
    if (fs.existsSync(PINCODES_FILE)) {
      const data = fs.readFileSync(PINCODES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading serviceable_pincodes.json:', err);
  }
  return [
    { pincode: '401107', city: 'Mumbai / Mira-Bhayandar', active: true, addedAt: new Date().toISOString() },
    { pincode: '400001', city: 'Mumbai South', active: true, addedAt: new Date().toISOString() },
    { pincode: '400050', city: 'Mumbai / Bandra', active: true, addedAt: new Date().toISOString() },
    { pincode: '110001', city: 'Delhi / Central', active: true, addedAt: new Date().toISOString() },
    { pincode: '560001', city: 'Bengaluru / Central', active: true, addedAt: new Date().toISOString() },
  ];
}

function savePincodesToFile(pincodes: PincodeEntry[]) {
  try {
    const dir = path.dirname(PINCODES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PINCODES_FILE, JSON.stringify(pincodes, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving serviceable_pincodes.json:', err);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkPin = searchParams.get('pincode')?.trim();

    let list = loadPincodesFromFile();

    try {
      const db = await getDatabase();
      const col = db.collection('serviceable_pincodes');
      const dbPins = await col.find({}).toArray();
      if (dbPins && dbPins.length > 0) {
        list = dbPins.map((d: any) => ({
          pincode: d.pincode,
          city: d.city || 'Serviceable Area',
          active: d.active !== false,
          addedAt: d.addedAt || new Date().toISOString(),
        }));
      }
    } catch {}

    if (checkPin) {
      const isServiceable = list.some(
        (p) => p.pincode === checkPin && p.active !== false
      );
      return NextResponse.json({
        success: true,
        pincode: checkPin,
        serviceable: isServiceable,
      });
    }

    return NextResponse.json({
      success: true,
      pincodes: list,
      count: list.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPin = body.pincode?.toString().trim();
    const city = body.city?.toString().trim() || 'Serviceable Area';

    if (!rawPin || rawPin.length < 5) {
      return NextResponse.json(
        { success: false, message: 'Valid 6-digit PIN code is required' },
        { status: 400 }
      );
    }

    let list = loadPincodesFromFile();
    const existingIndex = list.findIndex((p) => p.pincode === rawPin);

    const newEntry: PincodeEntry = {
      pincode: rawPin,
      city,
      active: true,
      addedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = newEntry;
    } else {
      list.unshift(newEntry);
    }

    savePincodesToFile(list);

    try {
      const db = await getDatabase();
      const col = db.collection('serviceable_pincodes');
      await col.updateOne(
        { pincode: rawPin },
        { $set: newEntry },
        { upsert: true }
      );
    } catch {}

    return NextResponse.json({
      success: true,
      message: `PIN code ${rawPin} added successfully`,
      pincode: newEntry,
      pincodes: list,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pin = searchParams.get('pincode')?.trim();

    if (!pin) {
      return NextResponse.json(
        { success: false, message: 'PIN code is required' },
        { status: 400 }
      );
    }

    let list = loadPincodesFromFile();
    list = list.filter((p) => p.pincode !== pin);
    savePincodesToFile(list);

    try {
      const db = await getDatabase();
      const col = db.collection('serviceable_pincodes');
      await col.deleteOne({ pincode: pin });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `PIN code ${pin} removed successfully`,
      pincodes: list,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
