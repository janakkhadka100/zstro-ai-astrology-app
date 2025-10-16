// /app/api/check-limit/route.ts
import { auth } from '@/app/(auth)/auth';
import { checkUserSubscriptionAndUpdateIfExpired, isCoinSufficient } from '@/lib/db/queries';

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  await checkUserSubscriptionAndUpdateIfExpired(userId);

  const isSufficient = await isCoinSufficient(userId);
  return Response.json({ isCoinSufficient: isSufficient });
}
