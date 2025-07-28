import { Pool } from 'pg'
import { hashPassword } from '../user/user.utils'
import { CreateVolunteerInput } from './volunteer.interface'

export async function insertVolunteerWithUser(
  pool: Pool,
  data: CreateVolunteerInput
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const hashedPassword = await hashPassword(data.password)

    // Insert into users table
    const userResult = await client.query(
      `
      INSERT INTO users (name, email, photo, phone, password, role, is_verified, nid_number, address, division, district, upazila)
      VALUES ($1, $2, $3, $4, $5, 'VOLUNTEER', false, $6, $7, $8, $9, $10)
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

    // Insert into volunteers table
    const volunteerResult = await client.query(
      `
      INSERT INTO volunteers (user_id, skills, preferred_locations, status, availability_time)
      VALUES ($1, $2, $3, 'PENDING', $4)
      RETURNING *
      `,
      [
        user.id,
        data.skills || [],
        data.preferred_locations || null,
        data.availability_time || null
      ]
    )

    await client.query('COMMIT')

    return {
      user,
      volunteer: volunteerResult.rows[0]
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
