/* eslint-disable @typescript-eslint/no-unused-vars */
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { signToken } from '../../utils/jwt';
import { ILoginUser } from './auth.interface';

export async function loginUser(pool: Pool, payload: ILoginUser) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [
      payload.email,
    ]);

    const user = result.rows[0];
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(payload.password, user.password);
    if (!isMatch) throw new Error('Wrong password');

    const token = signToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    // Remove Password from User Object
    const { password: userPassword, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  } finally {
    client.release();
  }
}
