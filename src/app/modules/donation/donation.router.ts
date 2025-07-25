import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { handleCreateDonation } from './donation.controller'

export default async function donationRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/donation' && req.method === 'POST') {
    await handleCreateDonation(req, res, pool)
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'Donation route not found' }))
}
