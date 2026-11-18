import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Download,
  Gift,
  Hash,
  Loader2,
  LogOut,
  Pencil,
  RefreshCw,
  Save,
  Sparkles,
  Ticket,
  User,
} from 'lucide-react';
import { downloadBoardingPass } from '@/lib/boardingPass';
import { RouteLine } from './RouteLine';
import { errorText, updateWishlist } from '@/lib/api';
import type { Member, MonitaRecipient } from '@/lib/types';

interface DashboardProps {
  member: Member;
  drawDone: boolean;
  monita: MonitaRecipient | null;
  onLogout: () => void;
  onRefresh: () => Promise<void>;
}

export function Dashboard({ member, drawDone, monita, onLogout, onRefresh }: DashboardProps) {
  const pending = member.status === 'pending';

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-5 py-10 md:py-14">
      <div className="flex items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <p className="text-sm text-slate-400">Сайн байна уу,</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">{member.fullName}</h1>
        </div>
        <button onClick={onLogout} className="btn-ghost !px-4 !py-2 text-sm">
          <LogOut className="h-4 w-4" />
          Гарах
        </button>
      </div>

      {pending ? (
        <div className="glass-strong p-8 text-center animate-pop-in">
          <div className="mx-auto h-16 w-16 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center">
            <Clock className="h-8 w-8 text-gold-400" />
          </div>
          <div className="badge bg-gold-500/15 text-gold-300 border border-gold-500/30 mt-5 mx-auto">
            <Clock className="h-3.5 w-3.5" />
            Бүртгэл баталгаажуулалт хүлээгдэж байна
          </div>
          <p className="mt-5 text-slate-300 leading-relaxed max-w-md mx-auto">
            Таны бүртгэл амжилттай илгээгдсэн. Зохион байгуулагч таны Sign code-ийг
            шалгаад баталгаажуулсны дараа таны эрх идэвхжих болно.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <BoardingPassCard member={member} />
          <WishlistCard member={member} onRefresh={onRefresh} />
          {drawDone ? (
            <MonitaCard monita={monita} />
          ) : (
            <div className="glass p-7 text-center">
              <Gift className="h-8 w-8 text-skyx-300 mx-auto" />
              <h3 className="font-display text-lg font-bold text-white mt-3">Сугалаа хараахан эхлээгүй</h3>
              <p className="text-sm text-slate-400 mt-2">
                Зохион байгуулагч сугалааг эхлүүлсэний дараа таны Монита энд харагдана.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BoardingPassCard({ member }: { member: Member }) {
  return (
    <div className="rounded-3xl overflow-hidden border border-gold-500/25 bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900 shadow-glow animate-pop-in">
      <div className="px-6 py-4 flex items-center justify-between bg-white/[0.04] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center">
            <Ticket className="h-4.5 w-4.5 text-gold-400" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm">МИАТ · МОНИТА</div>
            <div className="text-[11px] text-slate-400">Мэдээлэл лавлагааны тасаг</div>
          </div>
        </div>
        <button
          onClick={() => downloadBoardingPass(member)}
          className="btn-gold !px-4 !py-2 text-sm"
        >
          <Download className="h-4 w-4" />
          Урилга татах
        </button>
      </div>
      <div className="flex">
        <div className="flex-1 p-6">
          <div className="text-[10px] tracking-[0.16em] text-slate-400 font-bold uppercase">Зочин</div>
          <div className="font-display text-lg font-bold text-white mt-1">{member.fullName}</div>
          <div className="flex items-center gap-3 mt-4">
            <RouteLine />
          </div>
          <div className="text-[10px] tracking-[0.16em] text-slate-400 font-bold uppercase mt-4">Бэлгийн буудал</div>
          <div className="text-sm text-slate-200 mt-1">Ажлын гацуур модны доор</div>
        </div>
        <div className="w-32 md:w-40 border-l-2 border-dashed border-white/15 bg-white/[0.03] p-4 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] tracking-[0.16em] text-slate-400 font-bold uppercase">Sign Code</div>
          <div className="font-display text-lg md:text-2xl font-bold text-gold-300 mt-1 tracking-widest break-all">
            {member.signCode}
          </div>
          <div className="mt-3 flex gap-0.5">
            {member.signCode.slice(0, 8).split('').map((_, i) => (
              <span key={i} className="w-1.5 h-5 rounded-sm bg-white/20" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WishlistCard({ member, onRefresh }: { member: Member; onRefresh: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(member.wishlist);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await updateWishlist(member.id, text);
      await onRefresh();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(errorText(err, 'Хүслээ хадгалж чадсангүй.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass p-7 animate-fade-up">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold-400" />
          Миний хүсэл
        </h3>
        {editing ? (
          <button onClick={save} className="btn-gold !px-4 !py-2 text-sm" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Хадгалах
          </button>
        ) : (
          <button onClick={() => { setText(member.wishlist); setEditing(true); }} className="btn-ghost !px-4 !py-2 text-sm">
            <Pencil className="h-4 w-4" />
            Засах
          </button>
        )}
      </div>
      {editing ? (
        <textarea
          className="field min-h-[100px] resize-y"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Танд юу бэлэглэхэд таалагдаж байна вэ?"
          autoFocus
        />
      ) : (
        <p className={`text-sm leading-relaxed rounded-2xl border p-4 ${member.wishlist ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white/[0.02] border-white/5 text-slate-500 italic'}`}>
          {member.wishlist || 'Хараахан хүсэл бичээгүй байна. Хүсэл нь таны Монитад бэлэг сонгоход тусална.'}
        </p>
      )}
      {error && (
        <p className="text-sm text-festive-400 font-semibold mt-3">{error}</p>
      )}
      {saved && (
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mt-3 animate-pop-in">
          <RefreshCw className="h-4 w-4" />
          Амжилттай хадгалагдлаа
        </div>
      )}
    </div>
  );
}

function MonitaCard({ monita }: { monita: MonitaRecipient | null }) {
  const [revealed, setRevealed] = useState(false);

  if (!monita) {
    return (
      <div className="glass p-7 text-center">
        <AlertCircleLone />
        <h3 className="font-display text-lg font-bold text-white mt-3">Сугалаанд ороогүй байна</h3>
        <p className="text-sm text-slate-400 mt-2">
          Сугалаа явагдсан ч таны эрх хугацааны хүрээнд оролцоогүй байна. Зохион байгуулагчтай холбогдоно уу.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-strong p-8 relative overflow-hidden animate-pop-in">
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-festive-500/10 blur-3xl" />
      <div className="badge bg-festive-500/15 text-festive-400 border border-festive-500/30">
        <Gift className="h-3.5 w-3.5" />
        Таны нууц Монита
      </div>

      {!revealed ? (
        <div className="text-center py-8">
          <div className="mx-auto h-20 w-20 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center animate-float-slow">
            <Gift className="h-10 w-10 text-gold-400" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mt-5">Бэлэн үү?</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">Товчлуурыг дарж Монитагаа нууцаа нээгээрэй</p>
          <button onClick={() => setRevealed(true)} className="btn-gold">
            <Sparkles className="h-5 w-5" />
            Нууцыг нээх
          </button>
        </div>
      ) : (
        <div className="mt-5 animate-pop-in">
          <div className="flex items-center gap-4 rounded-2xl border border-gold-500/25 bg-gold-500/[0.07] p-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-b from-gold-300 to-gold-500 flex items-center justify-center shrink-0">
              <User className="h-7 w-7 text-navy-950" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-xl font-bold text-white truncate">{monita.fullName}</div>
              <div className="flex items-center gap-1.5 text-sm text-gold-300 font-mono font-bold mt-0.5">
                <Hash className="h-3.5 w-3.5" />
                {monita.signCode}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[10px] tracking-[0.16em] text-slate-400 font-bold uppercase">Түүний хүсэл</div>
            <p className={`mt-2 text-sm leading-relaxed rounded-2xl border p-4 ${monita.wishlist ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white/[0.02] border-white/5 text-slate-500 italic'}`}>
              {monita.wishlist || 'Хүсэл бичээгүй байна — та бэлгээ өөрөө сонгоорой!'}
            </p>
          </div>
          <p className="mt-4 text-xs text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Энэ нэрний нууцыг хэн ч мэдэхгүй — зөвхөн танд харагдана
          </p>
        </div>
      )}
    </div>
  );
}

function AlertCircleLone() {
  return (
    <div className="mx-auto h-12 w-12 rounded-full bg-festive-500/15 border border-festive-500/30 flex items-center justify-center">
      <Clock className="h-6 w-6 text-festive-400" />
    </div>
  );
}
