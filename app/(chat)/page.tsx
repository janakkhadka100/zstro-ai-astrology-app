import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { auth } from '@/app/(auth)/auth';
import { isCoinSufficient } from '@/lib/db/queries';
import { HistoryList } from '@/components/history/HistoryList';
import { isFeatureEnabled } from '@/lib/config/features';
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider';

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

  // Check if features are enabled
  const historyEnabled = isFeatureEnabled('history');
  const realtimeEnabled = isFeatureEnabled('wsRealtime');

  if (!modelIdFromCookie) {
    return (
      <RealtimeProvider userId={userId || "test-user-123"} enabled={realtimeEnabled}>
        <div className="flex h-screen">
          {/* Main Chat Area */}
          <div className="flex-1">
            <Chat
              key={id}
              id={id}
              initialMessages={[]}
              selectedChatModel={DEFAULT_CHAT_MODEL}
              selectedVisibilityType="private"
              isReadonly={!isSufficient}
              upgradePrompt={!isSufficient}
            />
            <DataStreamHandler id={id} />
          </div>
          
          {/* History Sidebar */}
          {historyEnabled && (
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
              <HistoryList 
                lang="en" // TODO: Get from user preferences
                onSessionSelect={(sessionId) => {
                  // TODO: Load session into chat
                  console.log('Load session:', sessionId);
                }}
                onCreateSession={() => {
                  // TODO: Create new session
                  console.log('Create new session');
                }}
              />
            </div>
          )}
        </div>
      </RealtimeProvider>
    );
  }

  return (
    <RealtimeProvider userId={userId || "test-user-123"} enabled={realtimeEnabled}>
      <div className="flex h-screen">
        {/* Main Chat Area */}
        <div className="flex-1">
          <Chat
            key={id}
            id={id}
            initialMessages={[]}
            selectedChatModel={modelIdFromCookie.value}
            selectedVisibilityType="private"
            isReadonly={!isSufficient}
            upgradePrompt={!isSufficient}
          />
          <DataStreamHandler id={id} />
        </div>
        
        {/* History Sidebar */}
        {historyEnabled && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <HistoryList 
              lang="en" // TODO: Get from user preferences
              onSessionSelect={(sessionId) => {
                // TODO: Load session into chat
                console.log('Load session:', sessionId);
              }}
              onCreateSession={() => {
                // TODO: Create new session
                console.log('Create new session');
              }}
            />
          </div>
        )}
      </div>
    </RealtimeProvider>
  );
}
