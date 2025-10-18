// components/notifications/NotificationManager.tsx
// Client-side notification management

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getString, type Lang } from '@/lib/utils/i18n';
import { isFeatureEnabled } from '@/lib/config/features';

interface NotificationManagerProps {
  lang: Lang;
  userId?: string;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({ 
  lang, 
  userId 
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);

  // Check if notifications are supported and feature is enabled
  useEffect(() => {
    if (!isFeatureEnabled('notifications')) {
      return;
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
    } else {
      setIsSupported(false);
    }
  }, []);

  // Check current subscription status
  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }, []);

  // Get VAPID public key
  const getVapidPublicKey = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/vapid-key');
      if (response.ok) {
        const data = await response.json();
        setVapidPublicKey(data.publicKey);
      }
    } catch (error) {
      console.error('Error getting VAPID key:', error);
    }
  }, []);

  // Subscribe to notifications
  const subscribe = useCallback(async () => {
    if (!isSupported || !vapidPublicKey) {
      setError(getString('notificationsNotSupported', lang));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...subscriptionData,
          userAgent: navigator.userAgent,
          language: lang
        })
      });

      if (response.ok) {
        setIsSubscribed(true);
        // Show success message
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(getString('subscriptionSuccess', lang), {
            body: getString('subscriptionSuccessMessage', lang),
            icon: '/icons/notification-192x192.png'
          });
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || getString('subscriptionFailed', lang));
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError(getString('subscriptionError', lang));
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, vapidPublicKey, lang]);

  // Unsubscribe from notifications
  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        const response = await fetch(`/api/notifications/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setIsSubscribed(false);
        }
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setError(getString('unsubscribeError', lang));
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await getVapidPublicKey();
      } else {
        setError(getString('permissionDenied', lang));
      }
    }
  }, [lang, getVapidPublicKey]);

  // Convert VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Convert array buffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  if (!isFeatureEnabled('notifications')) {
    return null;
  }

  if (!isSupported) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-lg">
        <p className="text-sm">
          {getString('notificationsNotSupported', lang)}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        {getString('notifications', lang)}
      </h3>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getString('notificationStatus', lang)}
            </p>
            <p className={`text-sm font-medium ${
              isSubscribed 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {isSubscribed 
                ? getString('subscribed', lang)
                : getString('notSubscribed', lang)
              }
            </p>
          </div>
          
          <div className="flex space-x-2">
            {!isSubscribed ? (
              <button
                onClick={requestPermission}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? getString('loading', lang) : getString('enableNotifications', lang)}
              </button>
            ) : (
              <button
                onClick={unsubscribe}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? getString('loading', lang) : getString('disableNotifications', lang)}
              </button>
            )}
          </div>
        </div>

        {!isSubscribed && Notification.permission === 'granted' && (
          <button
            onClick={subscribe}
            disabled={isLoading || !vapidPublicKey}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? getString('loading', lang) : getString('subscribeToNotifications', lang)}
          </button>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>{getString('notificationInfo', lang)}</p>
        </div>
      </div>
    </div>
  );
};
