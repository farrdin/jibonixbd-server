import dotenv from 'dotenv';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// dotenv config
dotenv.config({ path: path.join((process.cwd(), '.env')) });

// cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// export all env variables
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
  smtp_port: process.env.SMTP_PORT,
  sp: {
    sp_endpoint: process.env.SP_ENDPOINT,
    sp_username: process.env.SP_USERNAME,
    sp_password: process.env.SP_PASSWORD,
    sp_prefix: process.env.SP_PREFIX,
    sp_return_url: process.env.SP_RETURN_URL,
  },
  cloudinary,
};
