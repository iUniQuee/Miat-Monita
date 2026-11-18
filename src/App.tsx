import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Home, Plane, ShieldCheck, Ticket, TreePine } from 'lucide-react';
import { Landing } from '@/components/Landing';
import { AuthPanel } from '@/components/AuthPanel';
import { Dashboard } from '@/components/Dashboard';
import { AdminPanel } from '@/components/AdminPanel';
import { Snowfall } from '@/components/Snowfall';
import { SetupNotice } from '@/components/SetupNotice';
import {
  errorText,
  fetchDates,
  fetchMembers,
  fetchMyMonita,
  getSessionUserId,
  onAuthStateChange,
  signOutUser,
  subscribeToUpdates,
} from '@/lib/api';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  ADMIN_SIGN_CODE,
  EMPTY_DATES,
  type EventDates,
  type Member,
  type MonitaRecipient,
  type Panel,
} from '@/lib/types';

export default function App() {
  const [panel, setPanel] = useState<Panel>('home');
  const [dates, setDates] = useState<EventDates>(EMPTY_DATES);
  const [members, setMembers] = useState<Member[]>([]);
  const [myMonita, setMyMonita] = useState<MonitaRecipient | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const refresh = useCallback(async (uid: string | null) => {
    // RLS: нэвтрээгүй хэрэглэгч profiles-ыг уншиж чадахгүй тул зөвхөн
    // нэвтэрсэн үед татна (эс бөгөөс нүүр хуудсанд "permission denied" гарна).
    const [nextDates, nextMembers] = await Promise.all([
      fetchDates(),
      uid ? fetchMembers() : Promise.resolve<Member[]>([]),
    ]);
    setDates(nextDates);
    setMembers(nextMembers);
    setMyMonita(uid ? await fetchMyMonita() : null);
    setUserId(uid);
    userIdRef.current = uid;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let alive = true;

    (async () => {
      try {
        const uid = await getSessionUserId();
        if (!alive) return;
        await refresh(uid);
        if (alive) setError(null);
      } catch (err) {
        if (alive) setError(errorText(err, 'Мэдээллийг ачаалж чадсангүй.'));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    const unsubscribeAuth = onAuthStateChange((uid) => {
      void refresh(uid).catch(() => {});
    });

    // Realtime: өөр төхөөрөмж дээрх өөрчлөлт (батлах, сугалаа, хуваарь) шууд татагдана.
    const unsubscribeSync = subscribeToUpdates(() => {
      void refresh(userIdRef.current).catch(() => {});
    });

    return () => {
      alive = false;
      unsubscribeAuth();
      unsubscribeSync();
    };
  }, [refresh]);

  const currentUser = userId ? members.find((m) => m.userId === userId) ?? null : null;
  const drawDone = dates.drawDone;
  const isAdmin = currentUser?.signCode.toUpperCase() === ADMIN_SIGN_CODE;
  const loggedIn = !!currentUser;

  const navigate = (next: Panel) => {
    setPanel(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthenticated = async () => {
    const uid = await getSessionUserId();
    await refresh(uid);
    navigate('dashboard');
  };

  const handleRefresh = async () => {
    await refresh(userIdRef.current);
  };

  const handleLogout = async () => {
    await signOutUser();
    await refresh(null);
    navigate('home');
  };

  const goAdmin = () => {
    navigate('admin');
  };

  const openPanel = panel === 'dashboard' && !currentUser ? 'auth' : panel;

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex flex-col">
        <Snowfall />
        <SetupNotice />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Plane className="h-5 w-5 text-gold-400 animate-pulse -rotate-45" />
          <span className="text-sm font-semibold">Ачаалж байна…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Snowfall />

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-navy-950/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between gap-3">
          <button onClick={() => navigate('home')} className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Plane className="h-5 w-5 text-navy-950 -rotate-45" />
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-white leading-tight">МИАТ Монита</div>
              <div className="text-[10px] text-slate-400 leading-tight">Мэдээлэл лавлагааны тасаг</div>
            </div>
          </button>
          <nav className="flex items-center gap-1.5">
            <HeaderBtn active={openPanel === 'home'} onClick={() => navigate('home')} icon={<Home className="h-4 w-4" />} label="Нүүр" />
            {!loggedIn && (
              <HeaderBtn active={openPanel === 'auth'} onClick={() => navigate('auth')} icon={<Ticket className="h-4 w-4" />} label="Бүртгүүлэх" />
            )}
            {loggedIn && (
              <HeaderBtn active={openPanel === 'dashboard'} onClick={() => navigate('dashboard')} icon={<TreePine className="h-4 w-4" />} label="Миний булан" />
            )}
            <HeaderBtn active={openPanel === 'admin'} onClick={goAdmin} icon={<ShieldCheck className="h-4 w-4" />} label="Удирдлага" hideOnMobile />
          </nav>
        </div>
      </header>

      {error && (
        <div className="max-w-5xl w-full mx-auto px-5 mt-4">
          <div className="flex items-start gap-2 rounded-xl border border-festive-500/30 bg-festive-500/10 px-4 py-3 text-sm text-festive-400">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {error}
          </div>
        </div>
      )}

      <main className="flex-1">
        {openPanel === 'home' && (
          <Landing
            dates={dates}
            onEnter={loggedIn ? () => navigate('dashboard') : () => navigate('auth')}
            loggedIn={loggedIn}
            onAdmin={goAdmin}
          />
        )}
        {openPanel === 'auth' && <AuthPanel onAuthenticated={handleAuthenticated} />}
        {openPanel === 'dashboard' && currentUser && (
          <Dashboard
            member={currentUser}
            drawDone={drawDone}
            monita={myMonita}
            onLogout={handleLogout}
            onRefresh={handleRefresh}
          />
        )}
        {openPanel === 'admin' && (
          <AdminPanel
            dates={dates}
            drawDone={drawDone}
            members={members}
            onRefresh={handleRefresh}
            onExit={() => navigate('home')}
            adminMember={isAdmin ? currentUser : null}
          />
        )}
      </main>

      <div className="sm:hidden sticky bottom-0 z-30 border-t border-white/[0.06] bg-navy-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-around">
          <TabBtn active={openPanel === 'home'} onClick={() => navigate('home')} icon={<Home className="h-5 w-5" />} label="Нүүр" />
          {!loggedIn && <TabBtn active={openPanel === 'auth'} onClick={() => navigate('auth')} icon={<Ticket className="h-5 w-5" />} label="Бүртгүүлэх" />}
          {loggedIn && <TabBtn active={openPanel === 'dashboard'} onClick={() => navigate('dashboard')} icon={<TreePine className="h-5 w-5" />} label="Булан" />}
          <TabBtn active={openPanel === 'admin'} onClick={goAdmin} icon={<ShieldCheck className="h-5 w-5" />} label="Удирдлага" />
        </div>
      </div>
    </div>
  );
}

function HeaderBtn({
  active,
  onClick,
  icon,
  label,
  hideOnMobile,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hideOnMobile?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-white/10 text-gold-300 border border-gold-500/25'
          : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
      } ${hideOnMobile ? 'hidden sm:inline-flex' : ''}`}
    >
      {icon}
      {label}
    </button>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-colors ${
        active ? 'text-gold-300' : 'text-slate-400'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
