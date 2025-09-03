import { IncomingMessage, ServerResponse } from 'http';
import { Pool } from 'pg';
import { router } from './app/routes';
import { notFoundError } from './app/middlewares/notFoundError';
import { globalError } from './app/middlewares/globalError';
import config from './app/config';

//? Frontend URL
const allowedOrigins = config.allowed_origins;

// Set CORS Permission
function setCorsHeaders(req: IncomingMessage, res: ServerResponse) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
  }
}

export async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  try {
    setCorsHeaders(req, res);
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Check Connection
    if (req.url === '/' && req.method === 'GET') {
      return res.end(
        JSON.stringify({
          status: 'success',
          message: 'JIBONIX SERVER is running!',
        }),
      );
    }
    // API Router connection
    if (req.url && req.url.startsWith('/api')) {
      await router(req, res, pool);
      return;
    }
    // Not found handler
    notFoundError(req, res);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // Global Error Handler
    globalError(res, err);
  }
}
