import { Plane } from 'lucide-react';

export function RouteLine() {
  return (
    <div className="flex items-center gap-3">
      <span className="font-display font-bold text-skyx-300 text-sm tracking-wider">БЭЛЭГ</span>
      <span className="flex-1 relative flex items-center">
        <span className="w-full border-t-2 border-dotted border-gradient-to-r from-skyx-400/50 via-gold-400/50 to-gold-400/70" />
        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 h-6 w-6 rounded-full bg-navy-800 border border-gold-500/30 flex items-center justify-center shadow-glow">
          <Plane className="h-3.5 w-3.5 text-gold-400 rotate-45 -scale-x-100" />
        </span>
      </span>
      <span className="font-display font-bold text-gold-300 text-sm tracking-wider">МОНИТА</span>
    </div>
  );
}
