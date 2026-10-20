import { announcementText } from '../../src/notify/announceText';
test('announcement carries both links and the cause', () => {
  const t = announcementText('SDN 1 Palangka Raya', '30201234', 'asap', 'PM2.5 sangat tidak sehat', 'https://x.app');
  expect(t).toContain('Belajar daring'); expect(t).toContain('https://x.app/s/30201234/tugas');
  expect(t).toContain('https://x.app/s/30201234/absen'); expect(t).toContain('PM2.5 sangat tidak sehat');
});
