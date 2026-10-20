import Link from 'next/link';
import { MapLoader } from '@/components/MapLoader';
import { Topbar } from '@/components/Topbar';
import { ACTION_LABEL, LEVEL_COLOR, LEVEL_LABEL } from '@/lib/status';
import { createClient } from '@/lib/supabase/server';
import { formatWIB, isStale } from '@/lib/time';
import { ACTION_ORDER, type Action, type Hazard, type Level } from '@/risk/types';

export const dynamic = 'force-dynamic';

type Row = { npsn: string; name: string; lat: number; lon: number; kabupaten: string; school_status: { action: Action; levels: Record<Hazard, Level> } | null };

export default async function Home() {
  const db = await createClient();
  const [{ data: schools }, { data: run }] = await Promise.all([
    db.from('schools').select('npsn, name, lat, lon, kabupaten, school_status(action, levels)'),
    db.from('refresh_runs').select('finished_at').eq('ok', true).order('id', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const rows = ((schools ?? []) as unknown as Row[]).map((s) => {
    const lv = s.school_status?.levels;
    const level = (lv ? Math.max(lv.asap, lv.banjir, lv.angin) : 0) as Level;
    const action = s.school_status?.action ?? 'normal';
    return { ...s, level, action, actionLabel: ACTION_LABEL[action] };
  });
  rows.sort((a, b) => ACTION_ORDER.indexOf(b.action) - ACTION_ORDER.indexOf(a.action) || b.level - a.level || a.name.localeCompare(b.name));
  const stale = isStale(run?.finished_at ?? null, new Date());
  const counts = ACTION_ORDER.map((a) => [a, rows.filter((r) => r.action === a).length] as const).filter(([, n]) => n > 0);

  return (
    <div className="map-page">
      <Topbar />
      <div className="map-layout">
        <div className="map-box">
          <MapLoader schools={rows.map(({ npsn, name, lat, lon, level, actionLabel }) => ({ npsn, name, lat, lon, level, actionLabel }))} />
        </div>
        <aside className="side stack">
          <h1>Apa yang dilakukan sekolah hari ini</h1>
          <p className="muted">
            {rows.length} sekolah di Kalimantan Tengah, prakiraan 6 jam ke depan.
            {run?.finished_at ? ` Diperbarui ${formatWIB(run.finished_at)}.` : ''}
          </p>
          {stale && (
            <p className="banner" role="status">
              Data belum diperbarui sejak {run?.finished_at ? formatWIB(run.finished_at) : 'awal'}. Status di bawah mungkin sudah berubah.
            </p>
          )}
          <p className="small">{counts.map(([a, n]) => `${n} ${ACTION_LABEL[a].toLowerCase()}`).join(', ')}</p>
          <div className="legend" aria-label="Arti warna">
            {([0, 1, 2, 3] as Level[]).map((l) => (
              <span key={l} className="lv"><span className="dot" style={{ background: LEVEL_COLOR[l] }} />{LEVEL_LABEL[l]}</span>
            ))}
          </div>
          <ol>
            {rows.map((s) => (
              <li key={s.npsn}>
                <Link href={`/sekolah/${s.npsn}`}>
                  <span className="dot" style={{ background: LEVEL_COLOR[s.level], marginTop: 6 }} />
                  <span>
                    {s.name}
                    <br />
                    <span className="act">{s.actionLabel}, {s.kabupaten}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="attrib">
            <a href="https://open-meteo.com/">Weather data by Open-Meteo.com</a>. Fire data: NASA FIRMS. Peta © OpenStreetMap contributors.
          </p>
        </aside>
      </div>
    </div>
  );
}
