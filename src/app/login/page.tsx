import { Suspense } from 'react';
import { Topbar } from '@/components/Topbar';
import { DemoLogin } from './DemoLogin';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <>
      <Topbar />
      <main className="wrap stack" style={{ maxWidth: 440 }}>
        <h1>Masuk</h1>
        <p className="muted">Akun demo: pilih peran, tanpa mengisi apa pun.</p>
        <DemoLogin />
        <details>
          <summary>Masuk dengan email</summary>
          <Suspense>
            <LoginForm />
          </Suspense>
        </details>
      </main>
    </>
  );
}
