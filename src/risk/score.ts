import { ACTION_ORDER, HAZARDS, type Action, type Hazard, type Level } from './types';

const step = (value: number, cuts: [number, number, number]): Level =>
  (value >= cuts[2] ? 3 : value >= cuts[1] ? 2 : value >= cuts[0] ? 1 : 0) as Level;

const cap = (n: number): Level => Math.min(3, n) as Level;

export function levelAsap(pm25: number, upwindHotspots: number): Level {
  const base = step(pm25, [55.5, 150.5, 250.5]);
  return cap(base + (upwindHotspots >= 10 ? 1 : 0));
}

export function levelBanjir(rain24hMm: number): Level {
  return step(rain24hMm, [50, 100, 150]);
}

export function levelAngin(gustKmh: number, weatherCode: number): Level {
  const floor = weatherCode === 96 || weatherCode === 99 ? 2 : weatherCode === 95 ? 1 : 0;
  return Math.max(step(gustKmh, [40, 62, 89]), floor) as Level;
}

const ACTIONS: Record<Hazard, [Action, Action, Action, Action]> = {
  asap: ['normal', 'tunda_masuk', 'daring', 'daring'],
  banjir: ['normal', 'kurangi_luar', 'pulang_awal', 'daring'],
  angin: ['normal', 'kurangi_luar', 'tunda_masuk', 'tunda_masuk'],
};

export function actionFor(hazard: Hazard, level: Level): Action {
  return ACTIONS[hazard][level];
}

export function recommend(levels: Record<Hazard, Level>): { action: Action; hazard: Hazard | null } {
  let best: { action: Action; hazard: Hazard | null } = { action: 'normal', hazard: null };
  for (const h of HAZARDS) {
    const a = actionFor(h, levels[h]);
    if (ACTION_ORDER.indexOf(a) > ACTION_ORDER.indexOf(best.action)) best = { action: a, hazard: h };
  }
  return best;
}
