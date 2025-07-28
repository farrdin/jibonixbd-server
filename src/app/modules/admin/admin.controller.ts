import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody, sendJson } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import { insertAdminWithUser } from './admin.service'
import { CreateAdminInput } from './admin.interface'

export async function createAdmin(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = (await parseJsonBody(req)) as Partial<CreateAdminInput>
    if (
      !body ||
      typeof body !== 'object' ||
      typeof body.email !== 'string' ||
      typeof body.password !== 'string'
    ) {
      sendJson(res, 400, {
        status: 'failed',
        message: 'Email and password are required and must be strings'
      })
      return
    }

    const newAdmin = await insertAdminWithUser(pool, body as CreateAdminInput)

    const { user, admin } = newAdmin

    // Merge user and admin data into one object
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Admin registered successfully',
      data: {
        id: admin.id,
        name: user.name,
        email: user.email,
        role: user.role,
        can_export_data: user.can_export_data,
        created_at: admin.created_at,
        updated_at: admin.updated_at
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
