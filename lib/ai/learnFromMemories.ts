// lib/ai/learnFromMemories.ts
import { openai } from '@/lib/ai/openaiClient';
import { getUserById } from '@/lib/db/queries';
import { getPlanetaryContext } from './planetaryContext';
import { analyzePlanetaryPatterns, findSimilarConfigurations } from './planetaryContext';

export interface UserMemory {
  id: number;
  userId: string;
  eventDate: string;
  eventType: string;
  eventDescription: string;
  planetaryContext: any;
  dashaContext: any;
  transitContext: any;
  createdAt: string;
}

export interface MemoryInsights {
  patterns: {
    description: string;
    confidence: number;
    triggers: string[];
    warnings: string[];
  }[];
  predictions: {
    description: string;
    dateRange: string;
    confidence: number;
    advice: string;
  }[];
  personalityTraits: {
    trait: string;
    evidence: string;
    strength: number;
  }[];
  recommendations: string[];
}

/**
 * Learn patterns from user's memories
 */
export async function learnFromMemories(userId: string, limit: number = 50): Promise<MemoryInsights | null> {
  try {
    // Get user's memories from database
    const memories = await getUserMemories(userId, limit);
    if (!memories || memories.length === 0) return null;

    // Get planetary contexts for all events
    const eventsWithContext = await Promise.all(
      memories.map(async (memory) => {
        const context = await getPlanetaryContext(userId, memory.eventDate);
        return { event: memory, context };
      })
    );

    // Analyze patterns
    const patterns = analyzePlanetaryPatterns(eventsWithContext);
    
    // Create learning prompt
    const learningPrompt = createLearningPrompt(memories, eventsWithContext, patterns);
    
    // Get AI analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: learningPrompt },
        { role: "user", content: "Analyze these memories and provide insights." }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const analysis = response.choices[0]?.message?.content;
    if (!analysis) return null;

    // Parse the analysis
    return parseMemoryInsights(analysis, patterns);

  } catch (error) {
    console.error('Error learning from memories:', error);
    return null;
  }
}

/**
 * Create learning prompt for AI analysis
 */
function createLearningPrompt(
  memories: UserMemory[],
  eventsWithContext: Array<{ event: UserMemory; context: any }>,
  patterns: any
): string {
  const memoryData = memories.map(memory => ({
    date: memory.eventDate,
    type: memory.eventType,
    description: memory.eventDescription,
    planetary: memory.planetaryContext
  }));

  return `
You are an expert Vedic astrologer analyzing a user's life events and planetary patterns to provide personalized insights.

USER MEMORIES:
${JSON.stringify(memoryData, null, 2)}

PLANETARY PATTERNS FOUND:
- Common planets in houses: ${patterns.commonPlanets.join(', ')}
- Common houses: ${patterns.commonHouses.join(', ')}
- Common signs: ${patterns.commonSigns.join(', ')}
- Dasha patterns: ${patterns.dashaPatterns.join(', ')}
- Transit patterns: ${patterns.transitPatterns.join(', ')}

ANALYSIS TASK:
1. Identify repeating patterns between life events and planetary positions
2. Find correlations between specific planetary combinations and event types
3. Identify personality traits based on consistent planetary influences
4. Predict potential future events based on upcoming similar planetary configurations
5. Provide practical advice and warnings

OUTPUT FORMAT (JSON):
{
  "patterns": [
    {
      "description": "Description of the pattern",
      "confidence": 0.8,
      "triggers": ["Mars in 8th house", "Rahu dasha"],
      "warnings": ["Be careful during Mars transits", "Avoid risky activities"]
    }
  ],
  "predictions": [
    {
      "description": "Predicted event or influence",
      "dateRange": "Next 3 months",
      "confidence": 0.7,
      "advice": "Specific advice for this period"
    }
  ],
  "personalityTraits": [
    {
      "trait": "Strong Mars influence",
      "evidence": "Multiple events during Mars transits",
      "strength": 0.9
    }
  ],
  "recommendations": [
    "General advice based on patterns",
    "Specific remedies or precautions"
  ]
}

Focus on:
- Practical, actionable insights
- Clear correlations between planets and events
- Specific warnings for similar future configurations
- Personalized advice based on the user's unique patterns
- Use Vedic astrology principles and terminology
`;
}

/**
 * Parse AI analysis into structured insights
 */
function parseMemoryInsights(analysis: string, patterns: any): MemoryInsights {
  try {
    // Try to extract JSON from the response
    const jsonMatch = analysis.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        patterns: parsed.patterns || [],
        predictions: parsed.predictions || [],
        personalityTraits: parsed.personalityTraits || [],
        recommendations: parsed.recommendations || []
      };
    }
  } catch (error) {
    console.error('Error parsing memory insights:', error);
  }

  // Fallback: create basic insights from patterns
  return createBasicInsights(patterns);
}

/**
 * Create basic insights from patterns when AI parsing fails
 */
function createBasicInsights(patterns: any): MemoryInsights {
  const insights: MemoryInsights = {
    patterns: [],
    predictions: [],
    personalityTraits: [],
    recommendations: []
  };

  // Create patterns from common planets
  patterns.commonPlanets.forEach((pattern: string) => {
    const [planet, house] = pattern.split('-');
    insights.patterns.push({
      description: `${planet} in ${house}th house appears frequently in your events`,
      confidence: 0.7,
      triggers: [pattern],
      warnings: [`Be mindful when ${planet} transits the ${house}th house`]
    });
  });

  // Create personality traits
  if (patterns.commonHouses.includes(1)) {
    insights.personalityTraits.push({
      trait: "Strong personality influence",
      evidence: "Multiple events when planets were in 1st house",
      strength: 0.8
    });
  }

  if (patterns.commonHouses.includes(8)) {
    insights.personalityTraits.push({
      trait: "Transformative nature",
      evidence: "Events often occur when planets are in 8th house",
      strength: 0.7
    });
  }

  // Create recommendations
  insights.recommendations.push(
    "Monitor planetary transits to your most active houses",
    "Keep track of dasha periods when major events occur",
    "Consider remedies for planets that frequently trigger events"
  );

  return insights;
}

/**
 * Get user's memories from database
 */
async function getUserMemories(userId: string, limit: number = 50): Promise<UserMemory[]> {
  try {
    const { getUserMemories: getMemories } = await import('@/lib/db/queries');
    return await getMemories(userId, limit);
  } catch (error) {
    console.error('Error getting user memories:', error);
    return [];
  }
}

/**
 * Update user experience based on successful sessions
 */
export async function updateUserExperience(
  userId: string, 
  sessionSuccess: boolean
): Promise<number> {
  try {
    // This would update the user_experience table
    // For now, return a mock score
    return Math.floor(Math.random() * 100);
  } catch (error) {
    console.error('Error updating user experience:', error);
    return 0;
  }
}

/**
 * Get personalized advice based on experience level
 */
export function getPersonalizedAdvice(
  experienceScore: number,
  insights: MemoryInsights
): string[] {
  const advice: string[] = [];

  if (experienceScore < 30) {
    advice.push("Focus on basic planetary influences and major transits");
    advice.push("Keep simple records of important life events");
  } else if (experienceScore < 70) {
    advice.push("Consider complex planetary aspects and dasha interactions");
    advice.push("Analyze patterns across different time periods");
  } else {
    advice.push("Use advanced techniques like Navamsa and divisional charts");
    advice.push("Consider subtle planetary influences and timing");
  }

  // Add insights-based advice
  insights.patterns.forEach(pattern => {
    advice.push(`Watch for: ${pattern.triggers.join(', ')}`);
  });

  insights.predictions.forEach(prediction => {
    advice.push(`Upcoming: ${prediction.description} (${prediction.dateRange})`);
  });

  return advice;
}
