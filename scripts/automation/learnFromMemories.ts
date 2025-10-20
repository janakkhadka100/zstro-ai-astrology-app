// scripts/automation/learnFromMemories.ts
import { learnFromMemories } from "@/lib/ai/learnFromMemories";

(async () => {
  const { userId, limit } = JSON.parse(process.argv[2] || "{}");
  const insights = await learnFromMemories(userId, limit);
  console.log(JSON.stringify({ insights }));
})();
