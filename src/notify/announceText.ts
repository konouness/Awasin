import { HAZARD_LABEL } from '@/lib/status';
import type { Hazard } from '@/risk/types';

export function announcementText(schoolName: string, npsn: string, hazard: Hazard | null, reason: string, appUrl: string): string {
  return [
    `📢 ${schoolName}: Belajar daring mulai sekarang.`,
    `Penyebab: ${hazard ? HAZARD_LABEL[hazard] + '. ' : ''}${reason}`,
    `Absen kesehatan harian: ${appUrl}/s/${npsn}/absen`,
  ].join('\n');
}
