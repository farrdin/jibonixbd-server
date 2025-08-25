import { Pool } from 'pg'
import { CreateDonationInput } from './donation.interface'
import { orderUtils } from './donation.utils'

export async function createDonation(
  pool: Pool,
  data: CreateDonationInput,
  client_ip: string
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const result = await pool.query(
      `
    INSERT INTO donations (
      donor_id, disaster_id, type, amount, quantity,
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
    const donation = result.rows[0]

    let payment = null
    if (data.type === 'MONEY' && donation.amount) {
      // Build ShurjoPay payload
      const shurjopayPayload = {
        prefix: process.env.SP_PREFIX!,
        token: '',
        return_url: process.env.SP_RETURN_URL!,
        cancel_url: process.env.SP_RETURN_URL!,
        store_id: process.env.SP_USERNAME!,
        amount: donation.amount,
        order_id: donation.id.toString(),
        currency: 'BDT',
        customer_name: 'Anonymous Donor',
        customer_address: 'Dhaka',
        customer_email: 'donor@example.com',
        customer_phone: '01700000000',
        customer_city: 'Dhaka',
        customer_post_code: '1212',
        client_ip
      }

      // Call ShurjoPay SDK
      payment = await orderUtils.makePaymentAsync(shurjopayPayload)

      if (payment?.transactionStatus) {
        await client.query(
          `
          UPDATE donations
          SET transaction_id = $1,
              transaction_status = $2
          WHERE id = $3
          `,
          [payment.sp_order_id, payment.transactionStatus, donation.id]
        )
      }
    }

    await client.query('COMMIT')
    return { donation, payment }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function verifyDonationPayment(pool: Pool, order_id: string) {
  const verifiedPayment = await orderUtils.verifyPaymentAsync(order_id)

  if (verifiedPayment.length) {
    const v = verifiedPayment[0]

    await pool.query(
      `
      UPDATE donations
      SET transaction_status = $1,
          transaction_method = $2,
          bank_status = $3,
          sp_code = $4,
          sp_message = $5,
          transaction_date = $6
      WHERE transaction_id = $7
      `,
      [
        v.transaction_status,
        v.method,
        v.bank_status,
        v.sp_code,
        v.sp_message,
        v.date_time,
        order_id
      ]
    )
  }

  return verifiedPayment
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
