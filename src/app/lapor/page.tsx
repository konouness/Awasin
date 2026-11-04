import { redirect } from 'next/navigation';
import { Topbar } from '@/components/Topbar';
import { createClient, getSessionProfile } from '@/lib/supabase/server';
import { ReportForm } from './ReportForm';

export const dynamic = 'force-dynamic';

export default async function LaporPage() {
  const me = await getSessionProfile();
  if (!me) redirect('/login?next=/lapor');
  if (me.role !== 'sekolah' || !me.school_id) redirect('/dinas');
  const db = await createClient();
  const { data: school } = await db.from('schools').select('name').eq('id', me.school_id).single();
  return (
    <>
      <Topbar />
      <main className="wrap stack enter">
        <h1>Laporan lapangan</h1>
        <p className="muted">{school?.name}. Isi apa yang terlihat sekarang di sekolah.</p>
        <ReportForm schoolId={me.school_id} reporterId={me.id} />
      </main>
    </>
  );
}
