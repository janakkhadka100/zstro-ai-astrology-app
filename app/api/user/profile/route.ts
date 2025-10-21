// app/api/user/profile/route.ts
// User Profile API Endpoint for Birth Details

import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // In a real application, you would fetch the user's birth profile from a database
    // For now, we return a mock profile for demonstration purposes.
    // This profile is used by AstroCards to bootstrap astrological data.
    const mockProfile = {
      dob: "1990-01-01", // Date of Birth
      tob: "12:00",      // Time of Birth
      lat: 27.7172,      // Latitude (Kathmandu)
      lon: 85.3240,      // Longitude (Kathmandu)
      tz: "Asia/Kathmandu", // Timezone
      pob: "Kathmandu",  // Place of Birth
      gender: "male",    // Gender
      language: "ne"     // Preferred language
    };

    if (!userId) {
      // If no user is authenticated, return the mock profile
      // or an empty object if no default profile is desired
      return NextResponse.json(mockProfile, { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      });
    }

    // For authenticated users, you might fetch their actual saved profile
    // For this example, we still return the mock profile
    return NextResponse.json(mockProfile, { 
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

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
          }
        }
      );
    }

    const body = await request.json();
    const { dob, tob, lat, lon, tz, pob, gender, language } = body;

    // In a real application, you would save this to the database
    // For now, we just return the received data
    const profile = {
      dob,
      tob,
      lat,
      lon,
      tz,
      pob,
      gender,
      language,
      userId
    };

    return NextResponse.json(
      { success: true, profile },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      }
    );
  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      }
    );
  }
}