// lib/notifications/push-service.ts
// Web Push notification service

import { webpush, PushSubscription } from 'web-push';
import { isFeatureEnabled } from '@/lib/config/features';

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationService {
  private vapidKeys: {
    publicKey: string;
    privateKey: string;
  };

  constructor() {
    this.vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY || '',
      privateKey: process.env.VAPID_PRIVATE_KEY || ''
    };

    if (!this.vapidKeys.publicKey || !this.vapidKeys.privateKey) {
      console.warn('VAPID keys not configured. Push notifications will not work.');
    } else {
      webpush.setVapidDetails(
        'mailto:support@zstro.ai',
        this.vapidKeys.publicKey,
        this.vapidKeys.privateKey
      );
    }
  }

  // Send notification to a single subscription
  async sendNotification(
    subscription: PushSubscriptionData,
    payload: NotificationPayload
  ): Promise<boolean> {
    if (!isFeatureEnabled('notifications')) {
      console.log('Notifications feature disabled');
      return false;
    }

    try {
      const pushSubscription: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: subscription.keys
      };

      const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-72x72.png',
        data: payload.data || {},
        actions: payload.actions || [],
        timestamp: Date.now(),
        requireInteraction: true,
        silent: false
      });

      await webpush.sendNotification(pushSubscription, notificationPayload);
      console.log('Push notification sent successfully');
      return true;

    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Send notification to multiple subscriptions
  async sendBulkNotification(
    subscriptions: PushSubscriptionData[],
    payload: NotificationPayload
  ): Promise<{ sent: number; failed: number }> {
    if (!isFeatureEnabled('notifications')) {
      console.log('Notifications feature disabled');
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    const promises = subscriptions.map(async (subscription) => {
      const success = await this.sendNotification(subscription, payload);
      if (success) {
        sent++;
      } else {
        failed++;
      }
    });

    await Promise.allSettled(promises);

    console.log(`Bulk notification sent: ${sent} successful, ${failed} failed`);
    return { sent, failed };
  }

  // Send astrology analysis ready notification
  async sendAnalysisReadyNotification(
    subscription: PushSubscriptionData,
    analysisId: string,
    lang: 'ne' | 'en' = 'en'
  ): Promise<boolean> {
    const payload: NotificationPayload = {
      title: lang === 'ne' ? 'ज्योतिष विश्लेषण तयार छ' : 'Astrology Analysis Ready',
      body: lang === 'ne' 
        ? 'आफ्नो ज्योतिष विश्लेषण हेर्नुहोस्' 
        : 'Your astrology analysis is ready to view',
      icon: '/icons/astrology-192x192.png',
      data: {
        type: 'analysis_ready',
        analysisId,
        url: `/analysis/${analysisId}`
      },
      actions: [
        {
          action: 'view',
          title: lang === 'ne' ? 'हेर्नुहोस्' : 'View Analysis',
          icon: '/icons/view-24x24.png'
        },
        {
          action: 'dismiss',
          title: lang === 'ne' ? 'खारेज गर्नुहोस्' : 'Dismiss',
          icon: '/icons/close-24x24.png'
        }
      ]
    };

    return await this.sendNotification(subscription, payload);
  }

  // Send new message notification
  async sendNewMessageNotification(
    subscription: PushSubscriptionData,
    messagePreview: string,
    lang: 'ne' | 'en' = 'en'
  ): Promise<boolean> {
    const payload: NotificationPayload = {
      title: lang === 'ne' ? 'नयाँ सन्देश' : 'New Message',
      body: messagePreview.length > 100 
        ? messagePreview.substring(0, 100) + '...' 
        : messagePreview,
      icon: '/icons/message-192x192.png',
      data: {
        type: 'new_message',
        url: '/chat'
      },
      actions: [
        {
          action: 'reply',
          title: lang === 'ne' ? 'जवाफ दिनुहोस्' : 'Reply',
          icon: '/icons/reply-24x24.png'
        }
      ]
    };

    return await this.sendNotification(subscription, payload);
  }

  // Send system maintenance notification
  async sendMaintenanceNotification(
    subscription: PushSubscriptionData,
    maintenanceTime: string,
    lang: 'ne' | 'en' = 'en'
  ): Promise<boolean> {
    const payload: NotificationPayload = {
      title: lang === 'ne' ? 'सिस्टम मर्मत' : 'System Maintenance',
      body: lang === 'ne' 
        ? `सिस्टम मर्मत ${maintenanceTime} मा हुनेछ` 
        : `System maintenance scheduled for ${maintenanceTime}`,
      icon: '/icons/maintenance-192x192.png',
      data: {
        type: 'maintenance',
        maintenanceTime
      }
    };

    return await this.sendNotification(subscription, payload);
  }

  // Send promotional notification
  async sendPromotionalNotification(
    subscription: PushSubscriptionData,
    offer: string,
    lang: 'ne' | 'en' = 'en'
  ): Promise<boolean> {
    const payload: NotificationPayload = {
      title: lang === 'ne' ? 'विशेष प्रस्ताव' : 'Special Offer',
      body: offer,
      icon: '/icons/offer-192x192.png',
      data: {
        type: 'promotional',
        url: '/offers'
      },
      actions: [
        {
          action: 'view_offer',
          title: lang === 'ne' ? 'प्रस्ताव हेर्नुहोस्' : 'View Offer',
          icon: '/icons/offer-24x24.png'
        }
      ]
    };

    return await this.sendNotification(subscription, payload);
  }

  // Validate subscription
  validateSubscription(subscription: any): subscription is PushSubscriptionData {
    return (
      subscription &&
      typeof subscription.endpoint === 'string' &&
      subscription.keys &&
      typeof subscription.keys.p256dh === 'string' &&
      typeof subscription.keys.auth === 'string'
    );
  }

  // Get VAPID public key for client
  getVapidPublicKey(): string {
    return this.vapidKeys.publicKey;
  }
}

// Singleton instance
export const pushNotificationService = new PushNotificationService();
