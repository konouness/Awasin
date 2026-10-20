export type Hazard = 'asap' | 'banjir' | 'angin';
export type Level = 0 | 1 | 2 | 3;
export type Action = 'normal' | 'kurangi_luar' | 'tunda_masuk' | 'pulang_awal' | 'daring';
export const ACTION_ORDER: Action[] = ['normal', 'kurangi_luar', 'tunda_masuk', 'pulang_awal', 'daring'];
export const HAZARDS: Hazard[] = ['asap', 'banjir', 'angin'];
export type Point = { lat: number; lon: number };
export type HourRow = { time: string; rainMm: number; gustKmh: number; windFromDeg: number; weatherCode: number; pm25: number };
export type ForecastRow = { school_id: string; hazard: Hazard; hour: string; level: Level; score: number };
