import { Pool } from 'pg'
import { CreateReliefRequestInput } from './reliefRequest.interface'

export async function createReliefRequest(
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
        data.assigned_volunteer_id || null
      ]
    )
    return result.rows[0]
  } finally {
    client.release()
  }
}
export async function getAllReliefRequests(pool: Pool) {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT * FROM relief_requests')
    return result.rows
  } finally {
    client.release()
  }
}
export async function getMyReliefRequests(pool: Pool, victimId: string) {
  const client = await pool.connect()
  try {
    const result = await client.query(
      'SELECT * FROM relief_requests WHERE victim_id = $1',
      [victimId]
    )
    return result.rows
  } finally {
    client.release()
  }
}
export async function getReliefRequestById(pool: Pool, id: string) {
  const client = await pool.connect()
  try {
    const result = await client.query(
      'SELECT * FROM relief_requests WHERE id = $1',
      [id]
    )
    return result.rows[0]
  } finally {
    client.release()
  }
}
export async function updateReliefRequest(
  pool: Pool,
  id: string,
  data: Partial<CreateReliefRequestInput>
) {
  const client = await pool.connect()
  try {
    const fields = Object.keys(data)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ')
    const values = Object.values(data)

    const result = await client.query(
      `UPDATE relief_requests SET ${fields} WHERE id = $${values.length + 1} RETURNING *;`,
      [...values, id]
    )
    return result.rows[0]
  } finally {
    client.release()
  }
}
export async function deleteReliefRequest(pool: Pool, id: string) {
  const client = await pool.connect()
  try {
    const result = await client.query(
      'DELETE FROM relief_requests WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0]
  } finally {
    client.release()
  }
}
