import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { catchAsync } from '../../utils/catchAsync'
import { createAdmin } from './admin.controller'

export default async function adminRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/admin/create-admin' && req.method === 'POST') {
    await catchAsync(createAdmin)(req, res, pool)
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'fail', message: 'Admin route not found' }))
}
