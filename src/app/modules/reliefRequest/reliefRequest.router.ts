import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { createReliefRequest } from './reliefRequest.controller'

export default async function reliefRequestRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/reliefrequest' && req.method === 'POST') {
    await createReliefRequest(req, res, pool)
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ message: 'Relief route not found' }))
}
