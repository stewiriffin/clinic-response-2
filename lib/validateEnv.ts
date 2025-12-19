import { z } from 'zod';

/**
 * Environment variable validation schema
 * Validates required environment variables at startup
 */
const envSchema = z.object({
  // Database
  MONGODB_URI: z.string().url('MONGODB_URI must be a valid URL'),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').optional(),

  // Pusher (optional but recommended)
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().optional(),
  NEXT_PUBLIC_PUSHER_KEY: z.string().optional(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().optional(),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/, 'SMTP_PORT must be a number').optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email('SMTP_FROM must be a valid email').optional(),

  // SMS (optional)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
});

// Type for validated environment variables
export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validate environment variables at startup
 * Throws detailed error if validation fails
 */
export function validateEnv(): ValidatedEnv {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      });

      console.error('\n❌ Environment variable validation failed:\n');
      console.error(missingVars.join('\n'));
      console.error('\n📝 Check your .env file and compare with .env.example\n');

      throw new Error('Invalid environment variables');
    }
    throw error;
  }
}

/**
 * Check if optional features are configured
 */
export function checkOptionalFeatures() {
  const warnings: string[] = [];

  // Check Pusher
  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY) {
    warnings.push('⚠️  Pusher not configured - Real-time updates disabled');
  }

  // Check Email
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    warnings.push('⚠️  SMTP not configured - Email notifications disabled');
  }

  // Check SMS
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    warnings.push('⚠️  Twilio not configured - SMS notifications disabled');
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('\n' + warnings.join('\n') + '\n');
  }

  return warnings;
}

// Auto-validate in production
if (process.env.NODE_ENV === 'production') {
  validateEnv();
  checkOptionalFeatures();
}
