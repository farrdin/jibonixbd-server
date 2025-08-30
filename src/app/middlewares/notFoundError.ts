import { IncomingMessage, ServerResponse } from 'http';
import { sendJson } from '../utils';

export function notFoundError(req: IncomingMessage, res: ServerResponse) {
  sendJson(res, 404, {
    success: false,
    message: 'This is not a valid route',
    error: '',
  });
}
