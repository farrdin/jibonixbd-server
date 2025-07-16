import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { getUsers, createUser } from './user.controller'
import { catchAsync } from '../../utils/catchAsync'

export default async function userRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/users' && req.method === 'GET') {
    await catchAsync(getUsers)(req, res, pool)
    return
  }

  if (url === '/api/users' && req.method === 'POST') {
    await catchAsync(createUser)(req, res, pool)
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'fail', message: 'User route not found' }))
}
