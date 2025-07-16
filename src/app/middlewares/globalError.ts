import { ServerResponse } from 'http'
import { sendJson } from '../utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function globalError(res: ServerResponse, err: any, statusCode = 500) {
  console.error('🔥 Global Error:', err)
  sendJson(res, statusCode, {
    success: false,
    message: 'Internal Server Error',
    statusCode,
    error: err,
    stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined
  })
}
