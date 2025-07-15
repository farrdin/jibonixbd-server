// app/routes/index.ts
import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import userRouter from '../modules/user/user.router'

type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) => Promise<void>

const moduleRoutes: { path: string; route: RouteHandler }[] = [
  { path: '/users', route: userRouter }
]

export async function router(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const url = req.url?.split('?')[0] || ''

  for (const { path, route } of moduleRoutes) {
    if (url.startsWith(`/api${path}`)) {
      await route(req, res, pool)
      return
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'failed', message: 'Route not found' }))
}
