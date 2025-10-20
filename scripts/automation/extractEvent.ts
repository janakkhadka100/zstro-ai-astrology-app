// scripts/automation/extractEvent.ts
import { extractEvent } from "@/lib/ai/eventExtractor";

(async () => {
  const { text, lang } = JSON.parse(process.argv[2] || "{}");
  const event = await extractEvent(text, lang);
  console.log(JSON.stringify({ event }));
})();
