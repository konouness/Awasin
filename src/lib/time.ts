const TZ = 'Asia/Jakarta';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function partsWIB(d: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return { y: p.year, m: p.month, d: p.day, h: p.hour, min: p.minute };
}

export function todayWIB(now: Date): string {
  const p = partsWIB(now);
  return `${p.y}-${p.m}-${p.d}`;
}

export function formatWIB(iso: string): string {
  const p = partsWIB(new Date(iso));
  return `${Number(p.d)} ${MONTHS[Number(p.m) - 1]} ${p.h}.${p.min} WIB`;
}

export function hourWIB(iso: string): string {
  return partsWIB(new Date(iso)).h;
}

export function isStale(fetchedAt: string | null, now: Date, maxAgeMin = 120): boolean {
  if (!fetchedAt) return true;
  return now.getTime() - Date.parse(fetchedAt) > maxAgeMin * 60_000;
}
