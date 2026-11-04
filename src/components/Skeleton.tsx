import type { CSSProperties } from 'react';

export function TopbarShell() {
  return (
    <header className="topbar">
      <span className="brand"><span className="mark" aria-hidden="true" />Awasin</span>
    </header>
  );
}

export function Bone({ h, w, className }: { h: number | string; w?: number | string; className?: string }) {
  const style: CSSProperties = { height: h, width: w };
  return <div className={className ? `skel ${className}` : 'skel'} style={style} aria-hidden="true" />;
}
