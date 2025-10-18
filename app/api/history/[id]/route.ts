// app/api/history/[id]/route.ts
// History API - load saved analysis

import { NextRequest, NextResponse } from 'next/server';
import { getSession, getSnapshot } from '@/lib/db/history';
import { isFeatureEnabled } from '@/lib/config/features';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if history feature is enabled
    if (!isFeatureEnabled('history')) {
      return NextResponse.json(
        { success: false, errors: ['History feature is disabled'] },
        { status: 403 }
      );
    }

    const sessionId = params.id;
    const userId = "test-user-123"; // In real app, get from auth session

    if (!sessionId) {
      return NextResponse.json(
        { success: false, errors: ['Session ID is required'] },
        { status: 400 }
      );
    }

    // Get session with messages and snapshots
    const session = await getSession(sessionId, userId);
    
    if (!session) {
      return NextResponse.json(
        { success: false, errors: ['Session not found'] },
        { status: 404 }
      );
    }

    // Format the response
    const response = {
      success: true,
      data: {
        session: {
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        },
        messages: session.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
          metadata: msg.metadata,
        })),
        snapshots: session.snapshots.map(snap => ({
          id: snap.id,
          cards: snap.cards,
          analysis: snap.analysis,
          provenance: snap.provenance,
          createdAt: snap.createdAt,
        })),
      }
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=300', // 5 minutes
      }
    });

  } catch (error) {
    console.error('History API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        errors: ['Internal server error'] 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if history feature is enabled
    if (!isFeatureEnabled('history')) {
      return NextResponse.json(
        { success: false, errors: ['History feature is disabled'] },
        { status: 403 }
      );
    }

    const sessionId = params.id;
    const userId = "test-user-123"; // In real app, get from auth session

    if (!sessionId) {
      return NextResponse.json(
        { success: false, errors: ['Session ID is required'] },
        { status: 400 }
      );
    }

    // Import delete function
    const { deleteSession } = await import('@/lib/db/history');
    
    const deleted = await deleteSession(sessionId, userId);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, errors: ['Session not found or could not be deleted'] },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Session deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('History delete API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        errors: ['Internal server error'] 
      },
      { status: 500 }
    );
  }
}
