import { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  ClipboardCheck,
  Users,
  Trash2,
  Check,
  X,
  CalendarDays,
  Save,
  Shuffle,
  FlaskConical,
  AlertTriangle,
  PartyPopper,
  LogOut,
  Clock,
} from 'lucide-react';
import {
  loadMembers,
  makeDummyMembers,
  runDraw,
  saveAssignments,
  saveDates,
  saveMembers,
} from '@/lib/storage';
import { dateOrTba } from '@/lib/format';
import { ADMIN_PIN, ADMIN_SIGN_CODE, STATUS_LABELS, type Assignment, type EventDates, type Member, type UserStatus } from '@/lib/types';

interface AdminPanelProps {
  dates: EventDates;
  drawDone: boolean;
  onDatesChange: (d: EventDates) => void;
  onMembersChange: () => void;
  onDrawChange: (a: Assignment[]) => void;
  onExit: () => void;
  adminMember: Member | null;
}

export function AdminPanel({
  dates,
  drawDone,
  onDatesChange,
  onMembersChange,
  onDrawChange,
  onExit,
  adminMember,
}: AdminPanelProps) {
  const [unlocked, setUnlocked] = useState(adminMember?.signCode.toUpperCase() === ADMIN_SIGN_CODE);

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} onExit={onExit} />;
  }

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-5 py-10 md:py-14">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <div className="badge bg-skyx-500/15 text-skyx-300 border border-skyx-500/25">
            <ShieldCheck className="h-3.5 w-3.5" />
            Удирдлага
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mt-3">
            Зохион байгуулагчийн самбар
          </h1>
        </div>
        <button onClick={onExit} className="btn-ghost !px-4 !py-2 text-sm">
          <LogOut className="h-4 w-4" />
          Гарах
        </button>
      </div>

      <div className="space-y-6">
        <ApprovalSection onMembersChange={onMembersChange} />
        <DatesSection dates={dates} onSave={onDatesChange} />
        <DrawSection drawDone={drawDone} onDrawChange={onDrawChange} onMembersChange={onMembersChange} />
      </div>
    </div>
  );
}

function PinGate({ onUnlock, onExit }: { onUnlock: () => void; onExit: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="relative z-10 max-w-sm mx-auto px-5 py-16 md:py-28">
      <div className="glass-strong p-8 text-center animate-pop-in">
        <div className="mx-auto h-16 w-16 rounded-full bg-skyx-500/15 border border-skyx-500/30 flex items-center justify-center">
          <Lock className="h-8 w-8 text-skyx-300" />
        </div>
        <h2 className="font-display text-xl font-bold text-white mt-5">Удирдлагын нууц код</h2>
        <p className="text-sm text-slate-400 mt-2">Зөвхөн зохион байгуулагч орох эрхтэй</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            className="field text-center text-2xl font-display tracking-[0.5em] tabular-nums"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
              setError(false);
            }}
            placeholder="••••"
            inputMode="numeric"
            autoFocus
          />
          {error && <p className="text-sm text-festive-400 font-semibold">Нууц код буруу байна</p>}
          <button type="submit" className="btn-gold w-full">
            <ShieldCheck className="h-5 w-5" />
            Орох
          </button>
          <button type="button" onClick={onExit} className="text-sm text-slate-400 hover:text-slate-200 underline underline-offset-4">
            Буцах
          </button>
        </form>
      </div>
    </div>
  );
}

function ApprovalSection({ onMembersChange }: { onMembersChange: () => void }) {
  const [members, setMembers] = useState<Member[]>(() => loadMembers());
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const refresh = () => {
    setMembers(loadMembers());
    onMembersChange();
  };

  const setStatus = (id: string, status: UserStatus) => {
    saveMembers(loadMembers().map((m) => (m.id === id ? { ...m, status } : m)));
    setConfirmId(null);
    refresh();
  };

  const remove = (id: string) => {
    saveMembers(loadMembers().filter((m) => m.id !== id));
    setConfirmId(null);
    refresh();
  };

  const addDummies = () => {
    const current = loadMembers();
    saveMembers([...current, ...makeDummyMembers()]);
    refresh();
  };

  const sorted = [...members].sort((a, b) => {
    const order: Record<UserStatus, number> = { pending: 0, approved: 1, rejected: 2 };
    return order[a.status] - order[b.status] || b.createdAt - a.createdAt;
  });

  const statusStyle: Record<UserStatus, string> = {
    pending: 'bg-gold-500/15 text-gold-300 border-gold-500/30',
    approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    rejected: 'bg-festive-500/15 text-festive-400 border-festive-500/30',
  };

  return (
    <div className="glass-strong p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-skyx-300" />
          Бүртгэл баталгаажуулах
          {members.filter((m) => m.status === 'pending').length > 0 && (
            <span className="badge bg-festive-500/20 text-festive-400 border border-festive-500/30">
              {members.filter((m) => m.status === 'pending').length} шинэ
            </span>
          )}
        </h2>
        <button onClick={addDummies} className="btn-ghost !px-3.5 !py-2 text-xs">
          <FlaskConical className="h-4 w-4" />
          Туршлага нэмэх
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-400 bg-white/[0.03] rounded-2xl border border-white/5 p-6 text-center">
          Одоогоор бүртгэл байхгүй байна.
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((m) => (
            <div key={m.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white">{m.fullName}</span>
                    <span className={`badge border ${statusStyle[m.status]}`}>{STATUS_LABELS[m.status]}</span>
                  </div>
                  <div className="text-sm text-slate-400 mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="font-mono font-bold text-gold-300">{m.signCode}</span>
                    <span className="tabular-nums">{m.phone}</span>
                  </div>
                  {m.wishlist && (
                    <p className="text-xs text-slate-500 mt-1.5 truncate max-w-md">Хүсэл: {m.wishlist}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {m.signCode === ADMIN_SIGN_CODE && (
                    <span className="badge bg-skyx-500/15 text-skyx-300 border border-skyx-500/25">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Админ
                    </span>
                  )}
                  {m.status !== 'approved' && (
                    <button onClick={() => setStatus(m.id, 'approved')} className="btn-gold !px-3.5 !py-2 text-xs">
                      <Check className="h-4 w-4" />
                      Зөвшөөрөх
                    </button>
                  )}
                  {confirmId === m.id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => setStatus(m.id, 'rejected')} className="btn-danger">
                        <X className="h-4 w-4" />
                        Татгалзах
                      </button>
                      <button onClick={() => remove(m.id)} className="btn-danger">
                        <Trash2 className="h-4 w-4" />
                        Устгах
                      </button>
                      <button onClick={() => setConfirmId(null)} className="btn-ghost !px-3 !py-2 text-xs">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmId(m.id)} className="btn-danger">
                      <Trash2 className="h-4 w-4" />
                      Татгалзах / Устгах
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DatesSection({ dates, onSave }: { dates: EventDates; onSave: (d: EventDates) => void }) {
  const [reg, setReg] = useState(dates.registration ?? '');
  const [draw, setDraw] = useState(dates.draw ?? '');
  const [gift, setGift] = useState(dates.giftDay ?? '');
  const [saved, setSaved] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: EventDates = {
      registration: reg || null,
      draw: draw || null,
      giftDay: gift || null,
    };
    saveDates(next);
    onSave(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="glass-strong p-6 md:p-7">
      <h2 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-5">
        <CalendarDays className="h-5 w-5 text-gold-400" />
        Хуваарь тохируулах
      </h2>
      <form onSubmit={submit} className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Бүртгэл</label>
          <input type="date" className="field" value={reg} onChange={(e) => setReg(e.target.value)} />
        </div>
        <div>
          <label className="label">Монита сонгох</label>
          <input type="date" className="field" value={draw} onChange={(e) => setDraw(e.target.value)} />
        </div>
        <div>
          <label className="label">Бэлэг өгөх өдөр</label>
          <input type="date" className="field" value={gift} onChange={(e) => setGift(e.target.value)} />
        </div>
        <div className="sm:col-span-3 flex items-center gap-3">
          <button type="submit" className="btn-gold !py-2.5 text-sm">
            <Save className="h-4 w-4" />
            Хуваарь хадгалах
          </button>
          {saved && <span className="text-sm font-semibold text-emerald-400">Хадгалагдлаа</span>}
        </div>
      </form>
      <p className="text-xs text-slate-500 mt-3">
        Одоогийн: Бүртгэл — {dateOrTba(dates.registration)} · Сонгох — {dateOrTba(dates.draw)} · Бэлэг — {dateOrTba(dates.giftDay)}
      </p>
    </div>
  );
}

function DrawSection({
  drawDone,
  onDrawChange,
  onMembersChange,
}: {
  drawDone: boolean;
  onDrawChange: (a: Assignment[]) => void;
  onMembersChange: () => void;
}) {
  const members = loadMembers();
  const approved = members.filter((m) => m.status === 'approved');
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const run = () => {
    const result = runDraw(members);
    if (!result) {
      setError('Сугалаа хийхэд дор хаяж 2 зөвшөөрөгдсөн гишүун шаардлагатай.');
      setConfirming(false);
      return;
    }
    saveAssignments(result);
    onDrawChange(result);
    setError(null);
    setConfirming(false);
    onMembersChange();
  };

  return (
    <div className="glass-strong p-6 md:p-7">
      <h2 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-3">
        <Shuffle className="h-5 w-5 text-festive-400" />
        Сугалаа явуулах
      </h2>
      <p className="text-sm text-slate-400 leading-relaxed">
        Зөвхөн <span className="text-emerald-300 font-bold">зөвшөөрөгдсөн</span> гишүүдийн дунд
        сугалаа эхэлнэ. Хэн ч өөрийгөө сонгохгүй бөгөөд гишүүн бүр яг нэг хүнд оноогдно.
      </p>

      <div className="flex items-center gap-3 mt-4 text-sm text-slate-300">
        <Users className="h-4 w-4 text-skyx-300" />
        <span>Зөвшөөрөгдсөн: <strong className="text-white">{approved.length}</strong> хүн</span>
        <span className="text-slate-600">·</span>
        <Clock className="h-4 w-4 text-gold-400" />
        <span>Хүлээгдэж буй: <strong className="text-white">{members.filter((m) => m.status === 'pending').length}</strong> хүн</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-festive-500/30 bg-festive-500/10 px-4 py-3 text-sm text-festive-400 mt-4">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {drawDone ? (
        <div className="mt-5">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <PartyPopper className="h-4 w-4 shrink-0" />
            Сугалаа амжилттай явагдсан. Гишүүд нэвтэрч Монитаа харна.
          </div>
          <button
            onClick={() => { saveAssignments([]); onDrawChange([]); }}
            className="btn-ghost mt-4 !py-2.5 text-sm"
          >
            <RefreshIcon />
            Сугалааг дахин эхлүүлэх (устгах)
          </button>
        </div>
      ) : confirming ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={run} className="btn-gold text-sm">
            <Shuffle className="h-4 w-4" />
            Тийм, эхлүүлэх
          </button>
          <button onClick={() => setConfirming(false)} className="btn-ghost !py-2.5 text-sm">
            Буцах
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          disabled={approved.length < 2}
          className="btn-gold mt-5 text-sm"
        >
          <Shuffle className="h-4 w-4" />
          Сугалаа эхлүүлэх
        </button>
      )}
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
