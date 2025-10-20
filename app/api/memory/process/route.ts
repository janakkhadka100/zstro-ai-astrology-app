// app/api/memory/process/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { processUserMessageWithMemory } from '@/lib/ai/chatWithMemory';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, context } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Process message with memory system
    await processUserMessageWithMemory(session.user.id, message, context);

    return NextResponse.json({ 
      success: true, 
      message: 'Message processed with memory system' 
    });

  } catch (error) {
    console.error('Error processing message with memory:', error);
    return NextResponse.json({ 
      error: 'Failed to process message' 
    }, { status: 500 });
  }
}
