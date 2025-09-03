/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IncomingMessage, ServerResponse } from 'http';
import { Pool } from 'pg';
import { parseJsonBody, sendJson } from '../../utils';
import { sendResponse } from '../../utils/sendResponse';
import AppError from '../../errors/appError';
import otpGenerate from '../otp/otpGenerate';
import otpToDb from '../otp/otpToDb';
import { otpToPhone } from '../otp/otpToPhone';
import { otpToEmail } from '../otp/otpToEmail';
import { generateEmailTemplate } from '../../utils/emailTemplate';
import {
  roleInsertFunctions,
  roleValidationSchemas,
} from '../../utils/registerHelper';
import { CreateAdminInput } from '../admin/admin.interface';
import { CreateModeratorInput } from '../moderator/moderator.interface';
import { CreateVolunteerInput } from '../volunteer/volunteer.interface';
import { CreateVictimInput } from '../victim/victim.interface';
import { CreateDonorInput } from '../donor/donor.interface';
import { loginUser } from './auth.service';
import { AuthValidation } from './auth.validation';

type Role = 'ADMIN' | 'MODERATOR' | 'VOLUNTEER' | 'VICTIM' | 'DONOR';

type CreateUserInput =
  | (CreateAdminInput & { role: 'ADMIN' })
  | (CreateModeratorInput & { role: 'MODERATOR' })
  | (CreateVolunteerInput & { role: 'VOLUNTEER' })
  | (CreateVictimInput & { role: 'VICTIM' })
  | (CreateDonorInput & { role: 'DONOR' });

export async function handleRegister(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
): Promise<void> {
  try {
    const body = (await parseJsonBody(req)) as Partial<CreateUserInput>;
    const { email, password, phone, verification_method, role } = body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $2',
      [email?.toLowerCase(), phone],
    );
    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      if (user.email === email)
        throw new AppError(409, 'Email already in use.');
      if (user.phone === phone)
        throw new AppError(409, 'Phone number already in use.');
    }

    if (!role || typeof role !== 'string') {
      throw new AppError(400, 'Role is required and must be a string');
    }
    if (!roleValidationSchemas[role] || !roleInsertFunctions[role]) {
      throw new AppError(400, 'Invalid or unsupported role');
    }

    const schema = roleValidationSchemas[role];
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return sendJson(res, 400, {
        status: 'fail',
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const roleData = {
      ...body,
      email: email?.toLowerCase(),
      password: password,
      role,
      verification_method,
    };
    // Generate OTP
    const otp = await otpGenerate();
    const phoneOrEmail =
      verification_method === 'email' ? email?.toLowerCase() : phone;

    await otpToDb(
      pool,
      phoneOrEmail as string,
      otp,
      verification_method as 'email' | 'phone',
      role,
      roleData,
    );

    if (verification_method === 'phone') {
      await otpToPhone(phone as string, otp);
    } else {
      if (!email) {
        throw new AppError(400, 'Email is required for email verification');
      }
      const subject = 'Your OTP Verification Code';
      const message = generateEmailTemplate(otp);
      await otpToEmail({ email: email.toLowerCase(), subject, message });
    }

    sendJson(res, 200, {
      status: 'pending',
      message:
        verification_method === 'phone'
          ? 'OTP sent to phone. Please verify the OTP.'
          : 'OTP sent to email. Please check your inbox and verify.',
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: (err as any).statusCode || 500,
      success: false,
      message: err instanceof Error ? err.message : 'Server Error',
      data: null,
    });
  }
}

export async function handleVerifyOtp(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
): Promise<void> {
  try {
    const body = (await parseJsonBody(req)) as {
      otp: string;
      phoneOrEmail: string;
      verificationMethod: 'phone' | 'email';
    };

    const { otp, phoneOrEmail } = body;
    const result = await pool.query(
      `SELECT * FROM otp_verifications
       WHERE phone_or_email = $1 AND otp = $2 AND expires_at > NOW() AND is_verified = FALSE`,
      [phoneOrEmail.toLowerCase(), otp],
    );

    if (result.rows.length === 0) {
      return sendJson(res, 400, {
        status: 'fail',
        message: 'Invalid or expired OTP',
      });
    }
    const otpRecord = result.rows[0];

    const role = otpRecord?.role_data?.role as Role | undefined;
    const verificationMethod = otpRecord.role_data?.verification_method as
      | 'phone'
      | 'email'
      | undefined;

    if (!role || !roleInsertFunctions[role]) {
      throw new AppError(500, 'Invalid role data in OTP record');
    }
    if (!verificationMethod) {
      throw new AppError(500, 'Missing verification method in role data');
    }

    // Delete OTP record (mark as used)
    await pool.query('DELETE FROM otp_verifications WHERE id = $1', [
      otpRecord.id,
    ]);

    const {
      phone_or_email,
      otp: _otp,
      expires_at,
      verification_method,
      role: _role,
      role_data,
      ...commonFields
    } = otpRecord;

    const insertData: any = {
      ...commonFields,
      ...(role_data || {}),
    };

    const insertFunction = roleInsertFunctions[role];
    const newUser = await insertFunction(pool, insertData);

    const roleData = (newUser as any)[role.toLowerCase()];

    sendJson(res, 200, {
      status: 'success',
      message: 'User created and verified successfully',
      data: {
        id: roleData.id,
        name: newUser.user.name,
        email: newUser.user.email,
        phone: newUser.user.phone,
        role: newUser.user.role,
        created_at: roleData.created_at,
        updated_at: roleData.updated_at,
      },
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 900,
      success: false,
      message: err instanceof Error ? err.message : 'Server Error',
      data: null,
    });
  }
}

export async function handleLogin(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  try {
    const body = await parseJsonBody(req);
    const parsed = AuthValidation.loginValidationSchema.safeParse(body);

    if (!parsed.success) {
      return sendJson(res, 400, {
        status: 'fail',
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    const { email, password } = parsed.data;
    const lowerEmail = email.toLowerCase();
    const { token, user } = await loginUser(pool, {
      email: lowerEmail,
      password,
    });
    res.setHeader(
      'Set-Cookie',
      'token=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure',
    );
    const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=None; Secure`;
    res.setHeader('Set-Cookie', cookie);

    sendJson(res, 200, {
      status: 'Success',
      message: 'Login successful',
      user,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      sendJson(res, 401, { error: error.message || 'Invalid credentials' });
    } else {
      sendJson(res, 401, { error: 'Invalid credentials' });
    }
  }
}

export async function handleLogout(req: IncomingMessage, res: ServerResponse) {
  try {
    res.setHeader(
      'Set-Cookie',
      'token=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure',
    );
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({ status: 'Success', message: 'Logged out successfully' }),
    );
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'Error', message: 'Logout failed' }));
  }
}
