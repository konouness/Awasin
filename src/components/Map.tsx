'use client';
import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { LEVEL_COLOR } from '@/lib/status';
import type { Level } from '@/risk/types';

export type MapSchool = { npsn: string; name: string; lat: number; lon: number; level: Level; actionLabel: string };

export default function SchoolMap({ schools }: { schools: MapSchool[] }) {
  return (
    <MapContainer center={[-1.9, 113.4]} zoom={7} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · Weather data by <a href="https://open-meteo.com/">Open-Meteo.com</a> · Fire data: NASA FIRMS'
        maxZoom={18}
      />
      {schools.map((s) => (
        <CircleMarker
          key={s.npsn}
          center={[s.lat, s.lon]}
          radius={s.level >= 2 ? 11 : 8}
          pathOptions={{ color: '#17221f', weight: 1.5, fillColor: LEVEL_COLOR[s.level], fillOpacity: 0.95 }}
        >
          <Popup>
            <strong>{s.name}</strong>
            <br />
            {s.actionLabel}
            <br />
            <a href={`/sekolah/${s.npsn}`}>Lihat detail sekolah</a>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
