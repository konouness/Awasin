import { createAdmin } from '@/lib/supabase/admin';
import { commandOf, HELP_TEXT, parseStartCommand, sendTelegram } from '@/notify/telegram';

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

  const db = createAdmin();
  if (commandOf(text) === 'unfollow') {
    const { data: gone } = await db.from('telegram_chats').delete().eq('chat_id', chatId).select('chat_id');
    const reply = gone?.length ? 'Berhenti berlangganan. Anda tidak akan menerima peringatan lagi.' : 'Anda belum mengikuti sekolah mana pun.';
    await sendTelegram(chatId, reply).catch(() => {});
    return Response.json({ ok: true });
  }
  if (commandOf(text) === 'status') {
    const { data: row } = await db.from('telegram_chats').select('schools(name, npsn)').eq('chat_id', chatId).maybeSingle();
    const school = row?.schools as { name: string; npsn: string } | null | undefined;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const reply = school
      ? `Anda mengikuti ${school.name}. Detail: ${appUrl}/sekolah/${school.npsn}\nKetik /unfollow untuk berhenti.`
      : 'Anda belum mengikuti sekolah mana pun. Ketik /help untuk cara berlangganan.';
    await sendTelegram(chatId, reply).catch(() => {});
    return Response.json({ ok: true });
  }
  const npsn = parseStartCommand(text);
  if (!npsn) {
    await sendTelegram(chatId, HELP_TEXT).catch(() => {});
    return Response.json({ ok: true });
  }
  const { data: school } = await db.from('schools').select('id, name').eq('npsn', npsn).maybeSingle();
  if (!school) {
    await sendTelegram(chatId, 'Kode sekolah tidak ditemukan.').catch(() => {});
    return Response.json({ ok: true });
  }
  const { data: prev } = await db.from('telegram_chats').select('school_id, schools(name)').eq('chat_id', chatId).maybeSingle();
  await db.from('telegram_chats').upsert({ chat_id: chatId, school_id: school.id });
  const prevName = (prev?.schools as { name: string } | null | undefined)?.name;
  const replaced = prev && prev.school_id !== school.id && prevName ? ` (menggantikan ${prevName}; satu chat hanya bisa mengikuti satu sekolah)` : '';
  await sendTelegram(chatId, `Terdaftar untuk sekitar ${school.name}${replaced}. Kami kirim pesan saat risiko naik.`).catch(() => {});
  return Response.json({ ok: true });
}
