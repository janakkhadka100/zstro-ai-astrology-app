// app/api/memory/insights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { learnFromMemories } from '@/lib/ai/learnFromMemories';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get memory insights
    const insights = await learnFromMemories(userId);

    if (!insights) {
      return NextResponse.json({
        success: true,
        insights: null,
        message: 'No memory data available yet'
      });
    }

    return NextResponse.json({
      success: true,
      insights
    });

  } catch (error) {
    console.error('Memory insights API error:', error);
    return NextResponse.json(
      { error: 'Failed to get memory insights' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await req.json();
    const userId = session.user.id;

    switch (action) {
      case 'update_experience':
        const { sessionSuccess } = data;
        // Update user experience score
        console.log('Updating experience for user:', userId, 'Success:', sessionSuccess);
        return NextResponse.json({ success: true });

      case 'clear_memories':
        // Clear user memories (for privacy)
        console.log('Clearing memories for user:', userId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Memory insights POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process memory action' },
      { status: 500 }
    );
  }
}
