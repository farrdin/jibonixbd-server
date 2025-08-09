import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { handleLogin, handleRegister, verifyOtp } from './auth.controller'

export default async function authRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  if (url === '/api/auth/signup' && req.method === 'POST') {
    return await handleRegister(req, res, pool)
  }
  if (url === '/api/auth/verify-otp' && req.method === 'POST') {
    return await verifyOtp(req, res, pool)
  }
  if (url === '/api/auth/login' && req.method === 'POST') {
    await handleLogin(req, res, pool)
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ message: 'Auth route not found' }))
}
