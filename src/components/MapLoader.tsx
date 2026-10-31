'use client';
import dynamic from 'next/dynamic';
import type { MapSchool } from './Map';

const SchoolMap = dynamic(() => import('./Map'), { ssr: false, loading: () => <p className="muted" style={{ padding: 16 }}>Memuat peta…</p> });

export function MapLoader({ schools, fires }: { schools: MapSchool[]; fires: [number, number][] }) {
  return <SchoolMap schools={schools} fires={fires} />;
}
