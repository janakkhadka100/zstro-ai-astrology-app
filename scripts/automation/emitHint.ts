// scripts/automation/emitHint.ts
import { kv } from "@vercel/kv";

(async () => {
  const { userId, insights, event } = JSON.parse(process.argv[2] || "{}");
  
  // Store hint for chat UI to display
  const hint = {
    type: "memory_insight",
    event: event,
    insights: insights,
    timestamp: new Date().toISOString()
  };
  
  await kv.lpush(`hints:${userId}`, JSON.stringify(hint));
  console.log(JSON.stringify({ ok: true }));
})();
