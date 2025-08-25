import { Pool } from 'pg'
import { hashPassword } from '../user/user.utils'
import { CreateVictimInput } from './victim.interface'
import { notifyUser } from '../../../server'
import { pushNotification } from '../notification/notification.service'

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
      INSERT INTO users (email, password, name, phone, photo, role, is_verified,
        nid_number, address, division, district, upazila)
      VALUES ($1, $2, $3, $4, $5, 'VICTIM', true, $6, $7, $8, $9, $10)
      RETURNING id, name, email, role
      `,
      [
        data.email.toLocaleLowerCase(),
        hashedPassword,
        data.name,
        data.phone,
        data.photo || null,
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
        data.location,
        data.is_verified || false,
        data.total_requests_made || '0'
      ]
    )

    const moderators = await pool.query(
      `SELECT id FROM users WHERE role IN ('MODERATOR', 'ADMIN')`
    )
    for (const mod of moderators.rows) {
      await pushNotification(
        pool,
        notifyUser,
        mod.id,
        'NEW_VICTIM_REGISTERED',
        'user',
        {
          victimId: victimResult.rows[0].id,
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      )
    }

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

export async function updateVerifyVictim(pool: Pool, userId: string) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const result = await client.query(
      `
      UPDATE victims
      SET is_verified = true
      WHERE user_id = $1
      RETURNING *
      `,
      [userId]
    )

    const victim = result.rows[0]

    if (victim) {
      await pushNotification(
        pool,
        notifyUser,
        victim.user_id,
        `You are now Verified`,
        'Verified',
        { victimId: victim.id }
      )
    }

    await client.query('COMMIT')
    return victim
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
