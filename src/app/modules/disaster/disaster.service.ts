import { Pool } from 'pg';
import { CreateDisasterInput } from './disaster.interface';
import fs from 'fs';
import config from '../../config';

export async function createDisaster(
  pool: Pool,
  data: CreateDisasterInput,
  filePath?: string,
) {
  if (filePath) {
    const uploaded = await config.cloudinary.uploader.upload(filePath, {
      folder: 'disasters',
    });
    data.image = uploaded.secure_url;
    fs.unlinkSync(filePath);
  }
  const result = await pool.query(
    `
    INSERT INTO disasters (
      volunteer_id, type, image, location, affected_number,
      start_date, end_date, severity
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
    `,
    [
      data.volunteer_id || null,
      data.type,
      data.image,
      data.location,
      data.affected_number,
      data.start_date,
      data.end_date,
      data.severity,
    ],
  );
  return result.rows[0];
}

export async function getAllDisasters(pool: Pool) {
  const result = await pool.query(
    `SELECT * FROM disasters ORDER BY created_at DESC`,
  );
  return result.rows;
}

export async function getDisasterById(pool: Pool, id: string) {
  const result = await pool.query(`SELECT * FROM disasters WHERE id = $1`, [
    id,
  ]);
  return result.rows[0];
}

export async function updateDisaster(
  pool: Pool,
  id: string,
  data: Partial<CreateDisasterInput>,
  filePath?: string,
) {
  if (filePath) {
    const uploaded = await config.cloudinary.uploader.upload(filePath, {
      folder: 'disasters',
    });
    data.image = uploaded.secure_url;
    fs.unlinkSync(filePath);
  }

  const fields = Object.keys(data);
  const values = Object.values(data);
  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ');

  const result = await pool.query(
    `UPDATE disasters SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, id],
  );

  return result.rows[0];
}

export async function deleteDisaster(pool: Pool, id: string) {
  const result = await pool.query(
    `DELETE FROM disasters WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
}
