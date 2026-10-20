import { vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', 'benar');
const { POST } = await import('../../src/app/api/telegram/route');
test('telegram webhook rejects wrong secret', async () => {
  const res = await POST(new Request('http://x/api/telegram', { method: 'POST', headers: { 'X-Telegram-Bot-Api-Secret-Token': 'salah' }, body: '{}' }));
  expect(res.status).toBe(401);
});
test('telegram webhook ignores updates without a message', async () => {
  const res = await POST(new Request('http://x/api/telegram', { method: 'POST', headers: { 'X-Telegram-Bot-Api-Secret-Token': 'benar' }, body: '{}' }));
  expect(res.status).toBe(200);
});
