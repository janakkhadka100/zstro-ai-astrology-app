import { cookies } from 'next/headers';

import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { auth } from '@/app/(auth)/auth';
import { isCoinSufficient } from '@/lib/db/queries';
import { isFeatureEnabled } from '@/lib/config/features';
import ChatWithCards from '@/components/chat/ChatWithCards';

export default async function Page() {
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
  const session = await auth();
  const userId = session?.user?.id;
  let isSufficient = false;

  if (userId) {
    isSufficient = await isCoinSufficient(userId);
  }

  const selectedModel = modelIdFromCookie?.value || DEFAULT_CHAT_MODEL;

  return (
    <ChatWithCards
      id={id}
      selectedChatModel={selectedModel}
      selectedVisibilityType="private"
      isReadonly={!isSufficient}
      upgradePrompt={!isSufficient}
      userId={userId}
    />
  );
}
