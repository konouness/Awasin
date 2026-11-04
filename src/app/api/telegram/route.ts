import { createAdmin } from '@/lib/supabase/admin';
import { parseStartCommand, sendTelegram } from '@/notify/telegram';

export const dynamic = 'force-dynamic';

type Update = { message?: { chat?: { id?: number }; text?: string } };

export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || req.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const update = (await req.json().catch(() => ({}))) as Update;
  const chatId = update.message?.chat?.id;
  const text = update.message?.text;
  if (!chatId || !text) return Response.json({ ok: true });

  const npsn = parseStartCommand(text);
  if (!npsn) {
    await sendTelegram(chatId, 'Buka halaman sekolah di Awasin lalu tekan "Ikuti di Telegram" untuk berlangganan peringatan.').catch(() => {});
    return Response.json({ ok: true });
  }
  const db = createAdmin();
  const { data: school } = await db.from('schools').select('id, name').eq('npsn', npsn).maybeSingle();
  if (!school) {
    await sendTelegram(chatId, 'Kode sekolah tidak ditemukan.').catch(() => {});
    return Response.json({ ok: true });
  }
  await db.from('telegram_chats').upsert({ chat_id: chatId, school_id: school.id });
  await sendTelegram(chatId, `Terdaftar untuk sekitar ${school.name}. Kami kirim pesan saat risiko naik.`).catch(() => {});
  return Response.json({ ok: true });
}
