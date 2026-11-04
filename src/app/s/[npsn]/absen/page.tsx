import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CheckinForm } from './CheckinForm';

export const dynamic = 'force-dynamic';

export default async function AbsenPage({ params }: { params: Promise<{ npsn: string }> }) {
  const { npsn } = await params;
  const db = await createClient();
  const { data: school } = await db.from('schools').select('id, name').eq('npsn', npsn).maybeSingle();
  if (!school) notFound();
  const { data: em } = await db.from('emergencies').select('id').eq('school_id', school.id).is('ended_at', null).maybeSingle();
  return (
    <main className="wrap stack enter" style={{ maxWidth: 520 }}>
      <h1>Absen kesehatan</h1>
      <p className="muted">{school.name}</p>
      {em ? <CheckinForm npsn={npsn} /> : <p>Sekolah berjalan normal. Absen kesehatan hanya dibuka saat belajar daring.</p>}
    </main>
  );
}
