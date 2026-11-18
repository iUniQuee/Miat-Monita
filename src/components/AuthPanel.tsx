import { useState } from 'react';
import { LogIn, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { findMember, nextId, validateRegistration } from '@/lib/storage';
import { ADMIN_SIGN_CODE, type Member } from '@/lib/types';

interface AuthPanelProps {
  onLogin: (member: Member) => void;
}

type Tab = 'register' | 'login';

export function AuthPanel({ onLogin }: AuthPanelProps) {
  const [tab, setTab] = useState<Tab>('register');
  const [justRegistered, setJustRegistered] = useState(false);

  return (
    <div className="relative z-10 max-w-md mx-auto px-5 py-12 md:py-20">
      <div className="glass-strong p-7 md:p-8 animate-pop-in">
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 mb-7">
          {(
            [
              ['register', 'Бүртгүүлэх', UserPlus],
              ['login', 'Нэвтрэх', LogIn],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 ${
                tab === key
                  ? 'bg-gradient-to-b from-gold-300 to-gold-500 text-navy-950 shadow-glow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === 'register' ? (
          <RegisterForm
            onRegistered={() => {
              setJustRegistered(true);
              setTab('login');
            }}
          />
        ) : (
          <LoginForm onLogin={onLogin} justRegistered={justRegistered} />
        )}
      </div>
    </div>
  );
}

function RegisterForm({ onRegistered }: { onRegistered: () => void }) {
  const [fullName, setFullName] = useState('');
  const [signCode, setSignCode] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [wishlist, setWishlist] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const data = {
      fullName: fullName.trim(),
      signCode: signCode.trim().toUpperCase(),
      phone: phone.trim(),
      password,
    };

    const members = JSON.parse(localStorage.getItem('monita_members_v1') || '[]') as Member[];
    const err = validateRegistration(members, data);
    if (err) {
      setError(err);
      return;
    }

    const member: Member = {
      id: nextId(),
      ...data,
      wishlist: wishlist.trim(),
      status: data.signCode === ADMIN_SIGN_CODE ? 'approved' : 'pending',
      createdAt: Date.now(),
    };
    localStorage.setItem('monita_members_v1', JSON.stringify([...members, member]));
    onRegistered();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Овог, нэр *</label>
        <input
          className="field"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Жишээ: Батбаяр Дорж"
          required
        />
      </div>
      <div>
        <label className="label">Sign code *</label>
        <input
          className="field font-mono tracking-widest uppercase"
          value={signCode}
          onChange={(e) => setSignCode(e.target.value.toUpperCase())}
          placeholder="Жишээ: 0001BH"
          maxLength={12}
          required
        />
      </div>
      <div>
        <label className="label">Утасны дугаар *</label>
        <input
          className="field tabular-nums"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
          placeholder="99112233"
          inputMode="numeric"
          required
        />
      </div>
      <div>
        <label className="label">Нууц үг *</label>
        <input
          className="field"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Дор хаяж 4 тэмдэгт"
          required
        />
      </div>
      <div>
        <label className="label">
          Миний хүсэл <span className="text-slate-500 font-normal">(бэлгийн зөвлөмж — сунан бичиж болно)</span>
        </label>
        <textarea
          className="field min-h-[84px] resize-y"
          value={wishlist}
          onChange={(e) => setWishlist(e.target.value)}
          placeholder="Жишээ: Гэрэлтдэг кружка, унших ном, шоколад..."
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-festive-500/30 bg-festive-500/10 px-4 py-3 text-sm text-festive-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <button type="submit" className="btn-gold w-full">
        <UserPlus className="h-5 w-5" />
        Бүртгэл илгээх
      </button>
    </form>
  );
}

function LoginForm({
  onLogin,
  justRegistered,
}: {
  onLogin: (m: Member) => void;
  justRegistered: boolean;
}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const member = findMember(identifier, password);
    if (!member) {
      setError('Sign code / утасны дугаар эсвэл нууц үг тохирохгүй байна.');
      return;
    }
    if (member.status === 'rejected' && member.signCode !== ADMIN_SIGN_CODE) {
      setError('Таны бүртгэлд татгалзсан тул нэвтрэх боломжгүй.');
      return;
    }
    onLogin(member);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {justRegistered && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          Бүртгэл амжилттай илгээгдлээ. Одоо нэвтэрч статусаа харна уу.
        </div>
      )}
      <div>
        <label className="label">Sign code эсвэл утасны дугаар</label>
        <input
          className="field"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="0001BH"
          required
        />
      </div>
      <div>
        <label className="label">Нууц үг</label>
        <input
          className="field"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••"
          required
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-festive-500/30 bg-festive-500/10 px-4 py-3 text-sm text-festive-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <button type="submit" className="btn-gold w-full">
        <LogIn className="h-5 w-5" />
        Нэвтрэх
      </button>
    </form>
  );
}
