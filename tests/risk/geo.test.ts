import { distanceKm, bearingDeg, upwindHotspotCount } from '../../src/risk/geo';
test('distance Palangka Raya → Sampit ≈ 112 km', () => {
  expect(distanceKm({ lat: -2.21, lon: 113.92 }, { lat: -2.54, lon: 112.95 })).toBeGreaterThan(100);
  expect(distanceKm({ lat: -2.21, lon: 113.92 }, { lat: -2.54, lon: 112.95 })).toBeLessThan(120);
});
test('bearing due east = 90', () => { expect(Math.round(bearingDeg({ lat: 0, lon: 0 }, { lat: 0, lon: 1 }))).toBe(90); });
test('upwind counts only fires in the wind source sector', () => {
  const s = { lat: 0, lon: 0 };
  const east = { lat: 0, lon: 0.2 }, west = { lat: 0, lon: -0.2 }, far = { lat: 0, lon: 2 };
  expect(upwindHotspotCount(s, [east, west, far], 90)).toBe(1);
});
test('upwind sector wraps around north', () => {
  const s = { lat: 0, lon: 0 };
  expect(upwindHotspotCount(s, [{ lat: 0.2, lon: 0.01 }], 350)).toBe(1);
});
