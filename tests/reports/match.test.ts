import { matchReport } from '../../src/reports/match';
test('match rules', () => {
  expect(matchReport(2, 0)).toBe('tidak_terdeteksi');
  expect(matchReport(0, 2)).toBe('tidak_terkonfirmasi');
  expect(matchReport(0, 1)).toBe('cocok');
  expect(matchReport(3, 2)).toBe('cocok');
});
