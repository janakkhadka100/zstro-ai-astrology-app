// app/api/districts/route.ts
import { getAllDistricts } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const districts = await getAllDistricts();
    return NextResponse.json(districts);
  } catch (error) {
    console.error('❌ Error fetching districts:', error);
    return NextResponse.json({ error: 'Failed to load districts' }, { status: 500 });
  }
}
