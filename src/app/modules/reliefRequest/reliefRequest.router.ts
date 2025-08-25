import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import {
  handleCreateReliefRequest,
  handleGetAllReliefRequests,
  handleGetReliefRequestById,
  handleGetMyReliefRequests,
  handleUpdateReliefRequest,
  handleDeleteReliefRequest,
  handleAssignReliefRequest
} from './reliefRequest.controller'
import { authorizeRoles } from '../../middlewares/auth'

export default async function reliefRequestRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/relief-request' && req.method === 'POST') {
    return authorizeRoles(['VICTIM'])(req, res, async () => {
      await handleCreateReliefRequest(req, res, pool)
    })
  }
  if (url === '/api/relief-request' && req.method === 'GET') {
    return authorizeRoles(['MODERATOR', 'ADMIN'])(req, res, async () => {
      await handleGetAllReliefRequests(req, res, pool)
    })
  }
  if (url.startsWith('/api/relief-request/my') && req.method === 'GET') {
    return authorizeRoles(['VICTIM'])(req, res, async () => {
      await handleGetMyReliefRequests(req, res, pool)
    })
  }
  if (url.startsWith('/api/relief-request/') && req.method === 'GET') {
    return authorizeRoles(['VICTIM', 'VOLUNTEER'])(req, res, async () => {
      await handleGetReliefRequestById(req, res, pool)
    })
  }
  if (url.startsWith('/api/relief-request/') && req.method === 'PUT') {
    return authorizeRoles(['MODERATOR', 'ADMIN'])(req, res, async () => {
      await handleUpdateReliefRequest(req, res, pool)
    })
  }
  if (url.startsWith('/api/relief-request/') && req.method === 'DELETE') {
    return authorizeRoles(['MODERATOR', 'ADMIN'])(req, res, async () => {
      await handleDeleteReliefRequest(req, res, pool)
    })
  }
  if (url.match('api/relief-request/[^/]+/assign') && req.method === 'PATCH') {
    return authorizeRoles(['MODERATOR', 'ADMIN'])(req, res, async () => {
      await handleAssignReliefRequest(req, res, pool)
    })
  }

  res.writeHead(404)
  res.end(JSON.stringify({ message: 'Relief route not found' }))
}
