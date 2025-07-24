import { Pool } from 'pg'
import { hashPassword } from '../user/user.utils'
import { CreateModeratorInput } from './moderator.interface'

export async function insertModeratorWithUser(
  pool: Pool,
  data: CreateModeratorInput
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const hashedPassword = await hashPassword(data.password)

    const userResult = await client.query(
      `
      INSERT INTO users (name, email, phone, password, role, is_verified, nid_number, address, division, district, upazila)
      VALUES ($1, $2, $3, $4, 'MODERATOR', true, $5, $6, $7, $8, $9)
      RETURNING id, name, email, role
      `,
      [
        data.name || null,
        data.email,
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

    const moderatorResult = await client.query(
      `
      INSERT INTO moderators (user_id, assigned_region, can_verify_victims)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [user.id, data.assigned_region, data.can_verify_victims]
    )

    await client.query('COMMIT')

    return {
      user,
      moderator: moderatorResult.rows[0]
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
