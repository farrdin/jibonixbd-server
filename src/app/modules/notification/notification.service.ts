import { Pool } from 'pg'

export async function pushNotification(
  pool: Pool,
  notifyUser: (
    userId: string,
    event: string,
    data: Record<string, unknown>
  ) => void,
  userId: string,
  type: string,
  category: string,
  payload: Record<string, unknown>
) {
  // Insert notification and get its DB id
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, category, payload)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [userId, type, category, payload]
  )

  const dbNotification = result.rows[0]

  // Emit realtime notification including DB id
  notifyUser(userId, type, {
    id: dbNotification.id, // <-- important!
    type,
    category,
    payload,
    created_at: new Date().toISOString()
  })
}
