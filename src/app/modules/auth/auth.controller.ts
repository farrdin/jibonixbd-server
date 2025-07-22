import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { loginUser } from './auth.service'
import { parseJsonBody, sendJson } from '../../utils'

export async function handleLogin(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = await parseJsonBody(req)
    const { email, password } = body as { email?: string; password?: string }

    if (!email || !password) {
      sendJson(res, 400, { message: 'Email and password required' })
      return
    }

    const { token, user } = await loginUser(pool, email, password)

    sendJson(res, 200, { token, user })
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendJson(res, 401, { error: error.message || 'Invalid credentials' })
    } else {
      sendJson(res, 401, { error: 'Invalid credentials' })
    }
  }
}
