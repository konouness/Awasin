export type Jenjang = 'TK' | 'SD' | 'SMP' | 'SMA' | 'SLB' | 'PT';

const RULES: [Jenjang, RegExp][] = [
  ['PT', /^(UNIVERSITAS|INSTITUT|POLITEKNIK|SEKOLAH TINGGI|AKADEMI|STIKES|STIE|STAI|STKIP|STT|STIH|IAIN|UIN|IAKN|IAHN)\b/],
  ['SLB', /^SLB\b/],
  ['SMA', /^(SMA|SMAN|SMAS|SMALB|SMK|SMKN|SMKS|MA|MAN|MAS|MAK)\b/],
  ['SMP', /^(SMP|SMPN|SMPS|SMPLB|MTS|MTSN|MTSS)\b/],
  ['SD', /^(SD|SDN|SDS|SDLB|MI|MIN|MIS)\b/],
  ['TK', /^(TK|TKN|TKS|RA|BA|KB|PAUD|TPA|SPS)\b/],
];

export function jenjangOf(name: string): Jenjang {
  const n = name.trim().toUpperCase();
  return RULES.find(([, re]) => re.test(n))?.[0] ?? 'SD';
}

export const JENJANG_LABEL: Record<Jenjang, string> = {
  TK: 'TK / RA / PAUD',
  SD: 'SD / MI',
  SMP: 'SMP / MTs',
  SMA: 'SMA / SMK / MA',
  SLB: 'SLB',
  PT: 'Perguruan tinggi',
};

export const JENJANG_COLOR: Record<Jenjang, string> = {
  TK: '#8e24aa',
  SD: '#00838f',
  SMP: '#283593',
  SMA: '#546e7a',
  SLB: '#6d4c41',
  PT: '#212121',
};

export function badgeHtml(j: Jenjang, ring: string): string {
  return `<span class="badge" style="--tier:${JENJANG_COLOR[j]};--ring:${ring}">${j}</span>`;
}
