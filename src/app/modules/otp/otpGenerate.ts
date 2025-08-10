import { randomInt } from 'crypto'

export default async function otpGenerate(): Promise<string> {
  return randomInt(100000, 999999).toString()
}
