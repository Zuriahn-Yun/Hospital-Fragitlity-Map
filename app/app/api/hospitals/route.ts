import { NextRequest, NextResponse } from 'next/server';
import {
  getHospitals,
  getHospitalsByCountry,
  getHospitalsByRiskLevel,
  getFragilitySummary,
} from '@/lib/data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const iso3 = searchParams.get('iso3');
  const riskLevel = searchParams.get('riskLevel');

  try {
    if (type === 'summary') {
      const summary = getFragilitySummary();
      return NextResponse.json(summary);
    }

    if (iso3) {
      const hospitals = getHospitalsByCountry(iso3);
      return NextResponse.json(hospitals);
    }

    if (riskLevel) {
      const validRiskLevels = ['low', 'medium', 'high', 'critical'];
      if (!validRiskLevels.includes(riskLevel)) {
        return NextResponse.json(
          { error: 'Invalid risk level' },
          { status: 400 }
        );
      }
      const hospitals = getHospitalsByRiskLevel(
        riskLevel as 'low' | 'medium' | 'high' | 'critical'
      );
      return NextResponse.json(hospitals);
    }

    const hospitals = getHospitals();
    return NextResponse.json(hospitals);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospitals' },
      { status: 500 }
    );
  }
}
