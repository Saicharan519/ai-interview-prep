import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL').default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('uploads'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors.map((e) => `  ${e.path.join('.')}: ${e.message}`).join('\n');
    console.error(`\n[FATAL] Environment validation failed:\n${errors}\n`);
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
