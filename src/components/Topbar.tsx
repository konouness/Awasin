import Link from 'next/link';

export function Topbar() {
  return (
    <header className="topbar">
      <Link href="/" className="brand"><span className="mark" aria-hidden="true" />Awasin</Link>
      <nav aria-label="Menu utama">
        <Link href="/dinas">Dasbor dinas</Link>
      </nav>
    </header>
  );
}
