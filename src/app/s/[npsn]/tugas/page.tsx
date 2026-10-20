import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatWIB } from '@/lib/time';

export const dynamic = 'force-dynamic';

export default async function TugasPage({ params }: { params: Promise<{ npsn: string }> }) {
  const { npsn } = await params;
  const db = await createClient();
  const { data: school } = await db.from('schools').select('id, name').eq('npsn', npsn).maybeSingle();
  if (!school) notFound();
  const { data: em } = await db.from('emergencies').select('id').eq('school_id', school.id).is('ended_at', null).maybeSingle();
  const { data: tasks } = em
    ? await db.from('tasks').select('id, title, url, body, created_at').eq('emergency_id', em.id).order('created_at', { ascending: false })
    : { data: [] };
  return (
    <main className="wrap stack">
      <h1>Tugas {school.name}</h1>
      {!em ? (
        <p>Sekolah berjalan normal. Tidak ada tugas daring.</p>
      ) : (tasks ?? []).length === 0 ? (
        <p>Belum ada tugas. Cek lagi nanti.</p>
      ) : (
        <ul className="stack" style={{ paddingLeft: 18 }}>
          {(tasks ?? []).map((t) => (
            <li key={t.id}>
              <strong>{t.url ? <a href={t.url}>{t.title}</a> : t.title}</strong>
              <br />
              <span className="small muted">{formatWIB(t.created_at)}</span>
              {t.body && <p style={{ whiteSpace: 'pre-wrap' }}>{t.body}</p>}
            </li>
          ))}
        </ul>
      )}
      <p><a href={`/s/${npsn}/absen`}>Isi absen kesehatan hari ini</a></p>
    </main>
  );
}
