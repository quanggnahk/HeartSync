import { Profile } from '../types';

const BASE = process.env.EXPO_PUBLIC_API_URL;

async function request<T>(path: string, timeoutMs = 8000): Promise<T> {
  if (!BASE) throw new Error('EXPO_PUBLIC_API_URL is not set');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(BASE + path, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  profiles: () => request<Profile[]>('/profiles'),
};