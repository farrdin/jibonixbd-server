import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { createInventory } from './inventory.controller'

export default async function inventoryRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/inventory' && req.method === 'POST') {
    await createInventory(req, res, pool)
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ message: 'Inventory route not found' }))
}
