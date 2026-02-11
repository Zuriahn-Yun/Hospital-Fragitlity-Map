import { NextRequest, NextResponse } from 'next/server';
import { getHospitalDetail } from '@/lib/data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Hospital ID is required' },
      { status: 400 }
    );
  }

  try {
    const detail = getHospitalDetail(id);

    if (!detail) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(detail);
  } catch (error) {
    console.error('Error fetching hospital detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospital detail' },
      { status: 500 }
    );
  }
}
