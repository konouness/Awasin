'use client';
import dynamic from 'next/dynamic';
import type { MapSchool } from './Map';

const SchoolMap = dynamic(() => import('./Map'), { ssr: false, loading: () => <div className="skel map-skel"><span>Memuat peta…</span></div> });

export function MapLoader({ schools, fires }: { schools: MapSchool[]; fires: [number, number][] }) {
  return <SchoolMap schools={schools} fires={fires} />;
}
