import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface CityData {
  id: string;
  name: string;
  state: string;
  isPopular: boolean;
  serviceable: boolean;
  services: ('sell' | 'buy' | 'rent' | 'exchange')[];
  pincodes: string[];
}

const CITIES: CityData[] = [
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    isPopular: true,
    serviceable: true,
    services: ['sell', 'buy', 'rent', 'exchange'],
    pincodes: ['400001', '400050', '400076', '400092', '401107', '400053', '400072'],
  },
  {
    id: 'delhi',
    name: 'Delhi NCR',
    state: 'Delhi',
    isPopular: true,
    serviceable: true,
    services: ['sell', 'buy', 'rent', 'exchange'],
    pincodes: ['110001', '110019', '110020', '110025', '110092', '122001', '201301'],
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    isPopular: true,
    serviceable: true,
    services: ['sell', 'buy', 'rent', 'exchange'],
    pincodes: ['560001', '560034', '560038', '560068', '560100', '560102'],
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    isPopular: true,
    serviceable: true,
    services: ['sell', 'buy', 'rent', 'exchange'],
    pincodes: ['411001', '411004', '411014', '411038', '411057'],
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    isPopular: true,
    serviceable: true,
    services: ['sell', 'buy', 'rent', 'exchange'],
    pincodes: ['500001', '500032', '500081', '500084'],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    isPopular: false,
    serviceable: true,
    services: ['sell', 'buy', 'rent', 'exchange'],
    pincodes: ['600001', '600017', '600028', '600096'],
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    isPopular: false,
    serviceable: true,
    services: ['sell', 'buy', 'rent', 'exchange'],
    pincodes: ['380001', '380015', '380054'],
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    isPopular: false,
    serviceable: true,
    services: ['sell', 'buy', 'rent', 'exchange'],
    pincodes: ['700001', '700020', '700091'],
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    isPopular: false,
    serviceable: true,
    services: ['sell', 'buy', 'rent', 'exchange'],
    pincodes: ['302001', '302015', '302020'],
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    isPopular: false,
    serviceable: true,
    services: ['sell', 'buy', 'rent', 'exchange'],
    pincodes: ['226001', '226010', '226016'],
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode')?.trim();

    if (pincode) {
      const matchedCity = CITIES.find((c) =>
        c.pincodes.some((p) => p === pincode || p.slice(0, 3) === pincode.slice(0, 3))
      );
      return NextResponse.json({
        success: true,
        serviceable: !!matchedCity,
        pincode,
        city: matchedCity?.name || null,
        message: matchedCity
          ? `Instant doorstep pickup & delivery available in ${matchedCity.name}`
          : 'Service is coming soon to your pincode. We currently serve major metro hubs.',
      });
    }

    return NextResponse.json({
      success: true,
      cities: CITIES,
      total: CITIES.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}
