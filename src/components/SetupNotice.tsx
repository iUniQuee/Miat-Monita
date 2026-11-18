import { AlertCircle, Database, KeyRound, Plane } from 'lucide-react';

export function SetupNotice() {
  return (
    <div className="relative z-10 max-w-2xl mx-auto px-5 py-16 md:py-24">
      <div className="glass-strong p-8 animate-pop-in">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 flex items-center justify-center">
            <Plane className="h-5 w-5 text-navy-950 -rotate-45" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">МИАТ Монита</h1>
            <p className="text-sm text-slate-400">Supabase холболт тохируулагдаагүй байна</p>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-xl border border-festive-500/30 bg-festive-500/10 px-4 py-3 text-sm text-festive-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Апп ажиллахын тулд Supabase project-ийн URL болон anon key хэрэгтэй. Эдгээрийг
            кодонд бичихгүй, environment variable-аар дамжуулна.
          </span>
        </div>

        <ol className="mt-6 space-y-4 text-sm text-slate-300">
          <li className="flex items-start gap-3">
            <Database className="h-5 w-5 text-skyx-300 shrink-0 mt-0.5" />
            <span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-gold-300 font-semibold underline underline-offset-4"
              >
                supabase.com/dashboard
              </a>{' '}
              дээр project үүсгээд <span className="font-mono text-gold-300">supabase/schema.sql</span>{' '}
              файлыг SQL Editor дээр ажиллуулна.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <KeyRound className="h-5 w-5 text-gold-400 shrink-0 mt-0.5" />
            <span>
              Project Settings → API-аас URL болон anon public key-г хуулж, project root дахь{' '}
              <span className="font-mono text-gold-300">.env</span> файлд бичнэ:
              <span className="mt-2 block rounded-xl bg-black/40 border border-white/10 px-4 py-3 font-mono text-xs text-slate-200">
                VITE_SUPABASE_URL=https://xxxx.supabase.co
                <br />
                VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
              </span>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Plane className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
            <span>
              Dev server-ээ дахин асаана (<span className="font-mono text-gold-300">npm run dev</span>).
              GitHub-оос deploy хийхдээ эдгээр хоёр хувьсагчийг hosting-ийн Environment
              variables хэсэгт нэмнэ.
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
