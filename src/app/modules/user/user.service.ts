import { Pool } from 'pg'
import { User } from './user.interface'

export async function getAllUsers(pool: Pool): Promise<User[]> {
  const result = await pool.query('SELECT * FROM users')
  return result.rows
}
export async function getUserById(
  pool: Pool,
  id: string
): Promise<User | null> {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
  return result.rows[0] || null
}
export async function loggedInUser(pool: Pool, id: string) {
  const result = await pool.query(
    `SELECT * FROM users WHERE id = $1 ORDER BY created_at DESC`,
    [id]
  )
  return result.rows[0] || null
}
export async function updateUser(
  pool: Pool,
  id: string,
  userData: Partial<User>
): Promise<User | null> {
  const fields = Object.keys(userData)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ')

  const values = Object.values(userData)

  const result = await pool.query(
    `UPDATE users SET ${fields} WHERE id = $${values.length + 1} RETURNING *`,
    [...values, id]
  )

  return result.rows[0] || null
}
export async function updateUserRole(
  pool: Pool,
  id: string,
  role: string
): Promise<User | null> {
  const result = await pool.query(
    'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
    [role, id]
  )
  return result.rows[0] || null
}
export async function deleteUser(pool: Pool, id: string): Promise<void> {
  await pool.query('DELETE FROM users WHERE id = $1', [id])
}
