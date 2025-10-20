// scripts/automation/fetchPlanetary.ts
import { getPlanetaryContext } from "@/lib/ai/planetaryContext";

(async () => {
  const { userId, eventDate } = JSON.parse(process.argv[2] || "{}");
  const planetaryContext = await getPlanetaryContext(userId, eventDate);
  console.log(JSON.stringify({ planetaryContext }));
})();
