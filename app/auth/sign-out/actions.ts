'use server';

import { authServer } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function signOut() {
  await authServer.signOut();
  
  // Explicitly delete cookies to ensure Vercel/Edge compatibility
  const cookieStore = await cookies();
  cookieStore.delete('session_token');
  cookieStore.delete('neondb_auth_token'); // Potential other name
  
  // Clear all cookies that might store session data
  cookieStore.getAll().forEach((cookie) => {
    if (cookie.name.includes('token') || cookie.name.includes('session')) {
      cookieStore.delete(cookie.name);
    }
  });

  redirect('/auth/sign-in');
}
