'use server';
import { revalidatePath } from 'next/cache';
import { createAdmin } from '@/lib/supabase/admin';
import { createClient, getSessionProfile } from '@/lib/supabase/server';
import { announceEmergency } from '@/notify/announce';

async function ownSchool(npsn: string) {
  const me = await getSessionProfile();
  if (!me || me.role !== 'sekolah' || !me.school_id) throw new Error('Hanya akun sekolah ini yang bisa mengubah mode darurat');
  const db = await createClient();
  const { data } = await db.from('schools').select('id, npsn').eq('npsn', npsn).single();
  if (!data || data.id !== me.school_id) throw new Error('Hanya akun sekolah ini yang bisa mengubah mode darurat');
  return { db, schoolId: data.id };
}

export async function startEmergency(npsn: string) {
  const { schoolId } = await ownSchool(npsn);
  const admin = createAdmin();
  const { error } = await admin.from('emergencies').insert({ school_id: schoolId, hazard: null, reason: 'Diaktifkan oleh sekolah', started_by: 'sekolah' });
  if (!error) await announceEmergency(schoolId).catch(() => {});
  revalidatePath(`/sekolah/${npsn}`);
}

export async function endEmergency(npsn: string) {
  const { db, schoolId } = await ownSchool(npsn);
  await db.from('emergencies').update({ ended_at: new Date().toISOString() }).eq('school_id', schoolId).is('ended_at', null);
  revalidatePath(`/sekolah/${npsn}`);
}

export async function addTask(npsn: string, form: FormData) {
  const { db, schoolId } = await ownSchool(npsn);
  const { data: em } = await db.from('emergencies').select('id').eq('school_id', schoolId).is('ended_at', null).maybeSingle();
  if (!em) return;
  const title = String(form.get('title') ?? '').trim().slice(0, 200);
  const url = String(form.get('url') ?? '').trim();
  const body = String(form.get('body') ?? '').trim().slice(0, 2000);
  if (!title) return;
  await db.from('tasks').insert({ school_id: schoolId, emergency_id: em.id, title, url: /^https?:\/\//.test(url) ? url : null, body: body || null });
  revalidatePath(`/sekolah/${npsn}`);
}

export async function deleteTask(npsn: string, id: string) {
  const { db } = await ownSchool(npsn);
  await db.from('tasks').delete().eq('id', id);
  revalidatePath(`/sekolah/${npsn}`);
}
