import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import { CreateVictimInput } from './victim.interface'
import { insertVictimWithUser } from './victim.service'
import { createVictimValidationSchema } from './victim.validation'

export async function createVictim(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = await parseJsonBody(req)
    const parsed = createVictimValidationSchema.safeParse(body)
    if (!parsed.success) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Validation error',
        data: parsed.error.flatten().fieldErrors
      })
      return
    }
    const validData = parsed.data as CreateVictimInput
    const newVictim = await insertVictimWithUser(pool, validData)
    const { user, victim } = newVictim

    // Merge user and victim data into one object
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Victim registered successfully',
      data: {
        id: victim.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: victim.location,
        is_verified: victim.is_verified,
        total_requests_made: victim.total_requests_made,
        created_at: victim.created_at,
        updated_at: victim.updated_at
      }
    })
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Server Error',
      data: null
    })
  }
}
