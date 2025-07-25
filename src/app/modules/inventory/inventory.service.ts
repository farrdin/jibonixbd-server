import { Pool } from 'pg'
import { CreateInventoryInput } from './inventory.interface'

export async function insertInventory(pool: Pool, data: CreateInventoryInput) {
  const client = await pool.connect()
  try {
    const result = await client.query(
      `
      INSERT INTO inventories (donation_id, item_name, quantity, amount, expiry_date, warehouse_location)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [
        data.donation_id,
        data.item_name,
        data.quantity ?? null,
        data.amount ?? null,
        data.expiry_date ?? null,
        data.warehouse_location ?? null
      ]
    )
    return result.rows[0]
  } finally {
    client.release()
  }
}
