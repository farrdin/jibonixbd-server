import { ServerResponse } from 'http'
import { sendJson } from '../utils'
import AppError from '../errors/appError'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function globalError(res: ServerResponse, err: any, statusCode = 500) {
  console.error('🔥 Global Error:', err)

  if (err instanceof AppError) {
    sendJson(res, err.statusCode, {
      success: false,
      message: err.message,
      statusCode: err.statusCode,
      error: err,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
  } else {
    sendJson(res, statusCode, {
      success: false,
      message: 'Internal Server Error',
      statusCode,
      error: err,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
  }
}
