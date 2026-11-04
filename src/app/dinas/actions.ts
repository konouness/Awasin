'use server';
import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { todayWIB } from '@/lib/time';
import { askGemini, kabTotals, overviewSelect, sePrompt, toOverview, type SchoolRow } from '@/se/draft';

const UNAVAILABLE = 'Draf AI tidak tersedia, coba lagi nanti.' as const;

const cachedDraft = unstable_cache(
  async (prompt: string) => {
    const text = await askGemini(prompt);
    if (!text) throw new Error('gemini');
    return text;
  },
  ['se-draft'],
  { revalidate: 21600 },
);

export async function draftSE(kabupaten: string): Promise<{ ok: true; text: string } | { ok: false; text: typeof UNAVAILABLE }> {
  const today = todayWIB(new Date());
  const db = await createClient();
  const { data } = await db.from('schools').select(overviewSelect);
  const t = kabTotals(((data ?? []) as unknown as SchoolRow[]).map(toOverview)).find((x) => x.kabupaten === kabupaten);
  if (!t) return { ok: false, text: UNAVAILABLE };
  try {
    return { ok: true, text: await cachedDraft(sePrompt(t, today)) };
  } catch {
    return { ok: false, text: UNAVAILABLE };
  }
}
