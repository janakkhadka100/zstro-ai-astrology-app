// lib/llm/missing-detector.ts
// Missing data detector and fetch planner

import { AstroData, FetchPlan } from '@/lib/astrology/types';
import { getDataCoverage } from '@/lib/cards/compose';

export function detectMissingData(question: string, cards: AstroData): FetchPlan[] {
  const plans: FetchPlan[] = [];
  const coverage = getDataCoverage(cards);
  const q = question.toLowerCase();

  // Vimshottari Dasha requests
  if (q.includes("अन्तरदशा") || q.includes("antardasha") || q.includes("antar dasha")) {
    if (!coverage.dashas.vimshottari.includes("antar")) {
      plans.push({ kind: "vimshottari", levels: ["antar"] });
    }
  }

  if (q.includes("प्रत्यन्तरदशा") || q.includes("pratyantar") || q.includes("pratyantar dasha")) {
    if (!coverage.dashas.vimshottari.includes("pratyantar")) {
      plans.push({ kind: "vimshottari", levels: ["pratyantar"] });
    }
  }

  if (q.includes("महादशा") || q.includes("mahadasha") || q.includes("maha dasha")) {
    if (!coverage.dashas.vimshottari.includes("maha")) {
      plans.push({ kind: "vimshottari", levels: ["maha"] });
    }
  }

  // Yogini Dasha requests
  if (q.includes("योगिनी") || q.includes("yogini")) {
    if (!coverage.dashas.yogini.includes("maha")) {
      plans.push({ kind: "yogini", levels: ["maha"] });
    }
  }

  // Divisional chart requests
  if (q.includes("नवांश") || q.includes("navamsa") || q.includes("d9")) {
    if (!coverage.divisionals.includes("D9")) {
      plans.push({ kind: "divisionals", list: ["D9"] });
    }
  }

  if (q.includes("दशांश") || q.includes("dashamsha") || q.includes("d10")) {
    if (!coverage.divisionals.includes("D10")) {
      plans.push({ kind: "divisionals", list: ["D10"] });
    }
  }

  if (q.includes("सप्तांश") || q.includes("saptamsha") || q.includes("d7")) {
    if (!coverage.divisionals.includes("D7")) {
      plans.push({ kind: "divisionals", list: ["D7"] });
    }
  }

  if (q.includes("द्वादशांश") || q.includes("dwadashamsha") || q.includes("d12")) {
    if (!coverage.divisionals.includes("D2")) {
      plans.push({ kind: "divisionals", list: ["D2"] });
    }
  }

  // Shadbala detail requests
  if (q.includes("शड्बल") || q.includes("shadbala") || q.includes("षड्बल")) {
    if (!coverage.shadbala) {
      plans.push({ kind: "shadbala", detail: true });
    }
  }

  if (q.includes("बल") || q.includes("strength") || q.includes("power")) {
    if (!coverage.shadbala) {
      plans.push({ kind: "shadbala", detail: true });
    }
  }

  // Yogas detail requests
  if (q.includes("योग") || q.includes("yoga") || q.includes("राजयोग") || q.includes("rajyoga")) {
    if (!coverage.yogas) {
      plans.push({ kind: "yogas", detail: true });
    }
  }

  if (q.includes("पञ्चमहापुरुष") || q.includes("panchmahapurush") || q.includes("panch mahapurush")) {
    if (!coverage.yogas) {
      plans.push({ kind: "yogas", detail: true });
    }
  }

  if (q.includes("विपरीत") || q.includes("vipareeta") || q.includes("vipareeta rajyoga")) {
    if (!coverage.yogas) {
      plans.push({ kind: "yogas", detail: true });
    }
  }

  // Multiple divisional charts
  if (q.includes("सबै") || q.includes("all") || q.includes("सभी") || q.includes("every")) {
    if (q.includes("विभाजन") || q.includes("divisional") || q.includes("charts")) {
      const missingCharts = ["D2", "D7", "D9", "D10"].filter(chart => 
        !coverage.divisionals.includes(chart)
      );
      if (missingCharts.length > 0) {
        plans.push({ kind: "divisionals", list: missingCharts as any });
      }
    }
  }

  // Comprehensive dasha requests
  if (q.includes("सबै दशा") || q.includes("all dashas") || q.includes("सभी दशा")) {
    const missingVimshottari = ["maha", "antar", "pratyantar"].filter(level =>
      !coverage.dashas.vimshottari.includes(level)
    );
    if (missingVimshottari.length > 0) {
      plans.push({ kind: "vimshottari", levels: missingVimshottari as any });
    }

    const missingYogini = ["maha"].filter(level =>
      !coverage.dashas.yogini.includes(level)
    );
    if (missingYogini.length > 0) {
      plans.push({ kind: "yogini", levels: missingYogini as any });
    }
  }

  return plans;
}

export function parseDataNeededResponse(response: string): string[] {
  // Parse "DataNeeded: key1,key2" from LLM response
  const match = response.match(/^DataNeeded:\s*(.+)$/m);
  if (!match) return [];

  const keys = match[1].split(',').map(key => key.trim());
  
  // Validate keys against known data types
  const validKeys = [
    "d1", "divisionals", "yogas", "doshas", "shadbala",
    "dashas.vimshottari", "dashas.yogini",
    "divisionals.D9", "divisionals.D10", "divisionals.D7", "divisionals.D2",
    "dashas.vimshottari.maha", "dashas.vimshottari.antar", "dashas.vimshottari.pratyantar",
    "dashas.yogini.maha", "dashas.yogini.current"
  ];

  return keys.filter(key => validKeys.includes(key));
}

export function createFetchPlansFromKeys(keys: string[]): FetchPlan[] {
  const plans: FetchPlan[] = [];

  for (const key of keys) {
    if (key.startsWith("dashas.vimshottari.")) {
      const level = key.replace("dashas.vimshottari.", "") as "maha" | "antar" | "pratyantar" | "current";
      plans.push({ kind: "vimshottari", levels: [level] });
    } else if (key.startsWith("dashas.yogini.")) {
      const level = key.replace("dashas.yogini.", "") as "maha" | "current";
      plans.push({ kind: "yogini", levels: [level] });
    } else if (key.startsWith("divisionals.")) {
      const chart = key.replace("divisionals.", "") as "D2" | "D7" | "D9" | "D10";
      plans.push({ kind: "divisionals", list: [chart] });
    } else if (key === "shadbala") {
      plans.push({ kind: "shadbala", detail: true });
    } else if (key === "yogas") {
      plans.push({ kind: "yogas", detail: true });
    }
  }

  return plans;
}

export function shouldFetchData(question: string, cards: AstroData): boolean {
  const coverage = getDataCoverage(cards);
  const q = question.toLowerCase();

  // If basic data is missing, always fetch
  if (!coverage.d1) return true;

  // Check for specific data requests
  const hasSpecificRequests = [
    "अन्तरदशा", "antardasha", "प्रत्यन्तरदशा", "pratyantar",
    "नवांश", "navamsa", "दशांश", "dashamsha",
    "शड्बल", "shadbala", "योग", "yoga"
  ].some(term => q.includes(term));

  return hasSpecificRequests;
}

export function getDataNeededMessage(lang: "ne" | "en", missingKeys: string[]): string {
  if (missingKeys.length === 0) return "";

  if (lang === "ne") {
    return `कार्डमा निम्न डेटा छैन: ${missingKeys.join(", ")}। थप डेटा तान्दै...`;
  } else {
    return `The following data is missing from cards: ${missingKeys.join(", ")}. Fetching additional data...`;
  }
}

export function getDataUpdatedMessage(lang: "ne" | "en"): string {
  if (lang === "ne") {
    return "कार्ड अपडेट भयो। पुन: विश्लेषण भयो।";
  } else {
    return "Cards updated. Re-analyzing...";
  }
}
