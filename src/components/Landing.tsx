import {  Plane,
  Users,
  ClipboardCheck,
  Gift,
  CalendarDays,
  TreePine,
  Award,
  Ticket,
  Sparkles,
  Tag,
  ChevronRight,
  Snowflake,
} from 'lucide-react';
import { StatusBanner } from './StatusBanner';
import { RouteLine } from './RouteLine';
import { dateOrTba } from '@/lib/format';
import type { EventDates } from '@/lib/types';

interface LandingProps {
  dates: EventDates;
  onEnter: () => void;
  onAdmin: () => void;
  loggedIn: boolean;
}

export function Landing({ dates, onEnter, onAdmin, loggedIn }: LandingProps) {
  const timeline = [
    { icon: ClipboardCheck, label: 'Бүртгэл', date: dates.registration, desc: 'Нэр, Sign code-оо бүртгүүлж зохион байгуулагчаас баталгаажуулалт хүлээнэ.' },
    { icon: Users, label: 'Монита сонгох', date: dates.draw, desc: 'Систем таньд нууц хүнээ санамсаргүйгээр оноож өгнө.' },
    { icon: Gift, label: 'Бэлэг өгөх өдөр', date: dates.giftDay, desc: 'Гацуур модны доор бэлгээ солилцож баяртайгаа тэмдэглэнэ.' },
  ];

  const steps = [
    { n: '01', title: 'Бүртгүүлэх & Баталгаажуулах', desc: 'Нэр, Sign code, утасны дугаараа бүртгүүлээрэй. Зохион байгуулагч шалгаад баталгаажуулна.' },
    { n: '02', title: 'Монитагаа сугалах', desc: 'Сугалааны өдөр систем таньд нууц Монитагийн нэрийг харуулна. Хэн ч мэдэхгүй!' },
    { n: '03', title: 'Гацуур модны доор бэлгээ үлдээх', desc: 'Бэлгээ хүлээн авагчийн нэр, Sign code-оор тэмдэглээд ажлын гацуур модны доор үлдээгээрэй.' },
  ];

  return (
    <div className="relative z-10">
      {/* HERO */}
      <section className="max-w-5xl mx-auto px-5 pt-14 md:pt-24 pb-16 text-center">
        <div className="animate-fade-up">
          <div className="badge border border-gold-500/30 bg-gold-500/10 text-gold-300 mx-auto">
            <Plane className="h-3.5 w-3.5" />
            МИАТ ТӨХК · МЭДЭЭЛЭЛ ЛАВЛАГААНЫ ТАСАГ
          </div>
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-bold mt-6 leading-[1.15] tracking-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <span className="text-white">Нэг хамт олон.</span>
          <br />
          <span className="text-gold-gradient">Мянган инээмсэглэл.</span>
        </h1>

        <p className="max-w-2xl mx-auto mt-6 text-base md:text-lg text-slate-300 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Танд оноогдсон нэг хүнд өгөх нууц бэлэг.
          <br className="hidden md:block" />
          Хэн нэгний баярлах шалтгаан нь болоорой.
        </p>

        <div className="mt-9 flex flex-col items-center gap-5 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <StatusBanner dates={dates} />
          <button onClick={onEnter} className="btn-gold text-base group">
            {loggedIn ? (
              <>
                <TreePine className="h-5 w-5" />
                Миний булан
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Бүртгүүлэх / Нэвтрэх
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
          <button onClick={onAdmin} className="text-sm text-slate-400 hover:text-skyx-300 underline underline-offset-4 transition-colors">
            Зохион байгуулагчийн хэсэг
          </button>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <h2 className="section-title">Дурсамж бүтээх өдрүүд</h2>
          <p className="text-slate-400 mt-3">Монитагийн аяллын хөтлөгч, гурван гол цаг</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {timeline.map((item, i) => (
            <div key={item.label} className="glass p-6 relative overflow-hidden group hover:border-gold-500/30 transition-colors duration-300">
              <span className="absolute -top-3 -right-1 font-display text-[88px] font-bold text-white/[0.04] select-none">
                {i + 1}
              </span>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-b from-skyx-500/25 to-skyx-500/10 border border-skyx-400/20 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-skyx-300" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">{item.label}</h3>
              </div>
              <div className="mt-4 flex items-center gap-2 text-gold-300">
                <CalendarDays className="h-4 w-4" />
                <span className="text-sm font-bold">{dateOrTba(item.date)}</span>
              </div>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DROP-OFF + GOLDEN MONITA */}
      <section className="max-w-5xl mx-auto px-5 py-8 grid md:grid-cols-2 gap-5">
        <div className="glass-strong p-8 relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 text-emerald-400/10">
            <TreePine className="h-40 w-40" />
          </div>
          <div className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
            <TreePine className="h-3.5 w-3.5" />
            Бэлэг байрлуулах цэг
          </div>
          <h3 className="font-display text-xl md:text-2xl font-bold text-white mt-4 leading-snug">Бэлгээ шууд гацуур модны доор тавина уу.</h3>
          <p className="mt-4 text-sm font-bold text-gold-300">Хэрхэн явагдах вэ?</p>
          <ul className="mt-3 space-y-2.5 text-slate-300 leading-relaxed text-sm">
            <li className="flex gap-2">
              <span className="text-emerald-300 shrink-0">•</span>
              <span>Бэлэг өгөх цаг болоход нэг хүн гарч ирээд өөрийнхөө Монитаг дуудаж бэлгээ гардуулна.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-300 shrink-0">•</span>
              <span>Бэлэг авсан хүн нь үргэлжлүүлэн өөрийнхөө Монитаг дуудах байдлаар гинжин хэлхээ үүсгэн ээлж дараалан явна.</span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-slate-400 flex items-start gap-2">
            <Tag className="h-4 w-4 text-skyx-300 shrink-0 mt-0.5" />
            <span>
              Шошгон дээр Монитагийн нэр + Sign code-ийг тод бичээрэй (жишээ нь:{' '}
              <span className="font-mono font-bold text-gold-300">Бат 0001BH</span>).
            </span>
          </p>
        </div>

        <div className="glass p-8 relative overflow-hidden">
          <div className="absolute -top-8 -left-8 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="badge bg-gold-500/15 text-gold-300 border border-gold-500/30">
            <Award className="h-3.5 w-3.5" />
            Тусгай дүрэм
          </div>
          <h3 className="font-display text-2xl font-bold mt-4">
            <span className="text-gold-gradient">Алтан Монита</span>
          </h3>
          <p className="mt-3 text-slate-300 leading-relaxed text-sm md:text-base">
            Сугалааны систем зарим хослолыг санамсаргүй байдлаар “Алтан Монита” болгон
            сонгоно. Хэн нь Алтан Монита болсныг хэн ч урьдчилан мэдэхгүй бөгөөд хамт
            олны үдэш нууц бэлэг солилцох мөчид ил болно!
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="h-4 w-4 text-gold-400" />
            <span>Сэтгэл шингэсэн бэлгээрээ хэн нэгний өдрийг гэрэлтүүлээрэй.</span>
          </div>
        </div>
      </section>

      {/* BOARDING PASS PREVIEW */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <h2 className="section-title">Таны boarding pass урилга</h2>
          <p className="text-slate-400 mt-3">Баталгаажсан гишүүн бүр аялал зөвлөмжтэй урилга татаж авна</p>
        </div>
        <div className="max-w-xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-navy-700 to-navy-800 shadow-glow-blue">
            <div className="px-6 py-4 flex items-center justify-between bg-white/[0.04] border-b border-white/10">
              <div>
                <div className="font-display font-bold text-white flex items-center gap-2">
                  <Plane className="h-4 w-4 text-gold-400" />
                  MIAT · МОНИТА
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Мэдээлэл лавлагааны тасаг</div>
              </div>
              <Ticket className="h-6 w-6 text-gold-400" />
            </div>
            <div className="flex">
              <div className="flex-1 p-6">
                <div className="text-[10px] tracking-[0.16em] text-slate-400 font-bold uppercase">Зочин</div>
                <div className="font-display text-lg font-bold text-white mt-1">Таны нэр</div>
                <div className="flex items-center gap-3 mt-4">
                  <RouteLine />
                </div>
                <div className="text-[10px] tracking-[0.16em] text-slate-400 font-bold uppercase mt-4">Бэлгийн буудал</div>
                <div className="text-sm text-slate-200 mt-1">Ажлын гацуур модны доор</div>
              </div>
              <div className="w-36 border-l-2 border-dashed border-white/15 bg-white/[0.03] p-4 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] tracking-[0.16em] text-slate-400 font-bold uppercase">Sign Code</div>
                <div className="font-display text-xl font-bold text-gold-300 mt-1 tracking-widest">····</div>
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="w-1.5 h-5 rounded-sm bg-white/20" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-slate-400 mt-4 flex items-center justify-center gap-2">
            <Snowflake className="h-4 w-4 text-skyx-300" />
            Бүртгэл баталгаажсаны дараа урилгаа татаж авна
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-5 py-16 pb-24">
        <div className="text-center mb-12">
          <h2 className="section-title">Хэрхэн ажиллах вэ?</h2>
          <p className="text-slate-400 mt-3">Гурван энгийн алхам</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={s.n} className="glass p-7 relative group hover:-translate-y-1 transition-transform duration-300">
              <span className="font-display text-4xl font-bold text-gold-gradient">{s.n}</span>
              <h3 className="font-display text-lg font-bold text-white mt-4 leading-snug">{s.title}</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              {i < 2 && (
                <ChevronRight className="hidden md:block absolute top-1/2 -right-[18px] h-6 w-6 text-gold-500/50 z-10" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      {!loggedIn && (
        <section className="max-w-3xl mx-auto px-5 py-10 pb-20">
          <div className="glass-strong p-8 text-center">
            <h3 className="font-display text-xl md:text-2xl font-bold text-white">Бэлэн байна уу?</h3>
            <p className="text-sm text-slate-400 mt-2">Бүртгэл үүсгээд зохион байгуулагчийн баталгаажуулалт хүлээнэ үү</p>
            <button onClick={onEnter} className="btn-gold mt-6 group">
              <Sparkles className="h-5 w-5" />
              Бүртгүүлэх / Нэвтрэх
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      )}
      {loggedIn && (
        <section className="max-w-3xl mx-auto px-5 py-10 pb-20">
          <div className="glass-strong p-8 text-center">
            <h3 className="font-display text-xl md:text-2xl font-bold text-white">Таны бүртгэл идэвхтэй байна</h3>
            <p className="text-sm text-slate-400 mt-2">Урилга, хүсэл болон Монитагаа өөрийн хуудаснаас харна уу</p>
            <button onClick={onEnter} className="btn-gold mt-6 group">
              <TreePine className="h-5 w-5" />
              Миний булан руу орох
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      )}

      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Plane className="h-3.5 w-3.5 text-skyx-400" />
          <span className="font-semibold text-slate-400">МИАТ ТӨХК, Мэдээлэл лавлагааны тасаг</span>
        </div>
        <span>Монита нууц бэлэг солилцоо · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
