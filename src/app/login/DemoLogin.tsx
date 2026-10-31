'use client';
import { useState, useTransition } from 'react';
import { demoLogin } from './actions';

export function DemoLogin() {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const go = (role: string) => start(async () => setError(await demoLogin(role)));
  return (
    <div className="stack">
      <button className="btn" type="button" disabled={pending} onClick={() => go('sekolah')}>Masuk sebagai Sekolah</button>
      <button className="btn" type="button" disabled={pending} onClick={() => go('dinas')}>Masuk sebagai Dinas Pendidikan</button>
      {pending && <p className="muted small" role="status">Masuk…</p>}
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
