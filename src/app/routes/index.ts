import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import userRouter from '../modules/user/user.router'
import volunteerRouter from '../modules/volunteer/volunteer.routes'
import authRouter from '../modules/auth/auth.router'
import victimRouter from '../modules/victim/victim.routes'
import adminRouter from '../modules/admin/admin.router'

type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) => Promise<void>

const moduleRoutes: { path: string; route: RouteHandler }[] = [
  { path: '/auth', route: authRouter },
  { path: '/users', route: userRouter },
  { path: '/volunteer', route: volunteerRouter },
  { path: '/victim', route: victimRouter },
  { path: '/admin', route: adminRouter }
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
