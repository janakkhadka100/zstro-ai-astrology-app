// scripts/automation/storeChat.ts
import { storeChat } from "@/lib/chat/memory";

(async () => {
  const { userId, message } = JSON.parse(process.argv[2] || "{}");
  await storeChat(userId, message, {});
  console.log(JSON.stringify({ ok: true }));
})();
