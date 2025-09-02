import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config';
import { AuthTokenPayload } from '../types/global';

// Jwt Secret and Expiration
const secret: string = config.access_secret ?? '';
const expires: string = config.access_expires ?? '7d';

// Sign jwt token
export function signToken(
  payload: AuthTokenPayload,
  expiresIn: string = expires,
): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(payload, secret, options);
}

// verify token
export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, secret) as AuthTokenPayload;
}

// decode token for user info
export function decodeToken(token: string): string | object {
  return jwt.decode(token, { complete: true }) || {};
}
