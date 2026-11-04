import { ACTION_LABEL, HAZARD_LABEL } from '@/lib/status';
import type { Action, Hazard, Level } from '@/risk/types';

export function parseStartCommand(text: string): string | null {
  const m = /^\/start(?:@\w+)?\s+(\w{4,20})\s*$/.exec(text.trim());
  return m ? m[1] : null;
}

export function commandOf(text: string): string | null {
  const m = /^\/(\w+)(?:@\w+)?(?:\s|$)/.exec(text.trim());
  return m ? m[1].toLowerCase() : null;
}

export const HELP_TEXT = [
  'Awasin mengirim peringatan asap dan titik panas di sekitar sekolah.',
  '',
  'Cara berlangganan: buka halaman sekolah di Awasin lalu tekan "Ikuti di Telegram".',
  '',
  '/status — lihat sekolah yang Anda ikuti',
  '/unfollow — berhenti menerima peringatan',
  '/help — tampilkan pesan ini',
].join('\n');

export function alertText(schoolName: string, npsn: string, hazard: Hazard, level: Level, action: Action, appUrl: string): string {
  return `⚠️ Sekitar ${schoolName}: ${HAZARD_LABEL[hazard]} level ${level}. Rekomendasi: ${ACTION_LABEL[action]}. Detail: ${appUrl}/sekolah/${npsn}`;
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
