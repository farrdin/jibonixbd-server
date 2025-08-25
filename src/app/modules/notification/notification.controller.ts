// notification.controller.ts
import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { getAuthUser, getUserFromCookie } from '../../middlewares/auth'
import { sendResponse } from '../../utils/sendResponse'

// List notifications
export async function listNotifications(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const user = getAuthUser(req) || getUserFromCookie(req)
  if (!user)
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: 'Not authorized',
      data: null
    })

  const { unread } = (() => {
    const url = req.url || ''
    const params = new URLSearchParams(url.split('?')[1] || '')
    return { unread: params.get('unread') === 'true' }
  })()

  try {
    const query = `
      SELECT id, type, category, payload, is_read::boolean as is_read, created_at
      FROM notifications
      WHERE user_id = $1
      ${unread ? 'AND is_read = false' : ''}
      ORDER BY created_at DESC
      LIMIT 100
    `
    const result = await pool.query(query, [user.id])

    const notifications = result.rows.map((n) => ({
      ...n,
      payload: typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload
    }))

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Notifications fetched',
      data: notifications
    })
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Internal server error',
      data: null
    })
  }
}

// Mark notification as read
export async function markAsRead(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const user = getAuthUser(req) || getUserFromCookie(req)
  if (!user)
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: 'Not authorized',
      data: null
    })

  const parts = req.url?.split('/') || []
  const id = parts[parts.length - 1]

  try {
    const fetchRes = await pool.query(
      `SELECT is_read FROM notifications WHERE id = $1 AND user_id = $2`,
      [id, user.id]
    )
    if (fetchRes.rowCount === 0)
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Notification not found',
        data: null
      })

    const is_read = fetchRes.rows[0].is_read
    if (is_read)
      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Already read',
        data: null
      })

    await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
      [id, user.id]
    )
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Marked as read',
      data: null
    })
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Internal server error',
      data: null
    })
  }
}
