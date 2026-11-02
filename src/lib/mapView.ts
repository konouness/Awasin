type Bounds = [[number, number], [number, number]];

export function mapView(points: { lat: number; lon: number }[]): { bounds: Bounds } | { center: [number, number]; zoom: number } {
  if (points.length === 0) return { center: [-1.9, 113.4], zoom: 7 };
  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const bounds: Bounds = [[Math.min(...lats), Math.min(...lons)], [Math.max(...lats), Math.max(...lons)]];
  if (bounds[0][0] === bounds[1][0] && bounds[0][1] === bounds[1][1]) return { center: bounds[0], zoom: 9 };
  return { bounds };
}
