'use server';

import { authServer } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!email || !password) {
    return { error: 'Email and password are required' };
  }
  
  const { error } = await authServer.signIn.email({
    email,
    password,
  });
  
  if (error) {
    return { error: error.message || 'Failed to sign in. Try again' };
  }
  
  // Revalidate all paths to refresh user data across the app
  revalidatePath('/', 'layout');
  
  redirect('/');
}
