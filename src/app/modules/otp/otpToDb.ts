import { Pool } from 'pg'

export default async function otpToDb(
  pool: Pool,
  phoneOrEmail: string,
  otp: string,
  verificationMethod: 'phone' | 'email',
  role: string,
  role_data: object
) {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await pool.query(
    `INSERT INTO otp_verifications ( phone_or_email, otp, expires_at, role_data)
    VALUES ($1, $2, $3, $4)`,
    [phoneOrEmail, otp, expiresAt, role_data]
  )
}
