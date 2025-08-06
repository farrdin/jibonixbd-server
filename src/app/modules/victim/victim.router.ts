import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { catchAsync } from '../../utils/catchAsync'
import { createVictim } from './victim.controller'

export default async function victimRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/victim/create-victim' && req.method === 'POST') {
    await catchAsync(createVictim)(req, res, pool)
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'fail', message: 'Victim route not found' }))
}
