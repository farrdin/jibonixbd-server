import { Pool } from 'pg'
import { CreateInventoryInput } from './inventory.interface'

export async function createInventory(pool: Pool, data: CreateInventoryInput) {
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

export async function getInventoryById(pool: Pool, id: string) {
  const client = await pool.connect()
  try {
    const result = await client.query(
      'SELECT * FROM inventories WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

export async function getAllInventory(pool: Pool) {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT * FROM inventories')
    return result.rows
  } finally {
    client.release()
  }
}

export async function updateInventory(
  pool: Pool,
  id: string,
  data: Partial<CreateInventoryInput>
) {
  const client = await pool.connect()
  try {
    const fields = Object.keys(data)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ')
    const values = Object.values(data)

    const result = await client.query(
      `UPDATE inventories SET ${fields} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    )
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

export async function deleteInventory(pool: Pool, id: string) {
  const client = await pool.connect()
  try {
    const result = await client.query(
      'DELETE FROM inventories WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0] || null
  } finally {
    client.release()
  }
}
