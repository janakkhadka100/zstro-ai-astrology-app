// app/api/cron/learn/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getAllUsers } from '@/lib/db/queries';
import { learnFromMemories } from '@/lib/ai/learnFromMemories';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';

export async function GET() {
  // Public cron endpoint; protect via secret header in production
  try {
    const users = await getAllUsers();
    const results: Array<{ userId: string; ok: boolean }> = [];
    for (const u of users) {
      try {
        const insights = await learnFromMemories(u.id);
        await kv.set(`insights:${u.id}`, insights || null, { ex: 60 * 60 * 24 * 7 }); // 7d cache
        results.push({ userId: u.id, ok: true });
      } catch {
        results.push({ userId: u.id, ok: false });
      }
    }
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}


