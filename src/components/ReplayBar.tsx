import Link from 'next/link';
import { formatWIB } from '@/lib/time';
import { REPLAY_DAYS } from '@/replay/days';

const LABEL: Record<(typeof REPLAY_DAYS)[number], string> = { '2026-08-09': 'Putar ulang: 9 Agu', '2026-08-10': '10 Agu', '2026-08-11': '11 Agu 2026' };

export function ReplayBar({ active, base, at }: { active: string | null; base: string; at?: string }) {
  return (
    <div className="stack">
      <nav className="chips" aria-label="Pilih waktu data">
        <Link href={base} aria-current={active ? undefined : 'page'}>Langsung</Link>
        {REPLAY_DAYS.map((d) => (
          <Link key={d} href={`${base}?putar=${d}`} aria-current={active === d ? 'page' : undefined}>{LABEL[d]}</Link>
        ))}
      </nav>
      {active && at && (
        <p className="banner" role="status">Data historis: kondisi {formatWIB(at)}. Bukan data hari ini.</p>
      )}
    </div>
  );
}
