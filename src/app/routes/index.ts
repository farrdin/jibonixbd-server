import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import userRouter from '../modules/user/user.router'
import volunteerRouter from '../modules/volunteer/volunteer.router'
import authRouter from '../modules/auth/auth.router'
import victimRouter from '../modules/victim/victim.router'
import adminRouter from '../modules/admin/admin.router'
import reliefRequestRouter from '../modules/reliefRequest/reliefRequest.router'
import inventoryRouter from '../modules/inventory/inventory.router'
import donorRouter from '../modules/donor/donor.router'
import moderatorRouter from '../modules/moderator/moderator.router'
import donationRouter from '../modules/donation/donation.router'
import disasterRouter from '../modules/disaster/disaster.router'

type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) => Promise<void>

const moduleRoutes: { path: string; route: RouteHandler }[] = [
  { path: '/auth', route: authRouter },
  { path: '/users', route: userRouter },
  { path: '/admin', route: adminRouter },
  { path: '/moderator', route: moderatorRouter },
  { path: '/volunteer', route: volunteerRouter },
  { path: '/donor', route: donorRouter },
  { path: '/victim', route: victimRouter },
  { path: '/disaster', route: disasterRouter },
  { path: '/inventory', route: inventoryRouter },
  { path: '/relief-request', route: reliefRequestRouter },
  { path: '/donation', route: donationRouter }
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
