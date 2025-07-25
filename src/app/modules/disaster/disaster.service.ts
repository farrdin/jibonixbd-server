import { Pool } from 'pg'
import { CreateDisasterInput } from './disaster.interface'

export async function createDisaster(pool: Pool, data: CreateDisasterInput) {
  const result = await pool.query(
    `
    INSERT INTO disasters (
      volunteer_ids, type, image, location, affected_number,
      start_date, end_date, severity
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
    `,
    [
      data.volunteer_ids,
      data.type,
      data.image,
      data.location,
      data.affected_number,
      data.start_date,
      data.end_date,
      data.severity
    ]
  )

  return result.rows[0]
}
