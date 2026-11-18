import { useState } from 'react';
import { AlertCircle, Loader2, LogIn, UserPlus } from 'lucide-react';
import { errorText, signInUser, signUpUser } from '@/lib/api';

interface AuthPanelProps {
  onAuthenticated: () => Promise<void> | void;
}

type Tab = 'register' | 'login';

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
  const [tab, setTab] = useState<Tab>('register');

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
          <RegisterForm onAuthenticated={onAuthenticated} />
        ) : (
          <LoginForm onAuthenticated={onAuthenticated} />
        )}
      </div>
    </div>
  );
}

function RegisterForm({
  onAuthenticated,
}: {
  onAuthenticated: () => Promise<void> | void;
}) {
  const [fullName, setFullName] = useState('');
  const [signCode, setSignCode] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [wishlist, setWishlist] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanFullName = fullName.trim();
    const cleanSignCode = signCode.trim().toUpperCase();
    const cleanPhone = phone.trim();

    if (cleanFullName.length < 3) {
      setError('Овог, нэрээ бүрэн бичнэ үү.');
      return;
    }
    if (cleanSignCode.length < 4) {
      setError('Sign code дор хаяж 4 тэмдэгттэй байх ёстой.');
      return;
    }
    if (!/^\d{8}$/.test(cleanPhone)) {
      setError('Утасны дугаар 8 оронтой тоо байх ёстой.');
      return;
    }
    if (password.length < 6) {
      setError('Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.');
      return;
    }

    setBusy(true);
    try {
      const result = await signUpUser({
        password,
        fullName: cleanFullName,
        signCode: cleanSignCode,
        phone: cleanPhone,
        wishlist,
      });

      if (result.needsEmailConfirmation) {
        setError(
          'Supabase дээр "Confirm email" асаалттай байна. Authentication → Sign In / Providers → Email хэсэгт унтраасан эсэхээ шалгаад дахин бүртгүүлнэ үү.',
        );
      } else {
        await onAuthenticated();
      }
    } catch (err) {
      setError(errorText(err, 'Бүртгэл үүсгэж чадсангүй.'));
    } finally {
      setBusy(false);
    }
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
        <p className="text-xs text-slate-500 mt-1.5">
          Sign code-оор нэвтэрнэ — санаж үлдэхээр сонгоорой.
        </p>
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
          placeholder="Дор хаяж 6 тэмдэгт"
          autoComplete="new-password"
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

      <button type="submit" className="btn-gold w-full" disabled={busy}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
        Бүртгэл илгээх
      </button>
      <p className="text-xs text-slate-500 text-center leading-relaxed">
        Зохион байгуулагч баталгаажуулсны дараа таны Монита нээгдэнэ.
      </p>
    </form>
  );
}

function LoginForm({ onAuthenticated }: { onAuthenticated: () => Promise<void> | void }) {
  const [signCode, setSignCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signInUser(signCode, password);
      await onAuthenticated();
    } catch (err) {
      setError(errorText(err, 'Нэвтэрч чадсангүй.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Sign code</label>
        <input
          className="field font-mono tracking-widest uppercase"
          value={signCode}
          onChange={(e) => setSignCode(e.target.value.toUpperCase())}
          placeholder="0001BH"
          autoComplete="username"
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
          autoComplete="current-password"
          required
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-festive-500/30 bg-festive-500/10 px-4 py-3 text-sm text-festive-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <button type="submit" className="btn-gold w-full" disabled={busy}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
        Нэвтрэх
      </button>
    </form>
  );
}
