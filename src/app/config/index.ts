import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join((process.cwd(), '.env')) })

export default {
  node: process.env.NODE_ENV,
  port: process.env.PORT,
  postgres: process.env.DATABASE_URL,
  bcrypt_salt: process.env.BCRYPT_SALT_ROUNDS,
  access_secret: process.env.JWT_ACCESS_SECRET,
  refresh_secret: process.env.JWT_REFRESH_SECRET,
  access_expires: process.env.JWT_ACCESS_EXPIRES,
  refresh_expires: process.env.JWT_REFRESH_EXPIRES
}
