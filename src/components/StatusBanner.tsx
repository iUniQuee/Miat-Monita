import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { hasAllDates, timeUntil } from '@/lib/format';
import type { EventDates } from '@/lib/types';

export function StatusBanner({ dates }: { dates: EventDates }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const ready = hasAllDates(dates);
  const countdown = timeUntil(dates.draw, now) ?? timeUntil(dates.giftDay, now);

  if (!ready || !countdown) {
    return (
      <div className="glass inline-flex items-center gap-3 px-5 py-3 animate-pop-in">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-gold-400" />
        </span>
        <span className="font-semibold text-gold-300">Хуваарь удахгүй зарлагдана</span>
      </div>
    );
  }

  const cells: Array<[number, string]> = [
    [countdown.days, 'өдөр'],
    [countdown.hours, 'цаг'],
    [countdown.minutes, 'минут'],
    [countdown.seconds, 'секунд'],
  ];

  return (
    <div className="glass-strong inline-flex flex-col items-center gap-3 px-6 py-4 animate-pop-in" style={{ boxShadow: '0 0 40px rgba(245,185,61,0.18)' }}>
      <div className="flex items-center gap-2 text-sm font-semibold text-skyx-300">
        <CalendarClock className="h-4 w-4" />
        <span>Сугалааны хүртэл</span>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {cells.map(([value, label]) => (
          <div
            key={label}
            className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2 min-w-[64px] md:min-w-[76px]"
          >
            <span className="font-display text-2xl md:text-3xl font-bold text-gold-300 tabular-nums">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-[10px] md:text-xs text-slate-400 font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
