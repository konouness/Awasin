'use client';
import { useState, useTransition } from 'react';
import { demoLogin } from './actions';

export function DemoLogin() {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [role, setRole] = useState<string | null>(null);
  const go = (r: string) => {
    setRole(r);
    start(async () => setError(await demoLogin(r).catch(() => 'Akun demo belum tersedia.')));
  };
  return (
    <div className="stack">
      <button className="btn role-card" type="button" disabled={pending} aria-busy={pending && role === 'sekolah'} onClick={() => go('sekolah')}>Masuk sebagai Sekolah</button>
      <button className="btn role-card" type="button" disabled={pending} aria-busy={pending && role === 'dinas'} onClick={() => go('dinas')}>Masuk sebagai Dinas Pendidikan</button>
      {pending && <p className="muted small" role="status">Masuk…</p>}
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
