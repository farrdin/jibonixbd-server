import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join((process.cwd(), '.env')) })

export default {
  postgres: process.env.DATABASE_URL,
  frontend_url: process.env.FRONTEND_URL,
  node: process.env.NODE_ENV,
  port: process.env.PORT,
  bcrypt_salt: process.env.BCRYPT_SALT_ROUNDS,
  access_secret: process.env.JWT_ACCESS_SECRET,
  refresh_secret: process.env.JWT_REFRESH_SECRET,
  access_expires: process.env.JWT_ACCESS_EXPIRES,
  refresh_expires: process.env.JWT_REFRESH_EXPIRES,
  twilio_sid: process.env.TWILIO_SID,
  twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
  twilio_phone_number: process.env.TWILIO_PHONE_NUMBER,
  smtp_service: process.env.SMTP_SERVICE,
  smtp_mail: process.env.SMTP_MAIL,
  smtp_password: process.env.SMTP_PASSWORD,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT
}
