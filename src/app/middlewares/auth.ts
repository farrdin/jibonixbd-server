import { IncomingMessage, ServerResponse } from 'http';
import { verifyToken } from '../utils/jwt';
import { AuthTokenPayload } from '../types/global';
import { sendResponse } from '../utils/sendResponse';
import { parse } from 'cookie';

// Get User From Authorization Header
export function getAuthUser(req: IncomingMessage): AuthTokenPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

// Get User from Cookie
export function getUserFromCookie(
  req: IncomingMessage,
): AuthTokenPayload | null {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    try {
      const cookies = parse(cookieHeader);
      const token = cookies['token'];
      if (token) {
        return verifyToken(token);
      }
    } catch {
      return null;
    }
  }
  return null;
}

// authorizeRoles user middleware
export function authorizeRoles(allowedRoles: string[]) {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => Promise<void>,
  ) => {
    const user = getUserFromCookie(req) || getAuthUser(req);

    if (!user || !allowedRoles.includes(user.role)) {
      sendResponse(res, {
        statusCode: 403,
        success: false,
        message: 'You Are Not Authorized',
        data: null,
      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = user;

    await next();
  };
}
