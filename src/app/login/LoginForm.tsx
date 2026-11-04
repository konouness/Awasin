'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

export function LoginForm() {
  const next = useSearchParams().get('next');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const db = createClient();
    const { data, error } = await db.auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('password')) });
    if (error || !data.user) {
      setBusy(false);
      setError('Email atau kata sandi salah.');
      return;
    }
    let dest = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
    if (!next) {
      const { data: p } = await db.from('profiles').select('role, schools(npsn)').eq('id', data.user.id).maybeSingle();
      const npsn = (p?.schools as unknown as { npsn: string } | null)?.npsn;
      dest = p?.role === 'dinas' ? '/dinas' : npsn ? `/sekolah/${npsn}` : '/';
    }
    window.location.href = dest;
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="field">
        <label htmlFor="password">Kata sandi</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={busy} aria-busy={busy}>{busy ? 'Memeriksa…' : 'Masuk'}</button>
    </form>
  );
}
