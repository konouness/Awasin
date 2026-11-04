import { LEVEL_COLOR } from '@/lib/status';
import type { Level } from '@/risk/types';

export function Sparkline({ points, levels, label }: { points: number[]; levels: Level[]; label: string }) {
  const n = points.length;
  const max = Math.max(1, ...points);
  const w = 240;
  const h = 48;
  const bw = w / Math.max(1, n);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label={label} preserveAspectRatio="none">
      {points.map((v, i) => {
        const bh = Math.max(3, (v / max) * (h - 2));
        return <rect key={i} className="bar" style={{ ['--i' as string]: i }} x={i * bw + 1} y={h - bh} width={Math.max(1, bw - 2)} height={bh} rx={1.5} fill={LEVEL_COLOR[levels[i]]} />;
      })}
    </svg>
  );
}
