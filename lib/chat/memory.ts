// lib/chat/memory.ts
import { kv } from '@vercel/kv';

export interface ChatMessage {
  message: string;
  response?: string;
  context?: any;
  eventExtracted?: any;
  time: number;
  userId: string;
}

export interface ExtractedEvent {
  eventType: string;
  eventDate?: string;
  eventDescription: string;
  confidence: number;
}

/**
 * Store a chat message in user's chat history
 */
export async function storeChat(
  userId: string, 
  message: string, 
  response?: string, 
  context?: any,
  eventExtracted?: ExtractedEvent
): Promise<void> {
  try {
    const chatData: ChatMessage = {
      message,
      response,
      context,
      eventExtracted,
      time: Date.now(),
      userId
    };

    // Store in Vercel KV with sliding window (keep last 100 chats)
    await kv.lpush(`chat:${userId}`, JSON.stringify(chatData));
    await kv.ltrim(`chat:${userId}`, 0, 99); // Keep only last 100 messages
    
    // Also store in a time-sorted set for easy querying
    await kv.zadd(`chat:${userId}:timeline`, {
      score: Date.now(),
      member: JSON.stringify(chatData)
    });
    
    // Keep only last 100 in timeline too
    const cutoff = Date.now() - (100 * 24 * 60 * 60 * 1000); // 100 days ago
    await kv.zremrangebyscore(`chat:${userId}:timeline`, 0, cutoff);
    
  } catch (error) {
    console.error('Error storing chat:', error);
  }
}

/**
 * Get user's chat history
 */
export async function getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
  try {
    const list = await kv.lrange(`chat:${userId}`, 0, limit - 1);
    return list.map(item => JSON.parse(item as string));
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
}

/**
 * Get chat history by date range
 */
export async function getChatHistoryByDateRange(
  userId: string, 
  startDate: number, 
  endDate: number
): Promise<ChatMessage[]> {
  try {
    const items = await kv.zrangebyscore(
      `chat:${userId}:timeline`, 
      startDate, 
      endDate,
      { withScores: true }
    );
    
    return items.map(([item, score]) => ({
      ...JSON.parse(item as string),
      time: score
    }));
  } catch (error) {
    console.error('Error getting chat history by date range:', error);
    return [];
  }
}

/**
 * Get recent events from chat history
 */
export async function getRecentEvents(userId: string, days: number = 30): Promise<ExtractedEvent[]> {
  try {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const chats = await getChatHistoryByDateRange(userId, cutoff, Date.now());
    
    const events: ExtractedEvent[] = [];
    chats.forEach(chat => {
      if (chat.eventExtracted) {
        events.push(chat.eventExtracted);
      }
    });
    
    return events;
  } catch (error) {
    console.error('Error getting recent events:', error);
    return [];
  }
}

/**
 * Search chat history for specific patterns
 */
export async function searchChatHistory(
  userId: string, 
  query: string, 
  limit: number = 20
): Promise<ChatMessage[]> {
  try {
    const allChats = await getChatHistory(userId, 200);
    
    // Simple text search (in production, use a proper search engine)
    const filtered = allChats.filter(chat => 
      chat.message.toLowerCase().includes(query.toLowerCase()) ||
      (chat.response && chat.response.toLowerCase().includes(query.toLowerCase()))
    );
    
    return filtered.slice(0, limit);
  } catch (error) {
    console.error('Error searching chat history:', error);
    return [];
  }
}

/**
 * Get user's conversation patterns
 */
export async function getConversationPatterns(userId: string): Promise<{
  totalChats: number;
  averageResponseLength: number;
  commonTopics: string[];
  activeHours: number[];
}> {
  try {
    const chats = await getChatHistory(userId, 100);
    
    const totalChats = chats.length;
    const averageResponseLength = chats.reduce((sum, chat) => 
      sum + (chat.response?.length || 0), 0) / totalChats;
    
    // Extract common topics (simple keyword extraction)
    const topics = new Map<string, number>();
    chats.forEach(chat => {
      const words = (chat.message + ' ' + (chat.response || '')).toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      words.forEach(word => {
        topics.set(word, (topics.get(word) || 0) + 1);
      });
    });
    
    const commonTopics = Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic]) => topic);
    
    // Extract active hours
    const activeHours = new Map<number, number>();
    chats.forEach(chat => {
      const hour = new Date(chat.time).getHours();
      activeHours.set(hour, (activeHours.get(hour) || 0) + 1);
    });
    
    const sortedHours = Array.from(activeHours.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hour]) => hour);
    
    return {
      totalChats,
      averageResponseLength: Math.round(averageResponseLength),
      commonTopics,
      activeHours: sortedHours
    };
  } catch (error) {
    console.error('Error getting conversation patterns:', error);
    return {
      totalChats: 0,
      averageResponseLength: 0,
      commonTopics: [],
      activeHours: []
    };
  }
}
