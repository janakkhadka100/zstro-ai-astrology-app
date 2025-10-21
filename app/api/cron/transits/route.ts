// app/api/cron/transits/route.ts
// Cron job for background transit updates

import { NextRequest, NextResponse } from "next/server";
import { getUsersNeedingUpdates, batchUpdateTransits } from "@/lib/astro/realtimeTransits";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // Verify this is a cron request (optional security check)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Get users who need updates
    const usersNeedingUpdates = await getUsersNeedingUpdates();
    
    if (usersNeedingUpdates.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No users need transit updates',
        updated: 0
      });
    }

    // Batch update transits
    await batchUpdateTransits(usersNeedingUpdates, today);
    
    return NextResponse.json({
      success: true,
      message: `Updated transits for ${usersNeedingUpdates.length} users`,
      updated: usersNeedingUpdates.length,
      users: usersNeedingUpdates
    });

  } catch (error) {
    console.error('Cron transit update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIds, date } = body;

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'userIds array is required' }, { status: 400 });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Batch update transits for specified users
    await batchUpdateTransits(userIds, targetDate);
    
    return NextResponse.json({
      success: true,
      message: `Updated transits for ${userIds.length} users`,
      updated: userIds.length,
      date: targetDate
    });

  } catch (error) {
    console.error('Manual transit update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
