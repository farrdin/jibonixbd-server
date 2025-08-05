import { IncomingMessage, ServerResponse } from 'http'
import { verifyToken } from '../utils/jwt'
import { AuthTokenPayload } from '../types/global'
import { sendResponse } from '../utils/sendResponse'

export function getAuthUser(req: IncomingMessage): AuthTokenPayload | null {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  const token = authHeader.split(' ')[1]

  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

export function authorizeRoles(allowedRoles: string[]) {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => Promise<void>
  ) => {
    const user = getAuthUser(req)

    if (!user || !allowedRoles.includes(user.role)) {
      sendResponse(res, {
        statusCode: 403,
        success: false,
        message: 'You Are Not Authorized',
        data: null
      })
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(req as any).user = user

    await next()
  }
}
