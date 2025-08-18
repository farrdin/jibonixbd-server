import http from 'http'
import { Pool } from 'pg'
import config from './app/config'
import { handleRequest } from './app'
import { setupSocket } from './app/utils/notifier'

const pool = new Pool({ connectionString: config.postgres })

let server: http.Server

export let notifyUser: (userId: string, event: string, data: unknown) => void
export let notifyRole: (role: string, event: string, data: unknown) => void

async function main() {
  try {
    const client = await pool.connect()
    console.log('Connected to PostgreSQL database successfully!')
    client.release()

    server = http.createServer((req, res) => handleRequest(req, res, pool))

    const socketNotifiers = setupSocket(server, pool)
    notifyUser = socketNotifiers.notifyUser
    notifyRole = socketNotifiers.notifyRole

    server.listen(config.port, () => {
      console.log(`Jibonix server is running on ${config.port}`)
    })
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err)
    process.exit(1)
  }
}

main()

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  await pool.end()
  if (server) {
    server.close(() => process.exit(1))
  } else {
    process.exit(1)
  }
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})
