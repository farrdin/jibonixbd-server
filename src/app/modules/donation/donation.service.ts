import { Pool } from 'pg'
import { CreateDonationInput } from './donation.interface'

export async function createDonation(pool: Pool, data: CreateDonationInput) {
  const result = await pool.query(
    `
    INSERT INTO donations (
      donor_id, type, amount, quantity,
      donation_date, delivery, status, transaction_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
    `,
    [
      data.donor_id,
      data.type,
      data.amount ?? null,
      data.quantity ?? null,
      data.donation_date,
      data.delivery,
      data.status,
      data.transaction_id ?? null
    ]
  )

  return result.rows[0]
}
