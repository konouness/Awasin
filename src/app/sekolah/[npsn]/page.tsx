import { notFound } from 'next/navigation';
import { Sparkline } from '@/components/Sparkline';
import { ReplayBar } from '@/components/ReplayBar';
import { Topbar } from '@/components/Topbar';
import { HAZARD_ADVICE, SCORE_UNIT, THRESHOLD_SOURCE } from '@/lib/advice';
import { ACTION_LABEL, HAZARD_LABEL, LEVEL_LABEL } from '@/lib/status';
import { createClient, getSessionProfile } from '@/lib/supabase/server';
import { EmergencyPanel } from './EmergencyPanel';
import { formatWIB, hourWIB, isStale } from '@/lib/time';
import { HAZARDS, type Action, type Hazard, type Level } from '@/risk/types';
import { replayDay } from '@/replay/replay';

export const dynamic = 'force-dynamic';

export default async function SchoolPage({ params, searchParams }: { params: Promise<{ npsn: string }>; searchParams: Promise<{ putar?: string }> }) {
  const { npsn } = await params;
  const snap = replayDay((await searchParams).putar);
  const db = await createClient();
  const { data: school } = await db.from('schools').select('id, npsn, name, kabupaten').eq('npsn', npsn).maybeSingle();
  if (!school) notFound();
  const from = new Date(Math.floor(Date.now() / 3600_000) * 3600_000).toISOString();
  const hist = snap ? (snap.schools[school.npsn] ?? null) : null;
  const [{ data: liveStatus }, { data: liveRows }] = snap
    ? [{ data: null }, { data: null }]
    : await Promise.all([
        db.from('school_status').select('action, hazard, levels, updated_at').eq('school_id', school.id).maybeSingle(),
        db.from('forecasts').select('hazard, hour, level, score').eq('school_id', school.id).gte('hour', from).order('hour').limit(72),
      ]);
  const status = snap ? (hist ? { ...hist.status, updated_at: snap.at } : null) : liveStatus;
  const rows = snap ? (hist?.rows ?? []).filter((r) => r.hour >= snap.at).sort((a, b) => a.hour.localeCompare(b.hour)) : liveRows;
  const action = (status?.action ?? 'normal') as Action;
  const cause = (status?.hazard ?? null) as Hazard | null;
  const levels = (status?.levels ?? { asap: 0, banjir: 0, angin: 0 }) as Record<Hazard, Level>;
  const top = (cause ? levels[cause] : 0) as Level;
  const stale = !snap && isStale(status?.updated_at ?? null, new Date());
  const series = (h: Hazard) => (rows ?? []).filter((r) => r.hazard === h);
  const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const me = await getSessionProfile();
  const isOwner = me?.role === 'sekolah' && me.school_id === school.id;
  const { data: activeEm } = snap ? { data: null } : await db.from('emergencies').select('id').eq('school_id', school.id).is('ended_at', null).maybeSingle();

  return (
    <>
      <Topbar />
      <main className="wrap stack enter">
        <div>
          <h1>{school.name}</h1>
          <p className="muted">{school.kabupaten}, NPSN {school.npsn}</p>
        </div>

        <ReplayBar active={snap?.day ?? null} base={`/sekolah/${school.npsn}`} at={snap?.at} />
        {snap && !hist && <p className="banner" role="status">Tidak ada data historis untuk sekolah ini.</p>}

        {stale && (
          <p className="banner" role="status">
            Data belum diperbarui sejak {status?.updated_at ? formatWIB(status.updated_at) : 'awal'}. Rekomendasi bisa sudah berubah.
          </p>
        )}

        {!(snap && !hist) && (<>
        <section className={`sign lvl-${top}`} aria-label="Rekomendasi hari ini">
          <p className="sign-tab">Level {top} · {LEVEL_LABEL[top]}</p>
          <p className="action">{ACTION_LABEL[action]}</p>
          {cause ? (
            <>
              <p className="cause">{HAZARD_LABEL[cause]}, level {top} ({LEVEL_LABEL[top]}) dalam 6 jam ke depan</p>
              <p className="advice">{HAZARD_ADVICE[cause]}</p>
            </>
          ) : (
            <p className="cause">Tidak ada ancaman dalam 6 jam ke depan.</p>
          )}
        </section>
        {status?.updated_at && <p className="small muted">Dihitung {formatWIB(status.updated_at)} dari prakiraan cuaca, kualitas udara, dan titik panas satelit.</p>}
        </>)}

        {snap ? null : isOwner ? (
          <EmergencyPanel schoolId={school.id} npsn={school.npsn} />
        ) : activeEm ? (
          <p className="banner">
            Sekolah sedang belajar daring. Isi <a href={`/s/${school.npsn}/absen`}>absen kesehatan</a>.
          </p>
        ) : null}

        {!(snap && !hist) && (
        <section className="forecast" aria-label="Prakiraan 24 jam">
          <h2>24 jam ke depan</h2>
          {HAZARDS.map((h) => {
            const s = series(h);
            const peak = Math.max(0, ...s.map((r) => r.level as number));
            const now = s[0];
            return (
              <div className="hazard" key={h}>
                <header>
                  <strong>{HAZARD_LABEL[h]}</strong>
                  <span className={`plate lvl-${levels[h]}`}>{LEVEL_LABEL[levels[h]]}</span>
                </header>
                {s.length ? (
                  <>
                    <Sparkline points={s.map((r) => r.score)} levels={s.map((r) => r.level as Level)} label={`${HAZARD_LABEL[h]}, puncak level ${peak} dalam 24 jam`} />
                    <p className="small muted">
                      Sekarang {Math.round(now.score)} {SCORE_UNIT[h]}. Grafik dari pukul {hourWIB(s[0].hour)}.00 sampai {hourWIB(s[s.length - 1].hour)}.00 WIB.
                    </p>
                  </>
                ) : (
                  <p className="small muted">Belum ada prakiraan untuk bencana ini.</p>
                )}
                <p className="small muted">{THRESHOLD_SOURCE[h]}</p>
              </div>
            );
          })}
        </section>
        )}

        <section className="stack panel" aria-label="Langganan peringatan">
          <h2>Dapatkan peringatan</h2>
          <p>Kami kirim pesan saat risiko di sekolah ini naik.</p>
          <div className="row">
            {bot && <a className="btn" href={`https://t.me/${bot}?start=${school.npsn}`}>Ikuti di Telegram</a>}
          </div>
        </section>

        <p className="attrib">
          <a href="https://open-meteo.com/">Weather data by Open-Meteo.com</a>. Fire data: NASA FIRMS. © OpenStreetMap contributors.
        </p>
      </main>
    </>
  );
}
