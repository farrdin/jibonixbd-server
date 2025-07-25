import { Pool } from 'pg'
import { CreateReliefRequestInput } from './reliefRequest.interface'

export async function insertReliefRequest(
  pool: Pool,
  data: CreateReliefRequestInput
) {
  const client = await pool.connect()
  try {
    const result = await client.query(
      `
      INSERT INTO relief_requests (victim_id, requested_items, location, status, assigned_volunteer_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [
        data.victim_id,
        data.requested_items,
        data.location,
        data.status || 'PENDING',
        data.assigned_volunteer_id || 'not assigned'
      ]
    )
    return result.rows[0]
  } finally {
    client.release()
  }
}
