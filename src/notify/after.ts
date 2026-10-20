import 'server-only';
import { createAdmin } from '@/lib/supabase/admin';
import type { SchoolStatus } from '@/pipeline/buildForecasts';
import { HAZARDS, type Level } from '@/risk/types';
import { shouldActivateEmergency, shouldNotify } from './decide';
import { alertText, sendTelegram } from './telegram';

export async function sendToSchool(schoolId: string, text: string) {
  const db = createAdmin();
  const { data: chats } = await db.from('telegram_chats').select('chat_id').eq('school_id', schoolId);
  for (const c of chats ?? []) {
    const r = await sendTelegram(Number(c.chat_id), text).catch(() => 'error' as const);
    if (r === 'blocked') await db.from('telegram_chats').delete().eq('chat_id', c.chat_id);
  }
}

export async function afterStatus(list: SchoolStatus[], onEmergency: (schoolId: string) => Promise<void> = async () => {}) {
  const db = createAdmin();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const ids = list.map((s) => s.school_id);
  const [{ data: schools }, { data: state }, { data: active }] = await Promise.all([
    db.from('schools').select('id, npsn, name').in('id', ids),
    db.from('notify_state').select('school_id, hazard, level').in('school_id', ids),
    db.from('emergencies').select('school_id').is('ended_at', null).in('school_id', ids),
  ]);
  const school = new Map((schools ?? []).map((s) => [s.id, s]));
  const prev = new Map((state ?? []).map((r) => [`${r.school_id}:${r.hazard}`, r.level as Level]));
  const hasActive = new Set((active ?? []).map((e) => e.school_id));
  const upserts: { school_id: string; hazard: string; level: number; updated_at: string }[] = [];
  const errors: string[] = [];

  for (const s of list) {
    const info = school.get(s.school_id);
    if (!info) continue;
    for (const h of HAZARDS) {
      const next = s.levels[h];
      const before = prev.get(`${s.school_id}:${h}`) ?? null;
      if (shouldNotify(before, next)) {
        await sendToSchool(s.school_id, alertText(info.name, info.npsn, h, next, s.action, appUrl)).catch((e) => errors.push(String(e)));
      }
      if (before !== next) upserts.push({ school_id: s.school_id, hazard: h, level: next, updated_at: new Date().toISOString() });
    }
    if (shouldActivateEmergency(s.action, hasActive.has(s.school_id)) && s.hazard) {
      const reason = alertText(info.name, info.npsn, s.hazard, s.levels[s.hazard], s.action, appUrl);
      const { error } = await db.from('emergencies').insert({ school_id: s.school_id, hazard: s.hazard, reason, started_by: 'otomatis' });
      if (!error) await onEmergency(s.school_id).catch((e) => errors.push(String(e)));
      else if (error.code !== '23505') errors.push(error.message);
    }
  }
  if (upserts.length) {
    const { error } = await db.from('notify_state').upsert(upserts);
    if (error) errors.push(error.message);
  }
  if (errors.length) throw new Error(errors.slice(0, 3).join('; '));
}
