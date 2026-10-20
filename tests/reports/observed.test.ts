import { observedLevel } from '../../src/reports/observed';
test('asap visibility thresholds and smell floor', () => {
  expect(observedLevel({ hazard: 'asap', visibility_m: 150 })).toBe(3);
  expect(observedLevel({ hazard: 'asap', visibility_m: 800 })).toBe(1);
  expect(observedLevel({ hazard: 'asap', visibility_m: 5000, smoke_smell: true })).toBe(1);
  expect(observedLevel({ hazard: 'asap', visibility_m: null })).toBe(0);
});
test('banjir water depth', () => {
  expect(observedLevel({ hazard: 'banjir', water_depth_cm: 9 })).toBe(0);
  expect(observedLevel({ hazard: 'banjir', water_depth_cm: 30 })).toBe(2);
  expect(observedLevel({ hazard: 'banjir', water_depth_cm: 50 })).toBe(3);
});
test('angin felt', () => { expect(observedLevel({ hazard: 'angin', wind_felt: 'merusak' })).toBe(2); });
