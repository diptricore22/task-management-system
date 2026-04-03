import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment schema validation
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.string().default('3003').transform(Number),
  API_BASE_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),

  // Security
  BCRYPT_ROUNDS: z.string().default('12').transform(Number),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number), // 15 minutes
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),

  // Feature flags
  ENABLE_EMAIL_NOTIFICATIONS: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
  ENABLE_REGISTRATION: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
});

// Validate environment variables
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment variables:');
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.error(`  ${err.path.join('.')}: ${err.message}`);
    });
  }
  process.exit(1);
}

// Environment configuration export
export const config = {
  // Database
  database: {
    url: env.DATABASE_URL,
    directUrl: env.DIRECT_URL || env.DATABASE_URL,
  },

  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessTokenExpiration: '15m',
    refreshTokenExpiration: '7d',
  },

  // Email
  email: {
    resendApiKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM || 'noreply@taskapp.com',
    smtp: {
      host: env.SMTP_HOST || 'localhost',
      port: env.SMTP_PORT || 1025,
    },
  },

  // Application
  app: {
    env: env.NODE_ENV,
    port: env.API_PORT,
    baseUrl: env.API_BASE_URL || `http://localhost:${env.API_PORT}`,
    frontendUrl: env.NEXTAUTH_URL || 'http://localhost:3000',
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },

  // Security
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
    },
  },

  // Feature flags
  features: {
    emailNotifications: env.ENABLE_EMAIL_NOTIFICATIONS,
    publicRegistration: env.ENABLE_REGISTRATION,
  },
};

export default config;