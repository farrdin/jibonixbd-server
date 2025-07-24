import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import { insertModeratorWithUser } from './moderator.service'
import { CreateModeratorInput } from './moderator.interface'

export async function createModerator(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = (await parseJsonBody(req)) as Partial<CreateModeratorInput>

    if (
      !body.email ||
      !body.password ||
      typeof body.email !== 'string' ||
      typeof body.password !== 'string'
    ) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Email and password are required',
        data: null
      })
      return
    }

    const newModerator = await insertModeratorWithUser(
      pool,
      body as CreateModeratorInput
    )

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
