import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { createDonor } from './donor.controller'

export default async function donorRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/donor' && req.method === 'POST') {
    await createDonor(req, res, pool)
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'Donor route not found' }))
}
