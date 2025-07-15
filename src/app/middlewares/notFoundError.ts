import { IncomingMessage, ServerResponse } from 'http'
import { sendJson } from '../utils'

export function notFoundError(req: IncomingMessage, res: ServerResponse) {
  sendJson(res, 404, {
    success: false,
    message: 'API Not Found!',
    error: ''
  })
}
