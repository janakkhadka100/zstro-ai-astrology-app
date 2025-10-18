// components/realtime/RealtimeProvider.tsx
// Realtime provider for SSE updates

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useCardPatches } from '@/lib/realtime/useSSE';
import { isFeatureEnabled } from '@/lib/config/features';
import { AstroData } from '@/lib/astrology/types';

interface RealtimeContextType {
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  lastPatch: any | null;
  cards: AstroData | null;
  updateCards: (patch: any) => void;
  reconnect: () => void;
  disconnect: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

interface RealtimeProviderProps {
  children: ReactNode;
  userId: string;
  enabled?: boolean;
}

export function RealtimeProvider({ children, userId, enabled = true }: RealtimeProviderProps) {
  const [cards, setCards] = useState<AstroData | null>(null);
  const [lastPatch, setLastPatch] = useState<any | null>(null);

  // Only enable realtime if feature flag is on and enabled prop is true
  const realtimeEnabled = enabled && isFeatureEnabled('wsRealtime');

  const { isConnected, isReconnecting, error, reconnect, disconnect } = useCardPatches(
    userId,
    (patch) => {
      console.log('Received realtime patch:', patch);
      setLastPatch(patch);
      updateCards(patch);
    },
    {
      onConnect: () => {
        console.log('Realtime connected');
      },
      onDisconnect: () => {
        console.log('Realtime disconnected');
      },
      onError: (error) => {
        console.error('Realtime error:', error);
      }
    }
  );

  const updateCards = (patch: any) => {
    if (!patch || !patch.set) return;

    setCards(prevCards => {
      if (!prevCards) {
        // If no previous cards, create new ones from patch
        return patch.set as AstroData;
      }

      // Merge patch with existing cards
      const mergedCards = {
        ...prevCards,
        ...patch.set,
        // Update provenance if available
        provenance: patch.provenance ? {
          ...prevCards.provenance,
          ...patch.provenance
        } : prevCards.provenance
      };

      return mergedCards as AstroData;
    });
  };

  const contextValue: RealtimeContextType = {
    isConnected,
    isReconnecting,
    error,
    lastPatch,
    cards,
    updateCards,
    reconnect,
    disconnect
  };

  // Don't render realtime functionality if disabled
  if (!realtimeEnabled) {
    return <>{children}</>;
  }

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
      {/* Realtime status indicator */}
      <RealtimeStatus />
    </RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeContextType {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

// Status indicator component
function RealtimeStatus() {
  const { isConnected, isReconnecting, error } = useRealtime();

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>Realtime Error: {error}</span>
        </div>
      </div>
    );
  }

  if (isReconnecting) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-3 py-2 rounded-lg text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span>Reconnecting...</span>
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Live Updates</span>
        </div>
      </div>
    );
  }

  return null;
}

// Hook for components that need to react to card updates
export function useCardUpdates() {
  const { cards, lastPatch, updateCards } = useRealtime();
  
  return {
    cards,
    lastPatch,
    updateCards,
    hasUpdates: !!lastPatch
  };
}
