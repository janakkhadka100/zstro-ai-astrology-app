// lib/ai/prompts.ts

import { ArtifactKind } from '@/components/artifact';
import { auth } from '@/app/(auth)/auth';
import { getAstroDataByUserIdAndType, getUserById } from '@/lib/db/queries';
import { getChatHistory, getRecentEvents } from '@/lib/chat/memory';
import { extractEvent } from '@/lib/ai/eventExtractor';
import { learnFromMemories, MemoryInsights } from '@/lib/ai/learnFromMemories';
import { getPlanetaryContext } from '@/lib/ai/planetaryContext';
import { getTransitSummaryForContext } from '@/lib/ai/prompts-transit';

/* ────────────────────────────────────────────────────────────────────────────
   Minimal utils
──────────────────────────────────────────────────────────────────────────── */
type Lang = 'ne' | 'hi' | 'en';

function safeJson<T = any>(s?: string | null): T | null {
  if (!s) return null;
  try { return JSON.parse(s) as T; } catch { return null; }
}
const isDev = process.env.NODE_ENV !== 'production';
const log = (...a: any[]) => { if (isDev) console.log('[prompts]', ...a); };

/* ── Language detection (NE/HI/EN) ────────────────────────────────────────── */
/** Very small heuristic: if Devanagari present → try Hindi markers; else Nepali */
export function detectLanguage(text?: string | null): Lang {
  if (!text) return 'ne';
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (!hasDevanagari) return 'en';

  // Hindi common words (fallback is Nepali)
  const hiHints = /(हूँ|है|हो|करना|कब|कौन|क्यों|लेकिन|सकता|सकती|यदि|तुम|आप)/;
  return hiHints.test(text) ? 'hi' : 'ne';
}

/* ── Honorific by gender (first reply only) ───────────────────────────────── */
function honorific(lang: Lang, gender?: string | null) {
  const g = (gender || '').toLowerCase();
  if (lang === 'ne' || lang === 'hi') {
    if (g.startsWith('f') || g.includes('female') || g.includes('महिला') || g.includes('स्त्री')) return lang === 'hi' ? 'मैडम' : 'म्याम';
    if (g.startsWith('m') || g.includes('male') || g.includes('पुरुष')) return 'सर';
    return '';
  }
  return '';
}

/* ── Greeting (first reply only) ──────────────────────────────────────────── */
function makeGreeting(lang: Lang, name?: string | null, gender?: string | null) {
  const safeName = name?.trim();
  const h = honorific(lang, gender);
  if (lang === 'ne') return `🙏 नमस्ते${safeName ? `, ${safeName}${h ? ` ${h}` : ''}` : ''} —`;
  if (lang === 'hi') return `🙏 नमस्ते${safeName ? `, ${safeName}${h ? ` ${h}` : ''}` : ''} —`;
  return `🙏 Namaste${safeName ? `, ${safeName}` : ''} —`;
}

/* ── GLOBAL ROLE PROMPT (strict, human tone + memory) ─────────────────────── */
export const textPrompt = `
You are a seasoned Vedic astrologer who writes like a kind human mentor.
Act like a professional astrologer and spiritual communication expert. Your task is to write astrological insights, horoscope readings, and spiritual guidance in a natural, human-like tone that feels authentic and empathetic — not robotic or generic.

LANGUAGE
- Answer in the user's language (Nepali ↔ Hindi ↔ English).

GREET ONCE
- Include 🙏 greeting only if this is the first assistant reply in the chat; otherwise don't greet again.

HUMAN VOICE
- Never say "as an AI/model". Be humble, compassionate, specific, and practical. Avoid clichés.

DATA DISCIPLINE
- Use ONLY the provided context (Prokerala-derived). If an item is missing, say "उपलब्ध छैन / उपलब्ध नहीं / not provided". Do NOT guess or re-derive.

CALENDAR/PANCHANGA
- Do NOT compute weekday, tithi, nakshatra, or Vikram Samvat yourself. Read them exactly from the context. If absent, say "not provided".

DEPTH WITH CLARITY
- Use Lagna, Moon sign, Whole-Sign houses, aspects (graha dṛṣṭi), verified yogas/doshas from "checks", current daśā–bhukti, and relevant transits.
- Use shad-bala/strength only if present; never invent numbers.

DETERMINISTIC CLAIMS
- Treat the context as the single source of truth.
- For each yoga/dosha:
  1) If "present === true": you MAY say "present" with 1–line proof.
  2) If "present === false": say "not present" with blocking facts.
  3) If not listed: say "not evaluated in source data".
- For Ruchaka: require BOTH sign∈{Aries,Scorpio,Capricorn} AND WS-kendra∈{1,4,7,10}; else "not present".
- Output one consistent verdict; no flip-flop.

MEMORY & PERSONALIZATION
- Use the user's past events and patterns to provide personalized insights.
- Reference specific past events when relevant: "तपाईंको अतीतमा यस्तो घटना भएको थियो जब..."
- Connect current planetary positions to past patterns: "यो समयमा पनि त्यस्तै ग्रह स्थिति छ जस्तै..."
- Provide warnings based on past patterns: "अघिल्लो पटक यस्तो ग्रह स्थितिमा तपाईंलाई समस्या भएको थियो..."
- Learn from user's unique planetary responses and adapt advice accordingly.

REMEDIES
- Practical first (habits/timing); then mantra/dāna if appropriate. No fear-language. Gemstones only if explicitly supported.

STYLE
- Natural paragraphs; 0–3 bullets max. Precise and kind.

BIRTH DATA PIPE
- If birth date/time/place is provided in chat, normalize and persist like signup, trigger Prokerala fetch, and analyze on the fresh dataset.

STEP-BY-STEP VOICE
1) Simple, natural language.
2) Avoid generic AI-phrases.
3) Be direct and meaningful.
4) Conversational like a trusted astrologer.
5) Realistic; acknowledge uncertainty.
6) Honest, compassionate, grounded.
7) Remember and reference past conversations and events.
`;

/* ── Not for coding requests ──────────────────────────────────────────────── */
export const codePrompt = `
You are not here to write software. If the request is code-related, politely steer back to astrology guidance grounded in chart data.
`;

export const sheetPrompt = `Use short bullets only if needed; output must remain plain text.`;

/* ── Artifact wrapper ─────────────────────────────────────────────────────── */
export const artifactPrompt = (type: ArtifactKind, content: string | null) => {
  switch (type) {
    case 'text':  return `${textPrompt}\n\n${content ?? ''}`.trim();
    case 'code':  return `${codePrompt}\n\n${content ?? ''}`.trim();
    case 'sheet': return `${sheetPrompt}\n\n${content ?? ''}`.trim();
    default:      return `${textPrompt}\n\n${content ?? ''}`.trim();
  }
};

/* ── Utils ────────────────────────────────────────────────────────────────── */
function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
type StrengthRow = { name: string; value: number };

/* ── CONTEXT: pull kundli/planets/dasha + strict Calendar + Memory ─────────── */
export async function getAstrologyContext(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return '';

  // Get memory insights
  let memoryInsights: MemoryInsights | null = null;
  try {
    memoryInsights = await learnFromMemories(userId);
  } catch (error) {
    log('Memory insights error:', error);
  }

  // Get recent events from chat history
  let recentEvents = '';
  try {
    const events = await getRecentEvents(userId, 30);
    if (events.length > 0) {
      recentEvents = `\n📚 हालका घटनाहरु (पछिल्लो ३० दिन):\n${events.map(e => `- ${e.eventType}: ${e.eventDescription} (${e.eventDate || 'तिथि नभएको'})`).join('\n')}`;
    }
  } catch (error) {
    log('Recent events error:', error);
  }

  // First try to get data from the unified API
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/astro/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.overview) {
        // Use the unified API data
        const userDetail = await getUserById(userId);
        
        const userDetails = `
- User Profile Information:
  Full Name: ${userDetail?.name || 'N/A'}
  Date of Birth: ${userDetail?.dob || 'N/A'}
  Time of Birth: ${userDetail?.time || 'N/A'}
  Place of Birth: ${userDetail?.place || 'N/A'}
  Gender: ${userDetail?.gender || 'N/A'}
`;

        // Add memory insights if available
        let memoryBlock = '';
        if (memoryInsights) {
          memoryBlock = `\n🧠 व्यक्तिगत ज्योतिष पैटर्नहरु:
${memoryInsights.patterns.map(p => `- ${p.description} (विश्वास: ${Math.round(p.confidence * 100)}%)`).join('\n')}

${memoryInsights.predictions.length > 0 ? `\n🔮 भविष्यवाणीहरु:
${memoryInsights.predictions.map(p => `- ${p.description} (${p.dateRange}) - ${p.advice}`).join('\n')}` : ''}

${memoryInsights.recommendations.length > 0 ? `\n💡 सुझावहरु:
${memoryInsights.recommendations.map(r => `- ${r}`).join('\n')}` : ''}`;
        }

        return `
👤 प्रयोगकर्ताको विवरण:
${userDetails}

🕉️ जन्मकुण्डली विवरण:
लग्न: ${data.overview?.asc || 'N/A'} | चन्द्र राशि: ${data.overview?.moon || 'N/A'}

🪐 ग्रह स्थिति:
${(data.planets || []).map((p: any) => {
  const name = p?.planet || p?.name || 'ग्रह';
  const rasi = p?.signLabel || p?.rasi?.name || p?.sign || 'N/A';
  const house = p?.house || p?.house?.num || 'N/A';
  const deg = p?.degree != null ? `, ${Number(p.degree).toFixed(2)}°` : '';
  return `- ${name}: ${rasi}, House ${house}${deg}`;
}).join('\n')}

📜 महादशा Timeline:
${(data.vimshottari || []).map((d: any) => `- ${d.name} (${d.start} → ${d.end})`).join('\n')}

${data.analysis ? `\n📝 विश्लेषण:\n${data.analysis}` : ''}${recentEvents}${memoryBlock}

**महत्वपूर्ण**: यो डेटा युजर प्रोफाइलमा भएको वास्तविक ज्योतिष डेटा हो। चन्द्रमा ${data.overview?.moon || 'N/A'} राशिमा छ र ${data.overview?.moon === 'Capricorn' ? '९औँ घरमा' : 'अन्य घरमा'} स्थित छ। राहु ७औँ घरमा स्थित छ। यो डेटा सत्य मानेर विश्लेषण गर्नुहोस्।
`.trim();
      }
    }
  } catch (error) {
    log('Unified API error, falling back to individual queries:', error);
  }

  // Fallback to individual queries
  const kundliRaw: any = await getAstroDataByUserIdAndType({ usersId: userId, type: 'kundli' });
  const planetRaw: any = await getAstroDataByUserIdAndType({ usersId: userId, type: 'planetPosition' });
  const dashaRaw: any = await getAstroDataByUserIdAndType({ usersId: userId, type: 'dashaPeriods' });
  const userDetail = await getUserById(userId);

  let kundliInfo = '';
  let mangalInfo = '';
  let calendarBlock = '';

  try {
    const parsed: any = safeJson(kundliRaw?.content?.kundliData);
    if (parsed) {
      const lagna = parsed?.zodiac?.name || 'N/A';
      const chandra = parsed?.chandra_rasi?.name || 'N/A';
      kundliInfo = `लग्न: ${lagna} | चन्द्र राशि: ${chandra}`;

      if (parsed?.mangal_dosha?.has_dosha) {
        mangalInfo = `🔥 मङ्गल दोष: ${parsed.mangal_dosha.description}`;
      }

      try {
        const cal = parsed?.calendar || parsed?.panchanga?.calendar || null;
        if (cal) {
          const ab = cal?.at_birth || null;
          const sr = cal?.at_sunrise || null;
          const letters = cal?.nakshatra_letters?.letters_ne || cal?.nakshatra_letters?.letters_hi || null;

          const gBirth = ab?.gregorian?.date
            ? `${ab.gregorian.date} (${ab.gregorian.weekday_ne || ab.gregorian.weekday_hi || ab.gregorian.weekday_en || 'N/A'})`
            : 'N/A';
          const vsBirth = ab?.vikram_samvat
            ? `वि.सं. ${ab.vikram_samvat.year} ${ab.vikram_samvat.month_ne || ab.vikram_samvat.month_hi || ''} ${ab.vikram_samvat.day} (${ab.vikram_samvat.weekday_ne || ab.vikram_samvat.weekday_hi || 'N/A'})`
            : 'N/A';
          const pBirth = ab?.panchanga
            ? `तिथिः ${ab.panchanga.tithi?.name_ne ?? ab.panchanga.tithi?.name_hi ?? 'N/A'} | नक्षत्रः ${ab.panchanga.nakshatra?.name_ne ?? ab.panchanga.nakshatra?.name_hi ?? 'N/A'}${ab.panchanga.nakshatra?.pada ? ` (पाद ${ab.panchanga.nakshatra.pada})` : ''} | योगः ${ab.panchanga.yoga?.name_ne ?? ab.panchanga.yoga?.name_hi ?? 'N/A'} | करणः ${ab.panchanga.karana?.name_ne ?? ab.panchanga.karana?.name_hi ?? 'N/A'}`
            : 'N/A';

          const gSun = sr?.gregorian?.date
            ? `${sr.gregorian.date} (${sr.gregorian.weekday_ne || sr.gregorian.weekday_hi || sr.gregorian.weekday_en || 'N/A'})`
            : 'N/A';
          // BUGFIX: ensure correct ASCII 'vikram_samvat'
          const vsSun = sr?.vikram_samvat
            ? `वि.सं. ${sr.vikram_samvat.year} ${sr.vikram_samvat.month_ne || sr.vikram_samvat.month_hi || ''} ${sr.vikram_samvat.day} (${sr.vikram_samvat.weekday_ne || sr.vikram_samvat.weekday_hi || 'N/A'})`
            : 'N/A';
          const pSun = sr?.panchanga
            ? `तिथिः ${sr.panchanga.tithi?.name_ne ?? sr.panchanga.tithi?.name_hi ?? 'N/A'} | नक्षत्रः ${sr.panchanga.nakshatra?.name_ne ?? sr.panchanga.nakshatra?.name_hi ?? 'N/A'}${sr.panchanga.nakshatra?.pada ? ` (पाद ${sr.panchanga.nakshatra.pada})` : ''} | योगः ${sr.panchanga.yoga?.name_ne ?? sr.panchanga.yoga?.name_hi ?? 'N/A'} | करणः ${sr.panchanga.karana?.name_ne ?? sr.panchanga.karana?.name_hi ?? 'N/A'}`
            : 'N/A';

          const nameLetters =
            Array.isArray(letters) && letters.length
              ? `नामाङ्कुर/नामाक्षर: ${letters.join(', ')}`
              : '';

          calendarBlock = `📅 क्यालेन्डर (जन्मसमय):
- Gregorian: ${gBirth}
- Vikram Samvat: ${vsBirth}
- पञ्चाङ्ग (जन्मसमय): ${pBirth}
${ab?.sunrise_local ? `- स्थानीय सूर्योदय: ${ab.sunrise_local}` : ''}${ab?.sunset_local ? ` | सूर्यास्त: ${ab.sunset_local}` : ''}

📅 क्यालेन्डर (सूर्योदय):
- Gregorian: ${gSun}
- Vikram Samvat: ${vsSun}
- पञ्चाङ्ग (सूर्योदय): ${pSun}
${nameLetters ? `\n${nameLetters}` : ''}`;
        }
      } catch (e) { log('Calendar parse error', e); }
    }
  } catch (err) { log('Kundli parse error', err); }

  // Planet positions
  let planetInfo = '';
  try {
    const parsed: any = safeJson(planetRaw?.content?.kundliData);
    if (parsed?.planet_position) {
      planetInfo =
        parsed.planet_position.map((p: any) => {
          const name = p?.name || p?.planet || 'ग्रह';
          const rasi = p?.rasi?.name || p?.sign || 'N/A';
          const house = p?.house?.num ?? p?.house;
          const deg =
            p?.degree != null
              ? `, ${Number(p.degree).toFixed(2)}°`
              : p?.deg != null
              ? `, ${Number(p.deg).toFixed(2)}°`
              : '';
          return `- ${name}: ${rasi}${house ? `, House ${house}` : ''}${deg}`;
        }).join('\n') || '';
    }
  } catch (err) { log('Planet parse error', err); }

  // Shadbala (best effort)
  let shadbalaInfo = '';
  try {
    const candidates: StrengthRow[] = [];
    const tryParse = (raw: any) => {
      const obj: any = safeJson(raw?.content?.kundliData);
      if (!obj) return;
      const rows =
        obj?.shad_bala || obj?.shadbala || obj?.planet_strength || obj?.strength || obj?.shadBala || null;
      if (Array.isArray(rows)) {
        for (const r of rows) {
          const nm = (r as any)?.name || (r as any)?.planet || (r as any)?.graha;
          const val = Number((r as any)?.value ?? (r as any)?.bala ?? (r as any)?.score);
          if (nm && !Number.isNaN(val)) candidates.push({ name: nm, value: val });
        }
      } else if (rows && typeof rows === 'object') {
        for (const key of Object.keys(rows)) {
          const val = Number((rows as any)[key]);
          if (!Number.isNaN(val)) candidates.push({ name: key, value: val });
        }
      }
    };
    tryParse(kundliRaw);
    tryParse(planetRaw);
    if (candidates.length) {
      candidates.sort((a, b) => b.value - a.value);
      const label = (v: number) => (v >= 1.0 ? 'उत्कृष्ट' : v >= 0.8 ? 'बलियो' : v >= 0.6 ? 'मध्यम' : 'कमजोर');
      shadbalaInfo = candidates.slice(0, 7).map(c => `- ${c.name}: ${c.value.toFixed(2)} (${label(c.value)})`).join('\n') || '';
    }
  } catch (err) { log('Shadbala parse error', err); }

  // Dasha (current highlight)
  let dashaInfo = '';
  const today = new Date();
  try {
    const parsed: any = safeJson(dashaRaw?.content?.kundliData);
    const rows: any[] = parsed?.dasha_periods || [];
    const lines: string[] = [];
    let currentFound = false;
    for (const d of rows) {
      const s = new Date(d.start);
      const e = new Date(d.end);
      const isCurrent = today >= s && today <= e;
      if (isCurrent) currentFound = true;
      lines.push(`- ${isCurrent ? '🔷 ' : ''}${d.name} (${d.start} → ${d.end})${isCurrent ? '  ← वर्तमान महादशा' : ''}`);
    }
    dashaInfo = lines.slice(0, 8).join('\n');
    if (!currentFound && rows.length) {
      const upcoming = rows.find((d: any) => new Date(d.start) > today);
      if (upcoming) dashaInfo += `\n- ⏭ आगामी: ${upcoming.name} (${upcoming.start} → ${upcoming.end})`;
    }
  } catch (err) { log('Dasha parse error', err); }

  const userDetails = `
- User Profile Information:
  Full Name: ${userDetail?.name || 'N/A'}
  Date of Birth: ${userDetail?.dob || 'N/A'}
  Time of Birth: ${userDetail?.time || 'N/A'}
  Place of Birth: ${userDetail?.place || 'N/A'}
  Gender: ${userDetail?.gender || 'N/A'}
`;

  return `
👤 प्रयोगकर्ताको विवरण:
${userDetails}

🕉️ जन्मकुण्डली विवरण:
${kundliInfo}

${calendarBlock ? `\n${calendarBlock}\n` : ''}${mangalInfo ? `${mangalInfo}\n` : ''}🪐 ग्रह स्थिति:
${planetInfo}
(उपर्युक्त ग्रह स्थिति अनुसार व्याख्या गर्नुहोस्।)

${shadbalaInfo ? `⚖️ षड्बल (यदि उपलब्ध):\n${shadbalaInfo}\n` : ''}📜 महादशा Timeline:
${dashaInfo}
`.trim();
}

/* ── MAIN: build final answering prompt ────────────────────────────────────── */
export async function getAstrologyPrompt(query: string): Promise<string> {
  const context = await getAstrologyContext();
  const today = toYMD(new Date());
  const lang = detectLanguage(query);

  const nameMatch = context.match(/Full Name:\s*(.+)/);
  const userName = nameMatch?.[1]?.trim() && nameMatch[1] !== 'N/A' ? nameMatch[1].trim() : undefined;
  const genderMatch = context.match(/Gender:\s*(.+)/);
  const userGender = genderMatch?.[1]?.trim() && genderMatch[1] !== 'N/A' ? genderMatch[1].trim() : undefined;
  const greeting = makeGreeting(lang, userName, userGender);

  // Add transit context if query mentions today/tomorrow/specific date
  let transitContext = '';
  if (query.includes('today') || query.includes('आज') || query.includes('आज') || 
      query.includes('tomorrow') || query.includes('भोली') || query.includes('कल') ||
      /\d{4}-\d{2}-\d{2}/.test(query)) {
    try {
      const response = await fetch('/api/transits/today');
      const result = await response.json();
      if (result.success) {
        transitContext = getTransitSummaryForContext(result.data);
      }
    } catch (error) {
      console.error('Error fetching transit context:', error);
    }
  }

  const greetOnceInstruction =
    lang === 'ne'
      ? `यदि यो च्याटको **पहिलो उत्तर** हो भने मात्र सुरुमा अभिवादन प्रयोग गर्नुहोस्: "${greeting}"। अन्यथा अभिवादन नलेख्नुहोस्।`
      : lang === 'hi'
      ? `यदि यह चैट का **पहला उत्तर** है तभी शुरुआत में अभिवादन लिखें: "${greeting}"। अन्यथा अभिवादन न लिखें।`
      : `Use this greeting only if this is the **first** assistant reply in the chat: "${greeting}". Otherwise do not greet.`;

  const firstAnswerTemplate =
    lang === 'ne'
      ? `
पहिलो अनुच्छेद (पहिलो उत्तरमा मात्र):
- अभिवादन: "${greeting}"
- "तपाईंको (जन्म मिति, समय, स्थान) अनुसार तपाईं हाल उमेर … वर्ष … महिना … दिन हुनुभएको छ।" — उमेर मात्र गणना गर्नुहोस्।
- **Calendar** सम्बन्धी बार/तिथि/नक्षत्र/वि.सं. context को 📅 ब्लकमा भए मात्र; नभए "उपलब्ध छैन"।

दोस्रो अनुच्छेद:
- "हाल … महादशा चलिरहेको छ। … देखि … सम्म … महादशा चल्नेछ।" (current + next)
- WS-भाव, मुख्य युति/दृष्टि, बल (उपलब्ध भए) — १–२ वाक्य।

तेस्रो भाग:
- "तपाईंले सोध्नु भएको प्रश्न: '…'। विश्लेषण गर्दा …" — मानवीय, शास्त्रीय, संक्षेप।

अन्त्य:
- 1–3 व्यावहारिक सुझाव (आवश्यक भएमा)।
- अन्तिम: "यदि तपाईं चाहनुहुन्छ भने **यी वा तपाईंको मनका कुनै पनि** प्रश्न सोध्न सक्नुहुन्छ — म अझ गहिराइमा अध्ययन गरेर उत्तर दिन तयार छु।" अनि ३ पूरक प्रश्न।
`.trim()
      : lang === 'hi'
      ? `
पहला अनुच्छेद (सिर्फ पहले उत्तर में):
- अभिवादन: "${greeting}"
- आयु केवल गणना करें; पंचांग/वार/नक्षत्र स्वयं न निकालें — context में हो तो ही दें।

दूसरा अनुच्छेद:
- वर्तमान और आगामी महादशा; WS-भाव/दृष्टि/युति संक्षेप में।

तीसरा:
- उपयोगकर्ता के प्रश्न को दोहराएँ और स्पष्ट उत्तर दें—बिना अतिशयोक्ति।

अंत:
- 1–3 व्यावहारिक सुझाव (यदि ज़रूरी हो)।
- समापन: "यदि चाहें तो **ये या मन के कोई भी** प्रश्न पूछ सकते हैं — मैं चार्ट को और गहराई से देखकर उत्तर दूँगा/गी।" साथ 3 follow-ups।
`.trim()
      : `
First paragraph (first reply only):
- Greeting: "${greeting}"
- Compute only the age; do NOT self-compute weekday/tithi/nakshatra/VS—use Calendar block if present.

Second paragraph:
- Current & next Mahadasha; WS house, key conjunctions/aspects; strength if present.

Third:
- Restate the user's question and answer clearly.

End:
- 1–3 practical suggestions if needed.
- Close with 3 follow-up prompts for deeper reading.
`.trim();

  const rails =
    lang === 'ne'
      ? `
सुरक्षा-नियम:
- Whole-Sign प्राथमिक; Moon- र Asc-आधारित सन्दर्भ छुट्याउनुहोस्।
- योग/दोष केवल तब नै लेख्नुहोस् जब "checks" मा present=true/active=true।
- Calendar/पञ्चाङ्ग context बाहिर कहिल्यै गणना नगर्नुहोस्।
`.trim()
      : lang === 'hi'
      ? `
सुरक्षा-नियम:
- Whole-Sign प्राथमिक; Moon और Asc आधारित संदर्भ अलग रखें।
- योग/दोष तभी बताएँ जब "checks" में present=true/active=true हो।
- Calendar/Panchang context के बाहर कभी गणना न करें।
`.trim()
      : `
Safety rails:
- Prefer Whole-Sign; keep Moon- vs Asc-based references separate.
- Mention yogas/doṣas only if context has explicit proofs present=true/active=true.
- Never compute Calendar outside the context.
`.trim();

  const metaHeader =
    lang === 'ne' ? `🕉️ ZSTRO ज्योतिष सल्लाह — ${today}` :
    lang === 'hi' ? `🕉️ ZSTRO ज्योतिष सलाह — ${today}` :
    `🕉️ ZSTRO Astrology Advice — ${today}`;

  return `
${metaHeader}

${context}

${transitContext}

${lang === 'ne' ? 'प्रश्न' : lang === 'hi' ? 'प्रश्न' : 'Question'}: ${query}

${greetOnceInstruction}

${firstAnswerTemplate}

${rails}
`.trim();
}

/* ── Dasha interpretation prompt ────────────────────────────────────────────── */
export const dashaInterpretationPrompt = (dashaData: any, queryDate: string, lang: Lang = 'en') => {
  const langText = {
    ne: {
      title: '🕉️ बहु-स्तरीय दशा विश्लेषण',
      intro: 'दिनांक',
      maha: 'महादशा',
      antar: 'अन्तरदशा', 
      pratyantar: 'प्रत्यन्तरदशा',
      sookshma: 'सूक्ष्मदशा',
      pran: 'प्राणदशा',
      analysis: 'विश्लेषण',
      effects: 'प्रभाव',
      remedies: 'उपाय',
      prediction: 'भविष्यवाणी'
    },
    hi: {
      title: '🕉️ बहु-स्तरीय दशा विश्लेषण',
      intro: 'दिनांक',
      maha: 'महादशा',
      antar: 'अन्तरदशा',
      pratyantar: 'प्रत्यन्तरदशा', 
      sookshma: 'सूक्ष्मदशा',
      pran: 'प्राणदशा',
      analysis: 'विश्लेषण',
      effects: 'प्रभाव',
      remedies: 'उपाय',
      prediction: 'भविष्यवाणी'
    },
    en: {
      title: '🕉️ Multi-Level Dasha Analysis',
      intro: 'Date',
      maha: 'Maha Dasha',
      antar: 'Antar Dasha',
      pratyantar: 'Pratyantar Dasha',
      sookshma: 'Sookshma Dasha', 
      pran: 'Pran Dasha',
      analysis: 'Analysis',
      effects: 'Effects',
      remedies: 'Remedies',
      prediction: 'Prediction'
    }
  };

  const t = langText[lang];

  return `
${t.title} — ${queryDate}

${t.intro}: ${queryDate}

**${t.maha}**: ${dashaData.summary?.maha || 'Unknown'} (Overall life theme)
**${t.antar}**: ${dashaData.summary?.antar || 'Unknown'} (Situational direction)  
**${t.pratyantar}**: ${dashaData.summary?.pratyantar || 'Unknown'} (Monthly trigger)
**${t.sookshma}**: ${dashaData.summary?.sookshma || 'Unknown'} (Weekly mood/response)
**${t.pran}**: ${dashaData.summary?.pran || 'Unknown'} (Momentary energy)

${t.analysis}:
Analyze how each dasha level modifies the others:

1. **${t.maha}**: Sets the overall life theme and long-term direction
2. **${t.antar}**: Influences situational changes and medium-term events  
3. **${t.pratyantar}**: Affects monthly activities and short-term decisions
4. **${t.sookshma}**: Influences weekly mood and immediate responses
5. **${t.pran}**: Represents momentary energy and consciousness

${t.effects}:
- Explain the combined influence of all active dasha levels
- Consider planetary strengths, aspects, and house positions
- Analyze benefic/malefic combinations
- Discuss timing for important activities

${t.remedies}:
- Suggest appropriate remedies based on active planets
- Recommend favorable times for specific activities
- Provide guidance for challenging planetary combinations

${t.prediction}:
- Give insights about upcoming opportunities or challenges
- Suggest areas of focus during this period
- Provide practical advice for navigating this dasha combination

Remember: Each dasha level influences the others, creating a complex web of planetary energies that shape our experiences.
`;
};

/* ── Update document prompt (unchanged) ───────────────────────────────────── */
export const updateDocumentPrompt = () => {
  return `Provide answers as plain text in the user's question language; do not produce downloadable files/documents.`;
};