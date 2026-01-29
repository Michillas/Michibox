'use client';

import { createAuthClient } from '@neondatabase/auth/next';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_NEON_AUTH_URL || 'http://localhost:3000',
});
