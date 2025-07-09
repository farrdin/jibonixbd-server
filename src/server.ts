// server.ts
import http from 'http'
import pkg from 'pg'
import { handleRequest } from './app'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg
const PORT = 5000

// Initialize DB pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// Test DB connection
pool
  .connect()
  .then((client) => {
    console.log('Connected to PostgreSQL database successfully!')
    client.release()

    // Start server only after DB is connected
    const server = http.createServer((req, res) =>
      handleRequest(req, res, pool)
    )

    server.listen(PORT, () => {
      console.log(`Jibonix server is running on ${PORT}`)
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Closing PostgreSQL connection pool...')
      await pool.end()
      console.log('PostgreSQL connection pool closed.')
      process.exit(0)
    })
  })
  .catch((err) => {
    console.error('Error connecting to PostgreSQL:', err.stack)
    process.exit(1)
  })
