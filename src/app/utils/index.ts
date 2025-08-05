/* eslint-disable @typescript-eslint/no-unused-vars */
import { ServerResponse } from 'http'
import { IncomingMessage } from 'http'

export function sendJson(
  res: ServerResponse,
  statusCode: number,
  data: unknown
) {
  const json = JSON.stringify(data)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json)
  })
  res.end(json)
}

export function parseJsonBody<T = unknown>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk.toString()))
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (err) {
        reject(new Error('Invalid JSON'))
      }
    })
  })
}
