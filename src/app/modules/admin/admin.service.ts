import { Pool } from 'pg'
import { hashPassword } from '../user/user.utils'
import { CreateAdminInput } from './admin.interface'

export async function insertAdminWithUser(pool: Pool, data: CreateAdminInput) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const hashedPassword = await hashPassword(data.password)

    const userResult = await client.query(
      `
      INSERT INTO users (
        name, email, phone, password, role, is_verified,
        nid_number, address, division, district, upazila
      )
      VALUES ($1, $2, $3, $4, 'ADMIN', false, $5, $6, $7, $8, $9)
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

    const adminResult = await client.query(
      `
      INSERT INTO admins (user_id, can_export_data)
      VALUES ($1, $2)
      RETURNING *
      `,
      [user.id, data.can_export_data]
    )

    await client.query('COMMIT')

    return {
      user,
      admin: adminResult.rows[0]
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
