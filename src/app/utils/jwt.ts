import jwt, { SignOptions } from 'jsonwebtoken'
import config from '../config'

const secret: string = config.access_secret ?? ''
const expires: string = config.access_expires ?? '1h'

export function signToken(
  payload: string | object | Buffer,
  expiresIn: string = expires
): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: SignOptions = { expiresIn: expiresIn as any }
  return jwt.sign(payload, secret, options)
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret)
}
export function decodeToken(token: string): string | object {
  return jwt.decode(token, { complete: true }) || {}
}
