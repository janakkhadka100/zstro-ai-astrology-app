"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { HistoryList } from '@/components/history/HistoryList';
import { isFeatureEnabled } from '@/lib/config/features';
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider';
import AstroCards from '@/components/astro/AstroCards';
import { AstroData } from '@/lib/astrology/types';
import { ErrorNotice } from '@/components/shared/ErrorNotice';
import { Skeleton } from '@/components/shared/Skeleton';

interface ChatWithCardsProps {
  id: string;
  selectedChatModel: string;
  selectedVisibilityType: "private" | "public";
  isReadonly: boolean;
  upgradePrompt: boolean;
  userId?: string;
}

export default function ChatWithCards({
  id,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  upgradePrompt,
  userId
}: ChatWithCardsProps) {
  const { data: session, status } = useSession();
  const [cards, setCards] = useState<AstroData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  // Check if features are enabled
  const historyEnabled = isFeatureEnabled('history');
  const realtimeEnabled = isFeatureEnabled('wsRealtime');

  // Bootstrap cards on authentication
  useEffect(() => {
    if (cards || status !== "authenticated") return;
    
    const profile = (session as any)?.user?.profile; // dob,tob,lat,lon,tz,pob
    const payload = profile ? { ...profile, lang: "ne" } : { lang: "ne" }; // server can fill from session if missing
    const id = ++reqId.current;

    setLoading(true);
    setError(null);

    fetch("/api/astro/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async r => {
        if (!r.ok) {
          const errorText = await r.text();
          throw new Error(`bootstrap ${r.status}: ${errorText}`);
        }
        const j = await r.json();
        if (reqId.current === id) {
          setCards(j.data || j); // Handle both {data: ...} and direct response
        }
      })
      .catch((e) => {
        console.error("Bootstrap error:", e);
        if (reqId.current === id) {
          setError("डेटा ल्याउन असफल। कृपया फेरि प्रयास गर्नुहोस्।");
        }
      })
      .finally(() => {
        if (reqId.current === id) {
          setLoading(false);
        }
      });
  }, [status, session, cards]);

  // Show loading state
  if (loading && !cards) {
    return (
      <RealtimeProvider userId={userId || "test-user-123"} enabled={realtimeEnabled}>
        <div className="flex h-screen">
          {/* Astro Cards Sidebar */}
          <div className="w-96 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <div className="p-4 animate-pulse">कार्ड लोड हुँदै…</div>
          </div>
          
          {/* Main Chat Area */}
          <div className="flex-1">
            <Chat
              key={id}
              id={id}
              initialMessages={[]}
              selectedChatModel={selectedChatModel}
              selectedVisibilityType={selectedVisibilityType}
              isReadonly={isReadonly}
              upgradePrompt={upgradePrompt}
            />
            <DataStreamHandler id={id} />
          </div>
          
          {/* History Sidebar */}
          {historyEnabled && (
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
              <HistoryList 
                lang="ne"
                onSessionSelect={(sessionId) => {
                  console.log('Load session:', sessionId);
                }}
                onCreateSession={() => {
                  console.log('Create new session');
                }}
              />
            </div>
          )}
        </div>
      </RealtimeProvider>
    );
  }

  // Show error state
  if (error && !cards) {
    return (
      <RealtimeProvider userId={userId || "test-user-123"} enabled={realtimeEnabled}>
        <div className="flex h-screen">
          {/* Astro Cards Sidebar */}
          <div className="w-96 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <div className="p-4 text-red-600">{error}</div>
          </div>
          
          {/* Main Chat Area */}
          <div className="flex-1">
            <Chat
              key={id}
              id={id}
              initialMessages={[]}
              selectedChatModel={selectedChatModel}
              selectedVisibilityType={selectedVisibilityType}
              isReadonly={isReadonly}
              upgradePrompt={upgradePrompt}
            />
            <DataStreamHandler id={id} />
          </div>
          
          {/* History Sidebar */}
          {historyEnabled && (
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
              <HistoryList 
                lang="ne"
                onSessionSelect={(sessionId) => {
                  console.log('Load session:', sessionId);
                }}
                onCreateSession={() => {
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
        {/* Astro Cards Sidebar */}
        <div className="w-96 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <AstroCards 
            lang="ne" 
            data={cards}
            showThemeToggle={true}
          />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1">
          <Chat
            key={id}
            id={id}
            initialMessages={[]}
            selectedChatModel={selectedChatModel}
            selectedVisibilityType={selectedVisibilityType}
            isReadonly={isReadonly}
            upgradePrompt={upgradePrompt}
          />
          <DataStreamHandler id={id} />
        </div>
        
        {/* History Sidebar */}
        {historyEnabled && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <HistoryList 
              lang="ne"
              onSessionSelect={(sessionId) => {
                console.log('Load session:', sessionId);
              }}
              onCreateSession={() => {
                console.log('Create new session');
              }}
            />
          </div>
        )}
      </div>
    </RealtimeProvider>
  );
}
