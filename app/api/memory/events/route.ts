// app/api/memory/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { extractEvent } from '@/lib/ai/eventExtractor';
import { getPlanetaryContext } from '@/lib/ai/planetaryContext';
import { storeChat } from '@/lib/chat/memory';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, response, context } = await req.json();
    const userId = session.user.id;

    // Extract events from message
    const eventExtracted = await extractEvent(message);
    
    // If event found, get planetary context
    let planetaryContext = null;
    if (eventExtracted && eventExtracted.eventDate) {
      planetaryContext = await getPlanetaryContext(userId, eventExtracted.eventDate);
    }

    // Store in chat memory
    await storeChat(userId, message, response, context, eventExtracted);

    // Store event in database if found
    if (eventExtracted && eventExtracted.confidence > 0.5) {
      // This would store in user_memory table
      console.log('Event to store:', {
        userId,
        event: eventExtracted,
        planetary: planetaryContext
      });
    }

    return NextResponse.json({
      success: true,
      eventExtracted,
      planetaryContext
    });

  } catch (error) {
    console.error('Memory events API error:', error);
    return NextResponse.json(
      { error: 'Failed to process memory event' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const days = parseInt(searchParams.get('days') || '30');

    // Get recent events from chat history
    const { getRecentEvents } = await import('@/lib/chat/memory');
    const events = await getRecentEvents(userId, days);

    return NextResponse.json({
      success: true,
      events: events.slice(0, limit)
    });

  } catch (error) {
    console.error('Memory events GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get memory events' },
      { status: 500 }
    );
  }
}
