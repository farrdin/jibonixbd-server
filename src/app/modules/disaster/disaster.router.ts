import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { handleCreateDisaster } from './disaster.controller'
import { authorizeRoles } from '../../middlewares/auth'

export default async function disasterRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/disaster' && req.method === 'POST') {
    return authorizeRoles(['ADMIN', 'VOLUNTEER'])(req, res, async () => {
      await handleCreateDisaster(req, res, pool)
    })
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'Disaster route not found' }))
}
