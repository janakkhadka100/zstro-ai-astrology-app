// lib/realtime/useSSE.ts
// Client-side SSE hook for realtime updates

"use client";

import { useEffect, useRef, useState } from "react";

interface SSEMessage {
  type: string;
  patch?: any;
  timestamp?: string;
  userId?: string;
  channel?: string;
  message?: string;
}

interface UseSSEOptions {
  onPatch?: (patch: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useSSE(
  url: string, 
  options: UseSSEOptions = {}
) {
  const {
    onPatch,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setIsConnected(true);
        setIsReconnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data);
          setLastMessage(data);
          
          if (data.type === 'cards-patch' && data.patch) {
            onPatch?.(data.patch);
          } else if (data.type === 'error') {
            setError(data.message || 'Unknown error');
            onError?.(data.message || 'Unknown error');
          }
        } catch (parseError) {
          console.error('Error parsing SSE message:', parseError);
        }
      };

      eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        setIsConnected(false);
        onDisconnect?.();
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          setIsReconnecting(true);
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            connect();
          }, reconnectInterval);
        } else {
          setError('Max reconnection attempts reached');
          onError?.('Max reconnection attempts reached');
        }
      };

    } catch (error) {
      console.error('Error creating SSE connection:', error);
      setError('Failed to create connection');
      onError?.('Failed to create connection');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setIsConnected(false);
    setIsReconnecting(false);
    onDisconnect?.();
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [url]);

  return {
    isConnected,
    isReconnecting,
    error,
    lastMessage,
    reconnect: connect,
    disconnect
  };
}

// Hook specifically for card patches
export function useCardPatches(
  userId: string,
  onPatch: (patch: any) => void,
  options: Omit<UseSSEOptions, 'onPatch'> = {}
) {
  const url = `/api/realtime/stream?u=${userId}`;
  
  return useSSE(url, {
    ...options,
    onPatch
  });
}
