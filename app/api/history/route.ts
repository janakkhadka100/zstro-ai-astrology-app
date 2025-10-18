// app/api/history/route.ts
// History API - list user sessions

import { NextRequest, NextResponse } from 'next/server';
import { getUserSessions, createSession, getSessionStats } from '@/lib/db/history';
import { isFeatureEnabled } from '@/lib/config/features';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Check if history feature is enabled
    if (!isFeatureEnabled('history')) {
      return NextResponse.json(
        { success: false, errors: ['History feature is disabled'] },
        { status: 403 }
      );
    }

    const userId = "test-user-123"; // In real app, get from auth session
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const includeStats = url.searchParams.get('stats') === 'true';

    // Get user sessions
    const sessions = await getUserSessions(userId, limit, offset);

    // Get stats if requested
    let stats = null;
    if (includeStats) {
      stats = await getSessionStats(userId);
    }

    const response = {
      success: true,
      data: {
        sessions: sessions.map(session => ({
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          messageCount: session.messages.length,
          snapshotCount: session.snapshots.length,
          lastMessage: session.messages[session.messages.length - 1]?.content || null,
        })),
        pagination: {
          limit,
          offset,
          hasMore: sessions.length === limit,
        },
        ...(stats && { stats }),
      }
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60', // 1 minute
      }
    });

  } catch (error) {
    console.error('History list API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        errors: ['Internal server error'] 
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check if history feature is enabled
    if (!isFeatureEnabled('history')) {
      return NextResponse.json(
        { success: false, errors: ['History feature is disabled'] },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title } = body;
    const userId = "test-user-123"; // In real app, get from auth session

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { success: false, errors: ['Title is required'] },
        { status: 400 }
      );
    }

    // Create new session
    const session = await createSession(userId, title);

    const response = {
      success: true,
      data: {
        session: {
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        }
      }
    };

    return NextResponse.json(response, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('History create API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        errors: ['Internal server error'] 
      },
      { status: 500 }
    );
  }
}
