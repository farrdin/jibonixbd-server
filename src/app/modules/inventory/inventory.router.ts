import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import {
  handlecreateInventory,
  handleDeleteInventory,
  handleGetAllInventory,
  handleGetInventoryById,
  handleUpdateInventory
} from './inventory.controller'
import { authorizeRoles } from '../../middlewares/auth'

export default async function inventoryRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/inventory' && req.method === 'POST') {
    return authorizeRoles(['ADMIN', 'MODERATOR'])(req, res, async () => {
      await handlecreateInventory(req, res, pool)
    })
  }
  if (url === '/api/inventory' && req.method === 'GET') {
    return authorizeRoles(['ADMIN', 'MODERATOR'])(req, res, async () => {
      await handleGetAllInventory(req, res, pool)
    })
  }
  if (url.startsWith('/api/inventory/') && req.method === 'GET') {
    return authorizeRoles(['ADMIN', 'MODERATOR'])(req, res, async () => {
      await handleGetInventoryById(req, res, pool)
    })
  }
  if (url.startsWith('/api/inventory/') && req.method === 'PUT') {
    return authorizeRoles(['ADMIN', 'MODERATOR'])(req, res, async () => {
      await handleUpdateInventory(req, res, pool)
    })
  }
  if (url.startsWith('/api/inventory/') && req.method === 'DELETE') {
    return authorizeRoles(['ADMIN', 'MODERATOR'])(req, res, async () => {
      await handleDeleteInventory(req, res, pool)
    })
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'Inventory route not found' }))
}
