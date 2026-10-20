'use client';
import { createClient } from '@/lib/supabase/browser';

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await createClient().auth.signOut();
        window.location.href = '/';
      }}
      style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
    >
      Keluar
    </button>
  );
}
