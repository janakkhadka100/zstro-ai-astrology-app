// app/api/notifications/vapid-key/route.ts
// VAPID public key endpoint

import { NextResponse } from 'next/server';
import { pushNotificationService } from '@/lib/notifications/push-service';
import { secureResponse } from '@/lib/security/middleware';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const publicKey = pushNotificationService.getVapidPublicKey();
    
    if (!publicKey) {
      return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 500 }
      );
    }

    const response = {
      publicKey
    };

    const responseObj = NextResponse.json(response, { status: 200 });
    return secureResponse(responseObj, {
      cache: 'public-short'
    });

  } catch (error) {
    console.error('VAPID key error:', error);
    
    return NextResponse.json(
      { error: 'Failed to get VAPID key' },
      { status: 500 }
    );
  }
}
