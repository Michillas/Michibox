import { createAuthServer } from '@neondatabase/auth/next/server';

export const authServer = createAuthServer({
  baseURL: process.env.NEON_AUTH_BASE_URL,
});

export async function getServerAuth() {
  const session = await authServer.getSession();
  return { user: session?.user || null, session };
}
