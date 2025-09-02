import { IncomingMessage, ServerResponse } from 'http';
import { Pool } from 'pg';
import userRouter from '../modules/user/user.router';
import authRouter from '../modules/auth/auth.router';
import reliefRequestRouter from '../modules/reliefRequest/reliefRequest.router';
import inventoryRouter from '../modules/inventory/inventory.router';
import donationRouter from '../modules/donation/donation.router';
import disasterRouter from '../modules/disaster/disaster.router';
import notificationRouter from '../modules/notification/notification.router';

// Route Handler Type
type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) => Promise<void>;

// ALL Module Routes Here
const moduleRoutes: { path: string; route: RouteHandler }[] = [
  { path: '/auth', route: authRouter },
  { path: '/users', route: userRouter },
  { path: '/disaster', route: disasterRouter },
  { path: '/inventory', route: inventoryRouter },
  { path: '/relief-request', route: reliefRequestRouter },
  { path: '/donation', route: donationRouter },
  { path: '/notification', route: notificationRouter },
];

// Main Router Function
export async function router(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  // extract the URL path
  const url = req.url?.split('?')[0] || '';

  // check for matched routes
  for (const { path, route } of moduleRoutes) {
    if (url.startsWith(`/api${path}`)) {
      await route(req, res, pool);
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'failed', message: 'Route not found' }));
}
