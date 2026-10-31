import { askGemini, kabTotals, sePrompt, type Overview } from '../../src/se/draft';
const base = { hazard: null, levels: null, reports_today: 0, sick_reported: 0, sick_checkins: 0, emergency_active: false };
const fixtureRows: Overview[] = [
  { ...base, school_id: '1', npsn: '1', name: 'SDN 1 Palangka Raya', kabupaten: 'Palangka Raya', action: 'daring', hazard: 'asap', reports_today: 2, sick_reported: 3, sick_checkins: 2, emergency_active: true },
  { ...base, school_id: '2', npsn: '2', name: 'SMPN 2 Palangka Raya', kabupaten: 'Palangka Raya', action: 'tunda_masuk' },
  { ...base, school_id: '3', npsn: '3', name: 'SDN 1 Kapuas', kabupaten: 'Kapuas', action: 'normal' },
];
test('totals group by kabupaten and carry no names', () => {
  const t = kabTotals(fixtureRows);
  expect(t.map((x) => x.kabupaten)).toEqual(['Kapuas', 'Palangka Raya']);
  expect(t[1].byAction.daring).toBe(1); expect(t[1].sick).toBe(5);
  expect(t[1].schools).toBe(2); expect(t[1].emergencies).toBe(1); expect(t[1].reports).toBe(2);
  expect(sePrompt(t[1], '2026-08-09')).not.toContain('SDN 1 Palangka Raya');
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
