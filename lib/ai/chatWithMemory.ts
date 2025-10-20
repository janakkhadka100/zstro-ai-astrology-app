// lib/ai/chatWithMemory.ts
import { extractEvent } from './eventExtractor';
import { storeChat } from '@/lib/chat/memory';
import { getPlanetaryContext } from './planetaryContext';
import { learnFromMemories } from './learnFromMemories';

export interface ChatWithMemoryRequest {
  userId: string;
  message: string;
  response?: string;
  context?: any;
}

export interface ChatWithMemoryResponse {
  response: string;
  eventExtracted?: any;
  memoryInsights?: any;
  warnings?: string[];
}

/**
 * Process chat message with memory integration
 */
export async function processChatWithMemory(
  request: ChatWithMemoryRequest
): Promise<ChatWithMemoryResponse> {
  try {
    const { userId, message, response, context } = request;

    // Extract events from user message
    let eventExtracted = null;
    try {
      eventExtracted = await extractEvent(message);
      if (eventExtracted && eventExtracted.confidence > 0.5) {
        // Store the event with planetary context
        if (eventExtracted.eventDate) {
          const planetaryContext = await getPlanetaryContext(userId, eventExtracted.eventDate);
          if (planetaryContext) {
            // Store in database (this would be implemented)
            console.log('Event stored with planetary context:', {
              event: eventExtracted,
              planetary: planetaryContext
            });
          }
        }
      }
    } catch (error) {
      console.error('Error extracting event:', error);
    }

    // Store chat in memory
    try {
      await storeChat(userId, message, response, context, eventExtracted);
    } catch (error) {
      console.error('Error storing chat:', error);
    }

    // Get memory insights
    let memoryInsights = null;
    try {
      memoryInsights = await learnFromMemories(userId);
    } catch (error) {
      console.error('Error getting memory insights:', error);
    }

    // Generate warnings based on patterns
    const warnings = generateWarnings(memoryInsights, context);

    return {
      response: response || '',
      eventExtracted,
      memoryInsights,
      warnings
    };

  } catch (error) {
    console.error('Error processing chat with memory:', error);
    return {
      response: response || '',
      eventExtracted: null,
      memoryInsights: null,
      warnings: []
    };
  }
}

/**
 * Generate warnings based on memory insights
 */
function generateWarnings(memoryInsights: any, context: any): string[] {
  const warnings: string[] = [];

  if (!memoryInsights) return warnings;

  // Check for repeating patterns that might cause issues
  memoryInsights.patterns?.forEach((pattern: any) => {
    if (pattern.confidence > 0.7) {
      warnings.push(`⚠️ ${pattern.description} - ${pattern.warnings?.join(', ')}`);
    }
  });

  // Check for upcoming similar configurations
  memoryInsights.predictions?.forEach((prediction: any) => {
    if (prediction.confidence > 0.6) {
      warnings.push(`🔮 ${prediction.description} (${prediction.dateRange}) - ${prediction.advice}`);
    }
  });

  return warnings;
}

/**
 * Simple function for automation scripts
 */
export async function processUserMessageWithMemory(
  userId: string, 
  message: string, 
  context: any
): Promise<void> {
  try {
    // Extract event from the message
    const event = await extractEvent(message);
    
    if (event && event.eventType) {
      console.log("Detected event:", event);
      
      // If an event date is provided, fetch planetary context for that date
      if (event.eventDate) {
        const planetaryContext = await getPlanetaryContext(userId, event.eventDate);
        if (planetaryContext) {
          // Store the event with its planetary context
          const { rememberEvent } = await import('@/lib/db/queries');
          await rememberEvent(userId, { ...event, planetaryContext });
          console.log("Event remembered with planetary context.");
        }
      } else {
        // Store event without specific planetary context if date is missing
        const { rememberEvent } = await import('@/lib/db/queries');
        await rememberEvent(userId, event);
        console.log("Event remembered without specific planetary context (date missing).");
      }
    }

    // Store the current chat message
    await storeChat(userId, message, undefined, context, event);

    // Get chat history for contextual recall (sliding window)
    const chatHistory = await getChatHistory(userId);
    console.log("Chat history:", chatHistory);

  } catch (error) {
    console.error('Error processing user message with memory:', error);
  }
}

/**
 * Get personalized greeting based on memory
 */
export function getPersonalizedGreeting(
  userName: string,
  memoryInsights: any,
  recentEvents: any[]
): string {
  let greeting = `🙏 नमस्ते, ${userName}जी —`;

  if (recentEvents.length > 0) {
    const latestEvent = recentEvents[0];
    greeting += `\n\nतपाईंको हालका घटनाहरु हेरेर, ${latestEvent.eventType} सम्बन्धी केही ज्योतिषीय सुझाव दिन सक्छु।`;
  }

  if (memoryInsights?.patterns?.length > 0) {
    greeting += `\n\nतपाईंको अतीतका पैटर्नहरु हेरेर, व्यक्तिगत सुझावहरु पनि दिन सक्छु।`;
  }

  return greeting;
}

/**
 * Get contextual advice based on current planetary positions and past patterns
 */
export function getContextualAdvice(
  currentContext: any,
  memoryInsights: any,
  recentEvents: any[]
): string[] {
  const advice: string[] = [];

  if (!memoryInsights) return advice;

  // Check current planetary positions against past patterns
  memoryInsights.patterns?.forEach((pattern: any) => {
    if (pattern.confidence > 0.6) {
      // Check if current context matches this pattern
      const currentPlanets = currentContext?.planets || [];
      const hasMatchingPattern = pattern.triggers?.some((trigger: string) => {
        const [planet, house] = trigger.split('-');
        return currentPlanets.some((p: any) => 
          p.name === planet && p.house === parseInt(house)
        );
      });

      if (hasMatchingPattern) {
        advice.push(`📌 हालको ग्रह स्थिति तपाईंको अघिल्लो पैटर्नसँग मिल्छ - ${pattern.description}`);
        advice.push(`💡 सुझाव: ${pattern.warnings?.join(', ')}`);
      }
    }
  });

  // Add general recommendations
  memoryInsights.recommendations?.forEach((rec: string) => {
    advice.push(`💡 ${rec}`);
  });

  return advice;
}

/**
 * Check if user needs proactive warning
 */
export function checkProactiveWarnings(
  userId: string,
  memoryInsights: any,
  currentContext: any
): string[] {
  const warnings: string[] = [];

  if (!memoryInsights?.patterns) return warnings;

  // Check for high-confidence patterns that might be active
  memoryInsights.patterns.forEach((pattern: any) => {
    if (pattern.confidence > 0.8) {
      const currentPlanets = currentContext?.planets || [];
      const isActive = pattern.triggers?.some((trigger: string) => {
        const [planet, house] = trigger.split('-');
        return currentPlanets.some((p: any) => 
          p.name === planet && p.house === parseInt(house)
        );
      });

      if (isActive) {
        warnings.push(`🚨 सावधान: ${pattern.description} - यो पैटर्न हाल सक्रिय छ!`);
        warnings.push(`⚠️ ${pattern.warnings?.join(', ')}`);
      }
    }
  });

  return warnings;
}
