import { Request, Response, NextFunction } from 'express';
import { verifyToken, createClerkClient } from '@clerk/backend';
import { config } from '../config/env.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userName?: string;
  isDemo?: boolean;
}

const clerkClient = config.clerkSecretKey ? createClerkClient({ secretKey: config.clerkSecretKey }) : null;

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'Authentication token required. Please sign in.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === 'null' || token === 'undefined') {
      res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Bearer token is empty or invalid. Please sign in.',
      });
      return;
    }

    // 1. Check if token is explicitly a Demo Session token
    if (token.startsWith('demo_session_') || token.startsWith('demo_user_') || token.startsWith('demo_')) {
      req.userId = token;
      req.userEmail = (req.headers['x-user-email'] as string) || 'demo@devforge.ai';
      req.userName = (req.headers['x-user-name'] as string) || 'Demo Developer';
      req.isDemo = true;
      return next();
    }

    // 2. Real Clerk Token Verification
    if (config.clerkSecretKey) {
      try {
        const decoded = await verifyToken(token, { secretKey: config.clerkSecretKey });
        if (decoded && decoded.sub) {
          req.userId = decoded.sub; // Scoped real Clerk User ID
          req.isDemo = false;
          if (clerkClient) {
            try {
              const user = await clerkClient.users.getUser(decoded.sub);
              req.userEmail = user.emailAddresses[0]?.emailAddress || req.userEmail || 'user@devforge.ai';
              req.userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || req.userName || 'DevForge Engineer';
            } catch {
              // Ignore metadata fetch error, session sub is verified
            }
          }
          return next();
        }
      } catch (verifyErr: any) {
        console.warn(`[Clerk Verification Notice] Token validation failed: ${verifyErr?.message}`);
        res.status(401).json({
          success: false,
          code: 'CLERK_AUTH_FAILED',
          message: 'Your Clerk authentication session expired or is invalid. Please sign in again.',
        });
        return;
      }
    }

    // 3. Fallback for test/local environment when token is a raw Clerk User ID (e.g. user_...)
    if (token.startsWith('user_')) {
      req.userId = token;
      req.userEmail = (req.headers['x-user-email'] as string) || 'engineer@devforge.ai';
      req.userName = (req.headers['x-user-name'] as string) || 'DevForge Engineer';
      req.isDemo = false;
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

