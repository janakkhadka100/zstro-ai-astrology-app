import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return demo profile data
    // In production, this would fetch from database
    const profileData = {
      dob: "1990-01-01",
      tob: "12:00",
      lat: 27.7172,
      lon: 85.3240,
      tz: "Asia/Kathmandu",
      pob: "Kathmandu",
      name: session.user.name || "Demo User",
      email: session.user.email || "demo@example.com"
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
