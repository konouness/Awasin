import type { Metadata, Viewport } from 'next';
import { Archivo, Atkinson_Hyperlegible } from 'next/font/google';
import './globals.css';

const sign = Archivo({ subsets: ['latin'], variable: '--font-sign', axes: ['wdth'] });
const body = Atkinson_Hyperlegible({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Awasin',
  description: 'Peringatan dini asap, banjir, dan angin kencang untuk sekolah di Kalimantan Tengah.',
};

export const viewport: Viewport = { themeColor: '#17221f', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${sign.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
