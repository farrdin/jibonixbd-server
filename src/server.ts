import http from 'http';
import { Pool } from 'pg';
import config from './app/config';
import { handleRequest } from './app';
import { setupSocket } from './app/utils/notifier';

// Database Connection
const pool = new Pool({ connectionString: config.postgres });

// HTTP Server
let server: http.Server;

// SocketIo Notifiers
export let notifyUser: (userId: string, event: string, data: unknown) => void;
export let notifyRole: (role: string, event: string, data: unknown) => void;

// Main function
async function main() {
  try {
    // Connect to the database
    const client = await pool.connect();
    client.release();

    // Create Http Server
    server = http.createServer((req, res) => handleRequest(req, res, pool));

    // Setup Socket.io
    const socketNotifiers = setupSocket(server, pool);
    notifyUser = socketNotifiers.notifyUser;
    notifyRole = socketNotifiers.notifyRole;

    // Start server
    server.listen(config.port, () => {
      console.log(`Jibonix server is running on ${config.port}`);
    });
  } catch (err) {
    // Handle Connection Errors
    console.error('Error connecting to PostgreSQL:', err);
    process.exit(1);
  }
}

main();

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await pool.end();
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
