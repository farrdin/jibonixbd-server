import bcrypt from 'bcryptjs';
import config from '../../config';

const saltRounds = Number(config.bcrypt_salt) || 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
