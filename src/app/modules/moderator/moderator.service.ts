import { Pool } from 'pg'
import { hashPassword } from '../user/user.utils'
import { CreateModeratorInput } from './moderator.interface'
import { notifyUser } from '../../../server'
import { pushNotification } from '../notification/notification.service'

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
      INSERT INTO users ( email, password, name, phone, photo, role, is_verified,
        nid_number, address, division, district, upazila)
      VALUES ($1, $2, $3, $4, $5, 'MODERATOR', true, $6, $7, $8, $9, $10)
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
    const canVerifyVictims =
      typeof data.can_verify_victims === 'boolean'
        ? data.can_verify_victims
        : false
    const moderatorResult = await client.query(
      `
      INSERT INTO moderators (user_id, assigned_region, can_verify_victims)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [user.id, data.assigned_region, canVerifyVictims]
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
export async function updateModeratorCanVerifyVictims(
  pool: Pool,
  userId: string,
  canVerify: boolean
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const result = await client.query(
      `UPDATE moderators SET can_verify_victims = $1 WHERE user_id = $2 RETURNING *`,
      [canVerify, userId]
    )

    const moderator = result.rows[0]
    if (!moderator) throw new Error('Moderator not found')
    await client.query(`UPDATE users SET is_verified = true WHERE id = $1`, [
      userId
    ])
    await pushNotification(
      pool,
      notifyUser,
      moderator.user_id,
      `You are now Verified`,
      'Verified',
      { victimId: moderator.id }
    )
    await client.query('COMMIT')
    return moderator
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
