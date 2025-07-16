import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { globalError } from '../middlewares/globalError'

type RawHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) => Promise<void>

export function catchAsync(handler: RawHandler) {
  return async (req: IncomingMessage, res: ServerResponse, pool: Pool) => {
    try {
      await handler(req, res, pool)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const statusCode = err?.statusCode || 500
      globalError(res, err, statusCode)
    }
  }
}
