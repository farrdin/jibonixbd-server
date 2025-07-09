import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'

export const handleRequest = async (
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) => {
  res.setHeader('Content-Type', 'application/json')

  if (req.url === '/users' && req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM users')
      res.writeHead(200)
      res.end(JSON.stringify(result.rows))
    } catch (err) {
      console.error('Error executing query', err)
      res.writeHead(500)
      res.end(JSON.stringify({ error: 'Database query failed' }))
    }
  } else {
    res.writeHead(404)
    res.end(JSON.stringify({ message: 'Route not found' }))
  }
}
