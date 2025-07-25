import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { handleCreateDisaster } from './disaster.controller'

export default async function disasterRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/disaster' && req.method === 'POST') {
    await handleCreateDisaster(req, res, pool)
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'Disaster route not found' }))
}
