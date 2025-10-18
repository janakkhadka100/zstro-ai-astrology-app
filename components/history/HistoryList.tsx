// components/history/HistoryList.tsx
// History list component for saved analyses

"use client";

import { useState, useEffect } from 'react';
import { Clock, MessageSquare, Trash2, Eye, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getString, type Lang } from '@/lib/utils/i18n';
import { Skeleton } from '@/components/shared/Skeleton';
import { ErrorNotice } from '@/components/shared/ErrorNotice';

interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  snapshotCount: number;
  lastMessage: string | null;
}

interface HistoryListProps {
  lang: Lang;
  onSessionSelect?: (sessionId: string) => void;
  onCreateSession?: () => void;
  className?: string;
}

export function HistoryList({ 
  lang, 
  onSessionSelect, 
  onCreateSession,
  className = '' 
}: HistoryListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchSessions = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      const response = await fetch(`/api/history?limit=20&offset=${currentOffset}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        if (reset) {
          setSessions(data.data.sessions);
        } else {
          setSessions(prev => [...prev, ...data.data.sessions]);
        }
        setHasMore(data.data.pagination.hasMore);
        setOffset(currentOffset + data.data.sessions.length);
      } else {
        throw new Error(data.errors?.[0] || 'Failed to fetch sessions');
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : getString("dataLoadFailed", lang)
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/history/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        throw new Error(data.errors?.[0] || 'Failed to delete session');
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : getString("dataLoadFailed", lang)
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return lang === 'ne' ? 'अहिले' : 'Just now';
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return lang === 'ne' ? `${hours} घण्टा अगाडि` : `${hours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return lang === 'ne' ? `${days} दिन अगाडि` : `${days}d ago`;
    } else {
      return date.toLocaleDateString(lang === 'ne' ? 'ne-NP' : 'en-US');
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  useEffect(() => {
    fetchSessions(true);
  }, []);

  if (loading && sessions.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="h-6 w-32" />
          <Skeleton variant="rect" className="h-8 w-24" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <Skeleton variant="text" className="h-5 w-3/4" />
            <Skeleton variant="text" className="h-4 w-1/2" />
            <Skeleton variant="text" className="h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorNotice
          error={error}
          lang={lang}
          onRetry={() => fetchSessions(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {lang === 'ne' ? 'सुरक्षित विश्लेषणहरू' : 'Saved Analyses'}
        </h3>
        {onCreateSession && (
          <button
            onClick={onCreateSession}
            className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="size-4" />
            <span className="text-sm font-medium">
              {lang === 'ne' ? 'नयाँ' : 'New'}
            </span>
          </button>
        )}
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="size-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {lang === 'ne' 
              ? 'कुनै सुरक्षित विश्लेषण छैन' 
              : 'No saved analyses yet'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {session.title}
                  </h4>
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="size-4" />
                      <span>{formatDate(session.updatedAt)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="size-4" />
                      <span>{session.messageCount}</span>
                    </div>
                    
                    {session.snapshotCount > 0 && (
                      <div className="flex items-center space-x-1">
                        <Eye className="size-4" />
                        <span>{session.snapshotCount}</span>
                      </div>
                    )}
                  </div>
                  
                  {session.lastMessage && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {truncateText(session.lastMessage)}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {onSessionSelect && (
                    <button
                      onClick={() => onSessionSelect(session.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title={lang === 'ne' ? 'खोल्नुहोस्' : 'Open'}
                    >
                      <Eye className="size-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title={lang === 'ne' ? 'मेटाउनुहोस्' : 'Delete'}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => fetchSessions(false)}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? (lang === 'ne' ? 'लोड हुँदै...' : 'Loading...')
              : (lang === 'ne' ? 'थप लोड गर्नुहोस्' : 'Load More')
            }
          </button>
        </div>
      )}
    </div>
  );
}
