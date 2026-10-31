'use server';
import { redirect } from 'next/navigation';
import { demoAccount } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';

export async function demoLogin(role: string): Promise<string> {
  const acc = demoAccount(role);
  const password = process.env.DEMO_PASSWORD;
  if (!acc || !password) return 'Akun demo belum tersedia.';
  const db = await createClient();
  const { error } = await db.auth.signInWithPassword({ email: acc.email, password });
  if (error) return 'Akun demo belum tersedia.';
  redirect(acc.dest);
}
