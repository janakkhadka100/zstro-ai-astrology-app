-- 0014: Add memory consent flag to users

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "memory_consent" boolean DEFAULT false;


