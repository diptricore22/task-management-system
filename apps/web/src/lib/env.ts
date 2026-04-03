import { z } from 'zod';

// Frontend environment schema validation
const envSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z
    .string()
    .url('NEXT_PUBLIC_API_URL must be a valid URL')
    .default('http://localhost:3003'),

  // Frontend Configuration
  NEXT_PUBLIC_WEB_URL: z
    .string()
    .url('NEXT_PUBLIC_WEB_URL must be a valid URL')
    .default('http://localhost:3000'),

  // Feature Flags (must be strings that convert to booleans)
  NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS: z
    .string()
    .transform(val => val === 'true')
    .default('true'),

  NEXT_PUBLIC_ENABLE_REGISTRATION: z
    .string()
    .transform(val => val === 'true')
    .default('false'),

  // Monitoring & Analytics (optional)
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

// Validate environment variables
let env: z.infer<typeof envSchema> = {
  NEXT_PUBLIC_API_URL: 'http://localhost:3003',
  NEXT_PUBLIC_WEB_URL: 'http://localhost:3000',
  NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS: true,
  NEXT_PUBLIC_ENABLE_REGISTRATION: false,
  NEXT_PUBLIC_GA_ID: undefined,
  NEXT_PUBLIC_SENTRY_DSN: undefined,
};

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    error.errors.forEach(err => {
      console.error(`  ${err.path.join('.')}: ${err.message}`);
    });
  }
  // In development, we can proceed with defaults
  // In production, we should fail
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Export validated environment configuration
export const webEnv = {
  // API Configuration
  api: {
    baseUrl: env.NEXT_PUBLIC_API_URL,
  },

  // Frontend Configuration
  app: {
    url: env.NEXT_PUBLIC_WEB_URL,
    isDevelopment: typeof window === 'undefined' ? process.env.NODE_ENV === 'development' : false,
  },

  // Feature Flags
  features: {
    emailNotifications: env.NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS,
    publicRegistration: env.NEXT_PUBLIC_ENABLE_REGISTRATION,
  },

  // Analytics (optional)
  analytics: {
    gaId: env.NEXT_PUBLIC_GA_ID,
    sentryDsn: env.NEXT_PUBLIC_SENTRY_DSN,
  },
};

export default webEnv;
