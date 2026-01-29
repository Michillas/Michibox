import { authApiHandler } from '@neondatabase/auth/next/server';

// Initialize handler with configuration
const handler = authApiHandler({
  baseURL: process.env.NEON_AUTH_BASE_URL,
});

export const { GET, POST } = handler;
