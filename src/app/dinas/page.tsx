import Link from 'next/link';
import { Topbar } from '@/components/Topbar';
import { ACTION_LABEL, HAZARD_LABEL } from '@/lib/status';
import { createClient } from '@/lib/supabase/server';
import { todayWIB } from '@/lib/time';
import { ACTION_ORDER, type Level } from '@/risk/types';
import { overviewSelect, toOverview, type SchoolRow } from '@/se/draft';
import { SeDraft } from './SeDraft';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export default async function DinasPage() {
  const db = await createClient();
  const today = todayWIB(new Date());
  const { data } = await db.from('schools').select(overviewSelect);
  const rows = ((data ?? []) as unknown as SchoolRow[]).map(toOverview).sort(
    (a, b) => ACTION_ORDER.indexOf(b.action) - ACTION_ORDER.indexOf(a.action) || a.name.localeCompare(b.name),
  );

  return (
    <>
      <Topbar />
      <main className="wrap stack enter" style={{ maxWidth: 1100 }}>
        <h1>Dasbor dinas</h1>
        <p className="muted">Hari ini, {today}. Diurutkan dari tindakan paling berat.</p>
        <div className="table-box">
          <table>
            <thead>
              <tr><th>Sekolah</th><th>Rekomendasi</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const lv = r.levels ? (Math.max(r.levels.asap, r.levels.banjir, r.levels.angin) as Level) : 0;
                return (
                  <tr key={r.school_id} className={`lvl-${lv}`}>
                    <td><Link href={`/sekolah/${r.npsn}`}>{r.name}</Link><br /><span className="small muted">{r.kabupaten}</span></td>
                    <td><span className="plate">{ACTION_LABEL[r.action]}</span>{r.hazard && <><br /><span className="small muted">{HAZARD_LABEL[r.hazard]}</span></>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <SeDraft kabupaten={[...new Set(rows.map((r) => r.kabupaten))].sort((a, b) => a.localeCompare(b))} />
      </main>
    </>
  );
}
