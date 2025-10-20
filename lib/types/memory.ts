// lib/types/memory.ts
export type EventDTO = {
  eventType: string;
  eventDate?: string | null;
  assumedTime?: boolean;
  confidence?: number;
  eventDescription: string;
  lang?: 'ne' | 'hi' | 'en';
};

export type MemoryRow = {
  id: number;
  userId: string;
  eventDate: string | null;
  eventType: string | null;
  eventDescription: string | null;
  confidence: number | null;
  assumedTime: boolean | null;
  lang: string | null;
  hash: string | null;
  sourceMessageId: string | null;
  planetaryContext: any | null;
  model: string | null;
  promptVersion: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};


