'use server';
import { createClient, getSessionProfile } from '@/lib/supabase/server';
import { todayWIB } from '@/lib/time';
import { askGemini, kabTotals, sePrompt, type Overview } from '@/se/draft';

const UNAVAILABLE = 'Draf AI tidak tersedia, coba lagi nanti.' as const;

export async function draftSE(kabupaten: string): Promise<{ ok: true; text: string } | { ok: false; text: typeof UNAVAILABLE }> {
  const me = await getSessionProfile();
  if (!me || me.role !== 'dinas') return { ok: false, text: UNAVAILABLE };
  const today = todayWIB(new Date());
  const db = await createClient();
  const { data } = await db.rpc('dinas_overview', { p_date: today });
  const t = kabTotals((data ?? []) as Overview[]).find((x) => x.kabupaten === kabupaten);
  if (!t) return { ok: false, text: UNAVAILABLE };
  const text = await askGemini(sePrompt(t, today));
  return text ? { ok: true, text } : { ok: false, text: UNAVAILABLE };
}
