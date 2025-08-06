import { Pool } from 'pg'
import { User } from './user.interface'
import { hashPassword } from './user.utils'

export async function getAllUsersFromDB(pool: Pool): Promise<User[]> {
  const result = await pool.query('SELECT * FROM users')
  return result.rows
}
export async function insertUserIntoDB(
  pool: Pool,
  user: Partial<User>
): Promise<User> {
  const hashedPassword = await hashPassword(user.password!)
  const result = await pool.query(
    `
    INSERT INTO users
    (name, email,  phone, photo, password, role, is_verified, nid_number, address, division, district, upazila)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *
    `,
    [
      user.name,
      user?.email?.toLocaleLowerCase(),
      user.phone,
      user.photo,
      hashedPassword,
      user.role || 'VICTIM',
      user.is_verified ?? false,
      user.nid_number || null,
      user.address,
      user.division,
      user.district,
      user.upazila
    ]
  )
  return result.rows[0]
}
