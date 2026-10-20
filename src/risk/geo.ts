import type { Point } from './types';

const rad = (d: number) => (d * Math.PI) / 180;

export function distanceKm(a: Point, b: Point): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function bearingDeg(from: Point, to: Point): number {
  const y = Math.sin(rad(to.lon - from.lon)) * Math.cos(rad(to.lat));
  const x = Math.cos(rad(from.lat)) * Math.sin(rad(to.lat)) - Math.sin(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.cos(rad(to.lon - from.lon));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function upwindHotspotCount(school: Point, hotspots: Point[], windFromDeg: number, radiusKm = 50, toleranceDeg = 45): number {
  let n = 0;
  for (const h of hotspots) {
    if (distanceKm(school, h) > radiusKm) continue;
    const diff = Math.abs(((bearingDeg(school, h) - windFromDeg + 540) % 360) - 180);
    if (diff <= toleranceDeg) n++;
  }
  return n;
}
