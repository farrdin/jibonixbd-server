import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import {
  getAllUsers,
  getUserById,
  updateUser,
  loggedInUser,
  deleteUser
} from './user.service'
import { parseJsonBody } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import { User, UserRole } from './user.interface'
import { getAuthUser, getUserFromCookie } from '../../middlewares/auth'

export async function handleGetAllUsers(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const users = await getAllUsers(pool)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users GET successfully',
    data: users
  })
}

export async function handleGetUserById(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  userId: string
) {
  try {
    const user = await getUserById(pool, userId)
    if (!user) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'User not found',
        data: null
      })
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User retrieved successfully',
      data: user
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

export async function handleLoggedInUser(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const my = getUserFromCookie(req) || getAuthUser(req)
    if (!my || !my.email) {
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: 'Unauthorized',
        data: null
      })
      return
    }
    const profile = await pool.query(`SELECT id FROM users WHERE id = $1`, [
      my.id
    ])
    const userId = profile.rows[0]?.id

    const myProfile = await loggedInUser(pool, userId)
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User profile retrieved successfully',
      data: myProfile
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

export async function handleUpdateUser(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  userId: string
) {
  try {
    const body = await parseJsonBody(req)
    const updatedUser = await updateUser(pool, userId, body as Partial<User>)

    if (!updatedUser) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'User not found',
        data: null
      })
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User updated successfully',
      data: updatedUser
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

export async function handleUpdateUserRole(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  userId: string,
  role: string
) {
  try {
    const updatedUser = await updateUser(pool, userId, {
      role: role as UserRole
    })
    if (!updatedUser) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'User not found',
        data: null
      })
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User role updated successfully',
      data: updatedUser
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

export async function handleDeleteUser(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  userId: string
) {
  try {
    const user = await getUserById(pool, userId)
    if (!user) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'User not found',
        data: null
      })
    }
    await deleteUser(pool, userId)
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'User deleted successfully',
      data: null
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
