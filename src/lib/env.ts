import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_MAPTILER_KEY: z.string().min(1),
    NEXT_PUBLIC_APP_NAME: z.string().default('CONGOPE'),
    NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
    NEXT_PUBLIC_APP_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL:      process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MAPTILER_KEY: process.env.NEXT_PUBLIC_MAPTILER_KEY,
    NEXT_PUBLIC_APP_NAME:     process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION:  process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_APP_ENV:      process.env.NEXT_PUBLIC_APP_ENV,
  },
});
