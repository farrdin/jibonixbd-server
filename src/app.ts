import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { router } from './app/routes'
import { notFoundError } from './app/middlewares/notFoundError'
import { globalError } from './app/middlewares/globalError'
import config from './app/config'

const allowedOrigins = [config.frontend_url]

function setCorsHeaders(req: IncomingMessage, res: ServerResponse) {
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    )
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
}

export async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    setCorsHeaders(req, res)

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    if (req.url === '/' && req.method === 'GET') {
      return res.end(
        JSON.stringify({
          status: 'success',
          message: 'JIBONIX SERVER is running!'
        })
      )
    }

    if (req.url && req.url.startsWith('/api')) {
      await router(req, res, pool)
      return
    }

    notFoundError(req, res)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    globalError(res, err)
  }
}
