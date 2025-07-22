/* eslint-disable @typescript-eslint/no-unused-vars */
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { signToken } from '../../utils/jwt'

export async function loginUser(pool: Pool, email: string, password: string) {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [
      email
    ])

    const user = result.rows[0]
    if (!user) throw new Error('Invalid credentials')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new Error('Invalid credentials')

    const token = signToken({ id: user.id, role: user.role })

    const { password: userPassword, ...userWithoutPassword } = user

    return { token, user: userWithoutPassword }
  } finally {
    client.release()
  }
}
