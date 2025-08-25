/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server as HttpServer } from 'http'
import { Server as IOServer } from 'socket.io'
import { verifyToken } from '../utils/jwt'
import { Pool } from 'pg'
import { AuthTokenPayload } from '../types/global'
import config from '../config'

let io: IOServer

export function setupSocket(server: HttpServer, pool: Pool) {
  io = new IOServer(server, {
    cors: {
      origin: config.frontend_url,
      credentials: true
    }
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string
    if (!token) return next(new Error('Authentication error'))
    try {
      const payload = verifyToken(token) as AuthTokenPayload
      ;(socket as any).user = payload
      return next()
    } catch (err) {
      return next(new Error(String(err)))
    }
  })

  io.on('connection', (socket) => {
    const user: AuthTokenPayload = (socket as any).user
    // join private and role rooms
    socket.join(`user:${user.id}`)
    socket.join(`role:${user.role}`)

    socket.emit('connected', { message: 'Socket connected', user })

    socket.on('disconnect', () => {
      // cleanup if needed
    })
  })

  return {
    notifyUser: (userId: string, event: string, data: unknown) => {
      io.to(`user:${userId}`).emit(event, data)
    },
    notifyRole: (role: string, event: string, data: unknown) => {
      io.to(`role:${role}`).emit(event, data)
    }
  }
}
