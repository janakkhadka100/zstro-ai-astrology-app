// app/api/notifications/subscribe/route.ts
// Web Push subscription endpoint

import { NextRequest, NextResponse } from 'next/server';
import { pushNotificationService } from '@/lib/notifications/push-service';
import { createSecurityMiddleware, SECURITY_CONFIGS, secureResponse } from '@/lib/security/middleware';
import { z } from 'zod';

const SubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  }),
  userAgent: z.string().optional(),
  language: z.enum(['ne', 'en']).optional().default('en')
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Apply security middleware
    const securityMiddleware = createSecurityMiddleware({
      rateLimit: { action: 'user.chat' }, // Reuse chat rate limit
      validation: {
        schema: SubscriptionSchema,
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

    const body = await req.json();
    const { endpoint, keys, userAgent, language } = body;

    // Validate subscription
    if (!pushNotificationService.validateSubscription({ endpoint, keys })) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Get user ID from authentication
    // 2. Store subscription in database
    // 3. Associate with user account
    
    const userId = 'test-user-123'; // TODO: Get from auth session
    const subscriptionData = {
      userId,
      endpoint,
      keys,
      userAgent: userAgent || req.headers.get('user-agent') || 'unknown',
      language: language || 'en',
      subscribedAt: new Date().toISOString(),
      isActive: true
    };

    // TODO: Store in database
    console.log('Subscription stored:', subscriptionData);

    // Send welcome notification
    const welcomePayload = {
      title: language === 'ne' ? 'स्वागत छ!' : 'Welcome!',
      body: language === 'ne' 
        ? 'ज्योतिष सल्लाहको लागि सदस्यता लिइएको छ' 
        : 'You are now subscribed to astrology notifications',
      icon: '/icons/welcome-192x192.png',
      data: {
        type: 'welcome',
        url: '/'
      }
    };

    await pushNotificationService.sendNotification(
      { endpoint, keys },
      welcomePayload
    );

    const response = {
      success: true,
      message: 'Subscription successful',
      vapidPublicKey: pushNotificationService.getVapidPublicKey()
    };

    const responseObj = NextResponse.json(response, { status: 201 });
    return secureResponse(responseObj, {
      cache: 'no-cache'
    });

  } catch (error) {
    console.error('Subscription error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe to notifications' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Get user ID from authentication
    // 2. Remove subscription from database
    
    const userId = 'test-user-123'; // TODO: Get from auth session
    
    // TODO: Remove from database
    console.log('Subscription removed for user:', userId, 'endpoint:', endpoint);

    const response = {
      success: true,
      message: 'Unsubscribed successfully'
    };

    const responseObj = NextResponse.json(response, { status: 200 });
    return secureResponse(responseObj, {
      cache: 'no-cache'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
