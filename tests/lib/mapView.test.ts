import { mapView } from '../../src/lib/mapView';

test('no schools falls back to Kalteng', () => { expect(mapView([])).toEqual({ center: [-1.9, 113.4], zoom: 7 }); });
test('one school centers on it', () => { expect(mapView([{ lat: -2, lon: 113 }])).toEqual({ center: [-2, 113], zoom: 9 }); });
test('many schools give their bounding box', () => {
  expect(mapView([{ lat: 1, lon: 101 }, { lat: -3, lon: 114 }, { lat: 0, lon: 109 }])).toEqual({ bounds: [[-3, 101], [1, 114]] });
});
test('schools on one spot center on it', () => { expect(mapView([{ lat: -2, lon: 113 }, { lat: -2, lon: 113 }])).toEqual({ center: [-2, 113], zoom: 9 }); });
