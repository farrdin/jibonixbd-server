import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { getAllUsersFromDB, insertUserIntoDB } from './user.service'
import { parseJsonBody, sendJson } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'

export async function getUsers(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const users = await getAllUsersFromDB(pool)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users GET successfully',
    data: users
  })
}

export async function createUser(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = await parseJsonBody(req)

    if (typeof body !== 'object' || body === null) {
      sendJson(res, 400, { status: 'fail', message: 'Invalid request body' })
      return
    }

    const requiredFields = [
      'name',
      'email',
      'photo',
      'phone',
      'password',
      'address',
      'division',
      'district',
      'upazila'
    ]
    const missing = requiredFields.find(
      (field) => !(body as Record<string, unknown>)[field]
    )

    if (missing) {
      sendJson(res, 400, { status: 'fail', message: `${missing} is required` })
      return
    }

    const newUser = await insertUserIntoDB(pool, body)
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'User created successfully',
      data: newUser
    })
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Server error',
      data: null
    })
  }
}
