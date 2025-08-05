import { Pool } from 'pg'
import { CreateDonationInput } from './donation.interface'

export async function createDonation(pool: Pool, data: CreateDonationInput) {
  const result = await pool.query(
    `
    INSERT INTO donations (
      donor_id,disaster_id, type, amount, quantity,
      donation_date, delivery, status, transaction_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
    `,
    [
      data.donor_id,
      data.disaster_id,
      data.type,
      data.amount ?? null,
      data.quantity ?? null,
      data.donation_date,
      data.delivery,
      data.status || 'PENDING',
      data.transaction_id ?? null
    ]
  )

  return result.rows[0]
}

export async function getAllDonations(pool: Pool) {
  const result = await pool.query(
    `
    SELECT * FROM donations
    ORDER BY created_at DESC
    `
  )

  return result.rows
}

export async function getDonationsByDisasterId(pool: Pool, disasterId: string) {
  const result = await pool.query(
    `
    SELECT * FROM donations WHERE disaster_id = $1
    `,
    [disasterId]
  )

  return result.rows
}

export async function getSingleDonation(pool: Pool, donationId: string) {
  const result = await pool.query(
    `
    SELECT * FROM donations WHERE id = $1
    `,
    [donationId]
  )

  return result.rows[0]
}

export async function updateDonationStatus(
  pool: Pool,
  donationId: string,
  status: string
) {
  const result = await pool.query(
    `
    UPDATE donations SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
    `,
    [status, donationId]
  )

  return result.rows[0]
}

export async function deleteDonation(pool: Pool, donationId: string) {
  const result = await pool.query(
    `
    DELETE FROM donations WHERE id = $1
    RETURNING *
    `,
    [donationId]
  )

  return result.rows[0]
}

export async function getMyDonations(pool: Pool, donorId: string) {
  const result = await pool.query(
    `SELECT * FROM donations WHERE donor_id = $1 ORDER BY donation_date DESC`,
    [donorId]
  )
  return result.rows
}
