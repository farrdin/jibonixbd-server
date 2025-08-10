import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import {
  handleCreateDisaster,
  handleDeleteDisaster,
  handleGetAllDisasters,
  handleGetDisasterById,
  handleUpdateDisaster
} from './disaster.controller'
import { authorizeRoles } from '../../middlewares/auth'
import { extractIdFromUrl } from '../../utils'

export default async function disasterRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''
  const method = req.method

  // Create Disaster
  if (url === '/api/disaster' && method === 'POST') {
    return authorizeRoles(['ADMIN', 'VOLUNTEER'])(req, res, async () => {
      await handleCreateDisaster(req, res, pool)
    })
  }

  // Get All Disasters
  if (url === '/api/disasters' && method === 'GET') {
    return handleGetAllDisasters(req, res, pool)
  }

  // Get Specific Disaster
  if (url.startsWith('/api/disasters/') && method === 'GET') {
    const id = extractIdFromUrl(url, '/api/disasters/')
    return handleGetDisasterById(req, res, pool, id)
  }

  // Update Disaster
  if (url.startsWith('/api/disasters/') && method === 'PATCH') {
    const id = extractIdFromUrl(url, '/api/disasters/')
    return authorizeRoles(['MODERATOR', 'ADMIN'])(req, res, async () => {
      await handleUpdateDisaster(req, res, pool, id)
    })
  }

  // Delete Disaster
  if (url.startsWith('/api/disasters/') && method === 'DELETE') {
    const id = extractIdFromUrl(url, '/api/disasters/')
    return authorizeRoles(['MODERATOR', 'ADMIN'])(req, res, async () => {
      await handleDeleteDisaster(req, res, pool, id)
    })
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'Disaster route not found' }))
}
