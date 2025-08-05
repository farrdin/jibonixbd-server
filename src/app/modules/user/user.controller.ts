import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { getAllUsersFromDB, insertUserIntoDB } from './user.service'
import { parseJsonBody } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import { createUserSchema } from './user.validation'

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

    const parsed = createUserSchema.safeParse(body)

    if (!parsed.success) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Validation error',
        data: parsed.error.flatten().fieldErrors
      })
    }

    const newUser = await insertUserIntoDB(pool, parsed.data)
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
