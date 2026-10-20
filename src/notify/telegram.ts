import { ACTION_LABEL, HAZARD_LABEL } from '@/lib/status';
import type { Action, Hazard, Level } from '@/risk/types';

export function parseStartCommand(text: string): string | null {
  const m = /^\/start(?:@\w+)?\s+(\w{4,20})\s*$/.exec(text.trim());
  return m ? m[1] : null;
}

export function alertText(schoolName: string, npsn: string, hazard: Hazard, level: Level, action: Action, appUrl: string): string {
  return `⚠️ ${schoolName}: ${HAZARD_LABEL[hazard]} level ${level}. Rekomendasi: ${ACTION_LABEL[action]}. Detail: ${appUrl}/sekolah/${npsn}`;
}

export async function sendTelegram(chatId: number, text: string): Promise<'ok' | 'blocked'> {
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (res.status === 403) return 'blocked';
  if (!res.ok) throw new Error(`Telegram ${res.status}`);
  return 'ok';
}
