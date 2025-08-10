import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { createVolunteer } from './volunteer.controller'
import { catchAsync } from '../../utils/catchAsync'

export default async function volunteerRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/volunteer/create-volunteer' && req.method === 'POST') {
    await catchAsync(createVolunteer)(req, res, pool)
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(
    JSON.stringify({ status: 'fail', message: 'Volunteer route not found' })
  )
}
