import Link from 'next/link';
import { createClient, getSessionProfile } from '@/lib/supabase/server';
import { LogoutButton } from './LogoutButton';

export async function Topbar() {
  const me = await getSessionProfile();
  let home: string | null = null;
  if (me?.role === 'sekolah' && me.school_id) {
    const db = await createClient();
    const { data } = await db.from('schools').select('npsn').eq('id', me.school_id).maybeSingle();
    home = data ? `/sekolah/${data.npsn}` : null;
  }
  return (
    <header className="topbar">
      <Link href="/" className="brand">Awasin</Link>
      <nav aria-label="Menu utama">
        {me?.role === 'dinas' && <Link href="/dinas">Dasbor dinas</Link>}
        {home && <Link href={home}>Sekolah saya</Link>}
        {me?.role === 'sekolah' && <Link href="/lapor">Kirim laporan</Link>}
        {me ? <LogoutButton /> : <Link href="/login">Masuk</Link>}
      </nav>
    </header>
  );
}
