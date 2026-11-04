import Link from 'next/link';
import { MapLoader } from '@/components/MapLoader';
import { ReplayBar } from '@/components/ReplayBar';
import { Topbar } from '@/components/Topbar';
import { badgeHtml, JENJANG_LABEL, jenjangOf, type Jenjang } from '@/lib/jenjang';
import { ACTION_LABEL, LEVEL_COLOR, LEVEL_LABEL } from '@/lib/status';
import { createClient } from '@/lib/supabase/server';
import { formatWIB, isStale } from '@/lib/time';
import { replayDay } from '@/replay/replay';
import { ACTION_ORDER, type Action, type Hazard, type Level } from '@/risk/types';

export const dynamic = 'force-dynamic';

const ACTION_LV: Record<Action, Level> = { normal: 0, kurangi_luar: 1, tunda_masuk: 2, pulang_awal: 2, daring: 3 };

type Row = { npsn: string; name: string; lat: number; lon: number; kabupaten: string; provinsi: string; school_status: { action: Action; levels: Record<Hazard, Level> } | null };

export default async function Home({ searchParams }: { searchParams: Promise<{ putar?: string }> }) {
  const snap = replayDay((await searchParams).putar);
  const q = snap ? `?putar=${snap.day}` : '';
  const db = await createClient();
  const [{ data: schools }, { data: run }, { data: hot }] = await Promise.all([
    db.from('schools').select('npsn, name, lat, lon, kabupaten, provinsi, school_status(action, levels)'),
    db.from('refresh_runs').select('finished_at').eq('ok', true).order('id', { ascending: false }).limit(1).maybeSingle(),
    db.from('hotspots').select('points').eq('id', 1).maybeSingle(),
  ]);
  const fires = snap ? snap.fires : ((hot?.points ?? []) as [number, number][]);
  const rows = ((schools ?? []) as unknown as Row[]).map((s) => {
    const st = snap ? (snap.schools[s.npsn]?.status ?? null) : s.school_status;
    const lv = st?.levels;
    const level = (lv ? Math.max(lv.asap, lv.banjir, lv.angin) : 0) as Level;
    const action = st?.action ?? 'normal';
    return { ...s, level, action, actionLabel: ACTION_LABEL[action] };
  });
  rows.sort((a, b) => ACTION_ORDER.indexOf(b.action) - ACTION_ORDER.indexOf(a.action) || b.level - a.level || a.name.localeCompare(b.name));
  const updated = snap ? snap.at : run?.finished_at;
  const stale = !snap && isStale(run?.finished_at ?? null, new Date());
  const counts = ACTION_ORDER.map((a) => [a, rows.filter((r) => r.action === a).length] as const).filter(([, n]) => n > 0);

  return (
    <div className="map-page">
      <Topbar />
      <div className="map-layout">
        <div className="map-box">
          <MapLoader schools={rows.map(({ npsn, name, lat, lon, level, actionLabel }) => ({ npsn, name, lat, lon, level, actionLabel, href: `/sekolah/${npsn}${q}` }))} fires={fires} />
        </div>
        <aside className="side stack enter">
          <ReplayBar active={snap?.day ?? null} base="/" at={snap?.at} />
          <h1>Apa yang sebaiknya dilakukan hari ini</h1>
          <p className="muted">
            {rows.length} lokasi sekolah di {new Set(rows.map((r) => r.provinsi)).size} provinsi, prakiraan 6 jam ke depan.
            {updated ? ` Diperbarui ${formatWIB(updated)}.` : ''}
          </p>
          {stale && (
            <p className="banner" role="status">
              Data belum diperbarui sejak {run?.finished_at ? formatWIB(run.finished_at) : 'awal'}. Status di bawah mungkin sudah berubah.
            </p>
          )}
          <div className="board" aria-hidden="true">
            {[...counts].reverse().map(([a, n]) => (
              <div key={a} className={`lvl-${ACTION_LV[a]}`}>
                <span className="count" style={{ ['--n' as string]: n }} />
                {ACTION_LABEL[a]}
              </div>
            ))}
          </div>
          <p className="small">{counts.map(([a, n]) => `${n} ${ACTION_LABEL[a].toLowerCase()}`).join(', ')}</p>
          <div className="legend" aria-label="Arti warna cincin">
            {([0, 1, 2, 3] as Level[]).map((l) => (
              <span key={l} className={`plate lvl-${l}`}>{LEVEL_LABEL[l]}</span>
            ))}
            <span className="lv"><span className="dot fire" />{fires.length} titik panas (48 jam)</span>
          </div>
          <p className="small muted">Titik panas adalah area yang terdeteksi satelit lebih panas dari sekitarnya. Bisa kebakaran hutan atau lahan, tetapi bisa juga pabrik, PLTU, atau pembakaran sampah.</p>
          <div className="legend" aria-label="Jenjang sekolah">
            {(Object.keys(JENJANG_LABEL) as Jenjang[]).map((j) => (
              <span key={j} className="lv" dangerouslySetInnerHTML={{ __html: badgeHtml(j, 'transparent') + JENJANG_LABEL[j] }} />
            ))}
          </div>
          <ol>
            {rows.map((s) => (
              <li key={s.npsn} className={`lvl-${s.level}`}>
                <Link href={`/sekolah/${s.npsn}${q}`}>
                  <span dangerouslySetInnerHTML={{ __html: badgeHtml(jenjangOf(s.name), LEVEL_COLOR[s.level]) }} />
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
