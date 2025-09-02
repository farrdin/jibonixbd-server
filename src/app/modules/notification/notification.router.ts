import { IncomingMessage, ServerResponse } from 'http';
import { Pool } from 'pg';
import { listNotifications, markAsRead } from './notification.controller';

export default async function notificationRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  const url = req.url?.split('?')[0] || '';
  const method = req.method || '';

  if (url === '/api/notification' && method === 'GET') {
    await listNotifications(req, res, pool);
    return;
  }

  if (url.startsWith('/api/notification/') && method === 'PATCH') {
    await markAsRead(req, res, pool);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({ status: 'fail', message: 'Notification route not found' }),
  );
}
