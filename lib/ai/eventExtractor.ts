// lib/ai/eventExtractor.ts
import { openai } from '@/lib/ai/openaiClient';

export interface ExtractedEvent {
  eventType: string;
  eventDate?: string;
  eventDescription: string;
  confidence: number;
  keywords: string[];
  location?: string;
  people?: string[];
}

/**
 * Extract life events from user text using AI
 */
export async function extractEvent(text: string, lang?: string): Promise<ExtractedEvent | null> {
  try {
    const prompt = `
You are an expert at identifying life events from text. Analyze the following text and identify if it mentions any significant life events with dates.

Look for events like:
- Marriage, divorce, relationship changes
- Birth of children, family events
- Accidents, illnesses, health issues
- Job changes, promotions, career events
- Education milestones, graduations
- Travel, relocation, moving
- Financial events, investments, losses
- Success, failures, achievements
- Deaths, losses, grief
- Legal issues, court cases
- Spiritual experiences, religious events

Return JSON format:
{
  "eventType": "string (one of: marriage, birth, accident, job, education, travel, financial, success, failure, death, legal, spiritual, other)",
  "eventDate": "string (YYYY-MM-DD format if mentioned, null if not clear)",
  "eventDescription": "string (detailed description of the event)",
  "confidence": "number (0-1, how confident you are this is a real event)",
  "keywords": "array of strings (key words that indicate this event)",
  "location": "string (if location mentioned, null otherwise)",
  "people": "array of strings (people mentioned in relation to event)"
}

If no clear life event is mentioned, return null.

Text to analyze: "${text}"
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: text }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content || content === 'null') return null;

    const parsed = JSON.parse(content);
    
    // Validate the response
    if (!parsed.eventType || !parsed.eventDescription || parsed.confidence < 0.3) {
      return null;
    }

    return {
      eventType: parsed.eventType,
      eventDate: parsed.eventDate || undefined,
      eventDescription: parsed.eventDescription,
      confidence: Math.min(1, Math.max(0, parsed.confidence)),
      keywords: parsed.keywords || [],
      location: parsed.location || undefined,
      people: parsed.people || []
    };

  } catch (error) {
    console.error('Error extracting event:', error);
    return null;
  }
}

/**
 * Extract multiple events from a longer text
 */
export async function extractMultipleEvents(text: string): Promise<ExtractedEvent[]> {
  try {
    const sentences = text.split(/[.!?।]+/).filter(s => s.trim().length > 10);
    const events: ExtractedEvent[] = [];

    for (const sentence of sentences) {
      const event = await extractEvent(sentence.trim());
      if (event && event.confidence > 0.5) {
        events.push(event);
      }
    }

    return events;
  } catch (error) {
    console.error('Error extracting multiple events:', error);
    return [];
  }
}

/**
 * Extract events from chat history
 */
export async function extractEventsFromChatHistory(chatHistory: string[]): Promise<ExtractedEvent[]> {
  try {
    const allEvents: ExtractedEvent[] = [];
    
    for (const message of chatHistory) {
      const events = await extractMultipleEvents(message);
      allEvents.push(...events);
    }

    // Remove duplicates based on event description similarity
    const uniqueEvents = allEvents.filter((event, index, self) => 
      index === self.findIndex(e => 
        e.eventDescription.toLowerCase() === event.eventDescription.toLowerCase() &&
        e.eventDate === event.eventDate
      )
    );

    return uniqueEvents;
  } catch (error) {
    console.error('Error extracting events from chat history:', error);
    return [];
  }
}

/**
 * Validate and clean extracted event
 */
export function validateEvent(event: ExtractedEvent): ExtractedEvent | null {
  if (!event.eventType || !event.eventDescription) return null;
  if (event.confidence < 0.3) return null;
  if (event.eventDescription.length < 10) return null;

  // Clean up the event
  return {
    ...event,
    eventDescription: event.eventDescription.trim(),
    keywords: event.keywords.filter(k => k.length > 2),
    people: event.people?.filter(p => p.length > 1) || []
  };
}

/**
 * Get event type category for grouping
 */
export function getEventCategory(eventType: string): string {
  const categories: Record<string, string> = {
    marriage: 'relationships',
    divorce: 'relationships',
    birth: 'family',
    death: 'family',
    accident: 'health',
    illness: 'health',
    job: 'career',
    promotion: 'career',
    education: 'learning',
    travel: 'lifestyle',
    financial: 'money',
    success: 'achievement',
    failure: 'challenge',
    legal: 'legal',
    spiritual: 'spiritual'
  };

  return categories[eventType] || 'other';
}
