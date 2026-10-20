import { Suspense } from 'react';
import { Topbar } from '@/components/Topbar';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <>
      <Topbar />
      <main className="wrap stack" style={{ maxWidth: 440 }}>
        <h1>Masuk</h1>
        <p className="muted">Untuk akun sekolah dan dinas pendidikan.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
