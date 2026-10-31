import { ACTION_LABEL } from '@/lib/status';
import { ACTION_ORDER, type Action, type Hazard, type Level } from '@/risk/types';

export type Overview = { school_id: string; npsn: string; name: string; kabupaten: string; action: Action; hazard: Hazard | null; levels: Record<Hazard, Level> | null; reports_today: number; sick_reported: number; sick_checkins: number; emergency_active: boolean };

export type KabTotals = { kabupaten: string; schools: number; byAction: Record<Action, number>; reports: number; sick: number; emergencies: number };

export const MODEL = 'gemini-flash-lite-latest';

export function kabTotals(rows: Overview[]): KabTotals[] {
  const map = new Map<string, KabTotals>();
  for (const r of rows) {
    const t = map.get(r.kabupaten) ?? { kabupaten: r.kabupaten, schools: 0, byAction: Object.fromEntries(ACTION_ORDER.map((a) => [a, 0])) as Record<Action, number>, reports: 0, sick: 0, emergencies: 0 };
    t.schools += 1;
    t.byAction[r.action] += 1;
    t.reports += r.reports_today;
    t.sick += r.sick_reported + r.sick_checkins;
    if (r.emergency_active) t.emergencies += 1;
    map.set(r.kabupaten, t);
  }
  return [...map.values()].sort((a, b) => a.kabupaten.localeCompare(b.kabupaten));
}

export function sePrompt(t: KabTotals, date: string): string {
  const actions = ACTION_ORDER.filter((a) => t.byAction[a] > 0).map((a) => `- ${ACTION_LABEL[a]}: ${t.byAction[a]} sekolah`).join('\n');
  return [
    `Susun draf surat edaran resmi dalam Bahasa Indonesia dari Kepala Dinas Pendidikan kepada seluruh kepala sekolah di ${t.kabupaten}, tertanggal ${date}, tentang penyesuaian kegiatan belajar akibat kondisi cuaca dan kabut asap.`,
    'Gunakan hanya angka berikut. Jangan menambah angka, nama sekolah, nama orang, atau nomor surat. Tulis nomor surat sebagai [nomor].',
    `Jumlah sekolah dipantau: ${t.schools}`,
    'Rekomendasi Awasin hari ini:',
    actions,
    `Laporan lapangan hari ini: ${t.reports}`,
    `Siswa dilaporkan sakit hari ini: ${t.sick}`,
    `Sekolah dalam mode belajar daring: ${t.emergencies}`,
    'Struktur: kop singkat, perihal, dasar pertimbangan, instruksi bernomor, penutup, tempat untuk tanda tangan [nama Kepala Dinas]. Maksimal 350 kata. Tanpa markdown.',
  ].join('\n');
}

type Gemini = { candidates?: { content?: { parts?: { text?: string }[] } }[] };

export async function askGemini(prompt: string, fetchFn: typeof fetch = fetch): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetchFn(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(55_000),
    });
    if (res.status !== 200) return null;
    const data = (await res.json()) as Gemini;
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim();
    return text || null;
  } catch {
    return null;
  }
}
