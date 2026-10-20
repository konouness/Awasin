import 'server-only';
import { createAdmin } from '@/lib/supabase/admin';
import type { Hazard } from '@/risk/types';
import { sendToSchool } from './after';
import { announcementText } from './announceText';

export async function announceEmergency(schoolId: string): Promise<void> {
  const db = createAdmin();
  const [{ data: school }, { data: em }] = await Promise.all([
    db.from('schools').select('npsn, name').eq('id', schoolId).single(),
    db.from('emergencies').select('hazard, reason').eq('school_id', schoolId).is('ended_at', null).maybeSingle(),
  ]);
  if (!school || !em) return;
  await sendToSchool(schoolId, announcementText(school.name, school.npsn, em.hazard as Hazard | null, em.reason, process.env.NEXT_PUBLIC_APP_URL ?? ''));
}
