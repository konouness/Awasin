import { createClient } from '@/lib/supabase/server';
import { formatWIB, todayWIB } from '@/lib/time';
import { addTask, deleteTask, endEmergency, startEmergency } from './actions';

const SYMPTOM_LABEL: Record<string, string> = { batuk: 'batuk', sesak: 'sesak napas', demam: 'demam', mata_perih: 'mata perih' };

export async function EmergencyPanel({ schoolId, npsn }: { schoolId: string; npsn: string }) {
  const db = await createClient();
  const { data: em } = await db.from('emergencies').select('id, started_at, started_by, reason').eq('school_id', schoolId).is('ended_at', null).maybeSingle();
  if (!em) {
    return (
      <section className="stack" aria-label="Mode darurat">
        <h2>Mode darurat</h2>
        <p>Tidak aktif. Aktifkan untuk mengirim pengumuman belajar daring, membuka papan tugas, dan absen kesehatan.</p>
        <form action={startEmergency.bind(null, npsn)}>
          <button className="btn" type="submit">Aktifkan mode daring</button>
        </form>
      </section>
    );
  }
  const today = todayWIB(new Date());
  const [{ data: tasks }, { data: checkins }] = await Promise.all([
    db.from('tasks').select('id, title, url, created_at').eq('emergency_id', em.id).order('created_at', { ascending: false }),
    db.from('health_checkins').select('status, symptoms').eq('school_id', schoolId).eq('date', today),
  ]);
  const sick = (checkins ?? []).filter((c) => c.status === 'sakit');
  const symptomCount = new Map<string, number>();
  sick.forEach((c) => (c.symptoms as string[]).forEach((s) => symptomCount.set(s, (symptomCount.get(s) ?? 0) + 1)));
  const topSymptoms = [...symptomCount].sort((a, b) => b[1] - a[1]).map(([s, n]) => `${SYMPTOM_LABEL[s] ?? s} ${n}`);

  return (
    <section className="stack" aria-label="Mode darurat">
      <h2>Mode daring aktif</h2>
      <p>Sejak {formatWIB(em.started_at)}, {em.started_by === 'otomatis' ? 'diaktifkan otomatis' : 'diaktifkan oleh sekolah'}.</p>
      <p className="small">
        Bagikan ke wali murid: <a href={`/s/${npsn}/tugas`}>papan tugas</a> dan <a href={`/s/${npsn}/absen`}>absen kesehatan</a>.
      </p>
      <p>
        Absen hari ini: {(checkins ?? []).length - sick.length} sehat, {sick.length} sakit.
        {topSymptoms.length > 0 && ` Gejala: ${topSymptoms.join(', ')}.`}
      </p>

      <form action={addTask.bind(null, npsn)} className="stack">
        <div className="field">
          <label htmlFor="title">Judul tugas</label>
          <input id="title" name="title" type="text" required maxLength={200} />
        </div>
        <div className="field">
          <label htmlFor="url">Tautan (opsional)</label>
          <input id="url" name="url" type="url" placeholder="https://" />
        </div>
        <div className="field">
          <label htmlFor="body">Isi tugas (opsional)</label>
          <textarea id="body" name="body" rows={3} maxLength={2000} />
        </div>
        <button className="btn ghost" type="submit">Tambah tugas</button>
      </form>

      {(tasks ?? []).length > 0 && (
        <ul>
          {(tasks ?? []).map((t) => (
            <li key={t.id} className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{t.url ? <a href={t.url}>{t.title}</a> : t.title}</span>
              <form action={deleteTask.bind(null, npsn, t.id)}>
                <button className="btn ghost" type="submit">Hapus</button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={endEmergency.bind(null, npsn)}>
        <button className="btn ghost" type="submit">Akhiri mode daring</button>
      </form>
    </section>
  );
}
