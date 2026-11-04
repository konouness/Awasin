import { Suspense } from 'react';
import { Topbar } from '@/components/Topbar';
import { demoEnabled } from '@/lib/demo';
import { DemoLogin } from './DemoLogin';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <>
      <Topbar />
      <main className="wrap stack enter" style={{ maxWidth: 440 }}>
        <h1>Masuk</h1>
        {demoEnabled() ? (
          <>
            <p className="muted">Akun demo: pilih peran, tanpa mengisi apa pun.</p>
            <DemoLogin />
            <details>
              <summary>Masuk dengan email</summary>
              <Suspense>
                <LoginForm />
              </Suspense>
            </details>
          </>
        ) : (
          <>
            <p className="muted">Untuk akun sekolah dan dinas pendidikan.</p>
            <Suspense>
              <LoginForm />
            </Suspense>
          </>
        )}
      </main>
    </>
  );
}
