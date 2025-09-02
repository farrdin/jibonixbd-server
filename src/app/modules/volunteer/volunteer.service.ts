import { Pool } from 'pg';
import { hashPassword } from '../user/user.utils';
import { CreateVolunteerInput } from './volunteer.interface';
import { pushNotification } from '../notification/notification.service';
import { notifyUser } from '../../../server';

export async function insertVolunteerWithUser(
  pool: Pool,
  data: CreateVolunteerInput,
) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const hashedPassword = await hashPassword(data.password);

    // Insert into users table
    const userResult = await client.query(
      `
      INSERT INTO users (email, password, name, phone, photo, role, is_verified,
        nid_number, address, division, district, upazila)
      VALUES ($1, $2, $3, $4, $5, 'VOLUNTEER', true, $6, $7, $8, $9, $10)
      RETURNING id, name, email, role
      `,
      [
        data.email.toLocaleLowerCase(),
        hashedPassword,
        data.name,
        data.phone,
        data.photo || null,
        data.nid_number || null,
        data.address || null,
        data.division || null,
        data.district || null,
        data.upazila || null,
      ],
    );

    const user = userResult.rows[0];

    // Insert into volunteers table
    const volunteerResult = await client.query(
      `
      INSERT INTO volunteers (user_id, skills, preferred_locations, status, availability_time)
      VALUES ($1, $2, $3, 'PENDING', $4)
      RETURNING *
      `,
      [
        user.id,
        data.skills,
        data.preferred_locations,
        data.availability_time || null,
      ],
    );
    const admins = await pool.query(`SELECT id FROM users WHERE role='ADMIN'`);
    for (const admin of admins.rows) {
      await pushNotification(
        pool,
        notifyUser,
        admin.id,
        'NEW_VOLUNTEER_REGISTERED',
        'user',
        {
          volunteerId: volunteerResult.rows[0].id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: 'PENDING',
        },
      );
    }

    await client.query('COMMIT');

    return {
      user,
      volunteer: volunteerResult.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateVolunteerStatus(
  pool: Pool,
  userId: string,
  status: 'APPROVED' | 'REJECTED',
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE volunteers SET status = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *`,
      [status, userId],
    );

    if (result.rows.length === 0) throw new Error('Volunteer NOT Found');
    const volunteer = result.rows[0];

    await pushNotification(
      pool,
      notifyUser,
      volunteer.user_id,
      `VOLUNTEER ${status}`,
      'APPROVAL',
      {
        userId: volunteer.user_id,
        status,
      },
    );
    await client.query('COMMIT');
    return volunteer;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
