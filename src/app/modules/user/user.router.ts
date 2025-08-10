import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import {
  handleGetAllUsers,
  handleUpdateUser,
  handleGetUserById,
  handleDeleteUser,
  handleLoggedInUser,
  handleUpdateUserRole
} from './user.controller'
import { catchAsync } from '../../utils/catchAsync'
import { authorizeRoles } from '../../middlewares/auth'
import { parseJsonBody } from '../../utils'
import { UserRole } from './user.interface'

export default async function userRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  // get all users
  if (url === '/api/users' && req.method === 'GET') {
    return authorizeRoles(['ADMIN'])(req, res, async () => {
      await catchAsync(handleGetAllUsers)(req, res, pool)
      return
    })
  }
  // get My Profile
  if (url === '/api/users/me' && req.method === 'GET') {
    return await catchAsync(handleLoggedInUser)(req, res, pool)
  }
  // get user by ID
  if (url.startsWith('/api/users/') && req.method === 'GET') {
    const userId = url.split('/')[3]
    return authorizeRoles(['ADMIN'])(req, res, async () => {
      await catchAsync((req, res, pool) =>
        handleGetUserById(req, res, pool, userId)
      )(req, res, pool)
      return
    })
  }

  // update user role
  if (url.startsWith('/api/users/role/') && req.method === 'PATCH') {
    const userId = url.split('/')[4]
    const body = (await parseJsonBody(req)) as { role?: string }
    const role = body.role

    return authorizeRoles(['ADMIN'])(req, res, async () => {
      await catchAsync((req, res, pool) =>
        handleUpdateUserRole(req, res, pool, userId, role as UserRole)
      )(req, res, pool)
      return
    })
  }

  // update user
  if (url.startsWith('/api/users/') && req.method === 'PATCH') {
    const userId = url.split('/')[3]
    return authorizeRoles(['ADMIN'])(req, res, async () => {
      await catchAsync((req, res, pool) =>
        handleUpdateUser(req, res, pool, userId)
      )(req, res, pool)
      return
    })
  }

  // delete user
  if (url.startsWith('/api/users/') && req.method === 'DELETE') {
    const userId = url.split('/')[3]
    return authorizeRoles(['ADMIN'])(req, res, async () => {
      await catchAsync((req, res, pool) =>
        handleDeleteUser(req, res, pool, userId)
      )(req, res, pool)
      return
    })
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'fail', message: 'User route not found' }))
}
