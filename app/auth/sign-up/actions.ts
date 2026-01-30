'use server';

import { authServer } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get('email') as string;
  
  if (!email) {
    return { error: "Email address must be provided." }
  }
  
  // Optionally restrict sign ups based on email address
  // if (!email.trim().endsWith("@my-company.com")) {
  //   return { error: 'Email must be from my-company.com' };
  // }
  
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;
  
  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }
  
  const { error } = await authServer.signUp.email({
    email,
    name: name || email.split('@')[0] || 'User',
    password,
  });
  
  if (error) {
    return { error: error.message || 'Failed to create account' };
  }
  
  // Revalidate all paths to refresh user data across the app
  revalidatePath('/', 'layout');
  
  redirect('/');
}
