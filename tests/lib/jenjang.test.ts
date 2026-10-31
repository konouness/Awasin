import { jenjangOf } from '../../src/lib/jenjang';
test('jenjangOf reads the level from the school name', () => {
  expect(jenjangOf('SD NEGERI 1 BARANGGAU')).toBe('SD');
  expect(jenjangOf('MIN 2 Palangka Raya')).toBe('SD');
  expect(jenjangOf('TK PERTIWI')).toBe('TK');
  expect(jenjangOf('RA AL-HIDAYAH')).toBe('TK');
  expect(jenjangOf('SMPN 1 KAPUAS')).toBe('SMP');
  expect(jenjangOf('MTsN 1 Kotawaringin Barat')).toBe('SMP');
  expect(jenjangOf('SMK NEGERI 2 PALANGKA RAYA')).toBe('SMA');
  expect(jenjangOf('MAN KAPUAS')).toBe('SMA');
  expect(jenjangOf('SLB NEGERI 1 PALANGKA RAYA')).toBe('SLB');
  expect(jenjangOf('UNIVERSITAS PALANGKA RAYA')).toBe('PT');
  expect(jenjangOf('IAIN PALANGKA RAYA')).toBe('PT');
  expect(jenjangOf('MASJID')).toBe('SD');
});
