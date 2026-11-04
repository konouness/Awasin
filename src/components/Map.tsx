'use client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { CircleMarker, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { badgeHtml, jenjangOf } from '@/lib/jenjang';
import { mapView } from '@/lib/mapView';
import { LEVEL_COLOR } from '@/lib/status';
import type { Level } from '@/risk/types';

export type MapSchool = { npsn: string; name: string; lat: number; lon: number; level: Level; actionLabel: string; href: string };

export const FIRE_COLOR = '#ff3d00';
const canvas = L.canvas();
const icon = (s: MapSchool) => L.divIcon({ html: badgeHtml(jenjangOf(s.name), LEVEL_COLOR[s.level]), className: s.level === 3 ? 'badge-icon pulse' : 'badge-icon', iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -16] });

export default function SchoolMap({ schools, fires }: { schools: MapSchool[]; fires: [number, number][] }) {
  return (
    <MapContainer {...mapView(schools)} boundsOptions={{ padding: [24, 24] }} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · Weather data by <a href="https://open-meteo.com/">Open-Meteo.com</a> · Fire data: NASA FIRMS'
        maxZoom={18}
      />
      {fires.map(([lat, lon], i) => (
        <CircleMarker key={i} center={[lat, lon]} radius={4} renderer={canvas} interactive={false} pathOptions={{ color: '#ffd600', weight: 1, fillColor: FIRE_COLOR, fillOpacity: 0.9 }} />
      ))}
      {schools.map((s) => (
        <Marker key={s.npsn} position={[s.lat, s.lon]} icon={icon(s)} zIndexOffset={s.level * 100} title={s.name}>
          <Popup>
            <strong>{s.name}</strong>
            <br />
            {s.actionLabel}
            <br />
            <a href={s.href} className="btn">Lihat detail sekolah</a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
