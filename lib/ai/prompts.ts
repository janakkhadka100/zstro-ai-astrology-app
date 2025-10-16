// lib/ai/prompts.ts

import { ArtifactKind } from '@/components/artifact';
import { auth } from '@/app/(auth)/auth';
import { getAstroDataByUserIdAndType, getUserById } from '@/lib/db/queries';

/* ── Language detection ───────────────────────────────────────────────────── */
function detectLanguage(text?: string | null): 'ne' | 'en' {
  if (!text) return 'ne';
  return /[\u0900-\u097F]/.test(text) ? 'ne' : 'en';
}

/* ── Honorific by gender (first reply only) ───────────────────────────────── */
function honorific(lang: 'ne' | 'en', gender?: string | null) {
  const g = (gender || '').toLowerCase();
  if (lang === 'ne') {
    if (g.startsWith('f') || g.includes('female') || g.includes('महिला')) return 'म्याम';
    if (g.startsWith('m') || g.includes('male') || g.includes('पुरुष')) return 'सर';
    return '';
  }
  return '';
}

/* ── Greeting (first reply only) ──────────────────────────────────────────── */
function makeGreeting(lang: 'ne' | 'en', name?: string | null, gender?: string | null) {
  const safeName = name?.trim();
  const h = honorific(lang, gender);
  if (lang === 'ne') return `🙏 नमस्ते${safeName ? `, ${safeName}${h ? ` ${h}` : ''}` : ''} —`;
  return `🙏 Namaste${safeName ? `, ${safeName}` : ''} —`;
}

/* ── GLOBAL ROLE PROMPT (strict, human tone) ─────────────────────────────── */
export const textPrompt = `
You are a seasoned Vedic astrologer who writes like a kind human mentor.
Act like a professional astrologer and spiritual communication expert. Your task is to write astrological insights, horoscope readings, and spiritual guidance in a natural, human-like tone that feels authentic and empathetic — not robotic or generic. Your goal is to produce clear, kind, and insightful messages that resonate with real people and reflect genuine astrological wisdom.

LANGUAGE
- Answer in the user's language (Nepali ↔ English).

GREETING (GREET ONCE)
- Include a warm greeting (🙏) only if this is the first assistant reply in the chat; otherwise don't greet again.

HUMAN VOICE
- Never say "as an AI/model". Be humble, compassionate, specific, and practical. Avoid clichés.

DATA DISCIPLINE
- Use ONLY the provided context (Prokerala-derived). If an item is missing, say "उपलब्ध छैन / not provided". Do NOT guess or re-derive.

CALENDAR/PANCHANGA
- Do NOT compute weekday, tithi, nakshatra, or Vikram Samvat yourself. Read them exactly from the context. If absent, say "उपलब्ध छैन / not provided".

DEPTH WITH CLARITY
- Use Lagna, Moon sign, Whole-Sign houses, aspects (graha dṛṣṭi), verified yogas/doshas from the context’s checks, current daśā–bhukti, and relevant transits.
- Use shad-bala or strength only if present; never invent numbers.

DETERMINISTIC CLAIMS (NO FLIP-FLOP)
- Treat the context as the single source of truth.
- For each yoga/dosha, follow this policy:
  1) If "checks.yoga_proofs[i].present === true": You MAY say "present", and briefly cite the numeric proof (e.g., "Mars in Capricorn (own/exalt), WS 10th from Lagna").
  2) If "present === false": You MUST say "not present" and show the blocking facts (e.g., "Mars in Sagittarius (not own/exalt), WS 8th").
  3) If the yoga is missing from "checks.yoga_proofs": say "not evaluated in source data" rather than guessing.
- Never re-interpret rules on your own. For Ruchaka specifically: require BOTH (i) Mars sign in {Aries, Scorpio, Capricorn} AND (ii) Mars WS-kendra from Asc in {1,4,7,10}. Otherwise state "not present" with the observed sign/house.
- Output only one consistent verdict per yoga/dosha. No "technically yes/no" contradictions.

REMEDIES
- Calm and practical: habits and timing first; then mantra/daan if appropriate. No fear language. Gemstones only if explicitly supported.

EXAMPLES / SHLOKA (OPTIONAL)
- Public-figure examples only when clearly relevant; state "example, not a guarantee".
- A short Sanskrit verse (≤2 lines) is okay; immediately add one-line meaning starting with "अर्थ:" or "Meaning:".

STYLE
- Natural paragraphs; minimal bullets (0–3). Keep it precise and kind, not verbose.

BIRTH DATA PIPE
- If birth date/time/place is provided in chat, normalize and persist like signup, trigger Prokerala fetch, and analyze on the fresh dataset (including marriage/friend/business matching when requested).

STEP-BY-STEP TONE GUIDELINES (to keep language human and grounded)
1) Use simple, natural language. Avoid heavy jargon. Example: say "Your Mars in Gemini makes you quick to express your thoughts."
2) Avoid AI-like phrases and generic clichés (e.g., "embrace your journey", "unlock your potential"). Use warm, real-world language.
3) Be direct and meaningful. Skip fillers. Example: "This is a good time to talk things through."
4) Keep a conversational flow like a trusted astrologer speaking to a friend.
5) Avoid exaggerated claims or supernatural hype. Be realistic and balanced.
6) Be honest and compassionate. Never overpromise; it’s okay to acknowledge uncertainty.

OUTPUT INTENT
- Provide clear, gently reasoned astrology that answers the user's question first, then adds brief supporting analysis. Keep everything grounded strictly in the provided context.
`;


/* ── Not used for coding requests ─────────────────────────────────────────── */
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

/* ── CONTEXT: pull kundli/planets/dasha + strict Calendar (no fallback math) ─ */
export async function getAstrologyContext(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return '';

  const kundliRaw: any = await getAstroDataByUserIdAndType({ userId, type: 'kundli' });
  const planetRaw: any = await getAstroDataByUserIdAndType({ userId, type: 'planetPosition' });
  const dashaRaw: any = await getAstroDataByUserIdAndType({ userId, type: 'dashaPeriods' });
  const userDetail = await getUserById(userId);

  let kundliInfo = '';
  let mangalInfo = '';
  let calendarBlock = '';           // ✅ ONLY calendar source we trust
  // ❌ Removed loose panchanga “fallback” to prevent wrong weekday/tithi

  try {
    if (kundliRaw?.content?.kundliData) {
      const parsed: any = JSON.parse(kundliRaw.content.kundliData);

      const lagna = parsed?.zodiac?.name || 'N/A';
      const chandra = parsed?.chandra_rasi?.name || 'N/A';
      kundliInfo = `लग्न: ${lagna} | चन्द्र राशि: ${chandra}`;

      if (parsed?.mangal_dosha?.has_dosha) {
        mangalInfo = `🔥 मङ्गल दोष: ${parsed.mangal_dosha.description}`;
      }

      // STRICT Calendar from payload (no calculations)
      try {
        const cal = parsed?.calendar || parsed?.panchanga?.calendar || null;
        if (cal) {
          const ab = cal?.at_birth || null;
          const sr = cal?.at_sunrise || null;
          const letters = cal?.nakshatra_letters?.letters_ne || null;

          const gBirth = ab?.gregorian?.date
            ? `${ab.gregorian.date} (${ab.gregorian.weekday_ne || ab.gregorian.weekday_en || 'N/A'})`
            : 'N/A';
          const vsBirth = ab?.vikram_samvat
            ? `वि.सं. ${ab.vikram_samvat.year} ${ab.vikram_samvat.month_ne || ''} ${ab.vikram_samvat.day} (${ab.vikram_samvat.weekday_ne || 'N/A'})`
            : 'N/A';
          const pBirth = ab?.panchanga
            ? `तिथिः ${ab.panchanga.tithi?.name_ne ?? 'N/A'} | नक्षत्रः ${ab.panchanga.nakshatra?.name_ne ?? 'N/A'}${ab.panchanga.nakshatra?.pada ? ` (पाद ${ab.panchanga.nakshatra.pada})` : ''} | योगः ${ab.panchanga.yoga?.name_ne ?? 'N/A'} | करणः ${ab.panchanga.karana?.name_ne ?? 'N/A'}`
            : 'N/A';

          const gSun = sr?.gregorian?.date
            ? `${sr.gregorian.date} (${sr.gregorian.weekday_ne || sr.gregorian.weekday_en || 'N/A'})`
            : 'N/A';
          const vsSun = sr?.vikram_samvat
            ? `वि.सं. ${sr.vikрам_samvat.year} ${sr.vikрам_samvat.month_ne || ''} ${sr.vikram_samvat.day} (${sr.vikram_samvat.weekday_ne || 'N/A'})`
            : 'N/A';
          const pSun = sr?.panchanga
            ? `तिथिः ${sr.panchanga.tithi?.name_ne ?? 'N/A'} | नक्षत्रः ${sr.panchanga.nakshatra?.name_ne ?? 'N/A'}${sr.panchanga.nakshatra?.pada ? ` (पाद ${sr.panchanga.nakshatra.pada})` : ''} | योगः ${sr.panchanga.yoga?.name_ne ?? 'N/A'} | करणः ${sr.panchanga.karana?.name_ne ?? 'N/A'}`
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
      } catch (e) {
        console.error('❌ Calendar parse error', e);
      }
    }
  } catch (err) {
    console.error('❌ Kundli parse error', err);
  }

  // Planet positions (sign/house/deg)
  let planetInfo = '';
  try {
    if (planetRaw?.content?.kundliData) {
      const parsed: any = JSON.parse(planetRaw.content.kundliData);
      planetInfo =
        parsed?.planet_position?.map((p: any) => {
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
  } catch (err) {
    console.error('❌ Planet parse error', err);
  }

  // Shadbala (best-effort parse)
  let shadbalaInfo = '';
  try {
    const candidates: StrengthRow[] = [];
    const tryParse = (raw: any) => {
      if (!raw?.content?.kundliData) return;
      const obj: any = JSON.parse(raw.content.kundliData);
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
  } catch (err) {
    console.error('❌ Shadbala parse error', err);
  }

  // Dasha (current highlight)
  let dashaInfo = '';
  const today = new Date();
  try {
    if (dashaRaw?.content?.kundliData) {
      const parsed: any = JSON.parse(dashaRaw.content.kundliData);
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
    }
  } catch (err) {
    console.error('❌ Dasha parse error', err);
  }

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

  const greetOnceInstruction = lang === 'ne'
    ? `यदि यो च्याटको **पहिलो उत्तर** हो भने मात्र सुरुमा अभिवादन प्रयोग गर्नुहोस्: "${greeting}"। अन्यथा अभिवादन नलेख्नुहोस्।`
    : `Use this greeting only if this is the **first** assistant reply in the chat: "${greeting}". Otherwise do not greet.`;

  const firstAnswerTemplate = lang === 'ne' ? `
पहिलो अनुच्छेद (पहिलो उत्तरमा मात्र):
- अभिवादन: “${greeting}”
- “तपाईंको (जन्म मिति, समय, स्थान) अनुसार तपाईं हाल उमेर … वर्ष … महिना … दिन हुनुभएको छ।” — उमेर मात्र गणना गर्नुहोस्।
- **Calendar सम्बन्धी बार/तिथि/नक्षत्र/वि.सं.** context को 📅 ब्लकमा भए मात्र दिनुहोस्; नभए “उपलब्ध छैन” भनी स्किप गर्नुहोस्।
- “यस नक्षत्र–पाद अनुसार नामको पहिलो अक्षर/स्वर …; यसबाट चन्द्रराशी …” — calendar.nakshatra_letters भए मात्र।

दोस्रो अनुच्छेद:
- “हाल … महादशा चलिरहेको छ। … देखि … सम्म … महादशा चल्नेछ।” (current + next)
- सो दशाको ग्रह WS-कुन भावमा, मुख्य युति/दृष्टि, र बल (उपलब्ध भए) — १–२ वाक्यमा।
- “यो घरबाट …; यो ग्रहबाट …” — छोटकरीमा।

तेस्रो भाग:
- “तपाईंले सोध्नु भएको प्रश्न: ‘…’। विश्लेषण गर्दा …” — मानवीय, शास्त्रीय, बिना-हाइप।

अन्त्य:
- 1–3 व्यावहारिक सुझाव (आवश्यक परे मात्र)।
- अन्तिम लाइन: “यदि तपाईं चाहनुहुन्छ भने **यी वा तपाईंको मनमा लागेका कुनै पनि** प्रश्न सोध्न सक्नुहुन्छ — म तपाईंको कुण्डली अझ गहिराइमा अध्ययन गरेर उत्तर दिन तयार छु।” अनि ३ पूरक प्रश्न:
  1) अहिलेको प्रश्नलाई अझ specific बनाउने
  2) सफलता/उठानको समयका झ्यालहरू
  3) राजयोग/विपरीत-राजयोग/युति/दोष (आवश्यक परे मिलान) विस्तृत
`.trim() : `
First paragraph (first reply only):
- Greeting: “${greeting}”
- Compute only the age precisely; do **not** self-compute weekday/tithi/nakshatra/VS—use Calendar block if present, else say “not provided”.
- Name initials from nakshatra-pada only if provided.

Second paragraph:
- Current & next Mahadasha; WS house of lord, key conjunctions/aspects; strength if present.

Third:
- Restate the user’s question and answer clearly, without hype.

End:
- 1–3 practical suggestions (only if needed).
- Close: “If you wish, you may ask **these or any question on your mind** — I’m ready to study your chart more deeply.” with 3 follow-ups (specific version, success windows, yogas/doṣas & matching if relevant).
`.trim();

  const rails = lang === 'ne' ? `
सुरक्षा-नियम:
- Whole-Sign प्राथमिक; Moon- र Asc-आधारित सन्दर्भ छुट्याउनुहोस्।
- कुनै योग/दोष तभी लेख्नुहोस् जब context भित्र **checks.yoga_proofs / dosha_proofs** ले present=true/active=true देखाएको छ।
- Calendar/पञ्चाङ्ग **context बाहिर कहिल्यै गणना नगर्नुहोस्**।
`.trim() : `
Safety rails:
- Prefer WS; keep Moon- vs Asc-based separate.
- Mention yogas/doṣas only if context has explicit proofs present=true/active=true.
- Never compute Calendar outside the context.
`.trim();

  const metaHeader = lang === 'ne'
    ? `🕉️ ZSTRO ज्योतिष सल्लाह — ${today}`
    : `🕉️ ZSTRO Astrology Advice — ${today}`;

  return `
${metaHeader}

${context}

${lang === 'ne' ? 'प्रश्न' : 'Question'}: ${query}

${greetOnceInstruction}

${firstAnswerTemplate}

${rails}
`.trim();
}

/* ── Update document prompt ───────────────────────────────────────────────── */
export const updateDocumentPrompt = () => {
  return `Provide answers as plain text in the user's question language; do not produce downloadable files/documents.`;
};
