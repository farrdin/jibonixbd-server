import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { createModerator } from './moderator.controller'

export default async function moderatorRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/moderator' && req.method === 'POST') {
    await createModerator(req, res, pool)
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'Moderator route not found' }))
}
