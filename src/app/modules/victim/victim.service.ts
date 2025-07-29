import { Pool } from 'pg'
import { hashPassword } from '../user/user.utils'
import { CreateVictimInput } from './victim.interface'

export async function insertVictimWithUser(
  pool: Pool,
  data: CreateVictimInput
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const hashedPassword = await hashPassword(data.password)

    // Insert into users table
    const userResult = await client.query(
      `
      INSERT INTO users (name, email, photo, phone, password, role, is_verified, nid_number, address, division, district, upazila)
      VALUES ($1, $2, $3, $4, $5, 'VICTIM', false, $6, $7, $8, $9, $10)
      RETURNING id, name, email, role
      `,
      [
        data.name || null,
        data.email,
        data.photo || null,
        data.phone || null,
        hashedPassword,
        data.nid_number || null,
        data.address || null,
        data.division || null,
        data.district || null,
        data.upazila || null
      ]
    )

    const user = userResult.rows[0]

    // Insert into victims table
    const victimResult = await client.query(
      `
      INSERT INTO victims (user_id, location, is_verified, total_requests_made)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        user.id,
        data.location || null,
        data.is_verified || null,
        data.total_requests_made || null
      ]
    )

    await client.query('COMMIT')

    return {
      user,
      victim: victimResult.rows[0]
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
