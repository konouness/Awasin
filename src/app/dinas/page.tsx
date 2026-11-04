import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Topbar } from '@/components/Topbar';
import { ACTION_LABEL, HAZARD_LABEL } from '@/lib/status';
import { createClient, getSessionProfile } from '@/lib/supabase/server';
import { formatWIB, todayWIB } from '@/lib/time';
import { MATCH_LABEL, matchReport, type MatchResult } from '@/reports/match';
import { observedLevel, type ReportInput } from '@/reports/observed';
import { ACTION_ORDER, HAZARDS, type Hazard, type Level } from '@/risk/types';
import type { Overview } from '@/se/draft';
import { SeDraft } from './SeDraft';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Report = ReportInput & { id: string; school_id: string; students_sick: number; note: string | null; photo_path: string | null; created_at: string; schools: { name: string } };

const MATCH_LV: Record<MatchResult, Level> = { cocok: 0, tidak_terdeteksi: 3, tidak_terkonfirmasi: 1 };

function observedText(r: Report) {
  if (r.hazard === 'asap') return `Jarak pandang ${r.visibility_m ?? '–'} m${r.smoke_smell ? ', bau asap' : ''}`;
  if (r.hazard === 'banjir') return `Genangan ${r.water_depth_cm ?? 0} cm`;
  return `Angin ${r.wind_felt ?? 'tidak'}`;
}

export default async function DinasPage({ searchParams }: { searchParams: Promise<{ bencana?: string; hanya?: string }> }) {
  const me = await getSessionProfile();
  if (!me) redirect('/login?next=/dinas');
  if (me.role !== 'dinas') redirect('/lapor');
  const sp = await searchParams;
  const hazardFilter = HAZARDS.includes(sp.bencana as Hazard) ? (sp.bencana as Hazard) : null;
  const onlyMissed = sp.hanya === 'tidak_terdeteksi';

  const db = await createClient();
  const today = todayWIB(new Date());
  let q = db.from('field_reports').select('id, school_id, hazard, visibility_m, smoke_smell, water_depth_cm, wind_felt, students_sick, note, photo_path, created_at, schools(name)').order('created_at', { ascending: false }).limit(50);
  if (hazardFilter) q = q.eq('hazard', hazardFilter);
  const [{ data: overview }, { data: reportRows }] = await Promise.all([db.rpc('dinas_overview', { p_date: today }), q]);

  const rows = ((overview ?? []) as Overview[]).sort(
    (a, b) => ACTION_ORDER.indexOf(b.action) - ACTION_ORDER.indexOf(a.action) || b.sick_checkins + b.sick_reported - (a.sick_checkins + a.sick_reported) || a.name.localeCompare(b.name),
  );
  const reports = (reportRows ?? []) as unknown as Report[];
  const enriched = await Promise.all(
    reports.map(async (r) => {
      const [{ data: predicted }, photo] = await Promise.all([
        db.rpc('predicted_level_at', { p_school: r.school_id, p_hazard: r.hazard, p_at: r.created_at }),
        r.photo_path ? db.storage.from('reports').createSignedUrl(r.photo_path, 3600) : Promise.resolve({ data: null }),
      ]);
      const obs = observedLevel(r);
      const pred = (predicted ?? null) as Level | null;
      return { ...r, obs, pred, match: pred === null ? null : matchReport(obs, pred), photoUrl: photo.data?.signedUrl ?? null };
    }),
  );
  const shown = onlyMissed ? enriched.filter((r) => r.match === 'tidak_terdeteksi') : enriched;
  const link = (b: Hazard | null, h: boolean) => {
    const p = new URLSearchParams();
    if (b) p.set('bencana', b);
    if (h) p.set('hanya', 'tidak_terdeteksi');
    const s = p.toString();
    return s ? `/dinas?${s}` : '/dinas';
  };

  return (
    <>
      <Topbar />
      <main className="wrap stack enter" style={{ maxWidth: 1100 }}>
        <h1>Dasbor dinas</h1>
        <p className="muted">Hari ini, {today}. Diurutkan dari tindakan paling berat.</p>
        <div className="table-box">
          <table>
            <thead>
              <tr><th>Sekolah</th><th>Rekomendasi</th><th className="num">Laporan hari ini</th><th className="num">Sakit (laporan)</th><th className="num">Sakit (absen)</th><th>Mode daring</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const lv = r.levels ? (Math.max(r.levels.asap, r.levels.banjir, r.levels.angin) as Level) : 0;
                return (
                  <tr key={r.school_id} className={`lvl-${lv}`}>
                    <td><Link href={`/sekolah/${r.npsn}`}>{r.name}</Link><br /><span className="small muted">{r.kabupaten}</span></td>
                    <td><span className="plate">{ACTION_LABEL[r.action]}</span>{r.hazard && <><br /><span className="small muted">{HAZARD_LABEL[r.hazard]}</span></>}</td>
                    <td className="num">{r.reports_today}</td>
                    <td className="num">{r.sick_reported}</td>
                    <td className="num">{r.sick_checkins}</td>
                    <td>{r.emergency_active ? <span className="plate stripes">Aktif</span> : 'Tidak'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <SeDraft kabupaten={[...new Set(rows.map((r) => r.kabupaten))].sort((a, b) => a.localeCompare(b))} />

        <h2>Laporan lapangan terbaru</h2>
        <nav className="chips" aria-label="Saring laporan">
          <Link href={link(null, onlyMissed)} aria-current={!hazardFilter ? 'true' : undefined}>Semua bencana</Link>
          {HAZARDS.map((h) => (
            <Link key={h} href={link(h, onlyMissed)} aria-current={hazardFilter === h ? 'true' : undefined}>{HAZARD_LABEL[h]}</Link>
          ))}
          <Link href={link(hazardFilter, !onlyMissed)}>{onlyMissed ? 'Tampilkan semua hasil' : 'Hanya yang tidak terdeteksi satelit'}</Link>
        </nav>
        {shown.length === 0 && <p className="muted">Belum ada laporan yang cocok dengan saringan ini.</p>}
        <div className="scroll-x">
          <table>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td style={{ width: 120 }}>
                    {r.photoUrl ? (
                      <a href={r.photoUrl} target="_blank" rel="noreferrer">
                        <img src={r.photoUrl} alt={`Foto laporan ${r.schools.name}`} width={110} className="thumb" />
                      </a>
                    ) : <span className="small muted">Tanpa foto</span>}
                  </td>
                  <td>
                    <strong>{r.schools.name}</strong><br />
                    <span className="small muted">{formatWIB(r.created_at)}, {HAZARD_LABEL[r.hazard]}</span><br />
                    {observedText(r)}. Siswa sakit: {r.students_sick}.{r.note ? ` ${r.note}` : ''}
                  </td>
                  <td>
                    Pengamatan level {r.obs}, prediksi {r.pred ?? 'tidak ada'}<br />
                    {r.match ? (
                      <span className={`plate lvl-${MATCH_LV[r.match]}`}>{MATCH_LABEL[r.match]}</span>
                    ) : <span className="small muted">Belum ada prediksi untuk jam ini</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
