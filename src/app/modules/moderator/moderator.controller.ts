import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import { insertModeratorWithUser } from './moderator.service'
import { CreateModeratorInput } from './moderator.interface'
import { createModeratorValidationSchema } from './moderator.validation'

export async function createModerator(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = await parseJsonBody(req)
    const parsed = createModeratorValidationSchema.safeParse(body)
    if (!parsed.success) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Validation error',
        data: parsed.error.flatten().fieldErrors
      })
      return
    }
    const moderatorData = parsed.data as CreateModeratorInput
    const newModerator = await insertModeratorWithUser(pool, moderatorData)
    const { user, moderator } = newModerator

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Moderator created successfully',
      data: {
        id: moderator.id,
        name: user.name,
        email: user.email,
        role: user.role,
        assigned_region: moderator.assigned_region,
        can_verify_victims: moderator.can_verify_victims,
        created_at: moderator.created_at,
        updated_at: moderator.updated_at
      }
    })
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Internal Server Error',
      data: null
    })
  }
}
