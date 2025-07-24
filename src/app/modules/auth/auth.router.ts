import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { handleLogin } from './auth.controller'

export default async function authRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/auth/login' && req.method === 'POST') {
    await handleLogin(req, res, pool)
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ message: 'Auth route not found' }))
}
