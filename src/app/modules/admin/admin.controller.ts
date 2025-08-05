import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody, sendJson } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import { insertAdminWithUser } from './admin.service'
import { CreateAdminInput } from './admin.interface'
import { createAdminValidationSchema } from './admin.validation'

export async function createAdmin(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = await parseJsonBody(req)
    const parsed = createAdminValidationSchema.safeParse(body)

    if (!parsed.success) {
      return sendJson(res, 400, {
        status: 'fail',
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors
      })
    }
    const validatedData: CreateAdminInput = parsed.data
    const newAdmin = await insertAdminWithUser(pool, validatedData)

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
        can_export_data: user.can_export_data || true,
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
