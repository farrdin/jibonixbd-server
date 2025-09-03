/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { Pool } from 'pg';
import { AuthTokenPayload } from '../types/global';
import config from '../config';

// Socket.IO Server Instance
let io: IOServer;

// Socket.io Server Setup
export function setupSocket(server: HttpServer, pool: Pool) {
  const allowedOrigins = (config.allowed_origins ?? []).filter(
    (origin): origin is string => typeof origin === 'string',
  );
  // Init Socket.io
  io = new IOServer(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // Socket.io Auth Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string;
    if (!token) return next(new Error('Authentication error'));
    try {
      const payload = verifyToken(token) as AuthTokenPayload;
      (socket as any).user = payload;
      return next();
    } catch (err) {
      return next(new Error(String(err)));
    }
  });

  // Socket.io Connection Handler
  io.on('connection', (socket) => {
    const user: AuthTokenPayload = (socket as any).user;
    // join private and role rooms
    // user wise room
    socket.join(`user:${user.id}`);
    // role wise room
    socket.join(`role:${user.role}`);

    // emit connection event
    socket.emit('connected', { message: 'Socket connected', user });

    // handle socket.io Disconnection
    socket.on('disconnect', () => {
      // cleanup if needed
    });
  });

  return {
    // Notification functions
    notifyUser: (userId: string, event: string, data: unknown) => {
      io.to(`user:${userId}`).emit(event, data);
    },
    notifyRole: (role: string, event: string, data: unknown) => {
      io.to(`role:${role}`).emit(event, data);
    },
  };
}
