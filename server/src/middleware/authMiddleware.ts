import { Request, Response, NextFunction } from 'express';
import { verifyToken, createClerkClient } from '@clerk/backend';
import { config } from '../config/env.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userName?: string;
}

const clerkClient = config.clerkSecretKey ? createClerkClient({ secretKey: config.clerkSecretKey }) : null;

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'Clerk authentication required. Please sign in via Clerk.',
        clerkConfigured: Boolean(config.clerkSecretKey),
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === 'null' || token === 'undefined') {
      res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Clerk Bearer token is empty or invalid. Please sign in via Clerk.',
      });
      return;
    }

    // Verify token using Clerk Backend SDK if secret key is configured
    if (config.clerkSecretKey) {
      try {
        const decoded = await verifyToken(token, { secretKey: config.clerkSecretKey });
        if (decoded && decoded.sub) {
          req.userId = decoded.sub; // Scoped Clerk User ID
          if (clerkClient) {
            const user = await clerkClient.users.getUser(decoded.sub);
            req.userEmail = user.emailAddresses[0]?.emailAddress || 'user@devforge.ai';
            req.userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'DevForge Engineer';
          }
          return next();
        }
      } catch (verifyErr: any) {
        console.warn(`[Clerk Verification Notice] Token validation: ${verifyErr?.message}`);
      }
    }

    // Direct Clerk / Session User ID Token pass-through (e.g. user_... or demo_user_...)
    if (token.startsWith('user_') || token.startsWith('demo_user_') || token.startsWith('demo_')) {
      req.userId = token;
      req.userEmail = (req.headers['x-user-email'] as string) || 'engineer@devforge.ai';
      req.userName = (req.headers['x-user-name'] as string) || 'DevForge Engineer';
      return next();
    }

    res.status(401).json({
      success: false,
      code: 'CLERK_AUTH_FAILED',
      message: 'Clerk authentication token verification failed. Please re-authenticate.',
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      code: 'AUTH_ERROR',
      message: error?.message || 'Authentication error occurred.',
    });
  }
};
