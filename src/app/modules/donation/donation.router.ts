import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import {
  handleCreateDonation,
  handleGetAllDonations,
  handleGetMyDonations,
  handleGetDonationsByDisasterId,
  handleGetSingleDonation,
  handleUpdateDonationStatus,
  handleDeleteDonation
} from './donation.controller'
import { authorizeRoles } from '../../middlewares/auth'
import { notifyUser } from '../../../server'

export default async function donationRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const method = req.method || ''
  const url = req.url?.split('?')[0] || ''

  // POST Create Donation
  if (url === '/api/donation' && method === 'POST') {
    return authorizeRoles(['DONOR'])(req, res, async () => {
      await handleCreateDonation(req, res, pool, notifyUser)
    })
  }

  // GET All Donations
  if (url === '/api/donation' && method === 'GET') {
    return authorizeRoles(['ADMIN', 'VOLUNTEER', 'MODERATOR'])(
      req,
      res,
      async () => {
        await handleGetAllDonations(req, res, pool)
      }
    )
  }

  // GET My Donations
  if (url === '/api/donation/me' && method === 'GET') {
    return authorizeRoles(['DONOR'])(req, res, async () => {
      await handleGetMyDonations(req, res, pool)
    })
  }

  // GET Donations by Disaster ID
  if (url.startsWith('/api/donation/disaster/') && method === 'GET') {
    return authorizeRoles(['ADMIN', 'VOLUNTEER', 'MODERATOR'])(
      req,
      res,
      async () => {
        await handleGetDonationsByDisasterId(req, res, pool)
      }
    )
  }

  // GET Single Donation
  if (url.startsWith('/api/donation/') && method === 'GET') {
    return authorizeRoles(['ADMIN', 'VOLUNTEER', 'MODERATOR', 'DONOR'])(
      req,
      res,
      async () => {
        await handleGetSingleDonation(req, res, pool)
      }
    )
  }

  // Update Donation Status
  if (url.startsWith('/api/donation/') && method === 'PUT') {
    return authorizeRoles(['ADMIN', 'VOLUNTEER', 'MODERATOR'])(
      req,
      res,
      async () => {
        await handleUpdateDonationStatus(req, res, pool)
      }
    )
  }

  // DELETE Specific Donation
  if (url.startsWith('/api/donation/') && method === 'DELETE') {
    return authorizeRoles(['ADMIN', 'VOLUNTEER', 'MODERATOR'])(
      req,
      res,
      async () => {
        await handleDeleteDonation(req, res, pool)
      }
    )
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'Donation route not found' }))
}
