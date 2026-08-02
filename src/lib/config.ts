import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  SUPABASE_URL: z.string().url().or(z.string().min(1)),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  PRAVA_API_KEY: z.string(),
  PRAVA_BASE_URL: z.string().default('https://sandbox.api.prava.space'),
  SENSO_API_KEY: z.string(),
  LINQ_API_KEY: z.string(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function parseEnv(envObj?: Record<string, string | undefined>): EnvConfig {
  const envToParse = envObj || process.env;
  
  if (envToParse.NODE_ENV !== 'production') {
    const fallbacks = {
      SUPABASE_URL: envToParse.SUPABASE_URL || 'https://mock.supabase.co',
      SUPABASE_ANON_KEY: envToParse.SUPABASE_ANON_KEY || 'mock-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: envToParse.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key',
      UPSTASH_REDIS_REST_URL: envToParse.UPSTASH_REDIS_REST_URL || 'https://mock.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: envToParse.UPSTASH_REDIS_REST_TOKEN || 'mock-redis-token',
      PRAVA_API_KEY: envToParse.PRAVA_API_KEY || 'mock-prava-key',
      SENSO_API_KEY: envToParse.SENSO_API_KEY || 'mock-senso-key',
      LINQ_API_KEY: envToParse.LINQ_API_KEY || 'mock-linq-key',
    };
    return envSchema.parse({ ...envToParse, ...fallbacks });
  }

  return envSchema.parse(envToParse);
}

export const config = parseEnv();
export const env = config;
