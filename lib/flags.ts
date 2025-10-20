// lib/flags.ts
export const flags = {
  llm_streaming: true,
  model_routing: true,
  rag_memory: true,
  proactive_notifications: true,
  pwa: true,
  ab_tests: true,
  guardrails_strict: true,
  // Home widgets flags
  show_streaks: true,
  show_memory_timeline: true,
  enable_upload_export: true,
  enable_streaming_chat: true,
  i18n: true,
} as const;


