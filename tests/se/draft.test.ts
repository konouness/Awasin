import { askGemini, kabTotals, sePrompt, toOverview, type Overview } from '../../src/se/draft';
const base = { hazard: null, levels: null };
const fixtureRows: Overview[] = [
  { ...base, school_id: '1', npsn: '1', name: 'SDN 1 Palangka Raya', kabupaten: 'Palangka Raya', action: 'daring', hazard: 'asap' },
  { ...base, school_id: '2', npsn: '2', name: 'SMPN 2 Palangka Raya', kabupaten: 'Palangka Raya', action: 'tunda_masuk' },
  { ...base, school_id: '3', npsn: '3', name: 'SDN 1 Kapuas', kabupaten: 'Kapuas', action: 'normal' },
];
test('totals group by kabupaten and carry no names', () => {
  const t = kabTotals(fixtureRows);
  expect(t.map((x) => x.kabupaten)).toEqual(['Kapuas', 'Palangka Raya']);
  expect(t[1]).toEqual({ kabupaten: 'Palangka Raya', schools: 2, byAction: { normal: 0, kurangi_luar: 0, tunda_masuk: 1, pulang_awal: 0, daring: 1 } });
  const p = sePrompt(t[1], '2026-08-09');
  expect(p).not.toContain('SDN 1 Palangka Raya');
  for (const w of ['Laporan', 'sakit', 'mode belajar daring']) expect(p).not.toContain(w);
});
test('toOverview maps the schools select and defaults a missing status', () => {
  const levels = { asap: 3, banjir: 0, angin: 0 } as const;
  expect(toOverview({ id: 'a', npsn: '1', name: 'N', kabupaten: 'K', school_status: { action: 'daring', hazard: 'asap', levels } }))
    .toEqual({ school_id: 'a', npsn: '1', name: 'N', kabupaten: 'K', action: 'daring', hazard: 'asap', levels });
  expect(toOverview({ id: 'b', npsn: '2', name: 'M', kabupaten: 'K', school_status: null }))
    .toEqual({ school_id: 'b', npsn: '2', name: 'M', kabupaten: 'K', action: 'normal', hazard: null, levels: null });
});
test('gemini failure returns null', async () => {
  process.env.GEMINI_API_KEY = 'k';
  expect(await askGemini('x', async () => new Response('busy', { status: 503 }))).toBeNull();
  expect(await askGemini('x', async () => { throw new Error('net'); })).toBeNull();
});
test('gemini success returns the text', async () => {
  process.env.GEMINI_API_KEY = 'k';
  const body = { candidates: [{ content: { parts: [{ text: 'SURAT EDARAN' }] } }] };
  expect(await askGemini('x', async () => new Response(JSON.stringify(body), { status: 200 }))).toBe('SURAT EDARAN');
});
test('missing key returns null without calling', async () => {
  delete process.env.GEMINI_API_KEY;
  let called = false;
  expect(await askGemini('x', async () => { called = true; return new Response('{}'); })).toBeNull();
  expect(called).toBe(false);
});
