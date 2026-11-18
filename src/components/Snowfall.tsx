import { useMemo } from 'react';
import { Plane } from 'lucide-react';

export function Snowfall() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: (i * 3.7 + Math.random() * 3) % 100,
        size: 2 + Math.random() * 4,
        duration: 9 + Math.random() * 14,
        delay: -Math.random() * 20,
        opacity: 0.35 + Math.random() * 0.5,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {flakes.map((f, i) => (
        <span
          key={i}
          className="snow-dot"
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
      <div
        className="plane-trail hidden md:block"
        style={{ top: '18%', animationDelay: '-6s' }}
      >
        <Plane className="h-8 w-8 text-skyx-300/40 rotate-12" strokeWidth={1.5} />
      </div>
      <div
        className="plane-trail hidden md:block"
        style={{ top: '52%', animationDelay: '-19s' }}
      >
        <Plane className="h-5 w-5 text-gold-400/30 rotate-12" strokeWidth={1.5} />
      </div>
    </div>
  );
}
