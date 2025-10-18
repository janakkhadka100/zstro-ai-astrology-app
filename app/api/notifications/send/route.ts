// app/api/notifications/send/route.ts
// Send notifications endpoint (admin/internal use)

import { NextRequest, NextResponse } from 'next/server';
import { pushNotificationService } from '@/lib/notifications/push-service';
import { createSecurityMiddleware, secureResponse } from '@/lib/security/middleware';
import { z } from 'zod';

const SendNotificationSchema = z.object({
  type: z.enum(['analysis_ready', 'new_message', 'maintenance', 'promotional', 'custom']),
  userId: z.string().optional(),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  icon: z.string().url().optional(),
  data: z.record(z.any()).optional(),
  language: z.enum(['ne', 'en']).optional().default('en')
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Apply security middleware with custom config for admin
    const securityMiddleware = createSecurityMiddleware({
      rateLimit: { 
        action: 'api.export', // Use export rate limit for admin operations
        customConfig: { windowMs: 60 * 1000, maxRequests: 10 } // 10 requests per minute
      },
      validation: {
        schema: SendNotificationSchema,
        body: true
      }
    });
    
    const securityResponse = await securityMiddleware(req);
    if (securityResponse.status !== 200) {
      return securityResponse;
    }

    // Check if notifications feature is enabled
    if (!process.env.FF_NOTIFICATIONS || process.env.FF_NOTIFICATIONS !== '1') {
      return NextResponse.json(
        { success: false, error: 'Notifications feature is disabled' },
        { status: 403 }
      );
    }

    // In a real implementation, you would:
    // 1. Verify admin permissions
    // 2. Get user subscriptions from database
    // 3. Send to specific users or broadcast
    
    const body = await req.json();
    const { type, userId, title, body: messageBody, icon, data, language } = body;

    // Mock subscription data - in real app, fetch from database
    const mockSubscriptions = [
      {
        endpoint: 'https://fcm.googleapis.com/fcm/send/mock-endpoint-1',
        keys: {
          p256dh: 'mock-p256dh-key-1',
          auth: 'mock-auth-key-1'
        }
      },
      {
        endpoint: 'https://fcm.googleapis.com/fcm/send/mock-endpoint-2',
        keys: {
          p256dh: 'mock-p256dh-key-2',
          auth: 'mock-auth-key-2'
        }
      }
    ];

    let payload;
    
    // Create appropriate payload based on type
    switch (type) {
      case 'analysis_ready':
        payload = {
          title,
          body: messageBody,
          icon: icon || '/icons/astrology-192x192.png',
          data: {
            type: 'analysis_ready',
            ...data
          }
        };
        break;
        
      case 'new_message':
        payload = {
          title,
          body: messageBody,
          icon: icon || '/icons/message-192x192.png',
          data: {
            type: 'new_message',
            ...data
          }
        };
        break;
        
      case 'maintenance':
        payload = {
          title,
          body: messageBody,
          icon: icon || '/icons/maintenance-192x192.png',
          data: {
            type: 'maintenance',
            ...data
          }
        };
        break;
        
      case 'promotional':
        payload = {
          title,
          body: messageBody,
          icon: icon || '/icons/offer-192x192.png',
          data: {
            type: 'promotional',
            ...data
          }
        };
        break;
        
      default:
        payload = {
          title,
          body: messageBody,
          icon: icon || '/icons/notification-192x192.png',
          data: {
            type: 'custom',
            ...data
          }
        };
    }

    // Send notifications
    const result = await pushNotificationService.sendBulkNotification(
      mockSubscriptions,
      payload
    );

    const response = {
      success: true,
      message: 'Notifications sent successfully',
      stats: {
        sent: result.sent,
        failed: result.failed,
        total: result.sent + result.failed
      }
    };

    const responseObj = NextResponse.json(response, { status: 200 });
    return secureResponse(responseObj, {
      cache: 'no-cache'
    });

  } catch (error) {
    console.error('Send notification error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
