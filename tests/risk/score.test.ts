import { levelAsap, levelBanjir, levelAngin, actionFor, recommend } from '../../src/risk/score';
test('asap ISPU breakpoints', () => {
  expect(levelAsap(55.4, 0)).toBe(0); expect(levelAsap(55.5, 0)).toBe(1);
  expect(levelAsap(150.5, 0)).toBe(2); expect(levelAsap(250.5, 0)).toBe(3);
});
test('asap hotspot boost caps at 3', () => {
  expect(levelAsap(20, 10)).toBe(1); expect(levelAsap(20, 9)).toBe(0); expect(levelAsap(300, 50)).toBe(3);
});
test('banjir BMKG categories', () => {
  expect(levelBanjir(49.9)).toBe(0); expect(levelBanjir(50)).toBe(1);
  expect(levelBanjir(100)).toBe(2); expect(levelBanjir(150)).toBe(3);
});
test('angin gust + thunderstorm floor', () => {
  expect(levelAngin(39, 0)).toBe(0); expect(levelAngin(40, 0)).toBe(1); expect(levelAngin(89, 0)).toBe(3);
  expect(levelAngin(10, 95)).toBe(1); expect(levelAngin(10, 99)).toBe(2); expect(levelAngin(70, 95)).toBe(2);
});
test('actions per hazard', () => {
  expect(actionFor('banjir', 2)).toBe('pulang_awal'); expect(actionFor('asap', 2)).toBe('tunda_masuk');
  expect(actionFor('angin', 0)).toBe('normal');
});
test('recommend takes the heaviest action', () => {
  expect(recommend({ asap: 1, banjir: 2, angin: 0 })).toEqual({ action: 'pulang_awal', hazard: 'banjir' });
  expect(recommend({ asap: 3, banjir: 3, angin: 0 })).toEqual({ action: 'daring', hazard: 'asap' });
  expect(recommend({ asap: 0, banjir: 0, angin: 0 })).toEqual({ action: 'normal', hazard: null });
});

test('wind never asks for daring', () => {
  expect(actionFor('angin', 2)).toBe('tunda_masuk');
  expect(actionFor('angin', 3)).toBe('tunda_masuk');
  expect(recommend({ asap: 0, banjir: 0, angin: 3 })).toEqual({ action: 'tunda_masuk', hazard: 'angin' });
});
