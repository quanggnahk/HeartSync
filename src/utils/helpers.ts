import { AppState, Me, Profile } from '../types';
import { PROFILES } from '../store/AppContext';

export function getDeck(s: AppState): Profile[] {
  const seen = new Set([...s.passed, ...s.liked, ...s.blocked, ...s.matches]);
  const f = s.filters;
  const base = PROFILES.filter((p) => !seen.has(p.id) && (f.genders.length === 0 || f.genders.includes(p.gender)) &&
    p.age >= f.ageMin && p.age <= f.ageMax && (f.languages.length === 0 || p.languages.some((l) => f.languages.includes(l))));
  const near = base.filter((p) => p.distanceKm <= f.maxDistance);
  if (near.length === 0 && f.expandWhenEmpty) return base.filter((p) => p.distanceKm <= 15);
  return near.sort((a, b) => a.distanceKm - b.distanceKm);
}

const FIELDS: (keyof Me)[] = ['about', 'occupation', 'education', 'location', 'height', 'smoking', 'drinking', 'pets', 'children', 'zodiac', 'religion'];
export function completion(me: Me): number {
  let done = 1; // ảnh chính
  FIELDS.forEach((k) => { if (String(me[k]).trim()) done++; });
  if (me.interests.length >= 3) done++;
  if (me.languages.length >= 1) done++;
  return Math.round((done / (FIELDS.length + 3)) * 100);
}

export function ago(ts: number): string {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} hours ago` : `${Math.round(h / 24)} days ago`;
}

export const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
export const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
export const msg = (from: 'me' | 'them', text: string) => ({ id: `${Date.now()}-${Math.random()}`, from, text, ts: Date.now() });
