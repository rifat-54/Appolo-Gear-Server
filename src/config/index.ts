import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_round: Number(process.env.BCRYPT_SALT_ROUND) || 12,
  jwt: {
    jwt_access_secret: process.env.JWT_ACCESS_SECRET || 'secret_key',
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'admin123456',
  },
};
