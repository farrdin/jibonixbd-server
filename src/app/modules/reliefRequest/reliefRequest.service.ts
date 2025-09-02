import { Pool } from 'pg';
import { CreateReliefRequestInput } from './reliefRequest.interface';
import { pushNotification } from '../notification/notification.service';

export async function createReliefRequest(
  pool: Pool,
  data: CreateReliefRequestInput,
) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
      INSERT INTO relief_requests (victim_id, requested_items, location, status, assigned_volunteer_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [
        data.victim_id,
        data.requested_items,
        data.location,
        data.status || 'PENDING',
        data.assigned_volunteer_id || null,
      ],
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}
export async function getAllReliefRequests(pool: Pool) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM relief_requests');
    return result.rows;
  } finally {
    client.release();
  }
}
export async function getMyReliefRequests(pool: Pool, victimId: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM relief_requests WHERE victim_id = $1',
      [victimId],
    );
    return result.rows;
  } finally {
    client.release();
  }
}
export async function getReliefRequestById(pool: Pool, id: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM relief_requests WHERE id = $1',
      [id],
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}
export async function updateReliefRequest(
  pool: Pool,
  id: string,
  data: Partial<CreateReliefRequestInput>,
) {
  const client = await pool.connect();
  try {
    const fields = Object.keys(data)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    const values = Object.values(data);

    const result = await client.query(
      `UPDATE relief_requests SET ${fields} WHERE id = $${values.length + 1} RETURNING *;`,
      [...values, id],
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}
export async function deleteReliefRequest(pool: Pool, id: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM relief_requests WHERE id = $1 RETURNING *',
      [id],
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}
export async function assignReliefToVolunteer(
  pool: Pool,
  reliefRequestId: string,
  volunteerUserId: string,
  victimId: string,
  notifyUser: (userId: string, event: string, data: unknown) => void,
) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
  UPDATE relief_requests
  SET assigned_volunteer_id = $1, status = 'APPROVED'
  WHERE id = $2
  RETURNING *;
  `,
      [volunteerUserId, reliefRequestId],
    );

    // If no rows are updated, throw an error
    if (result.rowCount === 0) {
      throw new Error('Relief request not found or could not be updated');
    }

    const volunteerUserRes = await client.query(
      `SELECT user_id FROM volunteers WHERE id = $1`,
      [volunteerUserId], // GET volunteer USER Table ID
    );
    const resolvedVolunteerUserId = volunteerUserRes.rows[0]?.user_id;
    if (!resolvedVolunteerUserId) {
      throw new Error('Volunteer not found');
    }

    const victimUserRes = await client.query(
      `SELECT user_id FROM victims WHERE id = $1`,
      [victimId], // GET victim USER Table ID
    );
    const resolvedVictimUserId = victimUserRes.rows[0]?.user_id;
    if (!resolvedVictimUserId) {
      throw new Error('Victim not found');
    }

    // Notify the volunteer about the assignment
    await pushNotification(
      pool,
      notifyUser,
      resolvedVolunteerUserId,
      'RELIEF_ASSIGNED',
      'VOLUNTEER',
      {
        reliefRequestId,
        victimId,
        message: 'A new relief request has been assigned to you',
      },
    );
    // Notify the victim that a volunteer has been dispatched
    await pushNotification(
      pool,
      notifyUser,
      resolvedVictimUserId,
      'VOLUNTEER_DISPATCHED',
      'VICTIM',
      {
        reliefRequestId,
        message: 'A volunteer has been dispatched to help you',
      },
    );
    // Return the updated relief request
    return result.rows[0];
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}
