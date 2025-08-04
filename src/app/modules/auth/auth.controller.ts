import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { loginUser } from './auth.service'
import { parseJsonBody, sendJson } from '../../utils'
import { AuthValidation } from './auth.validation'

export async function handleLogin(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = await parseJsonBody(req)
    const parsed = AuthValidation.loginValidationSchema.safeParse(body)

    if (!parsed.success) {
      return sendJson(res, 400, {
        status: 'fail',
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors
      })
    }

    const { email, password } = parsed.data
    const lowerEmail = email.toLowerCase()
    const { token, user } = await loginUser(pool, {
      email: lowerEmail,
      password
    })

    sendJson(res, 200, {
      status: 'Success',
      message: 'Login successful',
      token,
      user
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendJson(res, 401, { error: error.message || 'Invalid credentials' })
    } else {
      sendJson(res, 401, { error: 'Invalid credentials' })
    }
  }
}
