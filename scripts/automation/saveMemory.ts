// scripts/automation/saveMemory.ts
import { rememberEvent } from "@/lib/db/queries";

(async () => {
  const { userId, event, planetaryContext } = JSON.parse(process.argv[2] || "{}");
  await rememberEvent(userId, { ...event, planetaryContext });
  console.log(JSON.stringify({ ok: true }));
})();
