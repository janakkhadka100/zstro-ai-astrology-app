-- 0013: Extend user_memory with quality fields and add indexes

ALTER TABLE "user_memory"
  ADD COLUMN IF NOT EXISTS "confidence" numeric(3,2),
  ADD COLUMN IF NOT EXISTS "source_message_id" varchar(64),
  ADD COLUMN IF NOT EXISTS "assumed_time" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "lang" varchar(8),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();

CREATE INDEX IF NOT EXISTS "user_memory_user_id_idx" ON "user_memory" ("user_id");
CREATE INDEX IF NOT EXISTS "user_memory_event_date_idx" ON "user_memory" ("event_date");
CREATE INDEX IF NOT EXISTS "user_memory_created_at_idx" ON "user_memory" ("created_at");


