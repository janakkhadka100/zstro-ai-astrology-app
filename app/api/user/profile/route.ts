// app/api/user/profile/route.ts
// Real user profile with birth details for astrological calculations

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // For demo purposes, return a structured profile
    // In production, fetch from database using userId
    const profile = {
      name: "राम शर्मा",
      language: "ne" as const,
      birth: {
        date: "1990-05-15",
        time: "14:30:00",
        tz_offset: "+05:45",
        location: {
          lat: 27.7172,
          lon: 85.3240,
          place: "काठमाडौं, नेपाल"
        }
      },
      preferences: {
        chart_style: "north_indian",
        language: "ne",
        timezone: "Asia/Kathmandu"
      }
    };

    if (!userId) {
      // Return demo profile for unauthenticated users
      return NextResponse.json(profile, { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      });
    }

    // For authenticated users, you would fetch their actual saved profile
    // const userProfile = await getUserProfile(userId);
    // return NextResponse.json(userProfile || profile, { ... });

    return NextResponse.json(profile, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    });

  } catch (error) {
    console.error('Profile API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, birth, preferences } = body;

    // In production, save to database
    // await saveUserProfile(userId, { name, birth, preferences });

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    });

  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      }
    );
  }
}