import { Pool } from 'pg'
import { hashPassword } from '../user/user.utils'
import { CreateDonorInput } from './donor.interface'

export async function insertDonorWithUser(pool: Pool, data: CreateDonorInput) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const hashedPassword = await hashPassword(data.password)

    const userResult = await client.query(
      `
      INSERT INTO users (name, email, photo, phone, password, role, is_verified, nid_number, address, division, district, upazila)
      VALUES ($1, $2, $3, $4, $5, 'DONOR', false, $6, $7, $8, $9, $10)
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

    const donorResult = await client.query(
      `
      INSERT INTO donors (user_id, organization_name, donation_history)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [user.id, data.organization_name || null, data.donation_history]
    )

    await client.query('COMMIT')

    return {
      user,
      donor: donorResult.rows[0]
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
