// app/api/privacy/route.ts
// Data privacy and GDPR compliance endpoints

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { dataPrivacyService } from '@/lib/services/dataPrivacy';
import { securityService } from '@/lib/services/security';
import { logger } from '@/lib/services/logger';
import { rateLimitMiddlewares } from '@/lib/middleware/rateLimit';

export const runtime = 'nodejs';

/**
 * GET /api/privacy - Get privacy policy and user data summary
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const privacyPolicy = dataPrivacyService.getPrivacyPolicy();
    const retentionPolicy = dataPrivacyService.getRetentionPolicy();

    return NextResponse.json({
      privacyPolicy,
      retentionPolicy,
      userRights: [
        'Request data export',
        'Request data deletion',
        'Request data anonymization',
        'Opt-out of data collection',
      ],
    });
  } catch (error) {
    logger.error('Failed to get privacy information', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/privacy/export - Export user data
 */
export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || 
    Math.random().toString(36).substring(2, 15);

  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddlewares.api(req, async () => {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const { action } = await req.json();

      switch (action) {
        case 'export':
          const userData = await dataPrivacyService.exportUserData(session.user.id);
          
          logger.info('User data exported', {
            requestId,
            userId: session.user.id,
            dataSize: JSON.stringify(userData).length,
          });

          return NextResponse.json({
            success: true,
            data: userData,
            exportedAt: new Date().toISOString(),
          });

        case 'delete':
          const deleteResult = await dataPrivacyService.deleteUserData(session.user.id);
          
          if (deleteResult) {
            logger.info('User data deleted', {
              requestId,
              userId: session.user.id,
            });

            return NextResponse.json({
              success: true,
              message: 'Your data has been permanently deleted',
            });
          } else {
            return NextResponse.json(
              { error: 'Failed to delete user data' },
              { status: 500 }
            );
          }

        case 'anonymize':
          const anonymizeResult = await dataPrivacyService.anonymizeUserData(session.user.id);
          
          if (anonymizeResult) {
            logger.info('User data anonymized', {
              requestId,
              userId: session.user.id,
            });

            return NextResponse.json({
              success: true,
              message: 'Your data has been anonymized',
            });
          } else {
            return NextResponse.json(
              { error: 'Failed to anonymize user data' },
              { status: 500 }
            );
          }

        default:
          return NextResponse.json(
            { error: 'Invalid action. Supported actions: export, delete, anonymize' },
            { status: 400 }
          );
      }
    });

    return rateLimitResult;
  } catch (error) {
    logger.error('Privacy API error', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/privacy - Delete user data (alternative endpoint)
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Require confirmation
    const { confirm } = await req.json();
    if (confirm !== 'DELETE_MY_DATA') {
      return NextResponse.json(
        { error: 'Confirmation required. Send { "confirm": "DELETE_MY_DATA" }' },
        { status: 400 }
      );
    }

    const deleteResult = await dataPrivacyService.deleteUserData(session.user.id);
    
    if (deleteResult) {
      logger.info('User data deleted via DELETE endpoint', {
        userId: session.user.id,
      });

      return NextResponse.json({
        success: true,
        message: 'Your data has been permanently deleted',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete user data' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Failed to delete user data', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
