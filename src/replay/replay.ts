import data from './data.json';
import { REPLAY_DAYS } from './days';
import type { Snapshot } from './snapshot';

export { REPLAY_DAYS };

const snapshots = data as unknown as Record<string, Snapshot>;

export function replayDay(param: string | undefined): Snapshot | null {
  if (!param || !(REPLAY_DAYS as readonly string[]).includes(param)) return null;
  return snapshots[param] ?? null;
}
