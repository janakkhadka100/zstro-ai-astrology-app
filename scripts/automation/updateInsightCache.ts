// scripts/automation/updateInsightCache.ts
import { kv } from "@vercel/kv";

(async () => {
  const { userId, insights } = JSON.parse(process.argv[2] || "{}");
  await kv.set(`insights:${userId}`, insights || "");
  console.log(JSON.stringify({ ok: true }));
})();
