import type { EventDates } from './types';

export function formatDateMongolian(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}. оны ${month}. сарын ${day}`;
}

export function dateOrTba(iso: string | null): string {
  return formatDateMongolian(iso) ?? 'Тун удахгүй зарлагдана';
}

export function hasAllDates(dates: EventDates): boolean {
  return Boolean(dates.registration && dates.draw && dates.giftDay);
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function timeUntil(dateIso: string | null, now: number): Countdown | null {
  if (!dateIso) return null;
  const target = new Date(`${dateIso}T00:00:00`).getTime();
  if (Number.isNaN(target)) return null;
  const diff = target - now;
  if (diff <= 0) return null;
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}
